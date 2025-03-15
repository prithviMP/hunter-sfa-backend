import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';

// Temporary middleware until proper middleware files are set up
const authenticate = (req: Request, res: Response, next: NextFunction) => next();
const authorize = (permissions: string[]) => (req: Request, res: Response, next: NextFunction) => next();
const validate = (schema: any) => (req: Request, res: Response, next: NextFunction) => next();

import * as callControllers from './controllers';
import * as callSchemas from './schemas';

const router = Router();

// All Call Manager routes require authentication
router.use(authenticate);

// Call routes
router.get(
  '/', 
  authorize(['read:calls']), 
  validate(callSchemas.getCallsSchema),
  callControllers.getCalls
);

router.post(
  '/', 
  authorize(['create:calls']), 
  validate(callSchemas.createCallSchema),
  callControllers.createCall
);

router.get(
  '/:id', 
  authorize(['read:calls']), 
  validate(callSchemas.getCallByIdSchema),
  callControllers.getCallById
);

router.patch(
  '/:id', 
  authorize(['update:calls']), 
  validate(callSchemas.updateCallSchema),
  callControllers.updateCall
);

router.delete(
  '/:id', 
  authorize(['delete:calls']), 
  validate(callSchemas.deleteCallSchema),
  callControllers.deleteCall
);

// Call status routes
router.patch(
  '/:id/start', 
  authorize(['update:calls']), 
  validate(callSchemas.startCallSchema),
  callControllers.startCall
);

router.patch(
  '/:id/end', 
  authorize(['update:calls']), 
  validate(callSchemas.endCallSchema),
  callControllers.endCall
);

router.patch(
  '/:id/cancel', 
  authorize(['update:calls']), 
  validate(callSchemas.cancelCallSchema),
  callControllers.cancelCall
);

// Call logs routes
router.get(
  '/logs', 
  authorize(['read:call-logs']), 
  validate(callSchemas.getCallLogsSchema),
  callControllers.getCallLogs
);

router.get(
  '/logs/pending', 
  authorize(['read:call-logs']), 
  validate(callSchemas.getPendingLogsSchema),
  callControllers.getPendingLogs
);

// Call reports routes
router.get(
  '/reports/daily', 
  authorize(['read:reports']), 
  validate(callSchemas.reportsSchema),
  callControllers.getDailyReport
);

router.get(
  '/reports/weekly', 
  authorize(['read:reports']), 
  validate(callSchemas.reportsSchema),
  callControllers.getWeeklyReport
);

router.get(
  '/reports/monthly', 
  authorize(['read:reports']), 
  validate(callSchemas.reportsSchema),
  callControllers.getMonthlyReport
);

export default router; 