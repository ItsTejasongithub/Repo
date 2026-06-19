import { createHmac, timingSafeEqual } from 'crypto';

export const ADMIN_COOKIE_NAME = 'portfolio_admin_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 12;

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error('Missing ADMIN_SESSION_SECRET');
  }
  return secret;
}

function base64Url(input: string) {
  return Buffer.from(input, 'utf8').toString('base64url');
}

function sign(payload: string) {
  return createHmac('sha256', getSecret()).update(payload).digest('base64url');
}

export function createAdminSession(username: string) {
  const payload = JSON.stringify({
    username,
    exp: Date.now() + SESSION_TTL_MS,
  });

  return `${base64Url(payload)}.${sign(payload)}`;
}

export function verifyAdminSession(value?: string | null) {
  if (!value) return null;
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return null;

  const [encodedPayload, signature] = value.split('.');
  if (!encodedPayload || !signature) return null;

  let payloadText: string;
  try {
    payloadText = Buffer.from(encodedPayload, 'base64url').toString('utf8');
  } catch {
    return null;
  }

  const expectedSignature = createHmac('sha256', secret).update(payloadText).digest('base64url');
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (signatureBuffer.length !== expectedBuffer.length) return null;
  if (!timingSafeEqual(signatureBuffer, expectedBuffer)) return null;

  try {
    const parsed = JSON.parse(payloadText) as { username?: string; exp?: number };
    if (!parsed.username || !parsed.exp || parsed.exp < Date.now()) return null;
    return { username: parsed.username };
  } catch {
    return null;
  }
}
