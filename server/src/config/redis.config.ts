import Redis from 'ioredis';
import { logger } from '../logger/logger';

export const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  lazyConnect: true,
  maxRetriesPerRequest: 1,
  retryStrategy: () => null, // disable auto-reconnect
  enableOfflineQueue: false,
});

// redis.on('connect', () => logger.info(''));
// redis.on('error', () => {}); // suppress repeated error logs

export const connectRedis = async (): Promise<void> => {
  try {
    await redis.connect();
    // logger.info('Redis connected successfully');
  } catch (error) {
    logger.error('Failed to connect to Redis', error);
    throw error;
  }
};

export const isRedisConnected = (): boolean => {
  return redis.status === 'ready';
};
