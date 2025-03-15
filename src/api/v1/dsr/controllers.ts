import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../../utils/requestUtils';
import * as dsrService from '../../../services/dsrService';
import { AppError } from '../../../middlewares/errorHandler';

// ============ VISIT CONTROLLERS ============

/**
 * Get all visits with filtering, sorting and pagination
 */
export const getVisits = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      throw new AppError('User not authenticated', 401);
    }
    const userId = authReq.user.id;
    const { 
      page, 
      limit, 
      startDate, 
      endDate, 
      status, 
      companyId, 
      areaId, 
      search, 
      sortBy, 
      order 
    } = req.query;
    
    const result = await dsrService.getVisits(
      userId,
      Number(page) || 1,
      Number(limit) || 10,
      {
        startDate: startDate as string,
        endDate: endDate as string,
        status: status as string,
        companyId: companyId as string,
        areaId: areaId as string,
        search: search as string,
        sortBy: sortBy as string,
        order: order as 'asc' | 'desc',
      }
    );
    
    res.status(200).json({
      status: 'success',
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get visit by ID
 */
export const getVisitById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      throw new AppError('User not authenticated', 401);
    }
    const userId = authReq.user.id;
    
    const visit = await dsrService.getVisitById(id, userId);
    
    res.status(200).json({
      status: 'success',
      data: visit,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new visit
 */
export const createVisit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      throw new AppError('User not authenticated', 401);
    }
    const userId = authReq.user.id;
    const visit = await dsrService.createVisit(req.body, userId);
    
    res.status(201).json({
      status: 'success',
      data: visit,
      message: 'Visit created successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a visit
 */
export const updateVisit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      throw new AppError('User not authenticated', 401);
    }
    const userId = authReq.user.id;
    
    const visit = await dsrService.updateVisit(id, req.body, userId);
    
    res.status(200).json({
      status: 'success',
      data: visit,
      message: 'Visit updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// ============ CHECK IN/OUT CONTROLLERS ============

/**
 * Perform check-in
 */
export const checkIn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      throw new AppError('User not authenticated', 401);
    }
    const userId = authReq.user.id;
    
    const visit = await dsrService.checkIn(req.body, userId);
    
    res.status(201).json({
      status: 'success',
      data: visit,
      message: 'Check-in completed successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Perform check-out
 */
export const checkOut = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { visitId } = req.params;
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      throw new AppError('User not authenticated', 401);
    }
    const userId = authReq.user.id;
    
    const visit = await dsrService.checkOut(visitId, req.body, userId);
    
    res.status(200).json({
      status: 'success',
      data: visit,
      message: 'Check-out completed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// ============ PHOTOS CONTROLLERS ============

/**
 * Upload visit photo
 */
export const uploadVisitPhoto = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { visitId } = req.params;
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      throw new AppError('User not authenticated', 401);
    }
    const userId = authReq.user.id;
    const file = req.file;
    
    if (!file) {
      throw new AppError('No file uploaded', 400);
    }
    
    const photo = await dsrService.uploadVisitPhoto(
      visitId,
      file,
      { caption: req.body.caption },
      userId
    );
    
    res.status(201).json({
      status: 'success',
      data: photo,
      message: 'Photo uploaded successfully',
    });
  } catch (error) {
    next(error);
  }
};

// ============ FOLLOW-UP CONTROLLERS ============

/**
 * Create follow-up for a visit
 */
export const createFollowUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { visitId } = req.params;
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      throw new AppError('User not authenticated', 401);
    }
    const userId = authReq.user.id;
    
    const followUp = await dsrService.createFollowUp(visitId, req.body, userId);
    
    res.status(201).json({
      status: 'success',
      data: followUp,
      message: 'Follow-up created successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all follow-ups with filtering
 */
export const getFollowUps = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      throw new AppError('User not authenticated', 401);
    }
    const userId = authReq.user.id;
    const { 
      page, 
      limit, 
      startDate, 
      endDate, 
      status, 
      priority, 
      sortBy, 
      order 
    } = req.query;
    
    const result = await dsrService.getFollowUps(
      userId,
      Number(page) || 1,
      Number(limit) || 10,
      {
        startDate: startDate as string,
        endDate: endDate as string,
        status: status as string,
        priority: priority as string,
        sortBy: sortBy as string,
        order: order as 'asc' | 'desc',
      }
    );
    
    res.status(200).json({
      status: 'success',
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update follow-up
 */
export const updateFollowUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      throw new AppError('User not authenticated', 401);
    }
    const userId = authReq.user.id;
    
    const followUp = await dsrService.updateFollowUp(id, req.body, userId);
    
    res.status(200).json({
      status: 'success',
      data: followUp,
      message: 'Follow-up updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// ============ PAYMENT CONTROLLERS ============

/**
 * Create payment for a visit
 */
export const createPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { visitId } = req.params;
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      throw new AppError('User not authenticated', 401);
    }
    const userId = authReq.user.id;
    
    const payment = await dsrService.createPayment(visitId, req.body, userId);
    
    res.status(201).json({
      status: 'success',
      data: payment,
      message: 'Payment recorded successfully',
    });
  } catch (error) {
    next(error);
  }
};

// ============ NEARBY COMPANIES CONTROLLERS ============

/**
 * Get nearby companies based on location
 */
export const getNearbyCompanies = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { latitude, longitude, radius, limit } = req.query;
    
    if (!latitude || !longitude) {
      throw new AppError('Latitude and longitude are required', 400);
    }
    
    const companies = await dsrService.getNearbyCompanies(
      parseFloat(latitude as string),
      parseFloat(longitude as string),
      radius ? parseFloat(radius as string) : undefined,
      limit ? parseInt(limit as string) : undefined
    );
    
    res.status(200).json({
      status: 'success',
      data: companies,
    });
  } catch (error) {
    next(error);
  }
};

// ============ REPORTS CONTROLLERS ============

/**
 * Get daily report
 */
export const getDailyReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      throw new AppError('User not authenticated', 401);
    }
    const userId = authReq.user.id;
    const { startDate, endDate, areaId, regionId } = req.query;
    
    if (!startDate) {
      throw new AppError('Start date is required', 400);
    }
    
    const report = await dsrService.getDailyReport(
      userId,
      startDate as string,
      endDate as string,
      {
        areaId: areaId as string,
        regionId: regionId as string,
      }
    );
    
    res.status(200).json({
      status: 'success',
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get weekly report
 */
export const getWeeklyReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      throw new AppError('User not authenticated', 401);
    }
    const userId = authReq.user.id;
    const { startDate, endDate, areaId, regionId } = req.query;
    
    if (!startDate) {
      throw new AppError('Start date is required', 400);
    }
    
    const report = await dsrService.getWeeklyReport(
      userId,
      startDate as string,
      endDate as string,
      {
        areaId: areaId as string,
        regionId: regionId as string,
      }
    );
    
    res.status(200).json({
      status: 'success',
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get monthly report
 */
export const getMonthlyReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      throw new AppError('User not authenticated', 401);
    }
    const userId = authReq.user.id;
    const { startDate, endDate, areaId, regionId } = req.query;
    
    if (!startDate) {
      throw new AppError('Start date is required', 400);
    }
    
    const report = await dsrService.getMonthlyReport(
      userId,
      startDate as string,
      endDate as string,
      {
        areaId: areaId as string,
        regionId: regionId as string,
      }
    );
    
    res.status(200).json({
      status: 'success',
      data: report,
    });
  } catch (error) {
    next(error);
  }
}; 