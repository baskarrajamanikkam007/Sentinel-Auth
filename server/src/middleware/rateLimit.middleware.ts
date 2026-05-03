import type { Request, Response, NextFunction } from 'express';
import { redis } from '../config/redis.config';
import { AppError, ErrorCodes } from '../constants/errors';

interface RateLimitOptions {
  max: number;
  windowMs: number;
  keyPrefix: string;
}

export const createRateLimit = ({ max, windowMs, keyPrefix }: RateLimitOptions) => {
  const windowSecs = Math.ceil(windowMs / 1000);

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const ip = req.ip ?? req.socket.remoteAddress ?? 'unknown';
    const key = `${keyPrefix}:${ip}`;

    try {
      const current = await redis.incr(key);
      if (current === 1) {
        await redis.expire(key, windowSecs);
      }

      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, max - current));

      if (current > max) {
        const ttl = await redis.ttl(key);
        res.setHeader('Retry-After', ttl);
        return next(new AppError('Too many requests, please try again later', 429, ErrorCodes.RATE_LIMITED));
      }

      next();
    } catch {
      next();
    }
  };
};
