import { createHmac } from 'crypto';

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32ToBuffer(secret: string) {
  const cleaned = secret.toUpperCase().replace(/[^A-Z2-7]/g, '');
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (const char of cleaned) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index === -1) continue;

    value = (value << 5) | index;
    bits += 5;

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

function hotp(secret: string, counter: number, digits = 6) {
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter));

  const hmac = createHmac('sha1', base32ToBuffer(secret)).update(counterBuffer).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  return String(code % 10 ** digits).padStart(digits, '0');
}

export function verifyTotp(
  secret: string | undefined,
  token: string,
  options?: {
    step?: number;
    digits?: number;
    window?: number;
    time?: number;
  }
) {
  if (!secret) return false;

  const digits = options?.digits ?? 6;
  const step = options?.step ?? 30;
  const window = options?.window ?? 1;
  const time = options?.time ?? Date.now();
  const normalizedToken = token.replace(/\s+/g, '');

  if (!/^\d+$/.test(normalizedToken) || normalizedToken.length !== digits) {
    return false;
  }

  const counter = Math.floor(time / 1000 / step);
  for (let offset = -window; offset <= window; offset += 1) {
    if (hotp(secret, counter + offset, digits) === normalizedToken) {
      return true;
    }
  }

  return false;
}

export function buildOtpAuthUri(params: {
  secret: string;
  accountName: string;
  issuer: string;
  digits?: number;
  period?: number;
}) {
  const digits = params.digits ?? 6;
  const period = params.period ?? 30;
  const label = `${encodeURIComponent(params.issuer)}:${encodeURIComponent(params.accountName)}`;

  return `otpauth://totp/${label}?secret=${params.secret}&issuer=${encodeURIComponent(
    params.issuer
  )}&algorithm=SHA1&digits=${digits}&period=${period}`;
}

