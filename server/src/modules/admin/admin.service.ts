import { prisma } from '../../config/pg.config';
import { AppError, ErrorCodes } from '../../constants/errors';
import { logAction } from '../audit/audit.service';
import { AuditAction, Role } from '../../generated/prisma/client';
import type { UserResponse } from '../user/user.types';

const USER_SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
  isEmailVerified: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const listUsers = async (
  page: number,
  limit: number,
): Promise<{ users: UserResponse[]; total: number }> => {
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip: (page - 1) * limit,
      take: limit,
      select: USER_SELECT,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count(),
  ]);
  return { users, total };
};

export const getUserById = async (id: string): Promise<UserResponse> => {
  const user = await prisma.user.findUnique({ where: { id }, select: USER_SELECT });
  if (!user) throw new AppError('User not found', 404, ErrorCodes.NOT_FOUND);
  return user;
};

export const updateUserRole = async (id: string, role: Role): Promise<UserResponse> => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new AppError('User not found', 404, ErrorCodes.NOT_FOUND);
  return prisma.user.update({ where: { id }, data: { role }, select: USER_SELECT });
};

export const lockUser = async (
  adminId: string,
  userId: string,
  durationMinutes: number,
): Promise<void> => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('User not found', 404, ErrorCodes.NOT_FOUND);

  await prisma.user.update({
    where: { id: userId },
    data: { lockedUntil: new Date(Date.now() + durationMinutes * 60_000) },
  });
  logAction({ userId: adminId, action: AuditAction.ACCOUNT_LOCKED, resourceId: userId, metadata: { durationMinutes } });
};

export const unlockUser = async (adminId: string, userId: string): Promise<void> => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('User not found', 404, ErrorCodes.NOT_FOUND);

  await prisma.user.update({
    where: { id: userId },
    data: { lockedUntil: null, failedLoginAttempts: 0 },
  });
  logAction({ userId: adminId, action: AuditAction.ACCOUNT_UNLOCKED, resourceId: userId });
};

export const getAuditLogs = async (
  page: number,
  limit: number,
  userId?: string,
): Promise<{ logs: object[]; total: number }> => {
  const where = userId ? { userId } : {};
  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.auditLog.count({ where }),
  ]);
  return { logs, total };
};

export const getAllSessions = (userId?: string) =>
  prisma.session.findMany({
    where: userId ? { userId } : {},
    orderBy: { createdAt: 'desc' },
    take: 200,
  });
