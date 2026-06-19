export function normaliseIp(raw: string) {
  if (raw.startsWith('::ffff:')) return raw.slice(7);
  return raw;
}

export function isPrivateIp(ip: string) {
  const value = normaliseIp(ip).toLowerCase();
  if (value === '127.0.0.1' || value === '::1' || value === '0.0.0.0' || value === 'localhost') return true;
  if (value.startsWith('10.')) return true;
  if (value.startsWith('192.168.')) return true;
  if (value.startsWith('169.254.')) return true;
  if (value.startsWith('fc') || value.startsWith('fd')) return true;
  const match = value.match(/^172\.(\d+)\./);
  if (match) {
    const second = Number(match[1]);
    if (second >= 16 && second <= 31) return true;
  }
  return false;
}

export function extractIp(headers: Headers) {
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    const first = forwardedFor.split(',')[0]?.trim();
    if (first) return normaliseIp(first);
  }

  const preferredHeaders = [
    headers.get('cf-connecting-ip'),
    headers.get('x-real-ip'),
    headers.get('x-client-ip'),
  ].filter(Boolean) as string[];

  const publicCandidate = preferredHeaders.find((ip) => !isPrivateIp(ip));
  if (publicCandidate) return normaliseIp(publicCandidate);

  return normaliseIp(preferredHeaders[0] ?? headers.get('x-real-ip') ?? '0.0.0.0');
}

export function parseUserAgent(ua: string) {
  const value = ua || '';

  let deviceType = 'desktop';
  if (/tablet|ipad|playbook|silk/i.test(value)) {
    deviceType = 'tablet';
  } else if (/mobile|iphone|ipod|android.*mobile|blackberry|iemobile|opera mini/i.test(value)) {
    deviceType = 'mobile';
  }

  let os = 'Unknown';
  if (/windows nt/i.test(value)) os = 'Windows';
  else if (/mac os x|macintosh/i.test(value)) os = /iphone|ipad|ipod/i.test(value) ? 'iOS' : 'macOS';
  else if (/android/i.test(value)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(value)) os = 'iOS';
  else if (/linux/i.test(value)) os = 'Linux';
  else if (/cros/i.test(value)) os = 'ChromeOS';

  let browser = 'Unknown';
  if (/edg\//i.test(value)) browser = 'Edge';
  else if (/opr\//i.test(value) || /opera/i.test(value)) browser = 'Opera';
  else if (/firefox\//i.test(value)) browser = 'Firefox';
  else if (/chrome\//i.test(value)) browser = 'Chrome';
  else if (/safari\//i.test(value)) browser = 'Safari';
  else if (/trident\/|msie /i.test(value)) browser = 'IE';

  return { deviceType, os, browser };
}

