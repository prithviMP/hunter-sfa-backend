import prisma from '../core/database/prisma';
import { AppError } from '../middlewares/errorHandler';
import { deleteCache, getCache, setCache } from '../core/cache/redis';

// Define CallStatus type
type CallStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

// ============ CALL SERVICES ============

/**
 * Get all calls with filtering, sorting and pagination
 */
export const getCalls = async (
  userId: string,
  page: number = 1,
  limit: number = 10,
  filters: {
    startDate?: string;
    endDate?: string;
    status?: string;
    contactId?: string;
    companyId?: string;
    search?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
  } = {}
) => {
  const { startDate, endDate, status, contactId, companyId, search, sortBy = 'scheduledTime', order = 'desc' } = filters;
  
  // Build where conditions
  const where: any = {
    userId,
  };
  
  if (startDate) {
    where.scheduledTime = {
      gte: new Date(startDate),
      ...where.scheduledTime,
    };
  }
  
  if (endDate) {
    where.scheduledTime = {
      lte: new Date(endDate),
      ...where.scheduledTime,
    };
  }
  
  if (status) {
    where.status = status;
  }
  
  if (contactId) {
    where.contactId = contactId;
  }
  
  if (companyId) {
    where.companyId = companyId;
  }
  
  if (search) {
    where.OR = [
      { purpose: { contains: search, mode: 'insensitive' } },
      { notes: { contains: search, mode: 'insensitive' } },
      { 
        contact: { 
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } }
          ]
        } 
      },
      { 
        company: { 
          name: { contains: search, mode: 'insensitive' } 
        } 
      },
    ];
  }
  
  // Calculate skip for pagination
  const skip = (page - 1) * limit;
  
  // Execute query
  const [calls, totalCount] = await Promise.all([
    prisma.call.findMany({
      where,
      select: {
        id: true,
        scheduledTime: true,
        actualStartTime: true,
        actualEndTime: true,
        duration: true,
        status: true,
        purpose: true,
        notes: true,
        outcome: true,
        createdAt: true,
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { [sortBy]: order },
    }),
    prisma.call.count({ where }),
  ]);
  
  // Calculate pagination metadata
  const totalPages = Math.ceil(totalCount / limit);
  
  return {
    data: calls,
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
 * Get call by ID
 */
export const getCallById = async (id: string, userId: string) => {
  // Check cache first
  const cachedCall = await getCache<string>(`call:${id}`);
  if (cachedCall) {
    return JSON.parse(cachedCall);
  }
  
  // Find call in database
  const call = await prisma.call.findUnique({
    where: { id },
    include: {
      contact: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          email: true,
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      company: {
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          address: true,
          type: true,
        },
      },
    },
  });
  
  if (!call) {
    throw new AppError('Call not found', 404);
  }
  
  // Check if the call belongs to the user
  if (call.userId !== userId) {
    throw new AppError('You do not have permission to access this call', 403);
  }
  
  // Cache call
  await setCache(`call:${id}`, JSON.stringify(call), 60 * 5); // 5 minutes
  
  return call;
};

/**
 * Create a call
 */
export const createCall = async (
  data: {
    contactId?: string;
    companyId?: string;
    scheduledTime: string;
    purpose: string;
    notes?: string;
  },
  userId: string
) => {
  // Check if either contactId or companyId is provided
  if (!data.contactId && !data.companyId) {
    throw new AppError('Either contactId or companyId must be provided', 400);
  }
  
  // Validate contactId if provided
  if (data.contactId) {
    const contact = await prisma.contact.findUnique({
      where: { id: data.contactId },
    });
    
    if (!contact) {
      throw new AppError('Contact not found', 404);
    }
  }
  
  // Validate companyId if provided
  if (data.companyId) {
    const company = await prisma.company.findUnique({
      where: { id: data.companyId },
    });
    
    if (!company) {
      throw new AppError('Company not found', 404);
    }
  }
  
  // Create call
  const call = await prisma.call.create({
    data: {
      userId,
      contactId: data.contactId,
      companyId: data.companyId,
      scheduledTime: new Date(data.scheduledTime),
      status: 'SCHEDULED',
      purpose: data.purpose,
      notes: data.notes,
    },
    include: {
      contact: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      company: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
  
  return call;
};

/**
 * Update a call
 */
export const updateCall = async (
  id: string,
  data: {
    scheduledTime?: string;
    purpose?: string;
    notes?: string;
    outcome?: string;
  },
  userId: string
) => {
  // Check if call exists and belongs to the user
  const call = await prisma.call.findUnique({
    where: { id },
  });
  
  if (!call) {
    throw new AppError('Call not found', 404);
  }
  
  if (call.userId !== userId) {
    throw new AppError('You do not have permission to update this call', 403);
  }
  
  // Prevent updates to calls that are not in SCHEDULED status
  if (call.status !== 'SCHEDULED' && data.scheduledTime) {
    throw new AppError('Cannot update scheduled time for a call that is not in SCHEDULED status', 400);
  }
  
  // Update call
  const updatedCall = await prisma.call.update({
    where: { id },
    data: {
      ...(data.scheduledTime ? { scheduledTime: new Date(data.scheduledTime) } : {}),
      ...(data.purpose ? { purpose: data.purpose } : {}),
      ...(data.notes !== undefined ? { notes: data.notes } : {}),
      ...(data.outcome ? { outcome: data.outcome } : {}),
    },
    include: {
      contact: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      company: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
  
  // Delete cache
  await deleteCache(`call:${id}`);
  
  return updatedCall;
};

/**
 * Delete a call
 */
export const deleteCall = async (id: string, userId: string) => {
  // Check if call exists and belongs to the user
  const call = await prisma.call.findUnique({
    where: { id },
  });
  
  if (!call) {
    throw new AppError('Call not found', 404);
  }
  
  if (call.userId !== userId) {
    throw new AppError('You do not have permission to delete this call', 403);
  }
  
  // Only allow deleting calls in SCHEDULED status
  if (call.status !== 'SCHEDULED') {
    throw new AppError('Only calls in SCHEDULED status can be deleted', 400);
  }
  
  // Delete call
  await prisma.call.delete({
    where: { id },
  });
  
  // Delete cache
  await deleteCache(`call:${id}`);
  
  return { success: true };
};

// ============ CALL STATUS SERVICES ============

/**
 * Start a call
 */
export const startCall = async (id: string, userId: string) => {
  // Check if call exists and belongs to the user
  const call = await prisma.call.findUnique({
    where: { id },
  });
  
  if (!call) {
    throw new AppError('Call not found', 404);
  }
  
  if (call.userId !== userId) {
    throw new AppError('You do not have permission to start this call', 403);
  }
  
  // Only calls in SCHEDULED status can be started
  if (call.status !== 'SCHEDULED') {
    throw new AppError('Only calls in SCHEDULED status can be started', 400);
  }
  
  // Update call status
  const updatedCall = await prisma.call.update({
    where: { id },
    data: {
      status: 'IN_PROGRESS',
      actualStartTime: new Date(),
    },
    include: {
      contact: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
        },
      },
      company: {
        select: {
          id: true,
          name: true,
          phone: true,
        },
      },
    },
  });
  
  // Delete cache
  await deleteCache(`call:${id}`);
  
  return updatedCall;
};

/**
 * End a call
 */
export const endCall = async (
  id: string,
  data: {
    outcome: string;
    notes?: string;
  },
  userId: string
) => {
  // Check if call exists and belongs to the user
  const call = await prisma.call.findUnique({
    where: { id },
  });
  
  if (!call) {
    throw new AppError('Call not found', 404);
  }
  
  if (call.userId !== userId) {
    throw new AppError('You do not have permission to end this call', 403);
  }
  
  // Only calls in IN_PROGRESS status can be ended
  if (call.status !== 'IN_PROGRESS') {
    throw new AppError('Only calls in IN_PROGRESS status can be ended', 400);
  }
  
  // Calculate duration
  const actualStartTime = call.actualStartTime;
  if (!actualStartTime) {
    throw new AppError('Call does not have an actual start time', 500);
  }
  
  const endTime = new Date();
  const durationInSeconds = Math.floor((endTime.getTime() - actualStartTime.getTime()) / 1000);
  
  // Update call status
  const updatedCall = await prisma.call.update({
    where: { id },
    data: {
      status: 'COMPLETED',
      actualEndTime: endTime,
      duration: durationInSeconds,
      outcome: data.outcome,
      notes: data.notes ? (call.notes ? `${call.notes}\n\n${data.notes}` : data.notes) : call.notes,
    },
    include: {
      contact: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      company: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
  
  // Delete cache
  await deleteCache(`call:${id}`);
  
  return updatedCall;
};

/**
 * Cancel a call
 */
export const cancelCall = async (
  id: string,
  data: {
    reason: string;
  },
  userId: string
) => {
  // Check if call exists and belongs to the user
  const call = await prisma.call.findUnique({
    where: { id },
  });
  
  if (!call) {
    throw new AppError('Call not found', 404);
  }
  
  if (call.userId !== userId) {
    throw new AppError('You do not have permission to cancel this call', 403);
  }
  
  // Only calls in SCHEDULED status can be cancelled
  if (call.status !== 'SCHEDULED') {
    throw new AppError('Only calls in SCHEDULED status can be cancelled', 400);
  }
  
  // Update call status
  const updatedCall = await prisma.call.update({
    where: { id },
    data: {
      status: 'CANCELLED',
      notes: call.notes ? `${call.notes}\n\nCancellation reason: ${data.reason}` : `Cancellation reason: ${data.reason}`,
    },
    include: {
      contact: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      company: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
  
  // Delete cache
  await deleteCache(`call:${id}`);
  
  return updatedCall;
};

// ============ CALL LOGS SERVICES ============

/**
 * Get call logs with filtering, sorting and pagination
 */
export const getCallLogs = async (
  userId: string,
  page: number = 1,
  limit: number = 10,
  filters: {
    startDate?: string;
    endDate?: string;
    status?: string;
    contactId?: string;
    companyId?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
  } = {}
) => {
  const { startDate, endDate, status, contactId, companyId, sortBy = 'createdAt', order = 'desc' } = filters;
  
  // Build where conditions
  const where: any = {
    userId,
    // Include only completed or missed calls
    status: {
      in: ['COMPLETED', 'MISSED'],
    },
  };
  
  if (startDate) {
    where.scheduledTime = {
      gte: new Date(startDate),
      ...where.scheduledTime,
    };
  }
  
  if (endDate) {
    where.scheduledTime = {
      lte: new Date(endDate),
      ...where.scheduledTime,
    };
  }
  
  if (status) {
    // Override the default status filter
    where.status = status;
  }
  
  if (contactId) {
    where.contactId = contactId;
  }
  
  if (companyId) {
    where.companyId = companyId;
  }
  
  // Calculate skip for pagination
  const skip = (page - 1) * limit;
  
  // Execute query
  const [calls, totalCount] = await Promise.all([
    prisma.call.findMany({
      where,
      select: {
        id: true,
        scheduledTime: true,
        actualStartTime: true,
        actualEndTime: true,
        duration: true,
        status: true,
        purpose: true,
        outcome: true,
        createdAt: true,
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { [sortBy]: order },
    }),
    prisma.call.count({ where }),
  ]);
  
  // Calculate pagination metadata
  const totalPages = Math.ceil(totalCount / limit);
  
  return {
    data: calls,
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
 * Get pending call logs
 */
export const getPendingLogs = async (
  userId: string,
  page: number = 1,
  limit: number = 10
) => {
  // Build where conditions
  const where: any = {
    userId,
    status: 'SCHEDULED',
    scheduledTime: {
      lt: new Date(), // Scheduled time in the past
    },
  };
  
  // Calculate skip for pagination
  const skip = (page - 1) * limit;
  
  // Execute query
  const [calls, totalCount] = await Promise.all([
    prisma.call.findMany({
      where,
      select: {
        id: true,
        scheduledTime: true,
        status: true,
        purpose: true,
        createdAt: true,
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { scheduledTime: 'desc' },
    }),
    prisma.call.count({ where }),
  ]);
  
  // Calculate pagination metadata
  const totalPages = Math.ceil(totalCount / limit);
  
  return {
    data: calls,
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

// ============ CALL REPORTS SERVICES ============

/**
 * Get daily call report
 */
export const getDailyReport = async (
  userId: string,
  startDate: string,
  endDate?: string
) => {
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
  
  // Get all calls for the date range
  const calls = await prisma.call.findMany({
    where: {
      userId,
      OR: [
        {
          // Scheduled calls in the date range
          scheduledTime: {
            gte: start,
            lte: end,
          },
        },
        {
          // Actual calls in the date range
          actualStartTime: {
            gte: start,
            lte: end,
          },
        },
      ],
    },
    include: {
      contact: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      company: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
  
  // Calculate statistics
  const totalCalls = calls.length;
  const completedCalls = calls.filter(call => call.status === 'COMPLETED').length;
  const missedCalls = calls.filter(call => call.status === 'MISSED').length;
  const pendingCalls = calls.filter(call => call.status === 'SCHEDULED').length;
  const cancelledCalls = calls.filter(call => call.status === 'CANCELLED').length;
  
  // Calculate total duration in minutes
  const totalDuration = calls.reduce((total, call) => {
    if (call.duration) {
      return total + call.duration;
    }
    return total;
  }, 0) / 60; // Convert seconds to minutes
  
  // Format response
  return {
    date: start.toISOString().split('T')[0],
    summary: {
      totalCalls,
      completedCalls,
      missedCalls,
      pendingCalls,
      cancelledCalls,
      averageCallDuration: completedCalls > 0 ? (totalDuration / completedCalls).toFixed(1) : 0,
      totalCallDuration: totalDuration.toFixed(1),
    },
    calls: calls.map(call => ({
      id: call.id,
      scheduledTime: call.scheduledTime,
      actualStartTime: call.actualStartTime,
      actualEndTime: call.actualEndTime,
      duration: call.duration ? (call.duration / 60).toFixed(1) : null,
      status: call.status,
      purpose: call.purpose,
      outcome: call.outcome,
      contact: call.contact ? `${call.contact.firstName} ${call.contact.lastName}` : null,
      company: call.company ? call.company.name : null,
    })),
  };
};

/**
 * Get weekly call report
 */
export const getWeeklyReport = async (
  userId: string,
  startDate: string,
  endDate?: string
) => {
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
  
  // Get all calls for the date range
  const calls = await prisma.call.findMany({
    where: {
      userId,
      OR: [
        {
          // Scheduled calls in the date range
          scheduledTime: {
            gte: start,
            lte: end,
          },
        },
        {
          // Actual calls in the date range
          actualStartTime: {
            gte: start,
            lte: end,
          },
        },
      ],
    },
    include: {
      contact: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      company: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
  
  // Group calls by day
  const callsByDay = calls.reduce((acc, call) => {
    const day = call.scheduledTime 
      ? new Date(call.scheduledTime).toISOString().split('T')[0]
      : new Date(call.actualStartTime!).toISOString().split('T')[0];
    
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(call);
    return acc;
  }, {} as Record<string, any[]>);
  
  // Calculate daily statistics
  const dailyStats = Object.keys(callsByDay).sort().map(day => {
    const dayCalls = callsByDay[day];
    return {
      date: day,
      totalCalls: dayCalls.length,
      completedCalls: dayCalls.filter(call => call.status === 'COMPLETED').length,
      missedCalls: dayCalls.filter(call => call.status === 'MISSED').length,
      cancelledCalls: dayCalls.filter(call => call.status === 'CANCELLED').length,
    };
  });
  
  // Calculate company statistics
  const companyStats = calls.reduce((acc, call) => {
    const companyId = call.companyId || (call.contact?.company?.id);
    const companyName = call.company?.name || (call.contact?.company?.name);
    
    if (!companyId || !companyName) return acc;
    
    if (!acc[companyId]) {
      acc[companyId] = {
        id: companyId,
        name: companyName,
        totalCalls: 0,
        completedCalls: 0,
      };
    }
    
    acc[companyId].totalCalls++;
    if (call.status === 'COMPLETED') {
      acc[companyId].completedCalls++;
    }
    
    return acc;
  }, {} as Record<string, any>);
  
  // Sort companies by total calls
  const topCompanies = Object.values(companyStats)
    .sort((a, b) => b.totalCalls - a.totalCalls)
    .slice(0, 5);
  
  // Calculate weekly totals
  const totalCalls = calls.length;
  const completedCalls = calls.filter(call => call.status === 'COMPLETED').length;
  const missedCalls = calls.filter(call => call.status === 'MISSED').length;
  const pendingCalls = calls.filter(call => call.status === 'SCHEDULED').length;
  const cancelledCalls = calls.filter(call => call.status === 'CANCELLED').length;
  
  // Calculate total duration in minutes
  const totalDuration = calls.reduce((total, call) => {
    if (call.duration) {
      return total + call.duration;
    }
    return total;
  }, 0) / 60; // Convert seconds to minutes
  
  // Format response
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
    summary: {
      totalCalls,
      completedCalls,
      missedCalls,
      pendingCalls,
      cancelledCalls,
      averageCallDuration: completedCalls > 0 ? (totalDuration / completedCalls).toFixed(1) : 0,
      totalCallDuration: totalDuration.toFixed(1),
      callsPerDay: dailyStats,
    },
    topCompanies,
  };
};

/**
 * Get monthly call report
 */
export const getMonthlyReport = async (
  userId: string,
  startDate: string,
  endDate?: string
) => {
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
  
  // Get all calls for the date range
  const calls = await prisma.call.findMany({
    where: {
      userId,
      OR: [
        {
          // Scheduled calls in the date range
          scheduledTime: {
            gte: start,
            lte: end,
          },
        },
        {
          // Actual calls in the date range
          actualStartTime: {
            gte: start,
            lte: end,
          },
        },
      ],
    },
  });
  
  // Calculate statistics by week
  const weeklyStats = [];
  let currentWeekStart = new Date(start);
  
  while (currentWeekStart <= end) {
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(currentWeekStart.getDate() + 6);
    
    if (weekEnd > end) {
      weekEnd.setTime(end.getTime());
    }
    
    const weekCalls = calls.filter(call => {
      const callDate = call.scheduledTime || call.actualStartTime;
      return callDate && callDate >= currentWeekStart && callDate <= weekEnd;
    });
    
    weeklyStats.push({
      weekStartDate: currentWeekStart.toISOString().split('T')[0],
      weekEndDate: weekEnd.toISOString().split('T')[0],
      totalCalls: weekCalls.length,
      completedCalls: weekCalls.filter(call => call.status === 'COMPLETED').length,
      missedCalls: weekCalls.filter(call => call.status === 'MISSED').length,
      cancelledCalls: weekCalls.filter(call => call.status === 'CANCELLED').length,
    });
    
    // Move to next week
    currentWeekStart = new Date(weekEnd);
    currentWeekStart.setDate(weekEnd.getDate() + 1);
  }
  
  // Calculate monthly totals
  const totalCalls = calls.length;
  const completedCalls = calls.filter(call => call.status === 'COMPLETED').length;
  const missedCalls = calls.filter(call => call.status === 'MISSED').length;
  const pendingCalls = calls.filter(call => call.status === 'SCHEDULED').length;
  const cancelledCalls = calls.filter(call => call.status === 'CANCELLED').length;
  
  // Calculate completion rate
  const completionRate = totalCalls > 0 
    ? (completedCalls / (completedCalls + missedCalls) * 100).toFixed(1) 
    : '0';
  
  // Calculate total duration in minutes
  const totalDuration = calls.reduce((total, call) => {
    if (call.duration) {
      return total + call.duration;
    }
    return total;
  }, 0) / 60; // Convert seconds to minutes
  
  // Format response
  return {
    month: `${start.getFullYear()}-${(start.getMonth() + 1).toString().padStart(2, '0')}`,
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
    summary: {
      totalCalls,
      completedCalls,
      missedCalls,
      pendingCalls, 
      cancelledCalls,
      completionRate: `${completionRate}%`,
      averageCallDuration: completedCalls > 0 ? (totalDuration / completedCalls).toFixed(1) : 0,
      totalCallDuration: totalDuration.toFixed(1),
    },
    weeklyStats,
  };
}; 