export interface CreateApiKeyDto {
  name: string;
  permissions?: string[];
  expiresAt?: Date;
}

export interface ApiKeyResponse {
  id: string;
  name: string;
  prefix: string;
  permissions: string[];
  lastUsedAt: Date | null;
  expiresAt: Date | null;
  isActive: boolean;
  createdAt: Date;
}

export interface ApiKeyCreatedResponse extends ApiKeyResponse {
  key: string;
}
