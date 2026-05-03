import type { Request, Response, NextFunction } from 'express';
import { verifyApiKey, updateLastUsed } from '../modules/api-key/apiKey.service';
import { AppError, ErrorCodes } from '../constants/errors';

export const authenticateApiKey = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const rawKey = req.headers['x-api-key'];
  if (!rawKey || typeof rawKey !== 'string') {
    return next(new AppError('API key required', 401, ErrorCodes.UNAUTHORIZED));
  }

  const result = await verifyApiKey(rawKey);
  if (!result) {
    return next(new AppError('Invalid or inactive API key', 401, ErrorCodes.TOKEN_INVALID));
  }

  req.user = { id: result.user.id, email: result.user.email, role: result.user.role };
  req.apiKeyId = result.apiKey.id;
  updateLastUsed(result.apiKey.id);
  next();
};
