/**
 * Custom error class for API errors with status code and optional details
 */
export class ApiError extends Error {
  statusCode: number;
  details?: any;
  isOperational: boolean;

  /**
   * Create a new API error
   * @param message Error message
   * @param statusCode HTTP status code for the error
   * @param details Additional error details
   * @param isOperational Whether the error is operational (expected) or programming error
   */
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
    
    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
    
    // Set name to the class name for better error identification
    this.name = this.constructor.name;
  }
}

/**
 * Create a 400 Bad Request error
 * @param message Error message
 * @param details Additional error details
 */
export const badRequestError = (message: string, details?: any): ApiError => {
  return new ApiError(message, 400, details);
};

/**
 * Create a 401 Unauthorized error
 * @param message Error message
 * @param details Additional error details
 */
export const unauthorizedError = (message: string, details?: any): ApiError => {
  return new ApiError(message, 401, details);
};

/**
 * Create a 403 Forbidden error
 * @param message Error message
 * @param details Additional error details
 */
export const forbiddenError = (message: string, details?: any): ApiError => {
  return new ApiError(message, 403, details);
};

/**
 * Create a 404 Not Found error
 * @param message Error message
 * @param details Additional error details
 */
export const notFoundError = (message: string, details?: any): ApiError => {
  return new ApiError(message, 404, details);
};

/**
 * Create a 409 Conflict error
 * @param message Error message
 * @param details Additional error details
 */
export const conflictError = (message: string, details?: any): ApiError => {
  return new ApiError(message, 409, details);
};

/**
 * Create a 500 Internal Server Error
 * @param message Error message
 * @param details Additional error details
 * @param isOperational Whether the error is operational
 */
export const internalServerError = (
  message: string,
  details?: any,
  isOperational: boolean = false
): ApiError => {
  return new ApiError(message, 500, details, isOperational);
}; 