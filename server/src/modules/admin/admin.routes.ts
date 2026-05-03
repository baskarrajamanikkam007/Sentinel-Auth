import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.middleware';
import * as adminController from './admin.controller';

export const adminRouter = Router();

adminRouter.use(authenticate, requireRole('ADMIN'));

adminRouter.get('/users', adminController.listUsers);
adminRouter.get('/users/:id', adminController.getUserById);
adminRouter.patch('/users/:id/role', adminController.updateRole);
adminRouter.post('/users/:id/lock', adminController.lockUser);
adminRouter.post('/users/:id/unlock', adminController.unlockUser);
adminRouter.get('/audit-logs', adminController.getAuditLogs);
adminRouter.get('/sessions', adminController.getSessions);
