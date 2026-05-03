import 'dotenv/config';

function req(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required environment variable: ${key}`);
  return val;
}

function opt(key: string, fallback: string): string {
  return process.env[key] || fallback;
}

export const env = {
  nodeEnv: opt('NODE_ENV', 'development'),
  port: parseInt(opt('PORT', '5000'), 10),
  databaseUrl: req('DATABASE_URL'),
  redis: {
    host: opt('REDIS_HOST', 'localhost'),
    port: parseInt(opt('REDIS_PORT', '6379'), 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },
  jwt: {
    accessSecret: req('JWT_ACCESS_SECRET'),
    refreshSecret: req('JWT_REFRESH_SECRET'),
    accessExpiry: opt('ACCESS_TOKEN_EXPIRES', '15m'),
    refreshExpiry: opt('REFRESH_TOKEN_EXPIRES', '7d'),
  },
  smtp: {
    host: opt('SMTP_HOST', 'smtp.gmail.com'),
    port: parseInt(opt('SMTP_PORT', '587'), 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: opt('SMTP_FROM', 'noreply@sentinelauth.com'),
  },
  corsOrigin: opt('CORS_ORIGIN', 'http://localhost:3000'),
  hibpApiKey: process.env.HIBP_API_KEY || '',
} as const;
