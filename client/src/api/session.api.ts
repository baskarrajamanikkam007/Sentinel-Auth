import client from './client';
import type { ApiResponse, SessionItem } from '@/types';

export const sessionApi = {
  getSessions: () => client.get<ApiResponse<SessionItem[]>>('/sessions'),
  revokeSession: (id: string) => client.delete<ApiResponse<null>>(`/sessions/${id}`),
  revokeAllSessions: () => client.delete<ApiResponse<{ count: number }>>('/sessions'),
};
