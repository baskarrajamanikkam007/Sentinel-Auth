import { prisma } from '../../config/pg.config';
import { AppError, ErrorCodes } from '../../constants/errors';
import { securityConfig } from '../../config/security';
import { hashPassword, verifyPassword } from '../security/password.service';
import { signAccessToken, signRefreshToken, verifyRefreshToken, blacklistToken, verifyAccessToken } from '../security/token.service';
import { generateAndStoreOtp, verifyOtp } from '../security/otp.service';
import { isPasswordBreached } from '../security/breach.service';
import { assessLoginRisk } from '../security/risk.service';
import { createSession, findByRefreshToken, revokeSession, revokeAllUserSessions, revokeAllExcept } from '../session/session.service';
import { sendVerificationEmail, sendPasswordResetEmail, sendLoginAlertEmail } from '../notification/mail.service';
import { logAction } from '../audit/audit.service';
import { getLocationFromIp } from '../../utils/geo';
import { parseDeviceInfo } from '../../utils/device';
import { expiryToDate, expiryToSeconds } from '../../utils/helpers';
import { OtpType, AuditAction } from '../../generated/prisma/client';
import type { AuthTokens, ChangePasswordDto, ForgotPasswordDto, LoginDto, RefreshTokenDto, RegisterDto, ResetPasswordDto, VerifyEmailDto } from './auth.types';

export const register = async (dto: RegisterDto): Promise<{ userId: string }> => {
  const existing = await prisma.user.findUnique({ where: { email: dto.email } });
  if (existing) throw new AppError('Email already in use', 409, ErrorCodes.CONFLICT);

  const breached = await isPasswordBreached(dto.password);
  if (breached) throw new AppError('Password appears in known data breaches. Please choose a different password.', 400, ErrorCodes.BREACH_DETECTED);

  const passwordHash = await hashPassword(dto.password);
  const user = await prisma.user.create({
    data: { email: dto.email, password: passwordHash, name: dto.name },
  });

  const code = await generateAndStoreOtp(user.id, OtpType.EMAIL_VERIFICATION);
  sendVerificationEmail(user.email, user.name ?? user.email, code).catch(() => {});

  logAction({ userId: user.id, action: AuditAction.REGISTER, resource: 'user', resourceId: user.id });

  return { userId: user.id };
};

export const login = async (
  dto: LoginDto,
  ip: string,
  userAgent: string,
): Promise<AuthTokens> => {
  const user = await prisma.user.findUnique({ where: { email: dto.email } });
  if (!user) throw new AppError('Invalid credentials', 401, ErrorCodes.INVALID_CREDENTIALS);

  if (!user.isActive) throw new AppError('Account is deactivated', 401, ErrorCodes.INVALID_CREDENTIALS);

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    throw new AppError(
      `Account locked until ${user.lockedUntil.toISOString()}`,
      401,
      ErrorCodes.ACCOUNT_LOCKED,
    );
  }

  const valid = await verifyPassword(user.password, dto.password);
  if (!valid) {
    const attempts = user.failedLoginAttempts + 1;
    const lockData =
      attempts >= securityConfig.lockout.maxAttempts
        ? {
            failedLoginAttempts: 0,
            lockedUntil: new Date(Date.now() + securityConfig.lockout.durationMinutes * 60_000),
          }
        : { failedLoginAttempts: attempts };

    await prisma.user.update({ where: { id: user.id }, data: lockData });

    if (attempts >= securityConfig.lockout.maxAttempts) {
      logAction({ userId: user.id, action: AuditAction.ACCOUNT_LOCKED, ip, userAgent });
      throw new AppError('Account locked due to too many failed attempts', 401, ErrorCodes.ACCOUNT_LOCKED);
    }

    throw new AppError('Invalid credentials', 401, ErrorCodes.INVALID_CREDENTIALS);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
  });

  const knownSessions = await prisma.session.findMany({
    where: { userId: user.id, isRevoked: false },
    select: { ip: true, deviceId: true },
  });
  const knownIps = knownSessions.map((s) => s.ip).filter(Boolean) as string[];
  const knownDevices = knownSessions.map((s) => s.deviceId).filter(Boolean) as string[];

  const risk = assessLoginRisk({ ip, userAgent, knownIps, knownDevices });

  const refreshExpiry = expiryToDate(securityConfig.jwt.refreshExpiry);
  const session = await createSession({
    userId: user.id,
    refreshToken: '',
    ip,
    userAgent,
    expiresAt: refreshExpiry,
  });

  const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role });
  const refreshToken = signRefreshToken({ sub: user.id, sessionId: session.id });

  await prisma.session.update({ where: { id: session.id }, data: { refreshToken } });

  logAction({ userId: user.id, action: AuditAction.LOGIN, ip, userAgent, metadata: { risk } });

  if (risk.level === 'high') {
    getLocationFromIp(ip).then((geo) => {
      const deviceInfo = parseDeviceInfo(userAgent);
      sendLoginAlertEmail(user.email, {
        name: user.name ?? user.email,
        device: `${deviceInfo.browser} on ${deviceInfo.os}`,
        location: `${geo.city}, ${geo.country}`,
        ip,
        time: new Date().toUTCString(),
      }).catch(() => {});
    });
  }

  return { accessToken, refreshToken };
};

export const logout = async (accessToken: string, sessionId: string): Promise<void> => {
  try {
    const payload = verifyAccessToken(accessToken);
    const ttl = expiryToSeconds(securityConfig.jwt.accessExpiry);
    await blacklistToken(payload.jti, ttl);
  } catch {
    // token already expired — blacklisting unnecessary
  }

  if (sessionId) {
    await prisma.session.update({
      where: { id: sessionId },
      data: { isRevoked: true },
    }).catch(() => {});
  }
};

export const refreshTokens = async (dto: RefreshTokenDto): Promise<AuthTokens> => {
  const session = await findByRefreshToken(dto.refreshToken);
  if (!session || session.isRevoked || session.expiresAt < new Date()) {
    throw new AppError('Invalid or expired refresh token', 401, ErrorCodes.TOKEN_INVALID);
  }

  let payload;
  try {
    payload = verifyRefreshToken(dto.refreshToken);
  } catch {
    throw new AppError('Invalid refresh token', 401, ErrorCodes.TOKEN_INVALID);
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || !user.isActive) {
    throw new AppError('User not found or inactive', 401, ErrorCodes.UNAUTHORIZED);
  }

  await prisma.session.update({ where: { id: session.id }, data: { isRevoked: true } });

  const refreshExpiry = expiryToDate(securityConfig.jwt.refreshExpiry);
  const newSession = await createSession({
    userId: user.id,
    refreshToken: '',
    ip: session.ip ?? undefined,
    userAgent: session.userAgent ?? undefined,
    deviceId: session.deviceId ?? undefined,
    expiresAt: refreshExpiry,
  });

  const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role });
  const refreshToken = signRefreshToken({ sub: user.id, sessionId: newSession.id });

  await prisma.session.update({ where: { id: newSession.id }, data: { refreshToken } });

  return { accessToken, refreshToken };
};

export const verifyEmail = async (dto: VerifyEmailDto): Promise<void> => {
  const valid = await verifyOtp(dto.userId, OtpType.EMAIL_VERIFICATION, dto.code);
  if (!valid) throw new AppError('Invalid or expired OTP', 400, ErrorCodes.OTP_INVALID);

  await prisma.user.update({ where: { id: dto.userId }, data: { isEmailVerified: true } });
  logAction({ userId: dto.userId, action: AuditAction.EMAIL_VERIFIED });
};

export const forgotPassword = async (dto: ForgotPasswordDto): Promise<void> => {
  const user = await prisma.user.findUnique({ where: { email: dto.email } });
  if (!user) return; // don't reveal existence

  const code = await generateAndStoreOtp(user.id, OtpType.PASSWORD_RESET);
  sendPasswordResetEmail(user.email, user.name ?? user.email, code).catch(() => {});
};

export const resetPassword = async (dto: ResetPasswordDto): Promise<void> => {
  const valid = await verifyOtp(dto.userId, OtpType.PASSWORD_RESET, dto.code);
  if (!valid) throw new AppError('Invalid or expired OTP', 400, ErrorCodes.OTP_INVALID);

  const breached = await isPasswordBreached(dto.newPassword);
  if (breached) throw new AppError('Password appears in known data breaches', 400, ErrorCodes.BREACH_DETECTED);

  const passwordHash = await hashPassword(dto.newPassword);
  await prisma.user.update({ where: { id: dto.userId }, data: { password: passwordHash } });
  await revokeAllUserSessions(dto.userId);

  logAction({ userId: dto.userId, action: AuditAction.PASSWORD_RESET });
};

export const changePassword = async (
  userId: string,
  currentSessionId: string,
  dto: ChangePasswordDto,
): Promise<void> => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('User not found', 404, ErrorCodes.NOT_FOUND);

  const valid = await verifyPassword(user.password, dto.currentPassword);
  if (!valid) throw new AppError('Current password is incorrect', 400, ErrorCodes.INVALID_CREDENTIALS);

  const breached = await isPasswordBreached(dto.newPassword);
  if (breached) throw new AppError('Password appears in known data breaches', 400, ErrorCodes.BREACH_DETECTED);

  const passwordHash = await hashPassword(dto.newPassword);
  await prisma.user.update({ where: { id: userId }, data: { password: passwordHash } });
  await revokeAllExcept(userId, currentSessionId);

  logAction({ userId, action: AuditAction.PASSWORD_CHANGE });
};
