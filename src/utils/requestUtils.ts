import { Request } from 'express';

// Define a custom interface for the request with user property
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    permissions: string[];
    [key: string]: any;
  };
}

/**
 * Helper function to cast a standard Request to AuthRequest
 */
export const asAuthRequest = (req: Request): AuthRequest => {
  return req as AuthRequest;
}; 