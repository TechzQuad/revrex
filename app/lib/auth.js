import { createHmac, timingSafeEqual, scryptSync, randomBytes } from 'crypto';

export const SESSION_COOKIE = 'rr_admin';
export const SESSION_MAX_AGE = 60 * 60 * 8; // 8 hours, in seconds

const SECRET = process.env.SESSION_SECRET || 'dev-insecure-secret-change-me';

// ── Password hashing (scrypt — built into Node, no bcrypt dependency) ──

export function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const derived = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password, stored) {
  if (!stored || !stored.includes(':')) return false;
  const [salt, key] = stored.split(':');
  const keyBuf = Buffer.from(key, 'hex');
  const test = scryptSync(password, salt, 64);
  return keyBuf.length === test.length && timingSafeEqual(keyBuf, test);
}

// ── Signed session tokens (HMAC) ──────────────────────────────────────

function sign(data) {
  return createHmac('sha256', SECRET).update(data).digest('base64url');
}

export function createSessionToken(email) {
  const payload = Buffer.from(
    JSON.stringify({ email, exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE })
  ).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token) {
  if (!token || !token.includes('.')) return null;
  const [payload, sig] = token.split('.');
  const expected = sign(payload);
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (data.exp < Math.floor(Date.now() / 1000)) return null;
    return data;
  } catch {
    return null;
  }
}
