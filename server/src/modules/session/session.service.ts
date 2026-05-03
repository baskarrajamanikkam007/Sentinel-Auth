import { prisma } from '../../config/pg.config';
import { AppError, ErrorCodes } from '../../constants/errors';
import type { CreateSessionDto, SessionResponse } from './session.types';
import type { Session } from '../../generated/prisma/client';

const SESSION_SELECT = {
  id: true,
  deviceId: true,
  userAgent: true,
  ip: true,
  isRevoked: true,
  expiresAt: true,
  createdAt: true,
} as const;

export const createSession = (dto: CreateSessionDto): Promise<Session> =>
  prisma.session.create({ data: dto });

export const findByRefreshToken = (token: string): Promise<Session | null> =>
  prisma.session.findUnique({ where: { refreshToken: token } });

export const revokeSession = async (id: string, userId: string): Promise<void> => {
  const session = await prisma.session.findFirst({ where: { id, userId } });
  if (!session) throw new AppError('Session not found', 404, ErrorCodes.NOT_FOUND);
  await prisma.session.update({ where: { id }, data: { isRevoked: true } });
};

export const revokeAllUserSessions = async (userId: string): Promise<number> => {
  const result = await prisma.session.updateMany({
    where: { userId, isRevoked: false },
    data: { isRevoked: true },
  });
  return result.count;
};

export const revokeAllExcept = async (userId: string, excludeId: string): Promise<void> => {
  await prisma.session.updateMany({
    where: { userId, isRevoked: false, NOT: { id: excludeId } },
    data: { isRevoked: true },
  });
};

export const getUserSessions = (userId: string): Promise<SessionResponse[]> =>
  prisma.session.findMany({
    where: { userId, isRevoked: false, expiresAt: { gt: new Date() } },
    select: SESSION_SELECT,
    orderBy: { createdAt: 'desc' },
  });

export const deleteExpiredSessions = async (): Promise<number> => {
  const result = await prisma.session.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  return result.count;
};
