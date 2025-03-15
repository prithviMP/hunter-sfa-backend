import { z } from 'zod';

// ============ AREA SCHEMAS ============

export const areaSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name cannot exceed 100 characters'),
    code: z.string().min(1, 'Code is required').max(20, 'Code cannot exceed 20 characters'),
    cityId: z.string().uuid('Invalid city ID'),
    stateId: z.string().uuid('Invalid state ID'),
    boundary: z.string().optional(),
    isActive: z.boolean().default(true),
  }),
});

export const updateAreaSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid area ID'),
  }),
  body: z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name cannot exceed 100 characters').optional(),
    code: z.string().min(1, 'Code is required').max(20, 'Code cannot exceed 20 characters').optional(),
    cityId: z.string().uuid('Invalid city ID').optional(),
    stateId: z.string().uuid('Invalid state ID').optional(),
    boundary: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const getAreasSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional().transform(Number).default('1'),
    limit: z.string().regex(/^\d+$/).optional().transform(Number).default('10'),
    search: z.string().optional(),
    cityId: z.string().optional(),
    stateId: z.string().optional(),
    sortBy: z.string().optional().default('createdAt'),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

// ============ BRAND SCHEMAS ============

export const brandSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name cannot exceed 100 characters'),
    code: z.string().min(1, 'Code is required').max(20, 'Code cannot exceed 20 characters'),
    description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
    isCompetitor: z.boolean().default(false),
    isActive: z.boolean().default(true),
  }),
});

export const updateBrandSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid brand ID'),
  }),
  body: z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name cannot exceed 100 characters').optional(),
    code: z.string().min(1, 'Code is required').max(20, 'Code cannot exceed 20 characters').optional(),
    description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
    isCompetitor: z.boolean().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const getBrandsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional().transform(Number).default('1'),
    limit: z.string().regex(/^\d+$/).optional().transform(Number).default('10'),
    search: z.string().optional(),
    isCompetitor: z.enum(['true', 'false']).optional().transform(val => val === 'true'),
    sortBy: z.string().optional().default('createdAt'),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

// ============ HSN CODE SCHEMAS ============

export const hsnCodeSchema = z.object({
  body: z.object({
    code: z.string().min(1, 'Code is required').max(20, 'Code cannot exceed 20 characters'),
    description: z.string().min(1, 'Description is required').max(500, 'Description cannot exceed 500 characters'),
    gstPercentage: z.number().min(0, 'GST percentage cannot be negative').max(100, 'GST percentage cannot exceed 100'),
    isActive: z.boolean().default(true),
  }),
});

export const updateHsnCodeSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid HSN code ID'),
  }),
  body: z.object({
    code: z.string().min(1, 'Code is required').max(20, 'Code cannot exceed 20 characters').optional(),
    description: z.string().min(1, 'Description is required').max(500, 'Description cannot exceed 500 characters').optional(),
    gstPercentage: z.number().min(0, 'GST percentage cannot be negative').max(100, 'GST percentage cannot exceed 100').optional(),
    isActive: z.boolean().optional(),
  }),
});

export const getHsnCodesSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional().transform(Number).default('1'),
    limit: z.string().regex(/^\d+$/).optional().transform(Number).default('10'),
    search: z.string().optional(),
    sortBy: z.string().optional().default('code'),
    order: z.enum(['asc', 'desc']).optional().default('asc'),
  }),
});

// ============ CITY/STATE SCHEMAS ============

export const stateSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name cannot exceed 100 characters'),
    code: z.string().min(1, 'Code is required').max(10, 'Code cannot exceed 10 characters'),
    countryId: z.string().uuid('Invalid country ID'),
    isActive: z.boolean().default(true),
  }),
});

export const getStatesSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional().transform(Number).default('1'),
    limit: z.string().regex(/^\d+$/).optional().transform(Number).default('100'),
    search: z.string().optional(),
    countryId: z.string().optional(),
  }),
});

export const citySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name cannot exceed 100 characters'),
    code: z.string().min(1, 'Code is required').max(10, 'Code cannot exceed 10 characters'),
    stateId: z.string().uuid('Invalid state ID'),
    isActive: z.boolean().default(true),
  }),
});

export const getCitiesSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional().transform(Number).default('1'),
    limit: z.string().regex(/^\d+$/).optional().transform(Number).default('10'),
    search: z.string().optional(),
    stateId: z.string().optional(),
  }),
});

// ============ EMAIL TEMPLATE SCHEMAS ============

export const emailTemplateSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name cannot exceed 100 characters'),
    subject: z.string().min(1, 'Subject is required').max(200, 'Subject cannot exceed 200 characters'),
    content: z.string().min(1, 'Content is required'),
    description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
    isActive: z.boolean().default(true),
  }),
});

export const updateEmailTemplateSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid email template ID'),
  }),
  body: z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name cannot exceed 100 characters').optional(),
    subject: z.string().min(1, 'Subject is required').max(200, 'Subject cannot exceed 200 characters').optional(),
    content: z.string().min(1, 'Content is required').optional(),
    description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
    isActive: z.boolean().optional(),
  }),
});

export const getEmailTemplatesSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional().transform(Number).default('1'),
    limit: z.string().regex(/^\d+$/).optional().transform(Number).default('10'),
    search: z.string().optional(),
  }),
});

// ============ PDF TEMPLATE SCHEMAS ============

export const pdfTemplateSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name cannot exceed 100 characters'),
    content: z.string().min(1, 'Content is required'),
    description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
    isActive: z.boolean().default(true),
  }),
});

export const updatePdfTemplateSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid PDF template ID'),
  }),
  body: z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name cannot exceed 100 characters').optional(),
    content: z.string().min(1, 'Content is required').optional(),
    description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
    isActive: z.boolean().optional(),
  }),
});

export const getPdfTemplatesSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional().transform(Number).default('1'),
    limit: z.string().regex(/^\d+$/).optional().transform(Number).default('10'),
    search: z.string().optional(),
  }),
});

// ============ SHORTCODE SCHEMAS ============

export const shortcodeSchema = z.object({
  body: z.object({
    code: z.string().min(1, 'Code is required').max(50, 'Code cannot exceed 50 characters'),
    description: z.string().min(1, 'Description is required').max(500, 'Description cannot exceed 500 characters'),
    replacementText: z.string().min(1, 'Replacement text is required'),
    category: z.string().max(100, 'Category cannot exceed 100 characters').optional(),
    isActive: z.boolean().default(true),
  }),
});

export const updateShortcodeSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid shortcode ID'),
  }),
  body: z.object({
    code: z.string().min(1, 'Code is required').max(50, 'Code cannot exceed 50 characters').optional(),
    description: z.string().min(1, 'Description is required').max(500, 'Description cannot exceed 500 characters').optional(),
    replacementText: z.string().min(1, 'Replacement text is required').optional(),
    category: z.string().max(100, 'Category cannot exceed 100 characters').optional(),
    isActive: z.boolean().optional(),
  }),
});

export const getShortcodesSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional().transform(Number).default('1'),
    limit: z.string().regex(/^\d+$/).optional().transform(Number).default('10'),
    search: z.string().optional(),
    category: z.string().optional(),
  }),
});

// ============ IMPORT/EXPORT SCHEMAS ============

export const importCompanySchema = z.object({
  body: z.object({
    mappings: z.record(z.string(), z.string()).optional(),
    updateExisting: z.boolean().default(false),
  }),
});

export const importContactSchema = z.object({
  body: z.object({
    mappings: z.record(z.string(), z.string()).optional(),
    updateExisting: z.boolean().default(false),
  }),
});

export const exportQuerySchema = z.object({
  query: z.object({
    format: z.enum(['csv', 'excel']).default('csv'),
    filters: z.string().optional().transform(val => {
      try {
        return val ? JSON.parse(val) : {};
      } catch (e) {
        return {};
      }
    }),
    dateRange: z.string().optional(),
  }),
}); 