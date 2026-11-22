import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createJsonStore } from '../src/store/jsonStore.js';
import { getOfficialSummary, getOverview, importOfficialRows, validateOfficialRows } from '../src/services/officialService.js';
import { checkAdminPassword, signToken, verifyToken } from '../src/services/auth.js';
import { parseCsv } from '../src/utils/csv.js';

const newStore = async () => createJsonStore({ dir: await mkdtemp(path.join(tmpdir(), 'sz-')) });
const row = (o) => ({ province: 'P1', district: 'D1', category: 'Theft', period: '2026-01', cases: 10, source_name: 'Source A', source_url: 'https://example.org/a', ...o });

test('csv parser handles quotes, commas, CRLF and BOM', () => {
  const out = parseCsv('\uFEFFa,b\r\n"x, y","say ""hi"""\r\n\r\n1,2\r\n');
  assert.deepEqual(out, [{ a: 'x, y', b: 'say "hi"' }, { a: '1', b: '2' }]);
});

test('official rows are validated and the whole import is rejected if one row is bad', async () => {
  const bad = validateOfficialRows([row(), row({ period: '26-1', cases: '-4', source_url: 'ftp://x' }), row({ district: '' })]);
  assert.equal(bad.rows.length, 1);
  assert.deepEqual(bad.errors.map((e) => e.row), [2, 3]);
  const store = await newStore();
  await assert.rejects(importOfficialRows([row(), row({ cases: 'abc' })], { store }), { status: 400 });
  assert.deepEqual(await store.listOfficial(), []);
});

test('importing the same period twice updates instead of duplicating', async () => {
  const store = await newStore();
  assert.deepEqual(await importOfficialRows([row()], { store }), { inserted: 1, updated: 0 });
  assert.deepEqual(await importOfficialRows([row({ cases: 12 })], { store }), { inserted: 0, updated: 1 });
  const s = await getOfficialSummary({}, { store });
  assert.equal(s.totalCases, 12);
});

test('summary never mixes sources or monthly with yearly rows (no double counting)', async () => {
  const store = await newStore();
  await importOfficialRows([
    row({ period: '2026-01', cases: 10 }), row({ period: '2026-02', cases: 20 }),
    row({ period: '2026', cases: 30 }), // yearly total of the same cases
    row({ source_name: 'Source B', source_url: 'https://example.org/b', period: '2026-01', cases: 99 }),
  ], { store });

  const def = await getOfficialSummary({}, { store });
  assert.equal(def.selected.source, 'Source A');
  assert.equal(def.selected.periodType, 'monthly');
  assert.equal(def.totalCases, 30); // 10 + 20, not 60 and not 129
  assert.equal((await getOfficialSummary({ periodType: 'yearly' }, { store })).totalCases, 30);
  assert.equal((await getOfficialSummary({ source: 'Source B' }, { store })).totalCases, 99);
  assert.equal(def.sources.length, 2);
});

test('summary filters by district, category and period range; real sources outrank sample sources', async () => {
  const store = await newStore();
  await importOfficialRows([
    row({ district: 'D1', category: 'Theft', period: '2026-01', cases: 5 }),
    row({ district: 'D2', category: 'Theft', period: '2026-02', cases: 7 }),
    row({ district: 'D2', category: 'Murder', period: '2026-03', cases: 2 }),
    row({ source_name: 'Sample', source_url: 'https://example.com', is_sample: 'true', cases: 1000 }),
  ], { store });
  const s = await getOfficialSummary({ district: 'D2', from: '2026-02', to: '2026-02' }, { store });
  assert.equal(s.selected.source, 'Source A');
  assert.equal(s.totalCases, 7);
  assert.deepEqual(s.byCategory, [{ category: 'Theft', cases: 7 }]);
  assert.deepEqual(s.options.districts, ['D1', 'D2']);
  assert.equal((await getOfficialSummary({ source: 'Sample' }, { store })).selected.isSample, true);
});

test('empty database gives hasData=false, and the overview keeps community counts separate', async () => {
  const store = await newStore();
  assert.equal((await getOfficialSummary({}, { store })).hasData, false);
  const o = await getOverview({ store, sampleAreas: 30 });
  assert.equal(o.official.hasData, false);
  assert.deepEqual(o.community, { pending: 0, verified: 0, rejected: 0, total: 0 });
  assert.equal(o.mapSample.areas, 30);
});

test('tokens: valid, tampered, expired, wrong secret, and password check', () => {
  const t = signToken({ role: 'admin' }, { secret: 's1', now: 1000, ttlMs: 5000 });
  assert.equal(verifyToken(t, { secret: 's1', now: 2000 }).role, 'admin');
  assert.equal(verifyToken(t, { secret: 's1', now: 7000 }), null);
  assert.equal(verifyToken(t, { secret: 's2', now: 2000 }), null);
  const [body, sig] = t.split('.');
  const forged = Buffer.from(JSON.stringify({ role: 'admin', exp: 9e15 })).toString('base64url');
  assert.equal(verifyToken(`${forged}.${sig}`, { secret: 's1', now: 2000 }), null);
  assert.equal(verifyToken(`${body}.x`, { secret: 's1', now: 2000 }), null);
  assert.equal(verifyToken(undefined), null);
  assert.equal(checkAdminPassword('pw', 'pw'), true);
  assert.equal(checkAdminPassword('nope', 'pw'), false);
  assert.equal(checkAdminPassword('', ''), false); // unset admin password never matches
});
