export { AuditAction } from '../../generated/prisma/client';

export interface CreateAuditLogDto {
  userId?: string;
  action: import('../../generated/prisma/client').AuditAction;
  resource?: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
}
