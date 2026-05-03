import { Router } from 'express';
import { authenticateAny } from '../../middleware/auth.middleware';
import * as userController from './user.controller';

export const userRouter = Router();

userRouter.use(authenticateAny);

userRouter.get('/me', userController.getMe);
userRouter.patch('/me', userController.updateMe);
userRouter.delete('/me', userController.deleteMe);
