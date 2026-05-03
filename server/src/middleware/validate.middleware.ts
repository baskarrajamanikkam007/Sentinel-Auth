import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
import { AppError, ErrorCodes } from '../constants/errors';

export const validate =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse({ body: req.body, query: req.query, params: req.params });
    if (!result.success) {
      const message = result.error.issues.map((i) => i.message).join('; ');
      return next(new AppError(message, 400, ErrorCodes.VALIDATION_ERROR));
    }
    next();
  };
