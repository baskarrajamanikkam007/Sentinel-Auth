import https from 'https';
import { sha1Prefix } from '../../utils/crypto';
import { logger } from '../../logger/logger';

export const isPasswordBreached = (password: string): Promise<boolean> =>
  new Promise((resolve) => {
    const { prefix, suffix } = sha1Prefix(password);
    const options = {
      hostname: 'api.pwnedpasswords.com',
      path: `/range/${prefix}`,
      headers: { 'Add-Padding': 'true', 'User-Agent': 'SentinelAuth' },
    };

    https
      .get(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          const found = data
            .split('\r\n')
            .some((line) => line.split(':')[0] === suffix);
          resolve(found);
        });
      })
      .on('error', (err) => {
        logger.warn('HIBP breach check failed, failing open', { error: err.message });
        resolve(false);
      });
  });
