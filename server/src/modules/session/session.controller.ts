import type { Request, Response, NextFunction } from 'express';
import * as sessionService from './session.service';
import { formatResponse } from '../../utils/helpers';

export const getSessions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const sessions = await sessionService.getUserSessions(req.user!.id);
    res.json(formatResponse(sessions));
  } catch (err) {
    next(err);
  }
};

export const revokeOne = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await sessionService.revokeSession(String(req.params.id), req.user!.id);
    res.json(formatResponse(null, 'Session revoked'));
  } catch (err) {
    next(err);
  }
};

export const revokeAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const count = await sessionService.revokeAllUserSessions(req.user!.id);
    res.json(formatResponse({ count }, 'All sessions revoked'));
  } catch (err) {
    next(err);
  }
};
