import { OtpType } from '../../generated/prisma/client';
import { redis } from '../../config/redis.config';
import { generateOtpCode } from '../../utils/crypto';
import { securityConfig } from '../../config/security';

const key = (userId: string, type: OtpType) => `otp:${userId}:${type}`;

export const generateAndStoreOtp = async (userId: string, type: OtpType): Promise<string> => {
  const code = generateOtpCode(securityConfig.otp.length);
  const ttl = securityConfig.otp.expiryMinutes * 60;
  await redis.setex(key(userId, type), ttl, code);
  return code;
};

export const verifyOtp = async (userId: string, type: OtpType, code: string): Promise<boolean> => {
  const stored = await redis.get(key(userId, type));
  if (!stored || stored !== code) return false;
  await redis.del(key(userId, type));
  return true;
};
