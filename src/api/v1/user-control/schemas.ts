import { z } from 'zod';

// ============ USER SCHEMAS ============

export const getUsersSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional().transform(Number).default('1'),
    limit: z.string().regex(/^\d+$/).optional().transform(Number).default('10'),
    search: z.string().optional(),
    roleId: z.string().uuid('Invalid role ID').optional(),
    departmentId: z.string().uuid('Invalid department ID').optional(),
    isActive: z.enum(['true', 'false']).optional().transform(val => val === 'true'),
    sortBy: z.string().optional().default('createdAt'),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

export const createUserSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, 'First name is required').max(50, 'First name cannot exceed 50 characters'),
    lastName: z.string().min(1, 'Last name is required').max(50, 'Last name cannot exceed 50 characters'),
    email: z.string().email('Invalid email format'),
    phoneNumber: z.string().min(10, 'Phone number must be at least 10 characters').max(20, 'Phone number cannot exceed 20 characters'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    roleId: z.string().uuid('Invalid role ID'),
    departmentId: z.string().uuid('Invalid department ID'),
    areaIds: z.array(z.string().uuid('Invalid area ID')).optional().default([]),
    regionIds: z.array(z.string().uuid('Invalid region ID')).optional().default([]),
    address: z.object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().optional(),
    }).optional(),
    profileImage: z.string().url('Invalid URL format').optional(),
    isActive: z.boolean().default(true),
  }),
});

export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user ID'),
  }),
  body: z.object({
    firstName: z.string().min(1, 'First name is required').max(50, 'First name cannot exceed 50 characters').optional(),
    lastName: z.string().min(1, 'Last name is required').max(50, 'Last name cannot exceed 50 characters').optional(),
    email: z.string().email('Invalid email format').optional(),
    phoneNumber: z.string().min(10, 'Phone number must be at least 10 characters').max(20, 'Phone number cannot exceed 20 characters').optional(),
    roleId: z.string().uuid('Invalid role ID').optional(),
    departmentId: z.string().uuid('Invalid department ID').optional(),
    areaIds: z.array(z.string().uuid('Invalid area ID')).optional(),
    regionIds: z.array(z.string().uuid('Invalid region ID')).optional(),
    address: z.object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().optional(),
    }).optional(),
    profileImage: z.string().url('Invalid URL format').optional(),
    isActive: z.boolean().optional(),
  }),
});

export const resetPasswordSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user ID'),
  }),
  body: z.object({
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  }),
});

// ============ ROLE SCHEMAS ============

export const getRolesSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional().transform(Number).default('1'),
    limit: z.string().regex(/^\d+$/).optional().transform(Number).default('10'),
    search: z.string().optional(),
    isActive: z.enum(['true', 'false']).optional().transform(val => val === 'true'),
    sortBy: z.string().optional().default('name'),
    order: z.enum(['asc', 'desc']).optional().default('asc'),
  }),
});

export const createRoleSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Role name is required').max(50, 'Role name cannot exceed 50 characters'),
    description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
    permissions: z.array(z.string().min(1, 'Permission is required')).min(1, 'At least one permission is required'),
    isDefault: z.boolean().optional().default(false),
    isActive: z.boolean().optional().default(true),
  }),
});

export const updateRoleSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid role ID'),
  }),
  body: z.object({
    name: z.string().min(1, 'Role name is required').max(50, 'Role name cannot exceed 50 characters').optional(),
    description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
    permissions: z.array(z.string().min(1, 'Permission is required')).min(1, 'At least one permission is required').optional(),
    isDefault: z.boolean().optional(),
    isActive: z.boolean().optional(),
  }),
});

// ============ DEPARTMENT SCHEMAS ============

export const getDepartmentsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional().transform(Number).default('1'),
    limit: z.string().regex(/^\d+$/).optional().transform(Number).default('10'),
    search: z.string().optional(),
    isActive: z.enum(['true', 'false']).optional().transform(val => val === 'true'),
    sortBy: z.string().optional().default('name'),
    order: z.enum(['asc', 'desc']).optional().default('asc'),
  }),
});

export const createDepartmentSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Department name is required').max(100, 'Department name cannot exceed 100 characters'),
    code: z.string().min(1, 'Department code is required').max(20, 'Department code cannot exceed 20 characters'),
    description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
    parentId: z.string().uuid('Invalid parent department ID').optional(),
    managerId: z.string().uuid('Invalid manager ID').optional(),
    isActive: z.boolean().optional().default(true),
  }),
});

export const updateDepartmentSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid department ID'),
  }),
  body: z.object({
    name: z.string().min(1, 'Department name is required').max(100, 'Department name cannot exceed 100 characters').optional(),
    code: z.string().min(1, 'Department code is required').max(20, 'Department code cannot exceed 20 characters').optional(),
    description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
    parentId: z.string().uuid('Invalid parent department ID').optional().nullable(),
    managerId: z.string().uuid('Invalid manager ID').optional().nullable(),
    isActive: z.boolean().optional(),
  }),
});

// ============ APP SCHEMAS ============

export const getAppsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional().transform(Number).default('1'),
    limit: z.string().regex(/^\d+$/).optional().transform(Number).default('10'),
    search: z.string().optional(),
    isActive: z.enum(['true', 'false']).optional().transform(val => val === 'true'),
    sortBy: z.string().optional().default('name'),
    order: z.enum(['asc', 'desc']).optional().default('asc'),
  }),
});

export const createAppSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'App name is required').max(100, 'App name cannot exceed 100 characters'),
    key: z.string().min(1, 'App key is required').max(50, 'App key cannot exceed 50 characters')
      .regex(/^[a-z0-9-_]+$/, 'App key can only contain lowercase letters, numbers, hyphens and underscores'),
    description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
    iconUrl: z.string().url('Invalid URL format').optional(),
    baseUrl: z.string().url('Invalid URL format').optional(),
    isActive: z.boolean().optional().default(true),
  }),
});

export const updateAppSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid app ID'),
  }),
  body: z.object({
    name: z.string().min(1, 'App name is required').max(100, 'App name cannot exceed 100 characters').optional(),
    key: z.string().min(1, 'App key is required').max(50, 'App key cannot exceed 50 characters')
      .regex(/^[a-z0-9-_]+$/, 'App key can only contain lowercase letters, numbers, hyphens and underscores')
      .optional(),
    description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
    iconUrl: z.string().url('Invalid URL format').optional().nullable(),
    baseUrl: z.string().url('Invalid URL format').optional().nullable(),
    isActive: z.boolean().optional(),
  }),
});

// ============ EMAIL CONFIGURATION SCHEMAS ============

export const getEmailConfigsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional().transform(Number).default('1'),
    limit: z.string().regex(/^\d+$/).optional().transform(Number).default('10'),
    search: z.string().optional(),
    roleId: z.string().uuid('Invalid role ID').optional(),
    regionId: z.string().uuid('Invalid region ID').optional(),
    isActive: z.enum(['true', 'false']).optional().transform(val => val === 'true'),
    sortBy: z.string().optional().default('createdAt'),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

export const createEmailConfigSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name cannot exceed 100 characters'),
    email: z.string().email('Invalid email format'),
    roleId: z.string().uuid('Invalid role ID'),
    regionId: z.string().uuid('Invalid region ID'),
    isActive: z.boolean().optional().default(true),
  }),
});

export const updateEmailConfigSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid email configuration ID'),
  }),
  body: z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name cannot exceed 100 characters').optional(),
    email: z.string().email('Invalid email format').optional(),
    roleId: z.string().uuid('Invalid role ID').optional(),
    regionId: z.string().uuid('Invalid region ID').optional(),
    isActive: z.boolean().optional(),
  }),
});

// ============ NOTIFICATION SCHEMAS ============

export const getNotificationsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional().transform(Number).default('1'),
    limit: z.string().regex(/^\d+$/).optional().transform(Number).default('10'),
    isRead: z.enum(['true', 'false']).optional().transform(val => val === 'true'),
    sortBy: z.string().optional().default('createdAt'),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

// ============ SETTINGS SCHEMAS ============

export const updateUserSettingsSchema = z.object({
  body: z.object({
    notifications: z.object({
      email: z.boolean().optional(),
      push: z.boolean().optional(),
      sms: z.boolean().optional(),
      inApp: z.boolean().optional(),
    }).optional(),
    display: z.object({
      theme: z.enum(['light', 'dark', 'system']).optional(),
      language: z.string().min(2).max(10).optional(),
      timezone: z.string().optional(),
      dateFormat: z.string().optional(),
      timeFormat: z.string().optional(),
    }).optional(),
    dashboard: z.object({
      widgets: z.array(z.string()).optional(),
      defaultView: z.string().optional(),
    }).optional(),
  }),
});

export const updateSystemSettingsSchema = z.object({
  body: z.object({
    email: z.object({
      smtpHost: z.string().optional(),
      smtpPort: z.number().int().positive().optional(),
      smtpUser: z.string().optional(),
      smtpPassword: z.string().optional(),
      senderEmail: z.string().email('Invalid email format').optional(),
      senderName: z.string().optional(),
      enableSSL: z.boolean().optional(),
    }).optional(),
    security: z.object({
      passwordPolicy: z.object({
        minLength: z.number().int().min(6).optional(),
        requireUppercase: z.boolean().optional(),
        requireLowercase: z.boolean().optional(),
        requireNumbers: z.boolean().optional(),
        requireSpecialChars: z.boolean().optional(),
        expiryDays: z.number().int().nonnegative().optional(),
      }).optional(),
      sessionTimeout: z.number().int().positive().optional(),
      maxLoginAttempts: z.number().int().positive().optional(),
      twoFactorAuth: z.boolean().optional(),
    }).optional(),
    localization: z.object({
      defaultLanguage: z.string().min(2).max(10).optional(),
      defaultTimezone: z.string().optional(),
      defaultDateFormat: z.string().optional(),
      defaultTimeFormat: z.string().optional(),
      defaultCurrency: z.string().length(3).optional(),
    }).optional(),
    branding: z.object({
      companyName: z.string().optional(),
      logoUrl: z.string().url('Invalid URL format').optional(),
      faviconUrl: z.string().url('Invalid URL format').optional(),
      primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color format').optional(),
      secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color format').optional(),
    }).optional(),
  }),
}); 