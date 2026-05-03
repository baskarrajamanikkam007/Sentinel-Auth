import { generateDeviceId } from '../../utils/device';

export type RiskLevel = 'low' | 'medium' | 'high';

export interface RiskScore {
  level: RiskLevel;
  score: number;
  factors: string[];
}

export interface RiskContext {
  ip: string;
  userAgent: string;
  knownIps: string[];
  knownDevices: string[];
}

export const assessLoginRisk = (ctx: RiskContext): RiskScore => {
  let score = 0;
  const factors: string[] = [];

  if (!ctx.knownIps.includes(ctx.ip)) {
    score += 30;
    factors.push('new_ip');
  }

  const deviceId = generateDeviceId(ctx.ip, ctx.userAgent);
  if (!ctx.knownDevices.includes(deviceId)) {
    score += 30;
    factors.push('new_device');
  }

  const hour = new Date().getHours();
  if (hour < 5 || hour >= 23) {
    score += 20;
    factors.push('unusual_hour');
  }

  const level: RiskLevel = score >= 60 ? 'high' : score >= 30 ? 'medium' : 'low';
  return { level, score, factors };
};
