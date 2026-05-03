import { z } from 'zod';

const password = z.string().min(8, 'Password must be at least 8 characters').max(100);
const email = z.string().email('Invalid email address');

export const registerSchema = z.object({
  body: z.object({
    email,
    password,
    name: z.string().min(2).max(100).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email,
    password: z.string().min(1, 'Password is required'),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});

export const verifyEmailSchema = z.object({
  body: z.object({
    userId: z.string().uuid(),
    code: z.string().length(6),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({ email }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    userId: z.string().uuid(),
    code: z.string().length(6),
    newPassword: password,
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1),
    newPassword: password,
  }),
});
