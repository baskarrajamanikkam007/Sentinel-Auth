import { UAParser } from 'ua-parser-js';
import crypto from 'crypto';

export interface DeviceInfo {
  browser: string;
  os: string;
  device: string;
  userAgent: string;
}

export const parseDeviceInfo = (userAgent: string): DeviceInfo => {
  const result = UAParser(userAgent);
  return {
    browser: `${result.browser?.name || 'Unknown'} ${result.browser?.version || ''}`.trim(),
    os: `${result.os?.name || 'Unknown'} ${result.os?.version || ''}`.trim(),
    device: result.device?.type || 'desktop',
    userAgent,
  };
};

export const generateDeviceId = (ip: string, userAgent: string): string =>
  crypto.createHash('sha256').update(`${ip}:${userAgent}`).digest('hex');
