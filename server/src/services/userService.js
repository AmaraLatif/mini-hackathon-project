/**
 * userService.js - accounts: signup, login, roles and the seeded first admin.
 * Passwords are only ever stored as salted scrypt hashes and never leave this layer.
 */
import { randomUUID } from 'node:crypto';
import { config } from '../config.js';
import { httpError } from '../utils/httpError.js';
import { hashPassword, signToken, verifyPassword, verifyToken } from './auth.js';

export const ROLES = ['user', 'admin'];

const clean = (v) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** What may be sent to a browser: never the password hash. */
export function toPublicUser(u) {
  const { id, name, email, role, createdAt, lastLoginAt } = u;
  return { id, name, email, role, createdAt, lastLoginAt: lastLoginAt ?? null };
}

const issue = (user) => ({
  token: signToken({ sub: user.id, role: user.role }),
  expiresInMs: config.adminTokenTtlMs,
  user: toPublicUser(user),
});

/** Returns { ok, value, errors } - errors is { field: message }. */
export function validateSignup(input = {}) {
  const errors = {};
  const name = clean(input.name);
  const email = clean(input.email).toLowerCase();
  const password = typeof input.password === 'string' ? input.password : '';

  if (name.length < 2 || name.length > 60) errors.name = 'Name must be 2-60 characters.';
  if (email.length > 120 || !EMAIL_RE.test(email)) errors.email = 'Enter a valid email address.';
  if (password.length < 8) errors.password = 'Password must be at least 8 characters.';
  else if (password.length > 128) errors.password = 'Password must be at most 128 characters.';
  else if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) errors.password = 'Password needs at least one letter and one number.';

  return { ok: Object.keys(errors).length === 0, errors, value: { name, email, password } };
}

/** Public signup. The role is NOT taken from the request: everybody who signs up is a "user". */
export async function signup(input, { store, now = new Date() }) {
  const { ok, errors, value } = validateSignup(input);
  if (!ok) throw httpError(400, 'Please fix the highlighted fields.', { fields: errors });

  const user = {
    id: randomUUID(),
    name: value.name,
    email: value.email,
    passwordHash: await hashPassword(value.password),
    role: 'user',
    createdAt: now.toISOString(),
    lastLoginAt: now.toISOString(),
  };
  try {
    await store.insertUser(user);
  } catch (e) {
    if (e.code === 'EMAIL_TAKEN') throw httpError(409, 'An account with this email already exists.', { fields: { email: 'This email is already registered.' } });
    throw e;
  }
  return issue(user);
}

let dummyHash = null; // lets "unknown email" take as long as "wrong password"

export async function login(input, { store, now = new Date() }) {
  const email = clean(input?.email).toLowerCase();
  const password = typeof input?.password === 'string' ? input.password : '';
  if (!email || !password || password.length > 128) throw httpError(400, 'Email and password are required.');

  const user = await store.getUserByEmail(email);
  dummyHash ??= await hashPassword('not-a-real-password');
  const ok = await verifyPassword(password, user ? user.passwordHash : dummyHash);
  // One message for both cases, so the form cannot be used to discover which emails are registered.
  if (!user || !ok) throw httpError(401, 'Invalid email or password.');

  const updated = (await store.updateUser(user.id, { lastLoginAt: now.toISOString() })) ?? user;
  return issue(updated);
}

/** Token -> the CURRENT user record (so a demoted or deleted admin loses access immediately), or null. */
export async function authenticate(token, { store }) {
  const payload = verifyToken(token);
  if (!payload?.sub) return null;
  const user = await store.getUserById(payload.sub);
  return user ? toPublicUser(user) : null;
}

/**
 * Creates the first admin from ADMIN_EMAIL + ADMIN_PASSWORD (idempotent: safe to run on every start).
 * The environment is the source of truth for this account: changing ADMIN_PASSWORD changes its password.
 */
export async function seedAdmin(store, { email = config.adminEmail, password = config.adminPassword, now = new Date() } = {}) {
  if (!email || !password) return null;
  const existing = await store.getUserByEmail(email);
  if (!existing) {
    const user = { id: randomUUID(), name: 'Administrator', email, passwordHash: await hashPassword(password), role: 'admin', createdAt: now.toISOString(), lastLoginAt: null };
    await store.insertUser(user);
    return toPublicUser(user);
  }
  const patch = {};
  if (existing.role !== 'admin') patch.role = 'admin';
  if (!(await verifyPassword(password, existing.passwordHash))) patch.passwordHash = await hashPassword(password);
  return toPublicUser(Object.keys(patch).length ? await store.updateUser(existing.id, patch) : existing);
}

export async function listUsers({ store }) {
  return (await store.listUsers()).map(toPublicUser);
}

/** Admin-only (enforced by the route). An admin cannot change their own role, so the last admin can never be removed. */
export async function setUserRole(actor, id, role, { store }) {
  if (!ROLES.includes(role)) throw httpError(400, `role must be one of: ${ROLES.join(', ')}.`);
  if (actor.id === id) throw httpError(400, 'You cannot change your own role.');
  const updated = await store.updateUser(id, { role });
  if (!updated) throw httpError(404, 'User not found.');
  return toPublicUser(updated);
}
