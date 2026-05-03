export interface UpdateProfileDto {
  name?: string;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isEmailVerified: boolean;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
