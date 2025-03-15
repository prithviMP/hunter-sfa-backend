import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

/**
 * Middleware to handle 404 Not Found errors
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  res.status(StatusCodes.NOT_FOUND).json({
    status: 'error',
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}; 