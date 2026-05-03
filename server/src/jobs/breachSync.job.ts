import { logger } from '../logger/logger';

export const startBreachSyncJob = (): void => {
  logger.info('Breach sync job: not configured — using real-time HIBP k-anonymity API instead');
};
