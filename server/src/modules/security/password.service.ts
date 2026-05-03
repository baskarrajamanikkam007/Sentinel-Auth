import argon2 from 'argon2';
import { securityConfig } from '../../config/security';

export const hashPassword = (password: string): Promise<string> =>
  argon2.hash(password, {
    memoryCost: securityConfig.argon2.memoryCost,
    timeCost: securityConfig.argon2.timeCost,
    parallelism: securityConfig.argon2.parallelism,
  });

export const verifyPassword = (hash: string, password: string): Promise<boolean> =>
  argon2.verify(hash, password);
