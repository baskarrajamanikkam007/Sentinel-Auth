import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import * as apiKeyController from './apiKey.controller';

export const apiKeyRouter = Router();

apiKeyRouter.use(authenticate);

apiKeyRouter.post('/', apiKeyController.createKey);
apiKeyRouter.get('/', apiKeyController.listKeys);
apiKeyRouter.delete('/:id', apiKeyController.revokeKey);
