import client from './client';
import type { ApiKey, ApiKeyCreated, ApiResponse } from '@/types';

export const apiKeyApi = {
  listKeys: () => client.get<ApiResponse<ApiKey[]>>('/keys'),

  createKey: (data: { name: string; permissions?: string[]; expiresAt?: string }) =>
    client.post<ApiResponse<ApiKeyCreated>>('/keys', data),

  revokeKey: (id: string) => client.delete<ApiResponse<null>>(`/keys/${id}`),
};
