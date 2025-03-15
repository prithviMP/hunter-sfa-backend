import { Request } from 'express';

// Extend the Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        permissions: string[];
        [key: string]: any;
      };
    }
  }
}

export {}; 