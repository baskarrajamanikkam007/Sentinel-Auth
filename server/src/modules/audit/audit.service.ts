import type { Prisma } from '../../generated/prisma/client';
import { prisma } from '../../config/pg.config';
import { logger } from '../../logger/logger';
import type { CreateAuditLogDto } from './audit.types';

export const logAction = (dto: CreateAuditLogDto): void => {
  const data: Prisma.AuditLogUncheckedCreateInput = {
    action: dto.action,
    userId: dto.userId,
    resource: dto.resource,
    resourceId: dto.resourceId,
    metadata: dto.metadata as Prisma.InputJsonValue | undefined,
    ip: dto.ip,
    userAgent: dto.userAgent,
  };

  prisma.auditLog
    .create({ data })
    .catch((err) => logger.error('Failed to write audit log', err));
};
