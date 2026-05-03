import { redis } from '../config/redis.config';
import { sendMail } from '../modules/notification/mail.service';
import { logger } from '../logger/logger';
import type { QueuedMail } from '../modules/notification/notification.types';

const QUEUE_KEY = 'email:queue';
const BATCH_SIZE = 10;
const INTERVAL_MS = 5_000;

const processBatch = async (): Promise<void> => {
  for (let i = 0; i < BATCH_SIZE; i++) {
    const raw = await redis.rpop(QUEUE_KEY);
    if (!raw) break;

    try {
      const mail = JSON.parse(raw) as QueuedMail;
      await sendMail(mail);
    } catch (err) {
      logger.error('Alert job: failed to send queued email', err);
    }
  }
};

export const startAlertJob = (): void => {
  setInterval(() => processBatch().catch((err) => logger.error('Alert job error', err)), INTERVAL_MS);
};
