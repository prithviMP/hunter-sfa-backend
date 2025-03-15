import prisma from '../core/database/prisma';
import { AppError } from '../middlewares/errorHandler';
import { deleteCache, getCache, setCache } from '../core/cache/redis';
import { s3UploadFile } from '../utils/s3';
import { calculateDistance } from '../utils/geospatial';

// ============ VISIT SERVICES ============

/**
 * Get all visits with filtering, sorting and pagination
 */
export const getVisits = async (
  userId: string,
  page: number = 1,
  limit: number = 10,
  filters: {
    startDate?: string;
    endDate?: string;
    status?: string;
    companyId?: string;
    areaId?: string;
    search?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
  } = {}
) => {
  const { startDate, endDate, status, companyId, areaId, search, sortBy = 'startTime', order = 'desc' } = filters;
  
  // Build where conditions
  const where: any = {
    userId,
  };
  
  if (startDate) {
    where.startTime = {
      gte: new Date(startDate),
      ...where.startTime,
    };
  }
  
  if (endDate) {
    where.startTime = {
      lte: new Date(endDate),
      ...where.startTime,
    };
  }
  
  if (status) {
    where.status = status;
  }
  
  if (companyId) {
    where.companyId = companyId;
  }
  
  if (areaId) {
    where.company = {
      areaId,
    };
  }
  
  if (search) {
    where.OR = [
      { purpose: { contains: search, mode: 'insensitive' } },
      { notes: { contains: search, mode: 'insensitive' } },
      { company: { name: { contains: search, mode: 'insensitive' } } },
    ];
  }
  
  // Calculate skip for pagination
  const skip = (page - 1) * limit;
  
  // Execute query
  const [visits, totalCount] = await Promise.all([
    prisma.visit.findMany({
      where,
      select: {
        id: true,
        startTime: true,
        endTime: true,
        status: true,
        purpose: true,
        notes: true,
        createdAt: true,
        company: {
          select: {
            id: true,
            name: true,
            code: true,
            type: true,
            address: true,
          },
        },
        _count: {
          select: {
            photos: true,
            followUps: true,
            payments: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { [sortBy]: order },
    }),
    prisma.visit.count({ where }),
  ]);
  
  // Calculate pagination metadata
  const totalPages = Math.ceil(totalCount / limit);
  
  // Format response
  const formattedVisits = visits.map(visit => ({
    ...visit,
    photosCount: visit._count.photos,
    followUpsCount: visit._count.followUps,
    paymentsCount: visit._count.payments,
    _count: undefined,
  }));
  
  return {
    data: formattedVisits,
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
 * Get visit by ID
 */
export const getVisitById = async (id: string, userId: string) => {
  // Check cache first
  const cachedVisit = await getCache<string>(`visit:${id}`);
  if (cachedVisit) {
    return JSON.parse(cachedVisit);
  }
  
  // Find visit in database
  const visit = await prisma.visit.findUnique({
    where: { id },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          code: true,
          type: true,
          address: true,
          phone: true,
          email: true,
          area: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      },
      photos: {
        select: {
          id: true,
          photoUrl: true,
          caption: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
      followUps: {
        select: {
          id: true,
          dueDate: true,
          status: true,
          priority: true,
          notes: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
      payments: {
        select: {
          id: true,
          amount: true,
          paymentMethod: true,
          reference: true,
          notes: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });
  
  if (!visit) {
    throw new AppError('Visit not found', 404);
  }
  
  // Check if the visit belongs to the user
  if (visit.userId !== userId) {
    throw new AppError('You do not have permission to access this visit', 403);
  }
  
  // Cache visit
  await setCache(`visit:${id}`, JSON.stringify(visit), 60 * 5); // 5 minutes
  
  return visit;
};

/**
 * Create a visit
 */
export const createVisit = async (
  data: {
    companyId: string;
    startTime: string;
    purpose: string;
    notes?: string;
    location?: string;
  },
  userId: string
) => {
  // Check if company exists
  const company = await prisma.company.findUnique({
    where: { id: data.companyId },
  });
  
  if (!company) {
    throw new AppError('Company not found', 404);
  }
  
  // Create visit
  const visit = await prisma.visit.create({
    data: {
      userId,
      companyId: data.companyId,
      startTime: new Date(data.startTime),
      status: 'PLANNED',
      purpose: data.purpose,
      notes: data.notes,
      location: data.location,
    },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          code: true,
          type: true,
        },
      },
    },
  });
  
  return visit;
};

/**
 * Update a visit
 */
export const updateVisit = async (
  id: string,
  data: {
    endTime?: string;
    status?: string;
    purpose?: string;
    notes?: string;
  },
  userId: string
) => {
  // Check if visit exists and belongs to the user
  const visit = await prisma.visit.findUnique({
    where: { id },
  });
  
  if (!visit) {
    throw new AppError('Visit not found', 404);
  }
  
  if (visit.userId !== userId) {
    throw new AppError('You do not have permission to update this visit', 403);
  }
  
  // Update visit
  const updatedVisit = await prisma.visit.update({
    where: { id },
    data: {
      ...(data.endTime ? { endTime: new Date(data.endTime) } : {}),
      ...(data.status ? { status: data.status } : {}),
      ...(data.purpose ? { purpose: data.purpose } : {}),
      ...(data.notes !== undefined ? { notes: data.notes } : {}),
    },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
  });
  
  // Delete cache
  await deleteCache(`visit:${id}`);
  
  return updatedVisit;
};

// ============ CHECK IN/OUT SERVICES ============

/**
 * Perform check-in
 */
export const checkIn = async (
  data: {
    companyId: string;
    purpose: string;
    location: string; // GeoJSON Point string: "POINT(longitude latitude)"
    notes?: string;
  },
  userId: string
) => {
  // Check if company exists
  const company = await prisma.company.findUnique({
    where: { id: data.companyId },
  });
  
  if (!company) {
    throw new AppError('Company not found', 404);
  }
  
  // Check if there's already an active visit (with status CHECKED_IN) for this user
  const activeVisit = await prisma.visit.findFirst({
    where: {
      userId,
      status: 'CHECKED_IN',
    },
  });
  
  if (activeVisit) {
    throw new AppError('You already have an active check-in. Please check-out first.', 400);
  }
  
  // Create visit with CHECKED_IN status
  const visit = await prisma.visit.create({
    data: {
      userId,
      companyId: data.companyId,
      startTime: new Date(),
      status: 'CHECKED_IN',
      purpose: data.purpose,
      notes: data.notes,
      location: data.location,
    },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          code: true,
          type: true,
          address: true,
        },
      },
    },
  });
  
  return visit;
};

/**
 * Perform check-out
 */
export const checkOut = async (
  visitId: string,
  data: {
    location: string; // GeoJSON Point string
    notes?: string;
  },
  userId: string
) => {
  // Check if visit exists and belongs to the user
  const visit = await prisma.visit.findUnique({
    where: { id: visitId },
  });
  
  if (!visit) {
    throw new AppError('Visit not found', 404);
  }
  
  if (visit.userId !== userId) {
    throw new AppError('You do not have permission to check-out this visit', 403);
  }
  
  if (visit.status !== 'CHECKED_IN' && 
      visit.status !== 'PHOTOS_UPLOADED' &&
      visit.status !== 'DETAILS_CAPTURED' && 
      visit.status !== 'PAYMENT_RECORDED') {
    throw new AppError('Visit is not in a state that can be checked-out', 400);
  }
  
  // Update visit with CHECKED_OUT status and end time
  const updatedVisit = await prisma.visit.update({
    where: { id: visitId },
    data: {
      status: 'CHECKED_OUT',
      endTime: new Date(),
      notes: data.notes ? `${visit.notes || ''}\n\nCheck-out notes: ${data.notes}` : visit.notes,
    },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
  });
  
  // Delete cache
  await deleteCache(`visit:${visitId}`);
  
  return updatedVisit;
};

// ============ PHOTOS SERVICES ============

/**
 * Upload visit photo
 */
export const uploadVisitPhoto = async (
  visitId: string,
  file: Express.Multer.File,
  data: {
    caption?: string;
  },
  userId: string
) => {
  // Check if visit exists and belongs to the user
  const visit = await prisma.visit.findUnique({
    where: { id: visitId },
  });
  
  if (!visit) {
    throw new AppError('Visit not found', 404);
  }
  
  if (visit.userId !== userId) {
    throw new AppError('You do not have permission to upload photos for this visit', 403);
  }
  
  if (visit.status !== 'CHECKED_IN' && 
      visit.status !== 'PHOTOS_UPLOADED' && 
      visit.status !== 'DETAILS_CAPTURED') {
    throw new AppError('Cannot upload photos for a visit that is not checked-in', 400);
  }
  
  // Upload file to S3
  const s3Result = await s3UploadFile(file, `visits/${visitId}/photos`);
  
  // Create photo record
  const photo = await prisma.visitPhoto.create({
    data: {
      visitId,
      photoUrl: s3Result.fileUrl,
      caption: data.caption,
    },
  });
  
  // Update visit status if it's the first photo
  if (visit.status === 'CHECKED_IN') {
    await prisma.visit.update({
      where: { id: visitId },
      data: { status: 'PHOTOS_UPLOADED' },
    });
  }
  
  // Delete cache
  await deleteCache(`visit:${visitId}`);
  
  return photo;
};

// ============ FOLLOW-UP SERVICES ============

/**
 * Create follow-up for a visit
 */
export const createFollowUp = async (
  visitId: string,
  data: {
    dueDate: string;
    priority: string;
    notes?: string;
  },
  userId: string
) => {
  // Check if visit exists and belongs to the user
  const visit = await prisma.visit.findUnique({
    where: { id: visitId },
  });
  
  if (!visit) {
    throw new AppError('Visit not found', 404);
  }
  
  if (visit.userId !== userId) {
    throw new AppError('You do not have permission to create follow-ups for this visit', 403);
  }
  
  // Create follow-up
  const followUp = await prisma.followUp.create({
    data: {
      visitId,
      dueDate: new Date(data.dueDate),
      status: 'PENDING',
      priority: data.priority,
      notes: data.notes,
    },
    include: {
      visit: {
        select: {
          id: true,
          purpose: true,
          company: {
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
  
  // Update visit status if needed
  if (visit.status === 'CHECKED_IN' || visit.status === 'PHOTOS_UPLOADED') {
    await prisma.visit.update({
      where: { id: visitId },
      data: { status: 'DETAILS_CAPTURED' },
    });
  }
  
  // Delete cache
  await deleteCache(`visit:${visitId}`);
  
  return followUp;
};

/**
 * Get all follow-ups with filtering
 */
export const getFollowUps = async (
  userId: string,
  page: number = 1,
  limit: number = 10,
  filters: {
    startDate?: string;
    endDate?: string;
    status?: string;
    priority?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
  } = {}
) => {
  const { startDate, endDate, status, priority, sortBy = 'dueDate', order = 'asc' } = filters;
  
  // Build where conditions
  const where: any = {
    visit: {
      userId,
    },
  };
  
  if (startDate) {
    where.dueDate = {
      gte: new Date(startDate),
      ...where.dueDate,
    };
  }
  
  if (endDate) {
    where.dueDate = {
      lte: new Date(endDate),
      ...where.dueDate,
    };
  }
  
  if (status) {
    where.status = status;
  }
  
  if (priority) {
    where.priority = priority;
  }
  
  // Calculate skip for pagination
  const skip = (page - 1) * limit;
  
  // Execute query
  const [followUps, totalCount] = await Promise.all([
    prisma.followUp.findMany({
      where,
      select: {
        id: true,
        dueDate: true,
        status: true,
        priority: true,
        notes: true,
        createdAt: true,
        visit: {
          select: {
            id: true,
            purpose: true,
            company: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
      skip,
      take: limit,
      orderBy: { [sortBy]: order },
    }),
    prisma.followUp.count({ where }),
  ]);
  
  // Calculate pagination metadata
  const totalPages = Math.ceil(totalCount / limit);
  
  return {
    data: followUps,
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
 * Update follow-up
 */
export const updateFollowUp = async (
  id: string,
  data: {
    dueDate?: string;
    status?: string;
    priority?: string;
    notes?: string;
  },
  userId: string
) => {
  // Check if follow-up exists and belongs to the user
  const followUp = await prisma.followUp.findUnique({
    where: { id },
    include: {
      visit: true,
    },
  });
  
  if (!followUp) {
    throw new AppError('Follow-up not found', 404);
  }
  
  if (followUp.visit.userId !== userId) {
    throw new AppError('You do not have permission to update this follow-up', 403);
  }
  
  // Update follow-up
  const updatedFollowUp = await prisma.followUp.update({
    where: { id },
    data: {
      ...(data.dueDate ? { dueDate: new Date(data.dueDate) } : {}),
      ...(data.status ? { status: data.status } : {}),
      ...(data.priority ? { priority: data.priority } : {}),
      ...(data.notes !== undefined ? { notes: data.notes } : {}),
    },
    include: {
      visit: {
        select: {
          id: true,
          purpose: true,
          company: {
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
  
  // Delete cache
  await deleteCache(`visit:${followUp.visitId}`);
  
  return updatedFollowUp;
};

// ============ PAYMENT SERVICES ============

/**
 * Create payment for a visit
 */
export const createPayment = async (
  visitId: string,
  data: {
    amount: number;
    paymentMethod: string;
    reference?: string;
    notes?: string;
  },
  userId: string
) => {
  // Check if visit exists and belongs to the user
  const visit = await prisma.visit.findUnique({
    where: { id: visitId },
  });
  
  if (!visit) {
    throw new AppError('Visit not found', 404);
  }
  
  if (visit.userId !== userId) {
    throw new AppError('You do not have permission to create payments for this visit', 403);
  }
  
  // Create payment
  const payment = await prisma.payment.create({
    data: {
      visitId,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      reference: data.reference,
      notes: data.notes,
    },
    include: {
      visit: {
        select: {
          id: true,
          purpose: true,
          company: {
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
  
  // Update visit status
  await prisma.visit.update({
    where: { id: visitId },
    data: { status: 'PAYMENT_RECORDED' },
  });
  
  // Delete cache
  await deleteCache(`visit:${visitId}`);
  
  return payment;
};

// ============ NEARBY COMPANIES SERVICES ============

/**
 * Get nearby companies based on location
 */
export const getNearbyCompanies = async (
  latitude: number,
  longitude: number,
  radius: number = 5, // Default 5 km
  limit: number = 20
) => {
  // Create a point as text in PostGIS format
  const point = `POINT(${longitude} ${latitude})`;
  
  // Get companies sorted by distance
  const companies = await prisma.$queryRaw<any[]>`
    SELECT 
      c.id, 
      c.name, 
      c.code, 
      c.type, 
      c.address,
      c.status,
      ST_Distance(
        ST_SetSRID(ST_GeomFromText(${point}), 4326)::geography,
        ST_SetSRID(ST_GeomFromText(c.location), 4326)::geography
      ) / 1000 as distance_km
    FROM "Company" c
    WHERE 
      c."isActive" = true AND
      c.location IS NOT NULL AND
      ST_Distance(
        ST_SetSRID(ST_GeomFromText(${point}), 4326)::geography,
        ST_SetSRID(ST_GeomFromText(c.location), 4326)::geography
      ) / 1000 <= ${radius}
    ORDER BY distance_km ASC
    LIMIT ${limit}
  `;
  
  return companies;
};

// ============ REPORTS SERVICES ============

/**
 * Get daily report
 */
export const getDailyReport = async (
  userId: string,
  startDate: string,
  endDate?: string,
  filters: {
    areaId?: string;
    regionId?: string;
  } = {}
) => {
  const { areaId, regionId } = filters;
  
  // Parse dates
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  
  let end;
  if (endDate) {
    end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
  } else {
    end = new Date(start);
    end.setHours(23, 59, 59, 999);
  }
  
  // Build where conditions
  const where: any = {
    userId,
    startTime: {
      gte: start,
      lte: end,
    },
  };
  
  if (areaId) {
    where.company = {
      ...where.company,
      areaId,
    };
  }
  
  if (regionId) {
    where.company = {
      ...where.company,
      regionId,
    };
  }
  
  // Get summary statistics
  const [visitStats, visits] = await Promise.all([
    prisma.visit.groupBy({
      by: ['status'],
      where,
      _count: true,
    }),
    prisma.visit.findMany({
      where,
      select: {
        id: true,
        startTime: true,
        endTime: true,
        status: true,
        purpose: true,
        company: {
          select: {
            id: true,
            name: true,
            code: true,
            type: true,
          },
        },
        photos: {
          select: {
            id: true,
          },
        },
        followUps: {
          select: {
            id: true,
            status: true,
          },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            paymentMethod: true,
          },
        },
      },
      orderBy: { startTime: 'asc' },
    }),
  ]);
  
  // Calculate additional statistics
  const totalVisits = visits.length;
  const completedVisits = visits.filter(v => v.status === 'CHECKED_OUT' || v.status === 'COMPLETED').length;
  const totalPhotos = visits.reduce((sum, v) => sum + v.photos.length, 0);
  const totalFollowUps = visits.reduce((sum, v) => sum + v.followUps.length, 0);
  const pendingFollowUps = visits.reduce((sum, v) => 
    sum + v.followUps.filter((f: any) => f.status === 'PENDING').length, 0);
  const totalPayments = visits.reduce((sum, v) => 
    sum + v.payments.reduce((pSum: number, p: any) => pSum + p.amount, 0), 0);
  
  const totalDuration = visits.reduce((sum, v) => {
    if (v.startTime && v.endTime) {
      return sum + (new Date(v.endTime).getTime() - new Date(v.startTime).getTime());
    }
    return sum;
  }, 0) / (1000 * 60); // in minutes
  
  // Format response
  return {
    date: start.toISOString().split('T')[0],
    summary: {
      totalVisits,
      completedVisits,
      checkedInVisits: visits.filter(v => v.status === 'CHECKED_IN').length,
      cancelledVisits: visits.filter(v => v.status === 'CANCELLED').length,
      plannedVisits: visits.filter(v => v.status === 'PLANNED').length,
      averageDuration: totalVisits > 0 ? (totalDuration / completedVisits).toFixed(0) : 0, // in minutes
      totalPhotos,
      totalFollowUps,
      pendingFollowUps,
      totalPayments,
      visitBreakdown: visitStats.reduce((acc, stat) => {
        acc[stat.status] = stat._count;
        return acc;
      }, {} as Record<string, number>),
    },
    visits: visits.map(visit => ({
      id: visit.id,
      startTime: visit.startTime,
      endTime: visit.endTime,
      status: visit.status,
      purpose: visit.purpose,
      company: visit.company,
      photosCount: visit.photos.length,
      followUpsCount: visit.followUps.length,
      paymentsTotal: visit.payments.reduce((sum, p) => sum + p.amount, 0),
      duration: visit.startTime && visit.endTime 
        ? (new Date(visit.endTime).getTime() - new Date(visit.startTime).getTime()) / (1000 * 60)
        : null, // in minutes
    })),
  };
};

/**
 * Get weekly report
 */
export const getWeeklyReport = async (
  userId: string,
  startDate: string,
  endDate?: string,
  filters: {
    areaId?: string;
    regionId?: string;
  } = {}
) => {
  const { areaId, regionId } = filters;
  
  // Parse dates
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  
  // If endDate is not provided, add 6 days to startDate to get a full week
  let end;
  if (endDate) {
    end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
  } else {
    end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
  }
  
  // Build where conditions
  const where: any = {
    userId,
    startTime: {
      gte: start,
      lte: end,
    },
  };
  
  if (areaId) {
    where.company = {
      ...where.company,
      areaId,
    };
  }
  
  if (regionId) {
    where.company = {
      ...where.company,
      regionId,
    };
  }
  
  // Get visits grouped by day
  const visits = await prisma.visit.findMany({
    where,
    select: {
      id: true,
      startTime: true,
      endTime: true,
      status: true,
      purpose: true,
      company: {
        select: {
          id: true,
          name: true,
          code: true,
          type: true,
        },
      },
      photos: {
        select: {
          id: true,
        },
      },
      followUps: {
        select: {
          id: true,
          status: true,
        },
      },
      payments: {
        select: {
          id: true,
          amount: true,
          paymentMethod: true,
        },
      },
    },
    orderBy: { startTime: 'asc' },
  });
  
  // Group visits by day
  const visitsByDay = visits.reduce((acc, visit) => {
    const day = new Date(visit.startTime).toISOString().split('T')[0];
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(visit);
    return acc;
  }, {} as Record<string, any[]>);
  
  // Calculate daily summaries
  const dailySummaries = Object.keys(visitsByDay).map(day => {
    const dayVisits = visitsByDay[day];
    const totalVisits = dayVisits.length;
    const completedVisits = dayVisits.filter(v => v.status === 'CHECKED_OUT' || v.status === 'COMPLETED').length;
    const totalPhotos = dayVisits.reduce((sum, v) => sum + v.photos.length, 0);
    const totalFollowUps = dayVisits.reduce((sum, v) => sum + v.followUps.length, 0);
    const pendingFollowUps = dayVisits.reduce((sum, v) => 
      sum + v.followUps.filter((f: any) => f.status === 'PENDING').length, 0);
    const totalPayments = dayVisits.reduce((sum, v) => 
      sum + v.payments.reduce((pSum: number, p: any) => pSum + p.amount, 0), 0);
    
    return {
      date: day,
      totalVisits,
      completedVisits,
      totalPhotos,
      totalFollowUps,
      pendingFollowUps,
      totalPayments,
    };
  });
  
  // Calculate weekly totals
  const totalVisits = visits.length;
  const completedVisits = visits.filter(v => v.status === 'CHECKED_OUT' || v.status === 'COMPLETED').length;
  const totalPhotos = visits.reduce((sum, v) => sum + v.photos.length, 0);
  const totalFollowUps = visits.reduce((sum, v) => sum + v.followUps.length, 0);
  const pendingFollowUps = visits.reduce((sum, v) => 
    sum + v.followUps.filter((f: any) => f.status === 'PENDING').length, 0);
  const totalPayments = visits.reduce((sum, v) => 
    sum + v.payments.reduce((pSum: number, p: any) => pSum + p.amount, 0), 0);
  
  // Format response
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
    summary: {
      totalVisits,
      completedVisits,
      totalPhotos,
      totalFollowUps,
      pendingFollowUps,
      totalPayments,
      averageVisitsPerDay: dailySummaries.length > 0 ? totalVisits / dailySummaries.length : 0,
    },
    dailySummaries,
  };
};

/**
 * Get monthly report
 */
export const getMonthlyReport = async (
  userId: string,
  startDate: string,
  endDate?: string,
  filters: {
    areaId?: string;
    regionId?: string;
  } = {}
) => {
  const { areaId, regionId } = filters;
  
  // Parse dates
  const start = new Date(startDate);
  start.setDate(1); // First day of month
  start.setHours(0, 0, 0, 0);
  
  let end;
  if (endDate) {
    end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
  } else {
    end = new Date(start);
    end.setMonth(start.getMonth() + 1);
    end.setDate(0); // Last day of month
    end.setHours(23, 59, 59, 999);
  }
  
  // Build where conditions
  const where: any = {
    userId,
    startTime: {
      gte: start,
      lte: end,
    },
  };
  
  if (areaId) {
    where.company = {
      ...where.company,
      areaId,
    };
  }
  
  if (regionId) {
    where.company = {
      ...where.company,
      regionId,
    };
  }
  
  // Get company visit statistics
  const companyVisits = await prisma.visit.groupBy({
    by: ['companyId'],
    where,
    _count: true,
  });
  
  // Get top visited companies
  const topCompanies = await Promise.all(
    companyVisits
      .sort((a, b) => b._count - a._count)
      .slice(0, 5)
      .map(async cv => {
        const company = await prisma.company.findUnique({
          where: { id: cv.companyId },
          select: {
            id: true,
            name: true,
            code: true,
            type: true,
          },
        });
        return {
          ...company,
          visitCount: cv._count,
        };
      })
  );
  
  // Get weekly statistics
  const weeklyStats = [];
  let currentWeekStart = new Date(start);
  
  while (currentWeekStart <= end) {
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(currentWeekStart.getDate() + 6);
    
    if (weekEnd > end) {
      weekEnd.setTime(end.getTime());
    }
    
    const weekVisits = await prisma.visit.count({
      where: {
        ...where,
        startTime: {
          gte: currentWeekStart,
          lte: weekEnd,
        },
      },
    });
    
    weeklyStats.push({
      weekStartDate: currentWeekStart.toISOString().split('T')[0],
      weekEndDate: weekEnd.toISOString().split('T')[0],
      visitCount: weekVisits,
    });
    
    // Move to next week
    currentWeekStart = new Date(weekEnd);
    currentWeekStart.setDate(weekEnd.getDate() + 1);
  }
  
  // Get visit summary
  const visitStats = await prisma.visit.groupBy({
    by: ['status'],
    where,
    _count: true,
  });
  
  const visitCounts = visitStats.reduce((acc, stat) => {
    acc[stat.status] = stat._count;
    return acc;
  }, {} as Record<string, number>);
  
  // Get payment summary
  const payments = await prisma.payment.findMany({
    where: {
      visit: {
        ...where,
      },
    },
    select: {
      amount: true,
      paymentMethod: true,
    },
  });
  
  const paymentsByMethod = payments.reduce((acc, payment) => {
    if (!acc[payment.paymentMethod]) {
      acc[payment.paymentMethod] = 0;
    }
    acc[payment.paymentMethod] += payment.amount;
    return acc;
  }, {} as Record<string, number>);
  
  // Get total counts
  const [totalVisits, totalFollowUps, totalPaymentsAmount] = await Promise.all([
    prisma.visit.count({ where }),
    prisma.followUp.count({
      where: {
        visit: {
          ...where,
        },
      },
    }),
    prisma.payment.aggregate({
      where: {
        visit: {
          ...where,
        },
      },
      _sum: {
        amount: true,
      },
    }),
  ]);
  
  // Format response
  return {
    month: `${start.getFullYear()}-${(start.getMonth() + 1).toString().padStart(2, '0')}`,
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
    summary: {
      totalVisits,
      totalFollowUps,
      totalPaymentsAmount: totalPaymentsAmount._sum.amount || 0,
      visitStatusCounts: visitCounts,
      paymentsByMethod,
    },
    topCompanies,
    weeklyStats,
  };
}; 