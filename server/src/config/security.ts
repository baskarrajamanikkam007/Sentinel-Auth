import 'dotenv/config';

export const securityConfig = {
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'default_access_secret_change_in_prod',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default_refresh_secret_change_in_prod',
    accessExpiry: process.env.ACCESS_TOKEN_EXPIRES || '15m',
    refreshExpiry: process.env.REFRESH_TOKEN_EXPIRES || '7d',
  },
  argon2: {
    memoryCost: 2 ** 16,
    timeCost: 3,
    parallelism: 1,
  },
  otp: {
    length: 6,
    expiryMinutes: 10,
  },
  lockout: {
    maxAttempts: 5,
    durationMinutes: 15,
  },
  rateLimit: {
    auth: { max: 10, windowMs: 15 * 60 * 1000 },
    api: { max: 100, windowMs: 15 * 60 * 1000 },
  },
};
