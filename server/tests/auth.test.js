import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

// Use a throw-away data folder and a seeded admin BEFORE the app modules read their config.
const dir = await mkdtemp(path.join(tmpdir(), 'sz-auth-'));
process.env.DATA_DIR = dir;
process.env.ADMIN_EMAIL = 'Boss@Example.com';
process.env.ADMIN_PASSWORD = 'Admin-pass-1';
process.env.AUTH_SECRET = 'test-secret';

const { createJsonStore } = await import('../src/store/jsonStore.js');
const { getStore } = await import('../src/store/index.js');
const { hashPassword, verifyPassword } = await import('../src/services/auth.js');
const users = await import('../src/services/userService.js');
const { requireAdmin } = await import('../src/middleware/requireAdmin.js');
const { requireAuth } = await import('../src/middleware/requireAuth.js');

const newStore = async () => createJsonStore({ dir: await mkdtemp(path.join(tmpdir(), 'sz-u-')) });
const good = { name: 'Ayesha Khan', email: 'ayesha@example.com', password: 'secret123' };

test('password hashing: salted, verifiable, never plain text', async () => {
  const a = await hashPassword('secret123');
  const b = await hashPassword('secret123');
  assert.notEqual(a, b); // different salt each time
  assert.ok(!a.includes('secret123'));
  assert.equal(await verifyPassword('secret123', a), true);
  assert.equal(await verifyPassword('secret124', a), false);
  assert.equal(await verifyPassword('x', 'garbage'), false);
  assert.equal(await verifyPassword('x', undefined), false);
});

test('signup validates input and reports every bad field', async () => {
  const store = await newStore();
  await assert.rejects(users.signup({ name: 'A', email: 'nope', password: 'short' }, { store }), (e) => {
    assert.equal(e.status, 400);
    assert.deepEqual(Object.keys(e.details.fields).sort(), ['email', 'name', 'password']);
    return true;
  });
  assert.ok(users.validateSignup({ ...good, password: 'onlyletters' }).errors.password);
  assert.ok(users.validateSignup({ ...good, password: '12345678' }).errors.password);
});

test('signup creates a plain user, ignores a requested role, and hides the hash', async () => {
  const store = await newStore();
  const s = await users.signup({ ...good, email: '  Ayesha@Example.COM ', role: 'admin' }, { store });
  assert.equal(s.user.role, 'user');
  assert.equal(s.user.email, 'ayesha@example.com');
  assert.ok(!('passwordHash' in s.user));
  assert.ok(s.token);
  assert.notEqual((await store.getUserByEmail('ayesha@example.com')).passwordHash, good.password);
});

test('duplicate email is rejected, case-insensitively', async () => {
  const store = await newStore();
  await users.signup(good, { store });
  await assert.rejects(users.signup({ ...good, email: 'AYESHA@example.com' }, { store }), { status: 409 });
});

test('login: right password works, wrong password and unknown email give the same 401', async () => {
  const store = await newStore();
  await users.signup(good, { store });
  const ok = await users.login({ email: 'ayesha@example.com', password: 'secret123' }, { store });
  assert.equal(ok.user.name, 'Ayesha Khan');
  assert.ok(ok.user.lastLoginAt);
  const wrong = await users.login({ email: 'ayesha@example.com', password: 'bad' }, { store }).catch((e) => e);
  const unknown = await users.login({ email: 'ghost@example.com', password: 'secret123' }, { store }).catch((e) => e);
  assert.equal(wrong.status, 401);
  assert.equal(unknown.status, 401);
  assert.equal(wrong.message, unknown.message);
  await assert.rejects(users.login({}, { store }), { status: 400 });
});

test('token -> current user; deleted/forged tokens are refused', async () => {
  const store = await newStore();
  const s = await users.signup(good, { store });
  assert.equal((await users.authenticate(s.token, { store })).email, good.email);
  assert.equal(await users.authenticate('x.y', { store }), null);
  assert.equal(await users.authenticate(undefined, { store }), null);
});

test('seedAdmin creates the admin, is idempotent, and syncs the password', async () => {
  const store = await newStore();
  const a = await users.seedAdmin(store, { email: 'boss@example.com', password: 'Admin-pass-1' });
  assert.equal(a.role, 'admin');
  await users.seedAdmin(store, { email: 'boss@example.com', password: 'Admin-pass-1' });
  assert.equal((await store.listUsers()).length, 1);
  await users.seedAdmin(store, { email: 'boss@example.com', password: 'New-pass-2' });
  assert.equal((await users.login({ email: 'boss@example.com', password: 'New-pass-2' }, { store })).user.role, 'admin');
  assert.equal(await users.seedAdmin(store, { email: '', password: '' }), null);
});

test('roles: admin can promote, cannot change own role, unknown id is 404', async () => {
  const store = await newStore();
  const admin = await users.seedAdmin(store, { email: 'boss@example.com', password: 'Admin-pass-1' });
  const { user } = await users.signup(good, { store });
  assert.equal((await users.setUserRole(admin, user.id, 'admin', { store })).role, 'admin');
  assert.equal((await users.setUserRole(admin, user.id, 'user', { store })).role, 'user');
  await assert.rejects(users.setUserRole(admin, admin.id, 'user', { store }), { status: 400 });
  await assert.rejects(users.setUserRole(admin, user.id, 'root', { store }), { status: 400 });
  await assert.rejects(users.setUserRole(admin, 'nope', 'user', { store }), { status: 404 });
  assert.deepEqual(await store.countUsersByRole(), { user: 1, admin: 1 });
});

// ---- middleware, driven with fake req objects (no HTTP server needed) ----
const run = (mw, token) =>
  new Promise((resolve) => {
    const req = { get: (h) => (h.toLowerCase() === 'authorization' && token ? `Bearer ${token}` : '') };
    mw(req, {}, (err) => resolve({ err, req }));
  });

test('requireAuth / requireAdmin: 401 without token, 403 for a normal user, ok for admin, demotion applies at once', async () => {
  const store = await getStore(); // seeded from ADMIN_EMAIL / ADMIN_PASSWORD
  const admin = await users.login({ email: 'boss@example.com', password: 'Admin-pass-1' }, { store });
  const normal = await users.signup(good, { store });

  assert.equal((await run(requireAuth)).err.status, 401);
  assert.equal((await run(requireAuth, 'junk')).err.status, 401);
  assert.equal((await run(requireAdmin, normal.token)).err.status, 403);
  assert.equal((await run(requireAuth, normal.token)).err, undefined);

  const okAdmin = await run(requireAdmin, admin.token);
  assert.equal(okAdmin.err, undefined);
  assert.equal(okAdmin.req.admin.email, 'boss@example.com');

  // promote then demote the normal user: the SAME old token reflects the new role immediately
  await users.setUserRole(admin.user, normal.user.id, 'admin', { store });
  assert.equal((await run(requireAdmin, normal.token)).err, undefined);
  await users.setUserRole(admin.user, normal.user.id, 'user', { store });
  assert.equal((await run(requireAdmin, normal.token)).err.status, 403);
});
