/** auth.js - tiny signed-token admin auth using only node:crypto (no JWT library). */
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { config } from '../config.js';

const b64 = (s) => Buffer.from(s).toString('base64url');
const sign = (body, secret) => createHmac('sha256', secret).update(body).digest('base64url');
const digest = (s) => createHash('sha256').update(String(s)).digest();

/** Constant-time password check. Always false when no ADMIN_PASSWORD is configured. */
export function checkAdminPassword(input, expected = config.adminPassword) {
  if (!expected) return false;
  return timingSafeEqual(digest(input), digest(expected));
}

export function signToken(payload = { role: 'admin' }, { secret = config.authSecret, ttlMs = config.adminTokenTtlMs, now = Date.now() } = {}) {
  const body = b64(JSON.stringify({ ...payload, exp: now + ttlMs }));
  return `${body}.${sign(body, secret)}`;
}

/** Returns the payload, or null if the token is malformed, tampered with or expired. */
export function verifyToken(token, { secret = config.authSecret, now = Date.now() } = {}) {
  if (typeof token !== 'string') return null;
  const [body, sig, extra] = token.split('.');
  if (!body || !sig || extra !== undefined) return null;
  const expected = sign(body, secret);
  if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'));
    return payload.exp > now ? payload : null;
  } catch {
    return null;
  }
}
