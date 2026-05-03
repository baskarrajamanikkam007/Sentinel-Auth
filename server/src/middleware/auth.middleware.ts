import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, isTokenBlacklisted } from '../modules/security/token.service';
import { verifyApiKey, updateLastUsed } from '../modules/api-key/apiKey.service';
import { AppError, ErrorCodes } from '../constants/errors';

export const authenticate = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(new AppError('No token provided', 401, ErrorCodes.UNAUTHORIZED));
  }

  const token = authHeader.slice(7);
  try {
    const payload = verifyAccessToken(token);

    const blacklisted = await isTokenBlacklisted(payload.jti);
    if (blacklisted) {
      return next(new AppError('Token has been revoked', 401, ErrorCodes.TOKEN_INVALID));
    }

    req.user = { id: payload.sub, email: payload.email, role: payload.role };
    next();
  } catch {
    next(new AppError('Invalid or expired token', 401, ErrorCodes.TOKEN_INVALID));
  }
};

export const authenticateAny = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    try {
      const payload = verifyAccessToken(token);
      const blacklisted = await isTokenBlacklisted(payload.jti);
      if (blacklisted) return next(new AppError('Token has been revoked', 401, ErrorCodes.TOKEN_INVALID));
      req.user = { id: payload.sub, email: payload.email, role: payload.role };
      return next();
    } catch {
      return next(new AppError('Invalid or expired token', 401, ErrorCodes.TOKEN_INVALID));
    }
  }

  const rawKey = req.headers['x-api-key'];
  if (rawKey && typeof rawKey === 'string') {
    const result = await verifyApiKey(rawKey);
    if (!result) return next(new AppError('Invalid or inactive API key', 401, ErrorCodes.TOKEN_INVALID));
    req.user = { id: result.user.id, email: result.user.email, role: result.user.role };
    req.apiKeyId = result.apiKey.id;
    updateLastUsed(result.apiKey.id);
    return next();
  }

  next(new AppError('No credentials provided', 401, ErrorCodes.UNAUTHORIZED));
};

export const requireRole = (...roles: string[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions', 403, ErrorCodes.FORBIDDEN));
    }
    next();
  };
