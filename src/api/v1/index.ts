import { Router } from 'express';
import userRoutes from './users/routes';
import dsrRoutes from './dsr/routes';
import callRoutes from './calls/routes';
import dataControlRoutes from './data-control/routes';
import userControlRoutes from './user-control/routes';
import contactManagementRoutes from './contact-management/routes';
import authRoutes from './auth/routes';

const router = Router();

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Register all API routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/dsr', dsrRoutes);
router.use('/calls', callRoutes);
router.use('/data-control', dataControlRoutes);
router.use('/user-control', userControlRoutes);
router.use('/contact-management', contactManagementRoutes);

export default router; 