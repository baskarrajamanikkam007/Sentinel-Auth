import crypto from 'crypto';

export const generateSecureToken = (bytes = 32): string =>
  crypto.randomBytes(bytes).toString('hex');

export const generateOtpCode = (length = 6): string => {
  const max = Math.pow(10, length);
  return crypto.randomInt(0, max).toString().padStart(length, '0');
};

export const sha256 = (data: string): string =>
  crypto.createHash('sha256').update(data).digest('hex');

export const sha1Prefix = (data: string): { prefix: string; suffix: string } => {
  const hash = crypto.createHash('sha1').update(data).digest('hex').toUpperCase();
  return { prefix: hash.slice(0, 5), suffix: hash.slice(5) };
};

export const hashApiKey = (key: string): string => sha256(key);

export const generateApiKeyPair = (): { key: string; hash: string; prefix: string } => {
  const key = `sk_${generateSecureToken(32)}`;
  const hash = sha256(key);
  const prefix = key.slice(0, 10);
  return { key, hash, prefix };
};
