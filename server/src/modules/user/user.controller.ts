import type { Request, Response, NextFunction } from 'express';
import * as userService from './user.service';
import { formatResponse } from '../../utils/helpers';

export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const profile = await userService.getProfile(req.user!.id);
    res.json(formatResponse(profile));
  } catch (err) {
    next(err);
  }
};

export const updateMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const profile = await userService.updateProfile(req.user!.id, req.body);
    res.json(formatResponse(profile, 'Profile updated'));
  } catch (err) {
    next(err);
  }
};

export const deleteMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await userService.deactivateAccount(req.user!.id);
    res.json(formatResponse(null, 'Account deactivated'));
  } catch (err) {
    next(err);
  }
};
