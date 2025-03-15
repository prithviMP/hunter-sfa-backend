import { z } from 'zod';

// ============ COMPANY SCHEMAS ============

export const getCompaniesSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional().transform(Number).default('1'),
    limit: z.string().regex(/^\d+$/).optional().transform(Number).default('10'),
    search: z.string().optional(),
    type: z.string().optional(),
    status: z.enum(['pending', 'approved', 'rejected']).optional(),
    areaId: z.string().uuid('Invalid area ID').optional(),
    regionId: z.string().uuid('Invalid region ID').optional(),
    isActive: z.enum(['true', 'false']).optional().transform(val => val === 'true'),
    sortBy: z.string().optional().default('createdAt'),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

export const createCompanySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Company name is required').max(100, 'Company name cannot exceed 100 characters'),
    code: z.string().min(1, 'Company code is required').max(20, 'Company code cannot exceed 20 characters')
      .regex(/^[A-Za-z0-9-_]+$/, 'Company code can only contain letters, numbers, hyphens and underscores'),
    type: z.enum(['customer', 'distributor', 'supplier', 'partner', 'other'], {
      errorMap: () => ({ message: 'Invalid company type' }),
    }),
    address: z.object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().optional(),
    }).optional(),
    phone: z.string().max(20, 'Phone number cannot exceed 20 characters').optional(),
    email: z.string().email('Invalid email format').optional(),
    website: z.string().url('Invalid URL format').optional(),
    gstNumber: z.string().max(20, 'GST number cannot exceed 20 characters').optional(),
    panNumber: z.string().max(20, 'PAN number cannot exceed 20 characters').optional(),
    description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
    logo: z.string().url('Invalid URL format').optional(),
    areaId: z.string().uuid('Invalid area ID').optional(),
    regionId: z.string().uuid('Invalid region ID').optional(),
  }),
});

export const updateCompanySchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid company ID'),
  }),
  body: z.object({
    name: z.string().min(1, 'Company name is required').max(100, 'Company name cannot exceed 100 characters').optional(),
    code: z.string().min(1, 'Company code is required').max(20, 'Company code cannot exceed 20 characters')
      .regex(/^[A-Za-z0-9-_]+$/, 'Company code can only contain letters, numbers, hyphens and underscores')
      .optional(),
    type: z.enum(['customer', 'distributor', 'supplier', 'partner', 'other'], {
      errorMap: () => ({ message: 'Invalid company type' }),
    }).optional(),
    address: z.object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().optional(),
    }).optional(),
    phone: z.string().max(20, 'Phone number cannot exceed 20 characters').optional(),
    email: z.string().email('Invalid email format').optional(),
    website: z.string().url('Invalid URL format').optional(),
    gstNumber: z.string().max(20, 'GST number cannot exceed 20 characters').optional(),
    panNumber: z.string().max(20, 'PAN number cannot exceed 20 characters').optional(),
    description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
    logo: z.string().url('Invalid URL format').optional(),
    areaId: z.string().uuid('Invalid area ID').optional().nullable(),
    regionId: z.string().uuid('Invalid region ID').optional().nullable(),
  }),
});

export const approveRejectCompanySchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid company ID'),
  }),
  body: z.object({
    reason: z.string().max(500, 'Reason cannot exceed 500 characters').optional(),
  }),
});

// ============ CONTACT SCHEMAS ============

export const getContactsSchema = z.object({
  params: z.object({
    companyId: z.string().uuid('Invalid company ID'),
  }),
  query: z.object({
    page: z.string().regex(/^\d+$/).optional().transform(Number).default('1'),
    limit: z.string().regex(/^\d+$/).optional().transform(Number).default('10'),
    search: z.string().optional(),
    isDecisionMaker: z.enum(['true', 'false']).optional().transform(val => val === 'true'),
    isActive: z.enum(['true', 'false']).optional().transform(val => val === 'true'),
    sortBy: z.string().optional().default('createdAt'),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

export const createContactSchema = z.object({
  params: z.object({
    companyId: z.string().uuid('Invalid company ID'),
  }),
  body: z.object({
    firstName: z.string().min(1, 'First name is required').max(50, 'First name cannot exceed 50 characters'),
    lastName: z.string().min(1, 'Last name is required').max(50, 'Last name cannot exceed 50 characters'),
    designation: z.string().max(100, 'Designation cannot exceed 100 characters').optional(),
    email: z.string().email('Invalid email format').optional(),
    phone: z.string().max(20, 'Phone number cannot exceed 20 characters').optional(),
    alternatePhone: z.string().max(20, 'Alternate phone number cannot exceed 20 characters').optional(),
    isDecisionMaker: z.boolean().optional().default(false),
    notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
  }),
});

export const updateContactSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid contact ID'),
  }),
  body: z.object({
    firstName: z.string().min(1, 'First name is required').max(50, 'First name cannot exceed 50 characters').optional(),
    lastName: z.string().min(1, 'Last name is required').max(50, 'Last name cannot exceed 50 characters').optional(),
    designation: z.string().max(100, 'Designation cannot exceed 100 characters').optional(),
    email: z.string().email('Invalid email format').optional(),
    phone: z.string().max(20, 'Phone number cannot exceed 20 characters').optional(),
    alternatePhone: z.string().max(20, 'Alternate phone number cannot exceed 20 characters').optional(),
    isDecisionMaker: z.boolean().optional(),
    isActive: z.boolean().optional(),
    notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
  }),
}); 