import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import * as sessionController from './session.controller';

export const sessionRouter = Router();

sessionRouter.use(authenticate);

sessionRouter.get('/', sessionController.getSessions);
sessionRouter.delete('/:id', sessionController.revokeOne);
sessionRouter.delete('/', sessionController.revokeAll);
