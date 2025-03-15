import { z } from 'zod';

// ============ VISIT SCHEMAS ============

export const getVisitsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional().transform(Number).default('1'),
    limit: z.string().regex(/^\d+$/).optional().transform(Number).default('10'),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    status: z.string().optional(),
    companyId: z.string().uuid('Invalid company ID').optional(),
    areaId: z.string().uuid('Invalid area ID').optional(),
    search: z.string().optional(),
    sortBy: z.string().optional().default('startTime'),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

export const getVisitByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid visit ID'),
  }),
});

export const createVisitSchema = z.object({
  body: z.object({
    companyId: z.string().uuid('Invalid company ID'),
    startTime: z.string().datetime('Invalid date format'),
    purpose: z.string().min(1, 'Purpose is required').max(200, 'Purpose cannot exceed 200 characters'),
    notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
    location: z.string().optional(), // GeoJSON Point format
  }),
});

export const updateVisitSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid visit ID'),
  }),
  body: z.object({
    endTime: z.string().datetime('Invalid date format').optional(),
    status: z.enum([
      'PLANNED', 
      'CHECKED_IN', 
      'PHOTOS_UPLOADED', 
      'DETAILS_CAPTURED', 
      'PAYMENT_RECORDED', 
      'CHECKED_OUT', 
      'COMPLETED', 
      'CANCELLED'
    ]).optional(),
    purpose: z.string().min(1, 'Purpose is required').max(200, 'Purpose cannot exceed 200 characters').optional(),
    notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
  }),
});

// ============ CHECK-IN/OUT SCHEMAS ============

export const checkInSchema = z.object({
  body: z.object({
    companyId: z.string().uuid('Invalid company ID'),
    purpose: z.string().min(1, 'Purpose is required').max(200, 'Purpose cannot exceed 200 characters'),
    location: z.string().min(1, 'Location is required'), // GeoJSON Point format
    notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
  }),
});

export const checkOutSchema = z.object({
  params: z.object({
    visitId: z.string().uuid('Invalid visit ID'),
  }),
  body: z.object({
    location: z.string().min(1, 'Location is required'), // GeoJSON Point format
    notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
  }),
});

// ============ PHOTOS SCHEMAS ============

export const uploadPhotoSchema = z.object({
  params: z.object({
    visitId: z.string().uuid('Invalid visit ID'),
  }),
  body: z.object({
    caption: z.string().max(100, 'Caption cannot exceed 100 characters').optional(),
  }),
  // Note: File validation will be handled by multer middleware
});

// ============ FOLLOW-UP SCHEMAS ============

export const createFollowUpSchema = z.object({
  params: z.object({
    visitId: z.string().uuid('Invalid visit ID'),
  }),
  body: z.object({
    dueDate: z.string().datetime('Invalid date format'),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
    notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
  }),
});

export const getFollowUpsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional().transform(Number).default('1'),
    limit: z.string().regex(/^\d+$/).optional().transform(Number).default('10'),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    status: z.enum(['PENDING', 'COMPLETED', 'CANCELLED']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
    sortBy: z.string().optional().default('dueDate'),
    order: z.enum(['asc', 'desc']).optional().default('asc'),
  }),
});

export const updateFollowUpSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid follow-up ID'),
  }),
  body: z.object({
    dueDate: z.string().datetime('Invalid date format').optional(),
    status: z.enum(['PENDING', 'COMPLETED', 'CANCELLED']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
    notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
  }),
});

// ============ PAYMENT SCHEMAS ============

export const createPaymentSchema = z.object({
  params: z.object({
    visitId: z.string().uuid('Invalid visit ID'),
  }),
  body: z.object({
    amount: z.number().positive('Amount must be positive'),
    paymentMethod: z.enum(['CASH', 'CHEQUE', 'ONLINE', 'UPI', 'BANK_TRANSFER']),
    reference: z.string().max(100, 'Reference cannot exceed 100 characters').optional(),
    notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
  }),
});

// ============ NEARBY COMPANIES SCHEMA ============

export const nearbyCompaniesSchema = z.object({
  query: z.object({
    latitude: z.string().regex(/^-?\d+(\.\d+)?$/, 'Invalid latitude format'),
    longitude: z.string().regex(/^-?\d+(\.\d+)?$/, 'Invalid longitude format'),
    radius: z.string().regex(/^\d+(\.\d+)?$/).optional().default('5'), // Default 5 km
    limit: z.string().regex(/^\d+$/).optional().transform(Number).default('20'),
  }),
});

// ============ REPORTS SCHEMAS ============

export const reportsSchema = z.object({
  query: z.object({
    startDate: z.string().datetime('Invalid start date format'),
    endDate: z.string().datetime('Invalid end date format').optional(),
    userId: z.string().uuid('Invalid user ID').optional(),
    areaId: z.string().uuid('Invalid area ID').optional(),
    regionId: z.string().uuid('Invalid region ID').optional(),
  }),
}); 