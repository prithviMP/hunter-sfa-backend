import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../core/database/prisma';
import { config } from '../config';
import { StatusCodes } from 'http-status-codes';
import { AuthRequest } from '../utils/requestUtils';

// Note: ApiError class should be imported properly when available
// Using a temporary inline implementation for now
class ApiError extends Error {
  statusCode: number;
  details?: any;
  isOperational: boolean;

  constructor(
    message: string,
    statusCode: number,
    details?: any,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
  }
}

// Interface for decoded JWT token
interface DecodedToken {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

/**
 * Middleware to authenticate requests using JWT
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError('Authentication required', StatusCodes.UNAUTHORIZED);
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      throw new ApiError('Invalid token format', StatusCodes.UNAUTHORIZED);
    }
    
    try {
      const decoded = jwt.verify(
        token,
        config.jwt.secret
      ) as DecodedToken;
      
      // Fetch user from database to ensure they still exist and have proper permissions
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: { role: true },
      });
      
      if (!user) {
        throw new ApiError('User not found', StatusCodes.UNAUTHORIZED);
      }
      
      // Attach user data to request object for use in route handlers
      (req as AuthRequest).user = {
        id: user.id,
        email: user.email,
        role: user.role.name,
        permissions: user.role.permissions as string[],
      };
      
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new ApiError('Token expired', StatusCodes.UNAUTHORIZED);
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new ApiError('Invalid token', StatusCodes.UNAUTHORIZED);
      } else {
        throw error;
      }
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if user has required permissions
 * @param requiredPermissions Array of permission strings required for the route
 */
export const authorize = (requiredPermissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      if (!authReq.user) {
        throw new ApiError(
          'User not authenticated',
          StatusCodes.UNAUTHORIZED
        );
      }
      
      const userPermissions = authReq.user.permissions || [];
      
      const hasAllPermissions = requiredPermissions.every((permission) =>
        userPermissions.includes(permission)
      );
      
      if (!hasAllPermissions) {
        throw new ApiError('Insufficient permissions', StatusCodes.FORBIDDEN);
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
}; 