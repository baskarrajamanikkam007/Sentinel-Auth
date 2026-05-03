export const Permissions = {
  READ_USERS: 'read:users',
  WRITE_USERS: 'write:users',
  DELETE_USERS: 'delete:users',
  READ_SESSIONS: 'read:sessions',
  MANAGE_SESSIONS: 'manage:sessions',
  READ_AUDIT_LOGS: 'read:audit_logs',
  MANAGE_API_KEYS: 'manage:api_keys',
} as const;

export type Permission = (typeof Permissions)[keyof typeof Permissions];
