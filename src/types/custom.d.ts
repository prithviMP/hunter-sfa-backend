import 'express';

declare module 'express-serve-static-core' {
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