import prisma from '../core/database/prisma';
import { AppError } from '../middlewares/errorHandler';
import { compare, hash } from 'bcrypt';
import { deleteCache, getCache, setCache } from '../core/cache/redis';

// ============ USER SERVICES ============

/**
 * Get all users with filtering, sorting and pagination
 * 
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @param {Object} filters - Filter parameters
 * @returns {Object} Users with pagination metadata
 */
export const getUsers = async (
  page: number = 1,
  limit: number = 10,
  filters: {
    search?: string;
    roleId?: string;
    departmentId?: string;
    isActive?: boolean;
    sortBy?: string;
    order?: 'asc' | 'desc';
  } = {}
) => {
  const { search, roleId, departmentId, isActive, sortBy = 'createdAt', order = 'desc' } = filters;
  
  // Build where conditions
  const where: any = {};
  
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phoneNumber: { contains: search, mode: 'insensitive' } },
    ];
  }
  
  if (roleId) {
    where.roleId = roleId;
  }
  
  if (departmentId) {
    where.departmentId = departmentId;
  }
  
  if (isActive !== undefined) {
    where.isActive = isActive;
  }
  
  // Calculate skip for pagination
  const skip = (page - 1) * limit;
  
  // Execute query
  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        profileImage: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        userAreas: {
          select: {
            area: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        userRegions: {
          select: {
            region: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      skip,
      take: limit,
      orderBy: { [sortBy]: order },
    }),
    prisma.user.count({ where }),
  ]);
  
  // Format response
  const formattedUsers = users.map(user => ({
    ...user,
    areas: user.userAreas.map(ua => ua.area),
    regions: user.userRegions.map(ur => ur.region),
    userAreas: undefined,
    userRegions: undefined,
  }));
  
  // Calculate pagination metadata
  const totalPages = Math.ceil(totalCount / limit);
  
  return {
    data: formattedUsers,
    meta: {
      totalCount,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

/**
 * Get user by ID
 * 
 * @param {string} id - User ID
 * @returns {Object} User details
 */
export const getUserById = async (id: string) => {
  // Check cache first
  const cachedUser = await getCache<string>(`user:${id}`);
  if (cachedUser) {
    return JSON.parse(cachedUser);
  }
  
  // Find user in database
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phoneNumber: true,
      profileImage: true,
      address: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      roleId: true,
      departmentId: true,
      role: {
        select: {
          id: true,
          name: true,
          permissions: true,
        },
      },
      department: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
      userAreas: {
        select: {
          area: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      },
      userRegions: {
        select: {
          region: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      },
    },
  });
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  // Format response
  const formattedUser = {
    ...user,
    areas: user.userAreas.map(ua => ua.area),
    regions: user.userRegions.map(ur => ur.region),
    userAreas: undefined,
    userRegions: undefined,
  };
  
  // Cache user
  await setCache(`user:${id}`, JSON.stringify(formattedUser), 60 * 30); // 30 minutes
  
  return formattedUser;
};

/**
 * Create a new user
 * 
 * @param {Object} data - User data
 * @returns {Object} Created user
 */
export const createUser = async (data: {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  roleId: string;
  departmentId: string;
  areaIds?: string[];
  regionIds?: string[];
  address?: any;
  profileImage?: string;
  isActive?: boolean;
}) => {
  const { areaIds = [], regionIds = [], password, ...userData } = data;
  
  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: userData.email },
  });
  
  if (existingUser) {
    throw new AppError('Email already in use', 400);
  }
  
  // Hash password
  const hashedPassword = await hash(password, 10);
  
  // Create user with transactions to ensure all related data is created
  const user = await prisma.$transaction(async (tx) => {
    // Create user
    const newUser = await tx.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        userAreas: {
          create: areaIds.map(areaId => ({
            area: { connect: { id: areaId } },
          })),
        },
        userRegions: {
          create: regionIds.map(regionId => ({
            region: { connect: { id: regionId } },
          })),
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        profileImage: true,
        address: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        roleId: true,
        departmentId: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
        department: {
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
  
  // Get areas and regions for the response
  const userWithRelations = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      userAreas: {
        select: {
          area: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      userRegions: {
        select: {
          region: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });
  
  // Format the response
  return {
    ...user,
    areas: userWithRelations?.userAreas.map(ua => ua.area) || [],
    regions: userWithRelations?.userRegions.map(ur => ur.region) || [],
  };
};

/**
 * Update a user
 * 
 * @param {string} id - User ID
 * @param {Object} data - User data to update
 * @returns {Object} Updated user
 */
export const updateUser = async (
  id: string,
  data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    roleId?: string;
    departmentId?: string;
    areaIds?: string[];
    regionIds?: string[];
    address?: any;
    profileImage?: string;
    isActive?: boolean;
  }
) => {
  const { areaIds, regionIds, ...userData } = data;
  
  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id },
    include: {
      userAreas: true,
      userRegions: true,
    },
  });
  
  if (!existingUser) {
    throw new AppError('User not found', 404);
  }
  
  // Check if email is being changed and already exists
  if (userData.email && userData.email !== existingUser.email) {
    const emailExists = await prisma.user.findUnique({
      where: { email: userData.email },
    });
    
    if (emailExists) {
      throw new AppError('Email already in use', 400);
    }
  }
  
  // Update user with transactions to ensure all related data is updated
  const user = await prisma.$transaction(async (tx) => {
    // Update user
    const updatedUser = await tx.user.update({
      where: { id },
      data: userData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        profileImage: true,
        address: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        roleId: true,
        departmentId: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    
    // Update areas if provided
    if (areaIds) {
      // Delete existing area connections
      await tx.userArea.deleteMany({
        where: { userId: id },
      });
      
      // Create new area connections
      if (areaIds.length > 0) {
        await Promise.all(
          areaIds.map(areaId =>
            tx.userArea.create({
              data: {
                userId: id,
                areaId,
              },
            })
          )
        );
      }
    }
    
    // Update regions if provided
    if (regionIds) {
      // Delete existing region connections
      await tx.userRegion.deleteMany({
        where: { userId: id },
      });
      
      // Create new region connections
      if (regionIds.length > 0) {
        await Promise.all(
          regionIds.map(regionId =>
            tx.userRegion.create({
              data: {
                userId: id,
                regionId,
              },
            })
          )
        );
      }
    }
    
    return updatedUser;
  });
  
  // Get areas and regions for the response
  const userWithRelations = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      userAreas: {
        select: {
          area: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      userRegions: {
        select: {
          region: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });
  
  // Delete cache
  await deleteCache(`user:${id}`);
  
  // Format the response
  return {
    ...user,
    areas: userWithRelations?.userAreas.map(ua => ua.area) || [],
    regions: userWithRelations?.userRegions.map(ur => ur.region) || [],
  };
};

/**
 * Deactivate a user (soft delete)
 * 
 * @param {string} id - User ID
 */
export const deactivateUser = async (id: string) => {
  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id },
  });
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  // Deactivate user
  await prisma.user.update({
    where: { id },
    data: { isActive: false },
  });
  
  // Delete cache
  await deleteCache(`user:${id}`);
};

/**
 * Reset user password
 * 
 * @param {string} id - User ID
 * @param {string} newPassword - New password
 */
export const resetUserPassword = async (id: string, newPassword: string) => {
  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id },
  });
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  // Hash new password
  const hashedPassword = await hash(newPassword, 10);
  
  // Update password
  await prisma.user.update({
    where: { id },
    data: { password: hashedPassword },
  });
  
  // Delete cache
  await deleteCache(`user:${id}`);
};

// ============ ROLE SERVICES ============

/**
 * Get all roles with filtering, sorting and pagination
 */
export const getRoles = async (
  page: number = 1,
  limit: number = 10,
  filters: {
    search?: string;
    isActive?: boolean;
    sortBy?: string;
    order?: 'asc' | 'desc';
  } = {}
) => {
  const { search, isActive, sortBy = 'name', order = 'asc' } = filters;
  
  // Build where conditions
  const where: any = {};
  
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }
  
  if (isActive !== undefined) {
    where.isActive = isActive;
  }
  
  // Calculate skip for pagination
  const skip = (page - 1) * limit;
  
  // Execute query
  const [roles, totalCount] = await Promise.all([
    prisma.role.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        isDefault: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            users: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { [sortBy]: order },
    }),
    prisma.role.count({ where }),
  ]);
  
  // Calculate pagination metadata
  const totalPages = Math.ceil(totalCount / limit);
  
  return {
    data: roles.map(role => ({
      ...role,
      userCount: role._count.users,
      _count: undefined,
    })),
    meta: {
      totalCount,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

/**
 * Get role by ID
 */
export const getRoleById = async (id: string) => {
  // Check cache first
  const cachedRole = await getCache<string>(`role:${id}`);
  if (cachedRole) {
    return JSON.parse(cachedRole);
  }
  
  // Find role in database
  const role = await prisma.role.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      permissions: true,
      isDefault: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          users: true,
        },
      },
    },
  });
  
  if (!role) {
    throw new AppError('Role not found', 404);
  }
  
  // Format response
  const formattedRole = {
    ...role,
    userCount: role._count.users,
    _count: undefined,
  };
  
  // Cache role
  await setCache(`role:${id}`, JSON.stringify(formattedRole), 60 * 30); // 30 minutes
  
  return formattedRole;
};

/**
 * Create a new role
 */
export const createRole = async (data: {
  name: string;
  description?: string;
  permissions: string[];
  isDefault?: boolean;
  isActive?: boolean;
}) => {
  // Check if role name already exists
  const existingRole = await prisma.role.findFirst({
    where: { name: data.name },
  });
  
  if (existingRole) {
    throw new AppError('Role name already exists', 400);
  }
  
  // Create role
  const role = await prisma.role.create({
    data,
    select: {
      id: true,
      name: true,
      description: true,
      permissions: true,
      isDefault: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  
  return role;
};

/**
 * Update a role
 */
export const updateRole = async (
  id: string,
  data: {
    name?: string;
    description?: string;
    permissions?: string[];
    isDefault?: boolean;
    isActive?: boolean;
  }
) => {
  // Check if role exists
  const role = await prisma.role.findUnique({
    where: { id },
  });
  
  if (!role) {
    throw new AppError('Role not found', 404);
  }
  
  // Check if name is being changed and already exists
  if (data.name && data.name !== role.name) {
    const nameExists = await prisma.role.findFirst({
      where: {
        name: data.name,
        id: { not: id },
      },
    });
    
    if (nameExists) {
      throw new AppError('Role name already exists', 400);
    }
  }
  
  // Update role
  const updatedRole = await prisma.role.update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      description: true,
      permissions: true,
      isDefault: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  
  // Delete cache
  await deleteCache(`role:${id}`);
  
  return updatedRole;
};

/**
 * Deactivate a role (soft delete)
 */
export const deactivateRole = async (id: string) => {
  // Check if role exists
  const role = await prisma.role.findUnique({
    where: { id },
    include: {
      users: {
        where: { isActive: true },
        select: { id: true },
      },
    },
  });
  
  if (!role) {
    throw new AppError('Role not found', 404);
  }
  
  // Check if role is being used by active users
  if (role.users.length > 0) {
    throw new AppError('Cannot deactivate role that is assigned to active users', 400);
  }
  
  // Check if it's the last active default role
  if (role.isDefault) {
    const activeDefaultRoles = await prisma.role.findMany({
      where: {
        isDefault: true,
        isActive: true,
        id: { not: id },
      },
    });
    
    if (activeDefaultRoles.length === 0) {
      throw new AppError('Cannot deactivate the last active default role', 400);
    }
  }
  
  // Deactivate role
  await prisma.role.update({
    where: { id },
    data: { isActive: false },
  });
  
  // Delete cache
  await deleteCache(`role:${id}`);
};

/**
 * Get all available permissions
 */
export const getAllPermissions = async () => {
  // This would typically come from a static list or a database table
  // For now, we'll return a static list grouped by module
  
  const permissions = {
    users: [
      { key: 'read:users', description: 'View user information' },
      { key: 'create:users', description: 'Create new users' },
      { key: 'update:users', description: 'Update user information' },
      { key: 'delete:users', description: 'Deactivate users' },
    ],
    roles: [
      { key: 'read:roles', description: 'View roles' },
      { key: 'create:roles', description: 'Create new roles' },
      { key: 'update:roles', description: 'Update roles' },
      { key: 'delete:roles', description: 'Deactivate roles' },
    ],
    departments: [
      { key: 'read:departments', description: 'View departments' },
      { key: 'create:departments', description: 'Create new departments' },
      { key: 'update:departments', description: 'Update departments' },
      { key: 'delete:departments', description: 'Deactivate departments' },
    ],
    apps: [
      { key: 'read:apps', description: 'View apps' },
      { key: 'create:apps', description: 'Create new apps' },
      { key: 'update:apps', description: 'Update apps' },
      { key: 'delete:apps', description: 'Deactivate apps' },
    ],
    'email-configurations': [
      { key: 'read:email-configurations', description: 'View email configurations' },
      { key: 'create:email-configurations', description: 'Create new email configurations' },
      { key: 'update:email-configurations', description: 'Update email configurations' },
      { key: 'delete:email-configurations', description: 'Deactivate email configurations' },
    ],
    settings: [
      { key: 'read:settings', description: 'View system settings' },
      { key: 'update:settings', description: 'Update system settings' },
    ],
    // Additional modules
    'data-control': [
      { key: 'read:areas', description: 'View areas' },
      { key: 'create:areas', description: 'Create areas' },
      { key: 'update:areas', description: 'Update areas' },
      { key: 'delete:areas', description: 'Delete areas' },
      // Similar permissions for brands, hsn-codes, etc.
    ],
    dsr: [
      { key: 'read:visits', description: 'View visits' },
      { key: 'create:visits', description: 'Create visits' },
      { key: 'update:visits', description: 'Update visits' },
      { key: 'delete:visits', description: 'Delete visits' },
      // Similar permissions for check-ins, follow-ups, etc.
    ],
  };
  
  return permissions;
};

// ============ DEPARTMENT SERVICES ============

/**
 * Get all departments with filtering, sorting and pagination
 * 
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @param {Object} filters - Filter parameters
 * @returns {Object} Departments with pagination metadata
 */
export const getDepartments = async (
  page: number = 1,
  limit: number = 10,
  filters: {
    search?: string;
    isActive?: boolean;
    sortBy?: string;
    order?: 'asc' | 'desc';
  } = {}
) => {
  const { search, isActive, sortBy = 'name', order = 'asc' } = filters;
  
  // Build where conditions
  const where: any = {};
  
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { code: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }
  
  if (isActive !== undefined) {
    where.isActive = isActive;
  }
  
  // Calculate skip for pagination
  const skip = (page - 1) * limit;
  
  // Execute query
  const [departments, totalCount] = await Promise.all([
    prisma.department.findMany({
      where,
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        parentId: true,
        parent: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: { 
            users: true,
            children: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { [sortBy]: order },
    }),
    prisma.department.count({ where }),
  ]);
  
  // Format response
  const formattedDepartments = departments.map(dept => ({
    ...dept,
    userCount: dept._count.users,
    childCount: dept._count.children,
    _count: undefined,
  }));
  
  // Calculate pagination metadata
  const totalPages = Math.ceil(totalCount / limit);
  
  return {
    data: formattedDepartments,
    meta: {
      totalCount,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

/**
 * Get department by ID
 * 
 * @param {string} id - Department ID
 * @returns {Object} Department details
 */
export const getDepartmentById = async (id: string) => {
  // Check cache first
  const cachedDept = await getCache<string>(`department:${id}`);
  if (cachedDept) {
    return JSON.parse(cachedDept);
  }
  
  // Find department in database
  const department = await prisma.department.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      code: true,
      description: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      parentId: true,
      managerId: true,
      parent: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
      children: {
        select: {
          id: true,
          name: true,
          code: true,
        },
        where: {
          isActive: true,
        },
      },
      manager: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      _count: {
        select: { 
          users: true 
        },
      },
    },
  });
  
  if (!department) {
    throw new AppError('Department not found', 404);
  }
  
  // Format response
  const formattedDepartment = {
    ...department,
    userCount: department._count.users,
    _count: undefined,
  };
  
  // Cache department
  await setCache(`department:${id}`, JSON.stringify(formattedDepartment), 60 * 30); // 30 minutes
  
  return formattedDepartment;
};

/**
 * Create a new department
 * 
 * @param {Object} data - Department data
 * @returns {Object} Created department
 */
export const createDepartment = async (data: {
  name: string;
  code: string;
  description?: string;
  parentId?: string;
  managerId?: string;
  isActive?: boolean;
}) => {
  // Check if code already exists
  const existingDept = await prisma.department.findUnique({
    where: { code: data.code },
  });
  
  if (existingDept) {
    throw new AppError('Department code already exists', 400);
  }
  
  // Validate parentId if provided
  if (data.parentId) {
    const parentExists = await prisma.department.findUnique({
      where: { id: data.parentId },
    });
    
    if (!parentExists) {
      throw new AppError('Parent department not found', 404);
    }
    
    // Prevent circular reference
    if (data.parentId === data.code) {
      throw new AppError('Department cannot be its own parent', 400);
    }
  }
  
  // Validate managerId if provided
  if (data.managerId) {
    const managerExists = await prisma.user.findUnique({
      where: { id: data.managerId },
    });
    
    if (!managerExists) {
      throw new AppError('Manager not found', 404);
    }
  }
  
  // Create department
  const department = await prisma.department.create({
    data,
    select: {
      id: true,
      name: true,
      code: true,
      description: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      parentId: true,
      managerId: true,
      parent: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
      manager: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });
  
  return department;
};

/**
 * Update a department
 * 
 * @param {string} id - Department ID
 * @param {Object} data - Department data to update
 * @returns {Object} Updated department
 */
export const updateDepartment = async (
  id: string,
  data: {
    name?: string;
    code?: string;
    description?: string;
    parentId?: string | null;
    managerId?: string | null;
    isActive?: boolean;
  }
) => {
  // Check if department exists
  const department = await prisma.department.findUnique({
    where: { id },
  });
  
  if (!department) {
    throw new AppError('Department not found', 404);
  }
  
  // Check if code is being changed and already exists
  if (data.code && data.code !== department.code) {
    const codeExists = await prisma.department.findUnique({
      where: { code: data.code },
    });
    
    if (codeExists) {
      throw new AppError('Department code already exists', 400);
    }
  }
  
  // Validate parentId if provided
  if (data.parentId) {
    // Prevent circular reference
    if (data.parentId === id) {
      throw new AppError('Department cannot be its own parent', 400);
    }
    
    const parentExists = await prisma.department.findUnique({
      where: { id: data.parentId },
    });
    
    if (!parentExists) {
      throw new AppError('Parent department not found', 404);
    }
    
    // Check for circular references in hierarchy
    let currentParent: string | null = data.parentId;
    while (currentParent) {
      interface DeptParent {
        parentId: string | null;
      }
      
      const parent = await prisma.department.findUnique({
        where: { id: currentParent },
        select: { parentId: true },
      }) as DeptParent | null;
      
      if (!parent) break;
      if (parent.parentId === id) {
        throw new AppError('Circular reference detected in department hierarchy', 400);
      }
      currentParent = parent.parentId;
    }
  }
  
  // Validate managerId if provided
  if (data.managerId) {
    const managerExists = await prisma.user.findUnique({
      where: { id: data.managerId },
    });
    
    if (!managerExists) {
      throw new AppError('Manager not found', 404);
    }
  }
  
  // Update department
  const updatedDepartment = await prisma.department.update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      code: true,
      description: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      parentId: true,
      managerId: true,
      parent: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
      manager: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });
  
  // Delete cache
  await deleteCache(`department:${id}`);
  
  return updatedDepartment;
};

/**
 * Deactivate a department (soft delete)
 * 
 * @param {string} id - Department ID
 */
export const deactivateDepartment = async (id: string) => {
  // Check if department exists
  const department = await prisma.department.findUnique({
    where: { id },
    include: {
      users: {
        where: { isActive: true },
        select: { id: true },
      },
      children: {
        where: { isActive: true },
        select: { id: true },
      },
    },
  });
  
  if (!department) {
    throw new AppError('Department not found', 404);
  }
  
  // Check if department has active users
  if (department.users.length > 0) {
    throw new AppError('Cannot deactivate department with active users. Reassign users first.', 400);
  }
  
  // Check if department has active child departments
  if (department.children.length > 0) {
    throw new AppError('Cannot deactivate department with active child departments', 400);
  }
  
  // Deactivate department
  await prisma.department.update({
    where: { id },
    data: { isActive: false },
  });
  
  // Delete cache
  await deleteCache(`department:${id}`);
};

// ============ APP SERVICES ============

/**
 * Get all apps with filtering, sorting and pagination
 * 
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @param {Object} filters - Filter parameters
 * @returns {Object} Apps with pagination metadata
 */
export const getApps = async (
  page: number = 1,
  limit: number = 10,
  filters: {
    search?: string;
    isActive?: boolean;
    sortBy?: string;
    order?: 'asc' | 'desc';
  } = {}
) => {
  const { search, isActive, sortBy = 'name', order = 'asc' } = filters;
  
  // Build where conditions
  const where: any = {};
  
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { key: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }
  
  if (isActive !== undefined) {
    where.isActive = isActive;
  }
  
  // Calculate skip for pagination
  const skip = (page - 1) * limit;
  
  // Execute query
  const [apps, totalCount] = await Promise.all([
    prisma.app.findMany({
      where,
      select: {
        id: true,
        name: true,
        key: true,
        description: true,
        iconUrl: true,
        baseUrl: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      skip,
      take: limit,
      orderBy: { [sortBy]: order },
    }),
    prisma.app.count({ where }),
  ]);
  
  // Calculate pagination metadata
  const totalPages = Math.ceil(totalCount / limit);
  
  return {
    data: apps,
    meta: {
      totalCount,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

/**
 * Get app by ID
 * 
 * @param {string} id - App ID
 * @returns {Object} App details
 */
export const getAppById = async (id: string) => {
  // Check cache first
  const cachedApp = await getCache<string>(`app:${id}`);
  if (cachedApp) {
    return JSON.parse(cachedApp);
  }
  
  // Find app in database
  const app = await prisma.app.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      key: true,
      description: true,
      iconUrl: true,
      baseUrl: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  
  if (!app) {
    throw new AppError('App not found', 404);
  }
  
  // Cache app
  await setCache(`app:${id}`, JSON.stringify(app), 60 * 30); // 30 minutes
  
  return app;
};

/**
 * Create a new app
 * 
 * @param {Object} data - App data
 * @returns {Object} Created app
 */
export const createApp = async (data: {
  name: string;
  key: string;
  description?: string;
  iconUrl?: string;
  baseUrl?: string;
  isActive?: boolean;
}) => {
  // Check if key already exists
  const existingApp = await prisma.app.findFirst({
    where: { key: data.key },
  });
  
  if (existingApp) {
    throw new AppError('App key already exists', 400);
  }
  
  // Create app
  const app = await prisma.app.create({
    data,
    select: {
      id: true,
      name: true,
      key: true,
      description: true,
      iconUrl: true,
      baseUrl: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  
  return app;
};

/**
 * Update an app
 * 
 * @param {string} id - App ID
 * @param {Object} data - App data to update
 * @returns {Object} Updated app
 */
export const updateApp = async (
  id: string,
  data: {
    name?: string;
    key?: string;
    description?: string;
    iconUrl?: string | null;
    baseUrl?: string | null;
    isActive?: boolean;
  }
) => {
  // Check if app exists
  const app = await prisma.app.findUnique({
    where: { id },
  });
  
  if (!app) {
    throw new AppError('App not found', 404);
  }
  
  // Check if key is being changed and already exists
  if (data.key && data.key !== app.key) {
    const keyExists = await prisma.app.findFirst({
      where: {
        key: data.key,
        id: { not: id },
      },
    });
    
    if (keyExists) {
      throw new AppError('App key already exists', 400);
    }
  }
  
  // Update app
  const updatedApp = await prisma.app.update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      key: true,
      description: true,
      iconUrl: true,
      baseUrl: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  
  // Delete cache
  await deleteCache(`app:${id}`);
  
  return updatedApp;
};

/**
 * Deactivate an app (soft delete)
 * 
 * @param {string} id - App ID
 */
export const deactivateApp = async (id: string) => {
  // Check if app exists
  const app = await prisma.app.findUnique({
    where: { id },
  });
  
  if (!app) {
    throw new AppError('App not found', 404);
  }
  
  // Deactivate app
  await prisma.app.update({
    where: { id },
    data: { isActive: false },
  });
  
  // Delete cache
  await deleteCache(`app:${id}`);
};

// ============ EMAIL CONFIGURATION SERVICES ============

/**
 * Get all email configurations with filtering, sorting and pagination
 * 
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @param {Object} filters - Filter parameters
 * @returns {Object} Email configurations with pagination metadata
 */
export const getEmailConfigurations = async (
  page: number = 1,
  limit: number = 10,
  filters: {
    search?: string;
    roleId?: string;
    regionId?: string;
    isActive?: boolean;
    sortBy?: string;
    order?: 'asc' | 'desc';
  } = {}
) => {
  const { search, roleId, regionId, isActive, sortBy = 'createdAt', order = 'desc' } = filters;
  
  // Build where conditions
  const where: any = {};
  
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }
  
  if (roleId) {
    where.roleId = roleId;
  }
  
  if (regionId) {
    where.regionId = regionId;
  }
  
  if (isActive !== undefined) {
    where.isActive = isActive;
  }
  
  // Calculate skip for pagination
  const skip = (page - 1) * limit;
  
  // Execute query
  const [emailConfigs, totalCount] = await Promise.all([
    prisma.emailConfiguration.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        roleId: true,
        regionId: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
        region: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { [sortBy]: order },
    }),
    prisma.emailConfiguration.count({ where }),
  ]);
  
  // Calculate pagination metadata
  const totalPages = Math.ceil(totalCount / limit);
  
  return {
    data: emailConfigs,
    meta: {
      totalCount,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

/**
 * Get email configuration by ID
 * 
 * @param {string} id - Email configuration ID
 * @returns {Object} Email configuration details
 */
export const getEmailConfigurationById = async (id: string) => {
  // Check cache first
  const cachedConfig = await getCache<string>(`emailConfig:${id}`);
  if (cachedConfig) {
    return JSON.parse(cachedConfig);
  }
  
  // Find email configuration in database
  const emailConfig = await prisma.emailConfiguration.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      roleId: true,
      regionId: true,
      role: {
        select: {
          id: true,
          name: true,
        },
      },
      region: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });
  
  if (!emailConfig) {
    throw new AppError('Email configuration not found', 404);
  }
  
  // Cache email configuration
  await setCache(`emailConfig:${id}`, JSON.stringify(emailConfig), 60 * 30); // 30 minutes
  
  return emailConfig;
};

/**
 * Create a new email configuration
 * 
 * @param {Object} data - Email configuration data
 * @returns {Object} Created email configuration
 */
export const createEmailConfiguration = async (data: {
  name: string;
  email: string;
  roleId: string;
  regionId: string;
  isActive?: boolean;
}, userId?: string) => {
  // Validate role exists
  const roleExists = await prisma.role.findUnique({
    where: { id: data.roleId },
  });
  
  if (!roleExists) {
    throw new AppError('Role not found', 404);
  }
  
  // Validate region exists
  const regionExists = await prisma.region.findUnique({
    where: { id: data.regionId },
  });
  
  if (!regionExists) {
    throw new AppError('Region not found', 404);
  }
  
  // Check if a configuration already exists for this role and region
  const existingConfig = await prisma.emailConfiguration.findFirst({
    where: {
      roleId: data.roleId,
      regionId: data.regionId,
      isActive: true,
    },
  });
  
  if (existingConfig) {
    throw new AppError('An active email configuration already exists for this role and region', 400);
  }
  
  // Create email configuration
  const emailConfig = await prisma.emailConfiguration.create({
    data: {
      ...data,
      userId, // Creator of the configuration
    },
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      roleId: true,
      regionId: true,
      role: {
        select: {
          id: true,
          name: true,
        },
      },
      region: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
  });
  
  return emailConfig;
};

/**
 * Update an email configuration
 * 
 * @param {string} id - Email configuration ID
 * @param {Object} data - Email configuration data to update
 * @returns {Object} Updated email configuration
 */
export const updateEmailConfiguration = async (
  id: string,
  data: {
    name?: string;
    email?: string;
    roleId?: string;
    regionId?: string;
    isActive?: boolean;
  }
) => {
  // Check if email configuration exists
  const emailConfig = await prisma.emailConfiguration.findUnique({
    where: { id },
  });
  
  if (!emailConfig) {
    throw new AppError('Email configuration not found', 404);
  }
  
  // If role or region is changing, validate they exist
  if (data.roleId && data.roleId !== emailConfig.roleId) {
    const roleExists = await prisma.role.findUnique({
      where: { id: data.roleId },
    });
    
    if (!roleExists) {
      throw new AppError('Role not found', 404);
    }
  }
  
  if (data.regionId && data.regionId !== emailConfig.regionId) {
    const regionExists = await prisma.region.findUnique({
      where: { id: data.regionId },
    });
    
    if (!regionExists) {
      throw new AppError('Region not found', 404);
    }
  }
  
  // If role or region is changing, check for existing configuration
  if ((data.roleId && data.roleId !== emailConfig.roleId) || 
      (data.regionId && data.regionId !== emailConfig.regionId)) {
    const existingConfig = await prisma.emailConfiguration.findFirst({
      where: {
        roleId: data.roleId || emailConfig.roleId,
        regionId: data.regionId || emailConfig.regionId,
        isActive: true,
        id: { not: id },
      },
    });
    
    if (existingConfig) {
      throw new AppError('An active email configuration already exists for this role and region', 400);
    }
  }
  
  // Update email configuration
  const updatedEmailConfig = await prisma.emailConfiguration.update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      roleId: true,
      regionId: true,
      role: {
        select: {
          id: true,
          name: true,
        },
      },
      region: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
  });
  
  // Delete cache
  await deleteCache(`emailConfig:${id}`);
  
  return updatedEmailConfig;
};

/**
 * Deactivate an email configuration (soft delete)
 * 
 * @param {string} id - Email configuration ID
 */
export const deactivateEmailConfiguration = async (id: string) => {
  // Check if email configuration exists
  const emailConfig = await prisma.emailConfiguration.findUnique({
    where: { id },
  });
  
  if (!emailConfig) {
    throw new AppError('Email configuration not found', 404);
  }
  
  // Deactivate email configuration
  await prisma.emailConfiguration.update({
    where: { id },
    data: { isActive: false },
  });
  
  // Delete cache
  await deleteCache(`emailConfig:${id}`);
};

// ============ NOTIFICATION SERVICES ============

/**
 * Get user notifications with filtering, sorting and pagination
 * 
 * @param {string} userId - User ID
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @param {Object} filters - Filter parameters
 * @returns {Object} Notifications with pagination metadata
 */
export const getUserNotifications = async (
  userId: string,
  page: number = 1,
  limit: number = 10,
  filters: {
    isRead?: boolean;
    sortBy?: string;
    order?: 'asc' | 'desc';
  } = {}
) => {
  const { isRead, sortBy = 'createdAt', order = 'desc' } = filters;
  
  // Build where conditions
  const where: any = { userId };
  
  if (isRead !== undefined) {
    where.isRead = isRead;
  }
  
  // Calculate skip for pagination
  const skip = (page - 1) * limit;
  
  // Execute query
  const [notifications, totalCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      select: {
        id: true,
        title: true,
        message: true,
        type: true,
        isRead: true,
        data: true,
        createdAt: true,
      },
      skip,
      take: limit,
      orderBy: { [sortBy]: order },
    }),
    prisma.notification.count({ where }),
  ]);
  
  // Calculate pagination metadata
  const totalPages = Math.ceil(totalCount / limit);
  
  return {
    data: notifications,
    meta: {
      totalCount,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

/**
 * Create a new notification
 * 
 * @param {Object} data - Notification data
 * @returns {Object} Created notification
 */
export const createNotification = async (data: {
  userId: string;
  title: string;
  message: string;
  type: string;
  data?: any;
}) => {
  // Validate user exists
  const userExists = await prisma.user.findUnique({
    where: { id: data.userId },
  });
  
  if (!userExists) {
    throw new AppError('User not found', 404);
  }
  
  // Create notification
  const notification = await prisma.notification.create({
    data: {
      ...data,
      data: data.data ? JSON.stringify(data.data) : undefined,
    },
    select: {
      id: true,
      title: true,
      message: true,
      type: true,
      isRead: true,
      data: true,
      createdAt: true,
      userId: true,
    },
  });
  
  return notification;
};

/**
 * Mark a notification as read
 * 
 * @param {string} id - Notification ID
 * @param {string} userId - User ID
 * @returns {Object} Updated notification
 */
export const markNotificationAsRead = async (id: string, userId: string) => {
  // Find notification and verify it belongs to the user
  const notification = await prisma.notification.findFirst({
    where: {
      id,
      userId,
    },
  });
  
  if (!notification) {
    throw new AppError('Notification not found', 404);
  }
  
  // If already read, just return it
  if (notification.isRead) {
    return notification;
  }
  
  // Mark as read
  const updatedNotification = await prisma.notification.update({
    where: { id },
    data: { isRead: true },
    select: {
      id: true,
      title: true,
      message: true,
      type: true,
      isRead: true,
      data: true,
      createdAt: true,
    },
  });
  
  return updatedNotification;
};

/**
 * Mark all user's notifications as read
 * 
 * @param {string} userId - User ID
 */
export const markAllNotificationsAsRead = async (userId: string) => {
  // Verify user exists
  const userExists = await prisma.user.findUnique({
    where: { id: userId },
  });
  
  if (!userExists) {
    throw new AppError('User not found', 404);
  }
  
  // Mark all notifications as read
  await prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: { isRead: true },
  });
};

/**
 * Delete a notification
 * 
 * @param {string} id - Notification ID
 * @param {string} userId - User ID
 */
export const deleteNotification = async (id: string, userId: string) => {
  // Find notification and verify it belongs to the user
  const notification = await prisma.notification.findFirst({
    where: {
      id,
      userId,
    },
  });
  
  if (!notification) {
    throw new AppError('Notification not found', 404);
  }
  
  // Delete notification
  await prisma.notification.delete({
    where: { id },
  });
};

/**
 * Delete all user's read notifications
 * 
 * @param {string} userId - User ID
 */
export const deleteAllReadNotifications = async (userId: string) => {
  // Verify user exists
  const userExists = await prisma.user.findUnique({
    where: { id: userId },
  });
  
  if (!userExists) {
    throw new AppError('User not found', 404);
  }
  
  // Delete all read notifications
  await prisma.notification.deleteMany({
    where: {
      userId,
      isRead: true,
    },
  });
};

// ============ SETTINGS SERVICES ============

/**
 * Get user settings
 * 
 * @param {string} userId - User ID
 * @returns {Object} User settings
 */
export const getUserSettings = async (userId: string) => {
  // Check cache first
  const cachedSettings = await getCache<string>(`userSettings:${userId}`);
  if (cachedSettings) {
    return JSON.parse(cachedSettings);
  }
  
  // Find user
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  // Get or create user settings
  let settings = await prisma.userSettings.findUnique({
    where: { userId },
  });
  
  if (!settings) {
    // Create default settings if not found
    settings = await prisma.userSettings.create({
      data: {
        userId,
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
  }
  
  // Cache settings
  await setCache(`userSettings:${userId}`, JSON.stringify(settings), 60 * 30); // 30 minutes
  
  return settings;
};

/**
 * Update user settings
 * 
 * @param {string} userId - User ID
 * @param {Object} data - Settings data to update
 * @returns {Object} Updated user settings
 */
export const updateUserSettings = async (
  userId: string,
  data: {
    notifications?: {
      email?: boolean;
      push?: boolean;
      sms?: boolean;
      inApp?: boolean;
    };
    display?: {
      theme?: 'light' | 'dark' | 'system';
      language?: string;
      timezone?: string;
      dateFormat?: string;
      timeFormat?: string;
    };
    dashboard?: {
      widgets?: string[];
      defaultView?: string;
    };
  }
) => {
  // Find user
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  // Get current settings
  let settings = await prisma.userSettings.findUnique({
    where: { userId },
  });
  
  const updateData: any = {};
  
  // Prepare notifications update if provided
  if (data.notifications) {
    const currentNotifications = settings?.notifications ? 
      (typeof settings.notifications === 'string' ? 
        JSON.parse(settings.notifications as string) : 
        settings.notifications) : 
      {};
      
    updateData.notifications = {
      ...currentNotifications,
      ...data.notifications,
    };
  }
  
  // Prepare display update if provided
  if (data.display) {
    const currentDisplay = settings?.display ? 
      (typeof settings.display === 'string' ? 
        JSON.parse(settings.display as string) : 
        settings.display) : 
      {};
      
    updateData.display = {
      ...currentDisplay,
      ...data.display,
    };
  }
  
  // Prepare dashboard update if provided
  if (data.dashboard) {
    const currentDashboard = settings?.dashboard ? 
      (typeof settings.dashboard === 'string' ? 
        JSON.parse(settings.dashboard as string) : 
        settings.dashboard) : 
      {};
      
    updateData.dashboard = {
      ...currentDashboard,
      ...data.dashboard,
    };
  }
  
  // Update or create settings
  if (settings) {
    // Update existing settings
    settings = await prisma.userSettings.update({
      where: { userId },
      data: updateData,
    });
  } else {
    // Create new settings
    settings = await prisma.userSettings.create({
      data: {
        userId,
        ...updateData,
      },
    });
  }
  
  // Delete cache
  await deleteCache(`userSettings:${userId}`);
  
  return settings;
};

/**
 * Get system settings
 * 
 * @returns {Object} System settings grouped by category
 */
export const getSystemSettings = async () => {
  // Check cache first
  const cachedSettings = await getCache<string>('systemSettings');
  if (cachedSettings) {
    return JSON.parse(cachedSettings);
  }
  
  // Get all system settings
  const settingsData = await prisma.systemSettings.findMany();
  
  // Group settings by category
  const settings: Record<string, any> = {};
  
  settingsData.forEach(setting => {
    if (!settings[setting.category]) {
      settings[setting.category] = {};
    }
    
    const value = typeof setting.value === 'string' ? 
      JSON.parse(setting.value as string) : 
      setting.value;
      
    settings[setting.category][setting.key] = value;
  });
  
  // Set default settings if not found
  if (!settings.email) {
    settings.email = {
      smtpHost: '',
      smtpPort: 587,
      smtpUser: '',
      smtpPassword: '',
      senderEmail: 'noreply@example.com',
      senderName: 'System',
      enableSSL: true,
    };
  }
  
  if (!settings.security) {
    settings.security = {
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        expiryDays: 90,
      },
      sessionTimeout: 30, // minutes
      maxLoginAttempts: 5,
      twoFactorAuth: false,
    };
  }
  
  if (!settings.localization) {
    settings.localization = {
      defaultLanguage: 'en',
      defaultTimezone: 'UTC',
      defaultDateFormat: 'YYYY-MM-DD',
      defaultTimeFormat: 'HH:mm',
      defaultCurrency: 'USD',
    };
  }
  
  if (!settings.branding) {
    settings.branding = {
      companyName: 'Hunter SFA',
      logoUrl: '',
      faviconUrl: '',
      primaryColor: '#3498db',
      secondaryColor: '#2ecc71',
    };
  }
  
  // Cache settings
  await setCache('systemSettings', JSON.stringify(settings), 60 * 30); // 30 minutes
  
  return settings;
};

/**
 * Update system settings
 * 
 * @param {Object} data - Settings data to update
 * @param {string} userId - ID of user making the update
 * @returns {Object} Updated system settings
 */
export const updateSystemSettings = async (
  data: {
    email?: {
      smtpHost?: string;
      smtpPort?: number;
      smtpUser?: string;
      smtpPassword?: string;
      senderEmail?: string;
      senderName?: string;
      enableSSL?: boolean;
    };
    security?: {
      passwordPolicy?: {
        minLength?: number;
        requireUppercase?: boolean;
        requireLowercase?: boolean;
        requireNumbers?: boolean;
        requireSpecialChars?: boolean;
        expiryDays?: number;
      };
      sessionTimeout?: number;
      maxLoginAttempts?: number;
      twoFactorAuth?: boolean;
    };
    localization?: {
      defaultLanguage?: string;
      defaultTimezone?: string;
      defaultDateFormat?: string;
      defaultTimeFormat?: string;
      defaultCurrency?: string;
    };
    branding?: {
      companyName?: string;
      logoUrl?: string;
      faviconUrl?: string;
      primaryColor?: string;
      secondaryColor?: string;
    };
  },
  userId?: string
) => {
  // Get current settings
  const currentSettings = await getSystemSettings();
  
  // Prepare transaction for updating multiple settings
  const updates = [];
  
  // Process email settings
  if (data.email) {
    const emailSettings = {
      ...currentSettings.email,
      ...data.email,
    };
    
    // Add update operations for each email setting
    for (const [key, value] of Object.entries(emailSettings)) {
      updates.push(
        prisma.systemSettings.upsert({
          where: {
            key: key,
          },
          update: {
            value: JSON.stringify(value),
            updatedBy: userId,
          },
          create: {
            key: key,
            value: JSON.stringify(value),
            category: 'email',
            updatedBy: userId,
          },
        })
      );
    }
  }
  
  // Process security settings
  if (data.security) {
    const securitySettings = {
      ...currentSettings.security,
      ...data.security,
    };
    
    if (data.security.passwordPolicy) {
      securitySettings.passwordPolicy = {
        ...currentSettings.security.passwordPolicy,
        ...data.security.passwordPolicy,
      };
    }
    
    // Add update operations for each security setting
    for (const [key, value] of Object.entries(securitySettings)) {
      updates.push(
        prisma.systemSettings.upsert({
          where: {
            key: key,
          },
          update: {
            value: JSON.stringify(value),
            updatedBy: userId,
          },
          create: {
            key: key,
            value: JSON.stringify(value),
            category: 'security',
            updatedBy: userId,
          },
        })
      );
    }
  }
  
  // Process localization settings
  if (data.localization) {
    const localizationSettings = {
      ...currentSettings.localization,
      ...data.localization,
    };
    
    // Add update operations for each localization setting
    for (const [key, value] of Object.entries(localizationSettings)) {
      updates.push(
        prisma.systemSettings.upsert({
          where: {
            key: key,
          },
          update: {
            value: JSON.stringify(value),
            updatedBy: userId,
          },
          create: {
            key: key,
            value: JSON.stringify(value),
            category: 'localization',
            updatedBy: userId,
          },
        })
      );
    }
  }
  
  // Process branding settings
  if (data.branding) {
    const brandingSettings = {
      ...currentSettings.branding,
      ...data.branding,
    };
    
    // Add update operations for each branding setting
    for (const [key, value] of Object.entries(brandingSettings)) {
      updates.push(
        prisma.systemSettings.upsert({
          where: {
            key: key,
          },
          update: {
            value: JSON.stringify(value),
            updatedBy: userId,
          },
          create: {
            key: key,
            value: JSON.stringify(value),
            category: 'branding',
            updatedBy: userId,
          },
        })
      );
    }
  }
  
  // Execute all updates in a transaction
  if (updates.length > 0) {
    await prisma.$transaction(updates);
  }
  
  // Delete cache
  await deleteCache('systemSettings');
  
  // Get updated settings
  return await getSystemSettings();
}; 