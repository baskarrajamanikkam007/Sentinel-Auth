import client from './client';
import type { ApiResponse, AuditLog, SessionItem, UserProfile } from '@/types';

interface UsersPage {
  users: UserProfile[];
  total: number;
  page: number;
  limit: number;
}

interface LogsPage {
  logs: AuditLog[];
  total: number;
  page: number;
  limit: number;
}

export const adminApi = {
  listUsers: (page = 1, limit = 20) =>
    client.get<ApiResponse<UsersPage>>(`/admin/users?page=${page}&limit=${limit}`),

  getUserById: (id: string) =>
    client.get<ApiResponse<UserProfile>>(`/admin/users/${id}`),

  updateRole: (id: string, role: string) =>
    client.patch<ApiResponse<UserProfile>>(`/admin/users/${id}/role`, { role }),

  lockUser: (id: string, durationMinutes: number) =>
    client.post<ApiResponse<null>>(`/admin/users/${id}/lock`, { durationMinutes }),

  unlockUser: (id: string) =>
    client.post<ApiResponse<null>>(`/admin/users/${id}/unlock`),

  getAuditLogs: (page = 1, limit = 20, userId?: string) =>
    client.get<ApiResponse<LogsPage>>(
      `/admin/audit-logs?page=${page}&limit=${limit}${userId ? `&userId=${userId}` : ''}`,
    ),

  getAllSessions: (userId?: string) =>
    client.get<ApiResponse<SessionItem[]>>(
      `/admin/sessions${userId ? `?userId=${userId}` : ''}`,
    ),
};
