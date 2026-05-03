export const parseUserAgent = (ua: string | null): string => {
  if (!ua) return 'Unknown device';
  const browsers: [RegExp, string][] = [
    [/Chrome\/(\S+)/, 'Chrome'],
    [/Firefox\/(\S+)/, 'Firefox'],
    [/Safari\/(\S+)/, 'Safari'],
    [/Edge\/(\S+)/, 'Edge'],
  ];
  const os: [RegExp, string][] = [
    [/Windows NT/, 'Windows'],
    [/Mac OS X/, 'macOS'],
    [/Linux/, 'Linux'],
    [/Android/, 'Android'],
    [/iPhone|iPad/, 'iOS'],
  ];
  const b = browsers.find(([r]) => r.test(ua));
  const o = os.find(([r]) => r.test(ua));
  return `${b?.[1] ?? 'Browser'} on ${o?.[1] ?? 'Unknown OS'}`;
};

export const formatDate = (iso: string | null): string => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString();
};

export const timeAgo = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};
