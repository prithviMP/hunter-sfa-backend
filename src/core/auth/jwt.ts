import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import { config } from '../../config';

/**
 * Interface for JWT payload
 */
export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Interface for token response
 */
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Get JWT secrets from config
const JWT_SECRET: Secret = config.jwt.secret || 'development-secret-key';
const JWT_REFRESH_SECRET: Secret = config.jwt.refreshSecret || 'development-refresh-secret-key';
const JWT_EXPIRES_IN = config.jwt.expiresIn || '1h';
const JWT_REFRESH_EXPIRES_IN = config.jwt.refreshExpiresIn || '7d';

/**
 * Generate JWT access token
 * @param payload User data to encode in the token
 * @returns JWT token string
 */
export const generateAccessToken = (payload: JwtPayload): string => {
  // Using any to bypass the type checking for expiresIn
  // This is safe because jwt.sign accepts string values for expiresIn
  const options = {
    expiresIn: JWT_EXPIRES_IN,
  } as any;
  return jwt.sign(payload, JWT_SECRET, options);
};

/**
 * Generate JWT refresh token
 * @param payload User data to encode in the token
 * @returns JWT refresh token string
 */
export const generateRefreshToken = (payload: JwtPayload): string => {
  // Using any to bypass the type checking for expiresIn
  // This is safe because jwt.sign accepts string values for expiresIn
  const options = {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  } as any;
  return jwt.sign(payload, JWT_REFRESH_SECRET, options);
};

/**
 * Generate both access and refresh tokens
 * @param payload User data to encode in the tokens
 * @returns Object containing both tokens and expiration
 */
export const generateTokens = (payload: JwtPayload): TokenResponse => {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Calculate expiration in seconds
  const decoded = jwt.decode(accessToken) as { exp: number };
  const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);

  return {
    accessToken,
    refreshToken,
    expiresIn,
  };
};

/**
 * Verify JWT access token
 * @param token JWT token to verify
 * @returns Decoded payload or null if invalid
 */
export const verifyAccessToken = (token: string): JwtPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};

/**
 * Verify JWT refresh token
 * @param token Refresh token to verify
 * @returns Decoded payload or null if invalid
 */
export const verifyRefreshToken = (token: string): JwtPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};

/**
 * Refresh the access token using a valid refresh token
 * @param refreshToken Valid refresh token
 * @returns New access token or null if refresh token is invalid
 */
export const refreshAccessToken = (refreshToken: string): string | null => {
  const payload = verifyRefreshToken(refreshToken);
  if (!payload) return null;
  
  return generateAccessToken(payload);
}; 