import type { Request, Response, NextFunction } from 'express';
import * as apiKeyService from './apiKey.service';
import { formatResponse } from '../../utils/helpers';
import type { CreateApiKeyDto } from './apiKey.types';

export const createKey = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, permissions, expiresAt } = req.body;
    const dto: CreateApiKeyDto = {
      name,
      permissions,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    };
    const result = await apiKeyService.createApiKey(req.user!.id, dto);
    res.status(201).json(formatResponse(result, 'API key created. Store it securely — it will not be shown again.'));
  } catch (err) {
    next(err);
  }
};

export const listKeys = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const keys = await apiKeyService.listUserApiKeys(req.user!.id);
    res.json(formatResponse(keys));
  } catch (err) {
    next(err);
  }
};

export const revokeKey = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await apiKeyService.revokeApiKey(String(req.params.id), req.user!.id);
    res.json(formatResponse(null, 'API key revoked'));
  } catch (err) {
    next(err);
  }
};
