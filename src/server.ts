import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import apiV1Router from './api/v1';
import swaggerRoutes from './docs/swagger';
import { errorHandler } from './middlewares/errorHandler';
import { notFoundHandler } from './middlewares/notFoundHandler';
import './core/websockets/socket';
import { initializeCache } from './utils/cache';
import { logger } from './utils/logger';

// Initialize express app
const app = express();

// Initialize redis cache
initializeCache().catch((err) => {
  logger.error('Failed to initialize cache', err);
});

// Apply middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// Request logging
if (config.environment !== 'test') {
  app.use(morgan(config.environment === 'production' ? 'combined' : 'dev'));
}

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use('/api/', apiLimiter);

// API routes
app.use('/api/v1', apiV1Router);

// Swagger documentation routes
app.use('/docs', swaggerRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    environment: config.environment,
  });
});

// Handle 404 routes
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Check if running in docs-only mode
const isDocsOnly = process.argv.includes('--docs-only');

if (!isDocsOnly) {
  // Root route
  app.get('/', (_, res) => {
    res.status(200).json({
      status: 'success',
      message: 'Hunter SFA API',
      version: '1.0.0',
      documentation: '/docs',
    });
  });
} else {
  // In docs-only mode, redirect root to docs
  app.get('/', (_, res) => {
    res.redirect('/docs');
  });
  
  logger.info('Running in documentation-only mode');
}

// Start server
const PORT = config.port || 3000;
const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${config.environment} mode`);
  if (isDocsOnly) {
    logger.info(`Documentation available at http://localhost:${PORT}/docs`);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

export default app; 