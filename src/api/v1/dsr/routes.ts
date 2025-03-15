import { Router } from 'express';
import { authenticate, authorize } from '../../../middlewares/authMiddleware';
import { validate } from '../../../middlewares/validationMiddleware';
import * as dsrControllers from './controllers';
import * as dsrSchemas from './schemas';
import { uploadMiddleware } from '../../../middlewares/uploadMiddleware';

const router = Router();

// All DSR routes require authentication
router.use(authenticate);

// Visit routes
router.get(
  '/visits', 
  authorize(['read:visits']), 
  validate(dsrSchemas.getVisitsSchema),
  dsrControllers.getVisits
);

router.post(
  '/visits', 
  authorize(['create:visits']), 
  validate(dsrSchemas.createVisitSchema),
  dsrControllers.createVisit
);

router.get(
  '/visits/:id', 
  authorize(['read:visits']), 
  validate(dsrSchemas.getVisitByIdSchema),
  dsrControllers.getVisitById
);

router.patch(
  '/visits/:id', 
  authorize(['update:visits']), 
  validate(dsrSchemas.updateVisitSchema),
  dsrControllers.updateVisit
);

// Check-in/out routes
router.post(
  '/check-in', 
  authorize(['create:visits']), 
  validate(dsrSchemas.checkInSchema),
  dsrControllers.checkIn
);

router.post(
  '/check-out/:visitId', 
  authorize(['update:visits']), 
  validate(dsrSchemas.checkOutSchema),
  dsrControllers.checkOut
);

// Photo upload routes
router.post(
  '/visits/:visitId/photos', 
  authorize(['update:visits']), 
  uploadMiddleware.single('photo'),
  validate(dsrSchemas.uploadPhotoSchema),
  dsrControllers.uploadVisitPhoto
);

// Follow-up routes
router.post(
  '/visits/:visitId/follow-ups', 
  authorize(['create:follow-ups']), 
  validate(dsrSchemas.createFollowUpSchema),
  dsrControllers.createFollowUp
);

router.get(
  '/follow-ups', 
  authorize(['read:follow-ups']), 
  validate(dsrSchemas.getFollowUpsSchema),
  dsrControllers.getFollowUps
);

router.patch(
  '/follow-ups/:id', 
  authorize(['update:follow-ups']), 
  validate(dsrSchemas.updateFollowUpSchema),
  dsrControllers.updateFollowUp
);

// Payment routes
router.post(
  '/visits/:visitId/payments', 
  authorize(['create:payments']), 
  validate(dsrSchemas.createPaymentSchema),
  dsrControllers.createPayment
);

// Nearby companies route
router.get(
  '/nearby-companies', 
  authorize(['read:companies']), 
  validate(dsrSchemas.nearbyCompaniesSchema),
  dsrControllers.getNearbyCompanies
);

// Reports routes
router.get(
  '/reports/daily', 
  authorize(['read:reports']), 
  validate(dsrSchemas.reportsSchema),
  dsrControllers.getDailyReport
);

router.get(
  '/reports/weekly', 
  authorize(['read:reports']), 
  validate(dsrSchemas.reportsSchema),
  dsrControllers.getWeeklyReport
);

router.get(
  '/reports/monthly', 
  authorize(['read:reports']), 
  validate(dsrSchemas.reportsSchema),
  dsrControllers.getMonthlyReport
);

export default router; 