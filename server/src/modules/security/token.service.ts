import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { redis } from '../../config/redis.config';
import { securityConfig } from '../../config/security';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: string;
  jti: string;
  type: 'access';
}

export interface RefreshTokenPayload {
  sub: string;
  sessionId: string;
  type: 'refresh';
}

export const signAccessToken = (payload: { sub: string; email: string; role: string }): string =>
  jwt.sign(
    { ...payload, jti: crypto.randomUUID(), type: 'access' },
    securityConfig.jwt.accessSecret,
    { expiresIn: securityConfig.jwt.accessExpiry } as jwt.SignOptions,
  );

export const signRefreshToken = (payload: { sub: string; sessionId: string }): string =>
  jwt.sign(
    { ...payload, type: 'refresh' },
    securityConfig.jwt.refreshSecret,
    { expiresIn: securityConfig.jwt.refreshExpiry } as jwt.SignOptions,
  );

export const verifyAccessToken = (token: string): AccessTokenPayload =>
  jwt.verify(token, securityConfig.jwt.accessSecret) as AccessTokenPayload;

export const verifyRefreshToken = (token: string): RefreshTokenPayload =>
  jwt.verify(token, securityConfig.jwt.refreshSecret) as RefreshTokenPayload;

export const blacklistToken = async (jti: string, ttlSeconds: number): Promise<void> => {
  await redis.setex(`blacklist:${jti}`, ttlSeconds, '1');
};

export const isTokenBlacklisted = async (jti: string): Promise<boolean> => {
  const result = await redis.exists(`blacklist:${jti}`);
  return result === 1;
};
