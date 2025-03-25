import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { logger } from '../utils/logger';

/**
 * Middleware to validate request against a Zod schema
 */
export const validateRequest = (schema: AnyZodObject) => 
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        logger.error('Validation error', { error: error.errors });
        return res.status(400).json({
          code: 400,
          message: 'Validation failed',
          details: error.errors,
        });
      }
      logger.error('Unexpected validation error', { error });
      return res.status(500).json({
        code: 500,
        message: 'Internal server error during validation',
      });
    }
  };

/**
 * Error handling middleware
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error('API error', { error: err.message, stack: err.stack });
  
  // Handle specific error types
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({
      code: 401,
      message: 'Unauthorized',
      details: err.message,
    });
    return;
  }
  
  if (err.name === 'NotFoundError') {
    res.status(404).json({
      code: 404,
      message: 'Resource not found',
      details: err.message,
    });
    return;
  }
  
  if (err.name === 'RateLimitError') {
    res.status(429).json({
      code: 429,
      message: 'Too many requests',
      details: err.message,
    });
    return;
  }
  
  // Default to 500 internal server error
  res.status(500).json({
    code: 500,
    message: 'Internal server error',
    details: process.env.NODE_ENV === 'production' ? undefined : err.message,
  });
  return;
};

/**
 * Request logging middleware
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // Log request
  logger.info('API request', {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  
  // Log response
  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 400 ? 'warn' : 'info';
    
    logger[level]('API response', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    });
  });
  
  next();
};
