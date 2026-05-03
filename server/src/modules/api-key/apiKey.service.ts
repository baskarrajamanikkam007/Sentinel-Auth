import { prisma } from '../../config/pg.config';
import { generateApiKeyPair, hashApiKey } from '../../utils/crypto';
import { AppError, ErrorCodes } from '../../constants/errors';
import { logAction } from '../audit/audit.service';
import { AuditAction } from '../../generated/prisma/client';
import type { ApiKeyCreatedResponse, ApiKeyResponse, CreateApiKeyDto } from './apiKey.types';
import type { User } from '../../generated/prisma/client';

const KEY_SELECT = {
  id: true,
  name: true,
  prefix: true,
  permissions: true,
  lastUsedAt: true,
  expiresAt: true,
  isActive: true,
  createdAt: true,
} as const;

export const createApiKey = async (
  userId: string,
  dto: CreateApiKeyDto,
): Promise<ApiKeyCreatedResponse> => {
  const { key, hash, prefix } = generateApiKeyPair();

  const apiKey = await prisma.apiKey.create({
    data: {
      userId,
      name: dto.name,
      keyHash: hash,
      prefix,
      permissions: dto.permissions ?? [],
      expiresAt: dto.expiresAt,
    },
    select: KEY_SELECT,
  });

  logAction({ userId, action: AuditAction.API_KEY_CREATED, resourceId: apiKey.id });

  return { ...apiKey, key };
};

export interface VerifiedApiKey {
  apiKey: { id: string; permissions: string[] };
  user: User;
}

export const verifyApiKey = async (rawKey: string): Promise<VerifiedApiKey | null> => {
  const hash = hashApiKey(rawKey);
  const apiKey = await prisma.apiKey.findUnique({ where: { keyHash: hash } });

  if (!apiKey || !apiKey.isActive) return null;
  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) return null;

  const user = await prisma.user.findUnique({ where: { id: apiKey.userId } });
  if (!user || !user.isActive) return null;

  return { apiKey: { id: apiKey.id, permissions: apiKey.permissions }, user };
};

export const listUserApiKeys = (userId: string): Promise<ApiKeyResponse[]> =>
  prisma.apiKey.findMany({ where: { userId, isActive: true }, select: KEY_SELECT, orderBy: { createdAt: 'desc' } });

export const revokeApiKey = async (id: string, userId: string): Promise<void> => {
  const key = await prisma.apiKey.findFirst({ where: { id, userId } });
  if (!key) throw new AppError('API key not found', 404, ErrorCodes.NOT_FOUND);

  await prisma.apiKey.update({ where: { id }, data: { isActive: false } });
  logAction({ userId, action: AuditAction.API_KEY_REVOKED, resourceId: id });
};

export const updateLastUsed = (id: string): void => {
  prisma.apiKey.update({ where: { id }, data: { lastUsedAt: new Date() } }).catch(() => {});
};
