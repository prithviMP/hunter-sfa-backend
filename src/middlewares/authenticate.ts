import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../core/auth/jwt';
import { AppError } from './errorHandler';

// Extend the Request interface to include user property
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

/**
 * Middleware to authenticate requests using JWT
 * Verifies the access token from the Authorization header
 * and attaches the user data to the request object
 */
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required', 401);
    }
    
    // Extract the token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      throw new AppError('Invalid token format', 401);
    }
    
    // Verify the token
    const decoded = verifyAccessToken(token);
    
    if (!decoded) {
      throw new AppError('Invalid or expired token', 401);
    }
    
    // Attach user data to the request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };
    
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError('Authentication failed', 401));
    }
  }
};

/**
 * Middleware to authorize requests based on user role
 * Must be used after the authenticate middleware
 * 
 * @param {string[]} roles - Array of allowed roles
 */
export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }
      
      if (!roles.includes(req.user.role)) {
        throw new AppError('You do not have permission to access this resource', 403);
      }
      
      next();
    } catch (error) {
      if (error instanceof AppError) {
        next(error);
      } else {
        next(new AppError('Authorization failed', 403));
      }
    }
  };
}; 