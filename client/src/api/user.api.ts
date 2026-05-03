import client from './client';
import type { ApiResponse, UserProfile } from '@/types';

export const userApi = {
  getMe: () => client.get<ApiResponse<UserProfile>>('/users/me'),
  updateMe: (data: { name?: string }) =>
    client.patch<ApiResponse<UserProfile>>('/users/me', data),
  deleteMe: () => client.delete<ApiResponse<null>>('/users/me'),
};
