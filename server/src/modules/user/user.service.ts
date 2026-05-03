import { prisma } from '../../config/pg.config';
import { AppError, ErrorCodes } from '../../constants/errors';
import type { UpdateProfileDto, UserResponse } from './user.types';
import type { User } from '../../generated/prisma/client';

const SELECT_SAFE = {
  id: true,
  email: true,
  name: true,
  role: true,
  isEmailVerified: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const findById = (id: string): Promise<User | null> =>
  prisma.user.findUnique({ where: { id } });

export const findByEmail = (email: string): Promise<User | null> =>
  prisma.user.findUnique({ where: { email } });

export const getProfile = async (id: string): Promise<UserResponse> => {
  const user = await prisma.user.findUnique({ where: { id }, select: SELECT_SAFE });
  if (!user) throw new AppError('User not found', 404, ErrorCodes.NOT_FOUND);
  return user;
};

export const updateProfile = async (id: string, dto: UpdateProfileDto): Promise<UserResponse> => {
  const user = await prisma.user.update({
    where: { id },
    data: dto,
    select: SELECT_SAFE,
  });
  return user;
};

export const deactivateAccount = async (id: string): Promise<void> => {
  await prisma.$transaction([
    prisma.user.update({ where: { id }, data: { isActive: false } }),
    prisma.session.updateMany({ where: { userId: id }, data: { isRevoked: true } }),
  ]);
};
