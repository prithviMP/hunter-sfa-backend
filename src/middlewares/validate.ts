import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { AppError } from './errorHandler';

/**
 * Middleware to validate request data against a Zod schema
 * @param schema Zod schema for validation
 */
export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request data against the schema
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      
      // If validation passes, proceed to the next middleware
      return next();
    } catch (error) {
      // Handle Zod validation errors
      if (error instanceof ZodError) {
        // Format the error message with the path of the field that failed validation
        const formattedErrors = error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }));
        
        // Return a 400 Bad Request with the validation errors
        return res.status(400).json({
          status: 'error',
          message: 'Validation error',
          errors: formattedErrors,
        });
      }
      
      // Pass any other errors to the global error handler
      return next(new AppError('Validation failed', 400));
    }
  };
}; 