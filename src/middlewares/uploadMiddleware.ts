import multer from 'multer';
import { Request } from 'express';
import { ApiError } from '../utils/ApiError';
import { StatusCodes } from 'http-status-codes';

// Define file size limits
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 5;

// Configure multer storage (memory storage for processing before S3 upload)
const storage = multer.memoryStorage();

// File filter function to validate file types
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept images and PDFs
  if (
    file.mimetype.startsWith('image/') ||
    file.mimetype === 'application/pdf'
  ) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        'Invalid file type. Only images and PDFs are allowed.',
        StatusCodes.BAD_REQUEST
      )
    );
  }
};

// Create multer upload instance
export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES,
  },
  fileFilter,
});

// Error handler for multer errors
export const handleMulterError = (err: any, req: Request, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    // Handle specific multer errors
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(
        new ApiError(
          `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`,
          StatusCodes.BAD_REQUEST
        )
      );
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      return next(
        new ApiError(
          `Too many files. Maximum is ${MAX_FILES} files.`,
          StatusCodes.BAD_REQUEST
        )
      );
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return next(
        new ApiError(
          'Unexpected field name for file upload.',
          StatusCodes.BAD_REQUEST
        )
      );
    }
  }
  
  // Pass other errors to the next error handler
  next(err);
}; 