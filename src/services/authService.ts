import prisma from '../core/database/prisma';
import { AppError } from '../middlewares/errorHandler';
import { compare, hash } from 'bcrypt';
import { generateTokens } from '../core/auth/jwt';
import { setCache } from '../core/cache/redis';

/**
 * Login user with email/username and password
 * 
 * @param {string} username - Username or email
 * @param {string} password - User password
 * @returns {Object} User data and tokens
 */
export const login = async (username: string, password: string) => {
  // Check if user exists by username or email
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: username },
        { username: username }
      ]
    },
    include: {
      role: true,
    },
  });

  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  // Check if user is active
  if (!user.isActive) {
    throw new AppError('Your account is inactive. Please contact an administrator.', 403);
  }

  // Verify password
  const isPasswordValid = await compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid credentials', 401);
  }

  // Generate tokens
  const tokens = generateTokens({
    userId: user.id,
    email: user.email,
    role: user.role.name,
  });

  // Return user data and tokens
  return {
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role.name,
      permissions: user.role.permissions,
    },
    ...tokens,
  };
};

/**
 * Register a new user
 * 
 * @param {Object} userData - User registration data
 * @returns {Object} Created user
 */
export const signup = async (userData: {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  phoneNumber?: string;
}) => {
  const { password, ...rest } = userData;

  // Check if email already exists
  const existingUserByEmail = await prisma.user.findUnique({
    where: { email: rest.email },
  });

  if (existingUserByEmail) {
    throw new AppError('Email already in use', 400);
  }

  // Check if username already exists
  const existingUserByUsername = await prisma.user.findFirst({
    where: { username: rest.username },
  });

  if (existingUserByUsername) {
    throw new AppError('Username already in use', 400);
  }

  // Get default role for new users (assuming there's a default role)
  const defaultRole = await prisma.role.findFirst({
    where: { isDefault: true },
  });

  if (!defaultRole) {
    throw new AppError('Default role not found', 500);
  }

  // Hash password
  const hashedPassword = await hash(password, 10);

  // Create user
  const user = await prisma.$transaction(async (tx) => {
    // Create the user
    const newUser = await tx.user.create({
      data: {
        ...rest,
        password: hashedPassword,
        roleId: defaultRole.id,
        isActive: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        username: true,
        phoneNumber: true,
        createdAt: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Create default user settings
    await tx.userSettings.create({
      data: {
        userId: newUser.id,
        notifications: {
          email: true,
          push: true,
          inApp: true,
        },
        display: {
          theme: 'light',
          language: 'en',
        },
      },
    });

    return newUser;
  });

  return user;
};

/**
 * Refresh access token using refresh token
 * 
 * @param {string} refreshToken - Refresh token
 * @returns {Object} New tokens
 */
export const refreshToken = async (refreshToken: string) => {
  // Verify refresh token
  const decoded = await prisma.$transaction(async (tx) => {
    // Verify the token exists and is valid
    const tokenRecord = await tx.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    // Get user
    const user = await tx.user.findUnique({
      where: { id: tokenRecord.userId },
      include: { role: true },
    });

    if (!user || !user.isActive) {
      throw new AppError('User not found or inactive', 401);
    }

    // Delete the used refresh token
    await tx.refreshToken.delete({
      where: { id: tokenRecord.id },
    });

    return {
      userId: user.id,
      email: user.email,
      role: user.role.name,
    };
  });

  // Generate new tokens
  const tokens = generateTokens(decoded);

  // Store new refresh token in database
  await prisma.refreshToken.create({
    data: {
      userId: decoded.userId,
      token: tokens.refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  return tokens;
};

/**
 * Logout user by invalidating refresh token
 * 
 * @param {string} refreshToken - Refresh token to invalidate
 */
export const logout = async (refreshToken: string) => {
  await prisma.refreshToken.deleteMany({
    where: { token: refreshToken },
  });
}; 