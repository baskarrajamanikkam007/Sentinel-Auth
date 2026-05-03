import client from './client';
import type { ApiResponse, AuthTokens, UserProfile } from '@/types';

export const authApi = {
  register: (data: { email: string; password: string; name?: string }) =>
    client.post<ApiResponse<{ userId: string }>>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    client.post<ApiResponse<AuthTokens>>('/auth/login', data),

  logout: () => client.post<ApiResponse<null>>('/auth/logout'),

  refresh: (refreshToken: string) =>
    client.post<ApiResponse<AuthTokens>>('/auth/refresh', { refreshToken }),

  verifyEmail: (data: { userId: string; code: string }) =>
    client.post<ApiResponse<null>>('/auth/verify-email', data),

  forgotPassword: (email: string) =>
    client.post<ApiResponse<null>>('/auth/forgot-password', { email }),

  resetPassword: (data: { userId: string; code: string; newPassword: string }) =>
    client.post<ApiResponse<null>>('/auth/reset-password', data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    client.post<ApiResponse<null>>('/auth/change-password', data),

  getMe: () => client.get<ApiResponse<UserProfile>>('/users/me'),
};
