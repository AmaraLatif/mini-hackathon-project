/** auth.js - tiny signed-token admin auth using only node:crypto (no JWT library). */
import { createHash, createHmac, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { config } from '../config.js';

const scryptAsync = promisify(scrypt);
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

// ---- User passwords: salted scrypt (built into Node, no bcrypt dependency) ----
const KEY_LEN = 64;

/** Returns "scrypt$<salt>$<hash>". A fresh random salt means equal passwords never share a hash. */
export async function hashPassword(password) {
  const salt = randomBytes(16);
  const key = await scryptAsync(String(password), salt, KEY_LEN);
  return `scrypt$${salt.toString('base64url')}$${key.toString('base64url')}`;
}

/** Constant-time check of a password against a stored hash. Never throws on a malformed hash. */
export async function verifyPassword(password, stored) {
  if (typeof stored !== 'string') return false;
  const [scheme, salt, hash] = stored.split('$');
  if (scheme !== 'scrypt' || !salt || !hash) return false;
  const expected = Buffer.from(hash, 'base64url');
  const actual = await scryptAsync(String(password), Buffer.from(salt, 'base64url'), expected.length);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
