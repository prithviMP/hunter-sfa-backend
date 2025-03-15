import prisma from '../core/database/prisma';
import { AppError } from '../middlewares/errorHandler';
import { deleteCache } from '../core/cache/redis';

// ============ AREA SERVICES ============

/**
 * Get all areas with filtering and pagination
 */
export const getAreas = async (
  page: number = 1,
  limit: number = 10,
  filters: {
    search?: string;
    cityId?: string;
    stateId?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
  } = {}
) => {
  const { search, cityId, stateId, sortBy = 'createdAt', order = 'desc' } = filters;
  
  // Build where conditions
  const where: any = {};
  
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { code: { contains: search, mode: 'insensitive' } },
    ];
  }
  
  if (cityId) {
    where.cityId = cityId;
  }
  
  if (stateId) {
    where.stateId = stateId;
  }
  
  // Calculate pagination
  const skip = (page - 1) * limit;
  
  // Get areas and total count
  const [areas, totalCount] = await Promise.all([
    prisma.area.findMany({
      where,
      select: {
        id: true,
        name: true,
        code: true,
        boundary: true,
        isActive: true,
        city: {
          select: {
            id: true,
            name: true,
          },
        },
        state: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
      skip,
      take: limit,
      orderBy: { [sortBy]: order },
    }),
    prisma.area.count({ where }),
  ]);
  
  // Calculate metadata
  const totalPages = Math.ceil(totalCount / limit);
  
  return {
    data: areas,
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
 * Get area by ID
 */
export const getAreaById = async (id: string) => {
  const area = await prisma.area.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      code: true,
      boundary: true,
      isActive: true,
      cityId: true,
      stateId: true,
      city: {
        select: {
          id: true,
          name: true,
        },
      },
      state: {
        select: {
          id: true,
          name: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });
  
  if (!area) {
    throw new AppError('Area not found', 404);
  }
  
  return area;
};

/**
 * Create a new area
 */
export const createArea = async (data: {
  name: string;
  code: string;
  cityId: string;
  stateId: string;
  boundary?: string;
  isActive?: boolean;
}) => {
  // Check if area code already exists
  const existingArea = await prisma.area.findFirst({
    where: { code: data.code },
  });
  
  if (existingArea) {
    throw new AppError('Area code already exists', 400);
  }
  
  // Create area
  const area = await prisma.area.create({
    data,
    select: {
      id: true,
      name: true,
      code: true,
      boundary: true,
      isActive: true,
      cityId: true,
      stateId: true,
      city: {
        select: {
          id: true,
          name: true,
        },
      },
      state: {
        select: {
          id: true,
          name: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });
  
  return area;
};

/**
 * Update an area
 */
export const updateArea = async (
  id: string,
  data: {
    name?: string;
    code?: string;
    cityId?: string;
    stateId?: string;
    boundary?: string;
    isActive?: boolean;
  }
) => {
  // Check if area exists
  const area = await prisma.area.findUnique({
    where: { id },
  });
  
  if (!area) {
    throw new AppError('Area not found', 404);
  }
  
  // Check if code is being changed and already exists
  if (data.code && data.code !== area.code) {
    const existingArea = await prisma.area.findFirst({
      where: {
        code: data.code,
        id: { not: id },
      },
    });
    
    if (existingArea) {
      throw new AppError('Area code already exists', 400);
    }
  }
  
  // Update area
  const updatedArea = await prisma.area.update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      code: true,
      boundary: true,
      isActive: true,
      cityId: true,
      stateId: true,
      city: {
        select: {
          id: true,
          name: true,
        },
      },
      state: {
        select: {
          id: true,
          name: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });
  
  // Clear cache
  await deleteCache(`area:${id}`);
  
  return updatedArea;
};

// ============ BRAND SERVICES ============

/**
 * Get all brands with filtering and pagination
 */
export const getBrands = async (
  page: number = 1,
  limit: number = 10,
  filters: {
    search?: string;
    isCompetitor?: boolean;
    sortBy?: string;
    order?: 'asc' | 'desc';
  } = {}
) => {
  const { search, isCompetitor, sortBy = 'createdAt', order = 'desc' } = filters;
  
  // Build where conditions
  const where: any = {};
  
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { code: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }
  
  if (isCompetitor !== undefined) {
    where.isCompetitor = isCompetitor;
  }
  
  // Calculate pagination
  const skip = (page - 1) * limit;
  
  // Get brands and total count
  const [brands, totalCount] = await Promise.all([
    prisma.brand.findMany({
      where,
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        isCompetitor: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      skip,
      take: limit,
      orderBy: { [sortBy]: order },
    }),
    prisma.brand.count({ where }),
  ]);
  
  // Calculate metadata
  const totalPages = Math.ceil(totalCount / limit);
  
  return {
    data: brands,
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
 * Get brand by ID
 */
export const getBrandById = async (id: string) => {
  const brand = await prisma.brand.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      code: true,
      description: true,
      isCompetitor: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  
  if (!brand) {
    throw new AppError('Brand not found', 404);
  }
  
  return brand;
};

/**
 * Create a new brand
 */
export const createBrand = async (data: {
  name: string;
  code: string;
  description?: string;
  isCompetitor?: boolean;
  isActive?: boolean;
}) => {
  // Check if brand code already exists
  const existingBrand = await prisma.brand.findFirst({
    where: { code: data.code },
  });
  
  if (existingBrand) {
    throw new AppError('Brand code already exists', 400);
  }
  
  // Create brand
  const brand = await prisma.brand.create({
    data,
    select: {
      id: true,
      name: true,
      code: true,
      description: true,
      isCompetitor: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  
  return brand;
};

/**
 * Update a brand
 */
export const updateBrand = async (
  id: string,
  data: {
    name?: string;
    code?: string;
    description?: string;
    isCompetitor?: boolean;
    isActive?: boolean;
  }
) => {
  // Check if brand exists
  const brand = await prisma.brand.findUnique({
    where: { id },
  });
  
  if (!brand) {
    throw new AppError('Brand not found', 404);
  }
  
  // Check if code is being changed and already exists
  if (data.code && data.code !== brand.code) {
    const existingBrand = await prisma.brand.findFirst({
      where: {
        code: data.code,
        id: { not: id },
      },
    });
    
    if (existingBrand) {
      throw new AppError('Brand code already exists', 400);
    }
  }
  
  // Update brand
  const updatedBrand = await prisma.brand.update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      code: true,
      description: true,
      isCompetitor: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  
  // Clear cache
  await deleteCache(`brand:${id}`);
  
  return updatedBrand;
};

// ============ HSN CODE SERVICES ============

/**
 * Get all HSN codes with filtering and pagination
 */
export const getHsnCodes = async (
  page: number = 1,
  limit: number = 10,
  filters: {
    search?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
  } = {}
) => {
  const { search, sortBy = 'code', order = 'asc' } = filters;
  
  // Build where conditions
  const where: any = {};
  
  if (search) {
    where.OR = [
      { code: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }
  
  // Calculate pagination
  const skip = (page - 1) * limit;
  
  // Get HSN codes and total count
  const [hsnCodes, totalCount] = await Promise.all([
    prisma.hSNCode.findMany({
      where,
      select: {
        id: true,
        code: true,
        description: true,
        gstPercentage: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      skip,
      take: limit,
      orderBy: { [sortBy]: order },
    }),
    prisma.hSNCode.count({ where }),
  ]);
  
  // Calculate metadata
  const totalPages = Math.ceil(totalCount / limit);
  
  return {
    data: hsnCodes,
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
 * Get HSN code by ID
 */
export const getHsnCodeById = async (id: string) => {
  const hsnCode = await prisma.hSNCode.findUnique({
    where: { id },
    select: {
      id: true,
      code: true,
      description: true,
      gstPercentage: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  
  if (!hsnCode) {
    throw new AppError('HSN code not found', 404);
  }
  
  return hsnCode;
};

/**
 * Create a new HSN code
 */
export const createHsnCode = async (data: {
  code: string;
  description: string;
  gstPercentage: number;
  isActive?: boolean;
}) => {
  // Check if HSN code already exists
  const existingCode = await prisma.hSNCode.findFirst({
    where: { code: data.code },
  });
  
  if (existingCode) {
    throw new AppError('HSN code already exists', 400);
  }
  
  // Create HSN code
  const hsnCode = await prisma.hSNCode.create({
    data,
    select: {
      id: true,
      code: true,
      description: true,
      gstPercentage: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  
  return hsnCode;
};

/**
 * Update an HSN code
 */
export const updateHsnCode = async (
  id: string,
  data: {
    code?: string;
    description?: string;
    gstPercentage?: number;
    isActive?: boolean;
  }
) => {
  // Check if HSN code exists
  const hsnCode = await prisma.hSNCode.findUnique({
    where: { id },
  });
  
  if (!hsnCode) {
    throw new AppError('HSN code not found', 404);
  }
  
  // Check if code is being changed and already exists
  if (data.code && data.code !== hsnCode.code) {
    const existingCode = await prisma.hSNCode.findFirst({
      where: {
        code: data.code,
        id: { not: id },
      },
    });
    
    if (existingCode) {
      throw new AppError('HSN code already exists', 400);
    }
  }
  
  // Update HSN code
  const updatedHsnCode = await prisma.hSNCode.update({
    where: { id },
    data,
    select: {
      id: true,
      code: true,
      description: true,
      gstPercentage: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  
  // Clear cache
  await deleteCache(`hsn-code:${id}`);
  
  return updatedHsnCode;
}; 