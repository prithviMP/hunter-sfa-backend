import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { config } from './config';
import apiV1Router from './api/v1';
import { errorHandler } from './middlewares/errorHandler';
import { notFoundHandler } from './middlewares/notFoundHandler';
import { initializeCache } from './utils/cache';
import { logger } from './utils/logger';

// Initialize express app
const app = express();
const port = process.env.PORT || 3000;

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

// Add logging in development mode
if (config.environment === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// API routes
app.use('/api/v1', apiV1Router);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
}); 