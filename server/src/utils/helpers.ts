import type { Request } from 'express';

const UNIT_MS: Record<string, number> = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
const UNIT_S: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };

function parseExpiry(expiry: string): { value: number; unit: string } {
  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match) throw new Error(`Invalid expiry format: ${expiry}`);
  return { value: parseInt(match[1], 10), unit: match[2] };
}

export const expiryToDate = (expiry: string): Date => {
  const { value, unit } = parseExpiry(expiry);
  return new Date(Date.now() + value * (UNIT_MS[unit] ?? 0));
};

export const expiryToSeconds = (expiry: string): number => {
  const { value, unit } = parseExpiry(expiry);
  return value * (UNIT_S[unit] ?? 0);
};

export const formatResponse = <T>(data: T, message?: string) => ({
  success: true,
  ...(message && { message }),
  data,
});

export const errorResponse = (message: string, code?: string) => ({
  success: false,
  message,
  ...(code && { code }),
});

export const getClientIp = (req: Request): string => {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
    return ip.trim();
  }
  return req.socket.remoteAddress || '127.0.0.1';
};
