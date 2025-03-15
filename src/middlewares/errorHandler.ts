import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { StatusCodes } from 'http-status-codes';

/**
 * Custom API Error class for consistent error handling
 */
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error handler middleware for handling all application errors
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Default error values
  let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  let message = 'Internal Server Error';
  let isOperational = false;
  let errorDetails = null;

  // Check if it's our custom API error
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
    errorDetails = err.details;
  } 
  // Check if it's our custom App error
  else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
  } 
  // Prisma errors
  else if (err.name === 'PrismaClientKnownRequestError') {
    statusCode = StatusCodes.BAD_REQUEST;
    message = 'Database operation failed';
    isOperational = true;
  } 
  // JWT errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = StatusCodes.UNAUTHORIZED;
    message = 'Invalid token';
    isOperational = true;
  }
  else if (err.name === 'TokenExpiredError') {
    statusCode = StatusCodes.UNAUTHORIZED;
    message = 'Token expired';
    isOperational = true;
  }

  // Log the error (more detailed in dev mode)
  if (process.env.NODE_ENV === 'development') {
    console.error('ERROR 💥', err);
  } else {
    // In production, only log operational errors or serious errors
    if (!isOperational) {
      console.error('CRITICAL ERROR 💥', err);
    }
  }

  // Send error response
  res.status(statusCode).json({
    status: 'error',
    message,
    ...(errorDetails && { details: errorDetails }),
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      isOperational
    }),
  });
}; 