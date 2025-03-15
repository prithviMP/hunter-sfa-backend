import prisma from '../core/database/prisma';
import { User, Prisma } from '@prisma/client';

/**
 * Repository for User-related database operations
 */
export const userRepository = {
  /**
   * Find a user by ID
   * @param id User ID
   * @returns User or null if not found
   */
  findById: async (id: string): Promise<User | null> => {
    return prisma.user.findUnique({
      where: { id },
    });
  },

  /**
   * Find a user by email
   * @param email User email
   * @returns User or null if not found
   */
  findByEmail: async (email: string): Promise<User | null> => {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  /**
   * Find a user by ID with role information
   * @param id User ID
   * @returns User with role or null if not found
   */
  findByIdWithRole: async (id: string): Promise<(User & { role: { name: string; permissions: string[] } }) | null> => {
    return prisma.user.findUnique({
      where: { id },
      include: {
        role: {
          select: {
            name: true,
            permissions: true,
          },
        },
      },
    }) as Promise<(User & { role: { name: string; permissions: string[] } }) | null>;
  },

  /**
   * Create a new user
   * @param data User data to create
   * @returns Created user
   */
  create: async (data: Prisma.UserCreateInput): Promise<User> => {
    return prisma.user.create({
      data,
    });
  },

  /**
   * Update a user
   * @param id User ID
   * @param data User data to update
   * @returns Updated user
   */
  update: async (id: string, data: Prisma.UserUpdateInput): Promise<User> => {
    return prisma.user.update({
      where: { id },
      data,
    });
  },

  /**
   * Delete a user
   * @param id User ID
   * @returns Deleted user
   */
  delete: async (id: string): Promise<User> => {
    return prisma.user.delete({
      where: { id },
    });
  },

  /**
   * Find users with pagination and filtering
   * @param params Parameters for filtering, sorting, and pagination
   * @returns Array of users and total count
   */
  findMany: async (params: {
    skip?: number;
    take?: number;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
    include?: Prisma.UserInclude;
  }): Promise<{ users: User[]; total: number }> => {
    const { skip, take, where, orderBy, include } = params;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take,
        where,
        orderBy,
        include,
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total };
  },
}; 