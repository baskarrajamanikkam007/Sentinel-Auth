import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createRateLimit } from '../../middleware/rateLimit.middleware';
import { securityConfig } from '../../config/security';
import * as authController from './auth.controller';
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  refreshTokenSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from './auth.validation';

export const authRouter = Router();

const authLimit = createRateLimit({
  max: securityConfig.rateLimit.auth.max,
  windowMs: securityConfig.rateLimit.auth.windowMs,
  keyPrefix: 'rl:auth',
});

authRouter.post('/register', validate(registerSchema), authController.register);
authRouter.post('/login', validate(loginSchema), authController.login);
authRouter.post('/logout', authenticate, authController.logout);
authRouter.post('/refresh', validate(refreshTokenSchema), authController.refresh);
authRouter.post('/verify-email', validate(verifyEmailSchema), authController.verifyEmail);
authRouter.post('/forgot-password', authLimit, validate(forgotPasswordSchema), authController.forgotPassword);
authRouter.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);
authRouter.post('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword);
