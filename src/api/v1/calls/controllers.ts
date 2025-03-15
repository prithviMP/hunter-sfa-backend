import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../../utils/requestUtils';
import * as callService from '../../../services/callService';
import { AppError } from '../../../middlewares/errorHandler';
import { getUserId } from '../../../core/auth/utils';

// ============ CALL CONTROLLERS ============

/**
 * Get all calls with filtering, sorting and pagination
 */
export const getCalls = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req);
    const { 
      page, 
      limit, 
      startDate, 
      endDate, 
      status, 
      contactId, 
      companyId, 
      search, 
      sortBy, 
      order 
    } = req.query;
    
    const result = await callService.getCalls(
      userId,
      Number(page) || 1,
      Number(limit) || 10,
      {
        startDate: startDate as string,
        endDate: endDate as string,
        status: status as string,
        contactId: contactId as string,
        companyId: companyId as string,
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
 * Get call by ID
 */
export const getCallById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;
    
    const call = await callService.getCallById(id, userId);
    
    res.status(200).json({
      status: 'success',
      data: call,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new call
 */
export const createCall = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req);
    const callData = req.body;
    const call = await callService.createCall(callData, userId);
    
    res.status(201).json({
      status: 'success',
      data: call,
      message: 'Call scheduled successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a call
 */
export const updateCall = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;
    
    const call = await callService.updateCall(id, req.body, userId);
    
    res.status(200).json({
      status: 'success',
      data: call,
      message: 'Call updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a call
 */
export const deleteCall = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;
    
    await callService.deleteCall(id, userId);
    
    res.status(200).json({
      status: 'success',
      message: 'Call deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// ============ CALL STATUS CONTROLLERS ============

/**
 * Start a call
 */
export const startCall = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;
    
    const call = await callService.startCall(id, userId);
    
    res.status(200).json({
      status: 'success',
      data: call,
      message: 'Call started successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * End a call
 */
export const endCall = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;
    
    const call = await callService.endCall(id, req.body, userId);
    
    res.status(200).json({
      status: 'success',
      data: call,
      message: 'Call ended successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel a call
 */
export const cancelCall = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;
    
    const call = await callService.cancelCall(id, req.body, userId);
    
    res.status(200).json({
      status: 'success',
      data: call,
      message: 'Call cancelled successfully',
    });
  } catch (error) {
    next(error);
  }
};

// ============ CALL LOGS CONTROLLERS ============

/**
 * Get call logs with filtering, sorting and pagination
 */
export const getCallLogs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req);
    const { 
      page, 
      limit, 
      startDate, 
      endDate, 
      status, 
      contactId, 
      companyId, 
      sortBy, 
      order 
    } = req.query;
    
    const result = await callService.getCallLogs(
      userId,
      Number(page) || 1,
      Number(limit) || 10,
      {
        startDate: startDate as string,
        endDate: endDate as string,
        status: status as string,
        contactId: contactId as string,
        companyId: companyId as string,
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
 * Get pending call logs
 */
export const getPendingLogs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req);
    const { page, limit } = req.query;
    
    const result = await callService.getPendingLogs(
      userId,
      Number(page) || 1,
      Number(limit) || 10
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

// ============ CALL REPORTS CONTROLLERS ============

/**
 * Get daily call report
 */
export const getDailyReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req);
    const { startDate, endDate } = req.query;
    
    if (!startDate) {
      throw new AppError('Start date is required', 400);
    }
    
    const report = await callService.getDailyReport(
      userId,
      startDate as string,
      endDate as string
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
 * Get weekly call report
 */
export const getWeeklyReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req);
    const { startDate, endDate } = req.query;
    
    if (!startDate) {
      throw new AppError('Start date is required', 400);
    }
    
    const report = await callService.getWeeklyReport(
      userId,
      startDate as string,
      endDate as string
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
 * Get monthly call report
 */
export const getMonthlyReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req);
    const { startDate, endDate } = req.query;
    
    if (!startDate) {
      throw new AppError('Start date is required', 400);
    }
    
    const report = await callService.getMonthlyReport(
      userId,
      startDate as string,
      endDate as string
    );
    
    res.status(200).json({
      status: 'success',
      data: report,
    });
  } catch (error) {
    next(error);
  }
}; 