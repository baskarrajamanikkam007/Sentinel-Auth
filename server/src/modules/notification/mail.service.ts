import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';
import { createMailTransport, mailFrom } from '../../config/mail';
import { redis } from '../../config/redis.config';
import { logger } from '../../logger/logger';
import { securityConfig } from '../../config/security';
import type { LoginAlertPayload, PasswordResetPayload, QueuedMail, VerifyEmailPayload } from './notification.types';

const TEMPLATE_DIR = path.join(__dirname, 'templates');
const EMAIL_QUEUE_KEY = 'email:queue';

function loadTemplate(name: string): HandlebarsTemplateDelegate {
  const src = fs.readFileSync(path.join(TEMPLATE_DIR, `${name}.hbs`), 'utf-8');
  return handlebars.compile(src);
}

const templates = {
  verifyEmail: loadTemplate('verify-email'),
  resetPassword: loadTemplate('reset-password'),
  loginAlert: loadTemplate('login-alert'),
};

export const sendMail = async (mail: QueuedMail): Promise<void> => {
  const transport = createMailTransport();
  await transport.sendMail({ from: mailFrom, ...mail });
};

const enqueue = async (mail: QueuedMail): Promise<void> => {
  await redis.lpush(EMAIL_QUEUE_KEY, JSON.stringify(mail));
};

export const sendVerificationEmail = async (to: string, name: string, code: string): Promise<void> => {
  const html = templates.verifyEmail({
    name,
    code,
    expiryMinutes: securityConfig.otp.expiryMinutes,
  } satisfies VerifyEmailPayload);
  await sendMail({ to, subject: 'Verify your SentinelAuth account', html });
};

export const sendPasswordResetEmail = async (to: string, name: string, code: string): Promise<void> => {
  const html = templates.resetPassword({
    name,
    code,
    expiryMinutes: securityConfig.otp.expiryMinutes,
  } satisfies PasswordResetPayload);
  await sendMail({ to, subject: 'SentinelAuth — password reset code', html });
};

export const sendLoginAlertEmail = async (
  to: string,
  payload: LoginAlertPayload,
): Promise<void> => {
  const html = templates.loginAlert(payload);
  const mail: QueuedMail = { to, subject: 'SentinelAuth — new login detected', html };
  try {
    await enqueue(mail);
  } catch {
    logger.warn('Email queue unavailable, sending login alert directly');
    await sendMail(mail).catch((err) => logger.error('Login alert email failed', err));
  }
};
