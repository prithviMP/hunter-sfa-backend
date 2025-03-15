import prisma from '../core/database/prisma';
import { AppError } from '../middlewares/errorHandler';
import { deleteCache, getCache, setCache } from '../core/cache/redis';

// ============ COMPANY SERVICES ============

/**
 * Get all companies with filtering, sorting and pagination
 */
export const getCompanies = async (
  page: number = 1,
  limit: number = 10,
  filters: {
    search?: string;
    type?: string;
    status?: string;
    areaId?: string;
    regionId?: string;
    isActive?: boolean;
    sortBy?: string;
    order?: 'asc' | 'desc';
  } = {}
) => {
  const { search, type, status, areaId, regionId, isActive, sortBy = 'createdAt', order = 'desc' } = filters;
  
  // Build where conditions
  const where: any = {};
  
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { code: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
    ];
  }
  
  if (type) {
    where.type = type;
  }
  
  if (status) {
    where.status = status;
  }
  
  if (areaId) {
    where.areaId = areaId;
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
  const [companies, totalCount] = await Promise.all([
    prisma.company.findMany({
      where,
      select: {
        id: true,
        name: true,
        code: true,
        type: true,
        address: true,
        phone: true,
        email: true,
        website: true,
        status: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        area: {
          select: {
            id: true,
            name: true,
          },
        },
        region: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            contacts: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { [sortBy]: order },
    }),
    prisma.company.count({ where }),
  ]);
  
  // Calculate pagination metadata
  const totalPages = Math.ceil(totalCount / limit);
  
  // Format response
  const formattedCompanies = companies.map(company => ({
    ...company,
    contactsCount: company._count.contacts,
    _count: undefined,
  }));
  
  return {
    data: formattedCompanies,
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
 * Get company by ID
 */
export const getCompanyById = async (id: string) => {
  // Check cache first
  const cachedCompany = await getCache<string>(`company:${id}`);
  if (cachedCompany) {
    return JSON.parse(cachedCompany);
  }
  
  // Find company in database
  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        }
      },
      approvedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        }
      },
      area: {
        select: {
          id: true,
          name: true,
          code: true,
        }
      },
      region: {
        select: {
          id: true,
          name: true,
          code: true,
        }
      },
      contacts: {
        where: {
          isActive: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });
  
  if (!company) {
    throw new AppError('Company not found', 404);
  }
  
  // Cache company
  await setCache(`company:${id}`, JSON.stringify(company), 60 * 15); // 15 minutes
  
  return company;
};

/**
 * Create a new company
 */
export const createCompany = async (
  data: {
    name: string;
    code: string;
    type: string;
    address?: any;
    phone?: string;
    email?: string;
    website?: string;
    gstNumber?: string;
    panNumber?: string;
    description?: string;
    logo?: string;
    areaId?: string;
    regionId?: string;
  },
  userId: string
) => {
  // Check if company code already exists
  const existingCompany = await prisma.company.findUnique({
    where: { code: data.code },
  });
  
  if (existingCompany) {
    throw new AppError('Company code already exists', 400);
  }
  
  // Create company
  const company = await prisma.company.create({
    data: {
      ...data,
      createdById: userId,
      status: 'pending',
    },
    include: {
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        }
      },
      area: {
        select: {
          id: true,
          name: true,
        }
      },
      region: {
        select: {
          id: true,
          name: true,
        }
      },
    },
  });
  
  return company;
};

/**
 * Update a company
 */
export const updateCompany = async (
  id: string,
  data: {
    name?: string;
    code?: string;
    type?: string;
    address?: any;
    phone?: string;
    email?: string;
    website?: string;
    gstNumber?: string;
    panNumber?: string;
    description?: string;
    logo?: string;
    areaId?: string | null;
    regionId?: string | null;
  }
) => {
  // Check if company exists
  const company = await prisma.company.findUnique({
    where: { id },
  });
  
  if (!company) {
    throw new AppError('Company not found', 404);
  }
  
  // Check if code is being changed and already exists
  if (data.code && data.code !== company.code) {
    const existingCompany = await prisma.company.findUnique({
      where: { code: data.code },
    });
    
    if (existingCompany) {
      throw new AppError('Company code already exists', 400);
    }
  }
  
  // Can only update if status is 'pending' or the company is already approved
  if (company.status !== 'pending' && company.status !== 'approved') {
    throw new AppError('Cannot update company with current status', 400);
  }
  
  // If company was already approved, set back to pending
  const updatedData = {
    ...data,
    ...(company.status === 'approved' ? { status: 'pending', approvedById: null } : {})
  };
  
  // Update company
  const updatedCompany = await prisma.company.update({
    where: { id },
    data: updatedData,
    include: {
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        }
      },
      approvedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        }
      },
      area: {
        select: {
          id: true,
          name: true,
        }
      },
      region: {
        select: {
          id: true,
          name: true,
        }
      },
    },
  });
  
  // Delete cache
  await deleteCache(`company:${id}`);
  
  return updatedCompany;
};

/**
 * Approve a company
 */
export const approveCompany = async (id: string, userId: string, reason?: string) => {
  // Check if company exists
  const company = await prisma.company.findUnique({
    where: { id },
  });
  
  if (!company) {
    throw new AppError('Company not found', 404);
  }
  
  // Can only approve if status is 'pending'
  if (company.status !== 'pending') {
    throw new AppError('Company is not in pending status', 400);
  }
  
  // Update company
  const updatedCompany = await prisma.company.update({
    where: { id },
    data: {
      status: 'approved',
      approvedById: userId,
      statusReason: reason,
    },
    include: {
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        }
      },
      approvedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        }
      },
    },
  });
  
  // Delete cache
  await deleteCache(`company:${id}`);
  
  return updatedCompany;
};

/**
 * Reject a company
 */
export const rejectCompany = async (id: string, userId: string, reason: string) => {
  // Check if company exists
  const company = await prisma.company.findUnique({
    where: { id },
  });
  
  if (!company) {
    throw new AppError('Company not found', 404);
  }
  
  // Can only reject if status is 'pending'
  if (company.status !== 'pending') {
    throw new AppError('Company is not in pending status', 400);
  }
  
  // Reason is required for rejection
  if (!reason) {
    throw new AppError('Reason is required for rejection', 400);
  }
  
  // Update company
  const updatedCompany = await prisma.company.update({
    where: { id },
    data: {
      status: 'rejected',
      approvedById: userId,
      statusReason: reason,
    },
    include: {
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        }
      },
      approvedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        }
      },
    },
  });
  
  // Delete cache
  await deleteCache(`company:${id}`);
  
  return updatedCompany;
};

/**
 * Deactivate a company
 */
export const deactivateCompany = async (id: string) => {
  // Check if company exists
  const company = await prisma.company.findUnique({
    where: { id },
  });
  
  if (!company) {
    throw new AppError('Company not found', 404);
  }
  
  // Update company
  await prisma.company.update({
    where: { id },
    data: {
      isActive: false,
    },
  });
  
  // Delete cache
  await deleteCache(`company:${id}`);
};

// ============ CONTACT SERVICES ============

/**
 * Get contacts for a company
 */
export const getContactsByCompany = async (
  companyId: string,
  page: number = 1,
  limit: number = 10,
  filters: {
    search?: string;
    isDecisionMaker?: boolean;
    isActive?: boolean;
    sortBy?: string;
    order?: 'asc' | 'desc';
  } = {}
) => {
  const { search, isDecisionMaker, isActive, sortBy = 'createdAt', order = 'desc' } = filters;
  
  // Check if company exists
  const company = await prisma.company.findUnique({
    where: { id: companyId },
  });
  
  if (!company) {
    throw new AppError('Company not found', 404);
  }
  
  // Build where conditions
  const where: any = {
    companyId,
  };
  
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
      { designation: { contains: search, mode: 'insensitive' } },
    ];
  }
  
  if (isDecisionMaker !== undefined) {
    where.isDecisionMaker = isDecisionMaker;
  }
  
  if (isActive !== undefined) {
    where.isActive = isActive;
  }
  
  // Calculate skip for pagination
  const skip = (page - 1) * limit;
  
  // Execute query
  const [contacts, totalCount] = await Promise.all([
    prisma.contact.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: order },
    }),
    prisma.contact.count({ where }),
  ]);
  
  // Calculate pagination metadata
  const totalPages = Math.ceil(totalCount / limit);
  
  return {
    data: contacts,
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
 * Get contact by ID
 */
export const getContactById = async (id: string) => {
  const contact = await prisma.contact.findUnique({
    where: { id },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          code: true,
        }
      },
    },
  });
  
  if (!contact) {
    throw new AppError('Contact not found', 404);
  }
  
  return contact;
};

/**
 * Create a contact for a company
 */
export const createContact = async (
  companyId: string,
  data: {
    firstName: string;
    lastName: string;
    designation?: string;
    email?: string;
    phone?: string;
    alternatePhone?: string;
    isDecisionMaker?: boolean;
    notes?: string;
  }
) => {
  // Check if company exists
  const company = await prisma.company.findUnique({
    where: { id: companyId },
  });
  
  if (!company) {
    throw new AppError('Company not found', 404);
  }
  
  // Create contact
  const contact = await prisma.contact.create({
    data: {
      ...data,
      companyId,
    },
    include: {
      company: {
        select: {
          id: true,
          name: true,
        }
      },
    },
  });
  
  // Delete company cache as contact count has changed
  await deleteCache(`company:${companyId}`);
  
  return contact;
};

/**
 * Update a contact
 */
export const updateContact = async (
  id: string,
  data: {
    firstName?: string;
    lastName?: string;
    designation?: string;
    email?: string;
    phone?: string;
    alternatePhone?: string;
    isDecisionMaker?: boolean;
    isActive?: boolean;
    notes?: string;
  }
) => {
  // Check if contact exists
  const contact = await prisma.contact.findUnique({
    where: { id },
  });
  
  if (!contact) {
    throw new AppError('Contact not found', 404);
  }
  
  // Update contact
  const updatedContact = await prisma.contact.update({
    where: { id },
    data,
    include: {
      company: {
        select: {
          id: true,
          name: true,
        }
      },
    },
  });
  
  // Delete company cache
  await deleteCache(`company:${contact.companyId}`);
  
  return updatedContact;
};

/**
 * Delete a contact
 */
export const deleteContact = async (id: string) => {
  // Check if contact exists
  const contact = await prisma.contact.findUnique({
    where: { id },
  });
  
  if (!contact) {
    throw new AppError('Contact not found', 404);
  }
  
  // Delete contact
  await prisma.contact.delete({
    where: { id },
  });
  
  // Delete company cache
  await deleteCache(`company:${contact.companyId}`);
}; 