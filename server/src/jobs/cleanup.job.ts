import { prisma } from '../config/pg.config';
import { logger } from '../logger/logger';

const INTERVAL_MS = 60 * 60 * 1000;

const run = async (): Promise<void> => {
  const now = new Date();
  const [sessions, otps] = await Promise.all([
    prisma.session.deleteMany({ where: { expiresAt: { lt: now } } }),
    prisma.otp.deleteMany({ where: { expiresAt: { lt: now } } }),
  ]);
  logger.info(`Cleanup job: removed ${sessions.count} expired sessions, ${otps.count} expired OTPs`);
};

export const startCleanupJob = (): void => {
  run().catch((err) => logger.error('Cleanup job error', err));
  setInterval(() => run().catch((err) => logger.error('Cleanup job error', err)), INTERVAL_MS);
};
