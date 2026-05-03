import https from 'https';

export interface GeoInfo {
  country: string;
  city: string;
  region: string;
  timezone: string;
}

const UNKNOWN: GeoInfo = { country: 'Unknown', city: 'Unknown', region: 'Unknown', timezone: 'Unknown' };

export const getLocationFromIp = (ip: string): Promise<GeoInfo> =>
  new Promise((resolve) => {
    if (!ip || ip === '127.0.0.1' || ip === '::1') return resolve(UNKNOWN);

    https
      .get(`https://ip-api.com/json/${ip}?fields=country,city,regionName,timezone`, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve({
              country: parsed.country || 'Unknown',
              city: parsed.city || 'Unknown',
              region: parsed.regionName || 'Unknown',
              timezone: parsed.timezone || 'Unknown',
            });
          } catch {
            resolve(UNKNOWN);
          }
        });
      })
      .on('error', () => resolve(UNKNOWN));
  });
