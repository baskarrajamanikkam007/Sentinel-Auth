import 'dotenv/config';
import http from 'http';
import app from './app';
import { appConfig } from './config/app.config';
import { initSockets } from './sockets';
import { logger } from './logger/logger';
import { prisma } from './config/pg.config';
import { connectRedis } from './config/redis.config';
import { startCleanupJob } from './jobs/cleanup.job';
import { startAlertJob } from './jobs/alert.job';
import { startBreachSyncJob } from './jobs/breachSync.job';

const server = http.createServer(app);
initSockets(server);

const start = async (): Promise<void> => {
  try {
    await prisma.$connect();
    logger.info('PostgreSQL connected via Prisma');
  } catch (error) {
    logger.error('Failed to connect to PostgreSQL', error);
    process.exit(1);
  }

  try {
    await connectRedis();
    logger.info('Redis connection established');
  } catch (err) {
    logger.error('Redis connection failed – authentication features require Redis', err);
    process.exit(1);
  }

  startCleanupJob();
  startAlertJob();
  startBreachSyncJob();

  server.listen(appConfig.port, () => {
    logger.info(`Server running on port ${appConfig.port} [${appConfig.env}]`);
  });
};

const shutdown = async (): Promise<void> => {
  logger.info('Shutting down gracefully...');
  server.close(() => process.exit(0));
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

start();
