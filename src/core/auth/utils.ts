import { Request } from 'express';

/**
 * Define the AuthRequest interface directly to avoid import issues
 */
interface User {
  id: string;
  [key: string]: any;
}

interface AuthRequestLocal extends Request {
  user?: User;
}

/**
 * Safely get the user ID from the request object
 * Throws an error if the user is not authenticated
 */
export const getUserId = (req: Request): string => {
  const authReq = req as AuthRequestLocal;
  if (!authReq.user || !authReq.user.id) {
    throw new Error('User not authenticated');
  }
  return authReq.user.id;
}; 