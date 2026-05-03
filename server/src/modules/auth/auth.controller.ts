import type { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service';
import { formatResponse } from '../../utils/helpers';
import { getClientIp } from '../../utils/helpers';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(formatResponse(result, 'Registration successful. Please verify your email.'));
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const ip = getClientIp(req);
    const ua = req.headers['user-agent'] || '';
    const tokens = await authService.login(req.body, ip, ua);
    res.json(formatResponse(tokens));
  } catch (err) {
    next(err);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.headers.authorization?.slice(7) ?? '';
    await authService.logout(token, req.sessionId ?? '');
    res.json(formatResponse(null, 'Logged out successfully'));
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tokens = await authService.refreshTokens(req.body);
    res.json(formatResponse(tokens));
  } catch (err) {
    next(err);
  }
};

export const verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await authService.verifyEmail(req.body);
    res.json(formatResponse(null, 'Email verified successfully'));
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await authService.forgotPassword(req.body);
    res.json(formatResponse(null, 'If this email exists, a reset code has been sent'));
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await authService.resetPassword(req.body);
    res.json(formatResponse(null, 'Password reset successfully'));
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await authService.changePassword(req.user!.id, req.sessionId ?? '', req.body);
    res.json(formatResponse(null, 'Password changed successfully'));
  } catch (err) {
    next(err);
  }
};
