import type { Request, Response, NextFunction } from 'express';
import * as adminService from './admin.service';
import { formatResponse } from '../../utils/helpers';
import { Role } from '../../generated/prisma/client';
import { AppError, ErrorCodes } from '../../constants/errors';

export const listUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10));
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? '20'), 10)));
    const result = await adminService.listUsers(page, limit);
    res.json(formatResponse({ ...result, page, limit }));
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await adminService.getUserById(String(req.params.id));
    res.json(formatResponse(user));
  } catch (err) {
    next(err);
  }
};

export const updateRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { role } = req.body;
    if (!Object.values(Role).includes(role)) {
      throw new AppError('Invalid role', 400, ErrorCodes.VALIDATION_ERROR);
    }
    const user = await adminService.updateUserRole(String(req.params.id), role as Role);
    res.json(formatResponse(user, 'Role updated'));
  } catch (err) {
    next(err);
  }
};

export const lockUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const durationMinutes = parseInt(String(req.body.durationMinutes ?? '60'), 10);
    await adminService.lockUser(req.user!.id, String(req.params.id), durationMinutes);
    res.json(formatResponse(null, 'User locked'));
  } catch (err) {
    next(err);
  }
};

export const unlockUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await adminService.unlockUser(req.user!.id, String(req.params.id));
    res.json(formatResponse(null, 'User unlocked'));
  } catch (err) {
    next(err);
  }
};

export const getAuditLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10));
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? '20'), 10)));
    const userId = typeof req.query.userId === 'string' ? req.query.userId : undefined;
    const result = await adminService.getAuditLogs(page, limit, userId);
    res.json(formatResponse({ ...result, page, limit }));
  } catch (err) {
    next(err);
  }
};

export const getSessions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = typeof req.query.userId === 'string' ? req.query.userId : undefined;
    const sessions = await adminService.getAllSessions(userId);
    res.json(formatResponse(sessions));
  } catch (err) {
    next(err);
  }
};
