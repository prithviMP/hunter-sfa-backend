import { z } from 'zod';

// ============ CALL SCHEMAS ============

export const getCallsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional().transform(Number).default('1'),
    limit: z.string().regex(/^\d+$/).optional().transform(Number).default('10'),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    status: z.string().optional(),
    contactId: z.string().uuid('Invalid contact ID').optional(),
    companyId: z.string().uuid('Invalid company ID').optional(),
    search: z.string().optional(),
    sortBy: z.string().optional().default('scheduledTime'),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

export const getCallByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid call ID'),
  }),
});

export const createCallSchema = z.object({
  body: z.object({
    contactId: z.string().uuid('Invalid contact ID').optional(),
    companyId: z.string().uuid('Invalid company ID').optional(),
    scheduledTime: z.string().datetime('Invalid date format'),
    purpose: z.string().min(1, 'Purpose is required').max(200, 'Purpose cannot exceed 200 characters'),
    notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
  })
  .refine(data => data.contactId || data.companyId, {
    message: 'Either contactId or companyId must be provided',
    path: ['contactId', 'companyId']
  }),
});

export const updateCallSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid call ID'),
  }),
  body: z.object({
    scheduledTime: z.string().datetime('Invalid date format').optional(),
    purpose: z.string().min(1, 'Purpose is required').max(200, 'Purpose cannot exceed 200 characters').optional(),
    notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
    outcome: z.string().max(500, 'Outcome cannot exceed 500 characters').optional(),
  }),
});

export const deleteCallSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid call ID'),
  }),
});

// ============ CALL STATUS SCHEMAS ============

export const startCallSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid call ID'),
  }),
});

export const endCallSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid call ID'),
  }),
  body: z.object({
    outcome: z.string().min(1, 'Outcome is required').max(500, 'Outcome cannot exceed 500 characters'),
    notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
  }),
});

export const cancelCallSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid call ID'),
  }),
  body: z.object({
    reason: z.string().min(1, 'Reason is required').max(200, 'Reason cannot exceed 200 characters'),
  }),
});

// ============ CALL LOGS SCHEMAS ============

export const getCallLogsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional().transform(Number).default('1'),
    limit: z.string().regex(/^\d+$/).optional().transform(Number).default('10'),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    status: z.string().optional(),
    contactId: z.string().uuid('Invalid contact ID').optional(),
    companyId: z.string().uuid('Invalid company ID').optional(),
    sortBy: z.string().optional().default('createdAt'),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

export const getPendingLogsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional().transform(Number).default('1'),
    limit: z.string().regex(/^\d+$/).optional().transform(Number).default('10'),
  }),
});

// ============ CALL REPORTS SCHEMAS ============

export const reportsSchema = z.object({
  query: z.object({
    startDate: z.string().datetime('Invalid start date format'),
    endDate: z.string().datetime('Invalid end date format').optional(),
    userId: z.string().uuid('Invalid user ID').optional(),
  }),
}); 