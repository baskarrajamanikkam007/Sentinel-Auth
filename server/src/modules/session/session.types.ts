export interface CreateSessionDto {
  userId: string;
  refreshToken: string;
  deviceId?: string;
  userAgent?: string;
  ip?: string;
  expiresAt: Date;
}

export interface SessionResponse {
  id: string;
  deviceId: string | null;
  userAgent: string | null;
  ip: string | null;
  isRevoked: boolean;
  expiresAt: Date;
  createdAt: Date;
}
