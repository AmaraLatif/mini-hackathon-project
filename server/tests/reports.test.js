import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createJsonStore } from '../src/store/jsonStore.js';
import { listPublicReports, moderateReport, submitReport, toPublicReport, validateReport } from '../src/services/reportService.js';

const NOW = new Date('2026-11-22T10:00:00Z');
const good = {
  city: 'Karachi', area: 'Saddar', category: 'Mobile Snatching', incidentDate: '2026-11-20',
  description: 'Two men on a motorcycle snatched a phone near the market entrance.',
};
const newStore = async () => createJsonStore({ dir: await mkdtemp(path.join(tmpdir(), 'sz-')) });
const at = (mins) => new Date(NOW.getTime() + mins * 60_000);

test('validation accepts a good report and trims input', () => {
  const r = validateReport({ ...good, city: '  Karachi  ' }, NOW);
  assert.equal(r.ok, true);
  assert.equal(r.value.city, 'Karachi');
  assert.equal(r.value.contact, null);
});

test('validation rejects bad category, short text, future and invalid dates, bad coordinates', () => {
  const r = validateReport({ ...good, category: 'Alien', description: 'short', incidentDate: '2026-12-30', latitude: 10, longitude: 10 }, NOW);
  assert.equal(r.ok, false);
  assert.deepEqual(Object.keys(r.errors).sort(), ['category', 'description', 'incidentDate', 'location']);
  assert.ok(validateReport({ ...good, incidentDate: '2026-02-31' }, NOW).errors.incidentDate);
  assert.ok(validateReport({ ...good, incidentDate: '2024-01-01' }, NOW).errors.incidentDate);
});

test('new reports are pending and never contribute to official data', async () => {
  const store = await newStore();
  const { report } = await submitReport(good, { ip: '1.1.1.1' }, { store, now: NOW });
  assert.equal(report.status, 'pending');
  assert.deepEqual(await store.listOfficial(), []);
});

test('public view hides contact, ip hash and moderation notes; rejected reports are not listed', async () => {
  const store = await newStore();
  const { report } = await submitReport({ ...good, contact: '0300-0000000' }, { ip: '1.1.1.1' }, { store, now: NOW });
  assert.equal(report.contact, '0300-0000000');
  const pub = toPublicReport(report);
  for (const k of ['contact', 'ipHash', 'moderationNote', 'duplicateOf']) assert.ok(!(k in pub), k);

  assert.equal((await listPublicReports({}, { store })).length, 1);
  await moderateReport(report.id, { status: 'rejected', note: 'spam' }, { store, now: NOW });
  assert.equal((await listPublicReports({}, { store })).length, 0);
  await assert.rejects(listPublicReports({ status: 'rejected' }, { store }), { status: 400 });
});

test('same IP is throttled within a minute, other IPs are not', async () => {
  const store = await newStore();
  await submitReport(good, { ip: '1.1.1.1' }, { store, now: NOW });
  await assert.rejects(submitReport({ ...good, area: 'Lyari' }, { ip: '1.1.1.1' }, { store, now: at(0.5) }), { status: 429 });
  await submitReport({ ...good, area: 'Lyari' }, { ip: '2.2.2.2' }, { store, now: at(0.5) });
  await submitReport({ ...good, area: 'Clifton' }, { ip: '1.1.1.1' }, { store, now: at(2) });
});

test('same city+area+category within 24h is flagged as a duplicate, not rejected', async () => {
  const store = await newStore();
  const first = (await submitReport(good, { ip: '1.1.1.1' }, { store, now: NOW })).report;
  const second = (await submitReport({ ...good, area: ' saddar ' }, { ip: '2.2.2.2' }, { store, now: at(30) })).report;
  assert.equal(second.duplicateOf, first.id);
  const later = (await submitReport(good, { ip: '3.3.3.3' }, { store, now: at(25 * 60) })).report;
  assert.equal(later.duplicateOf, null);
});

test('honeypot field silently drops bot submissions', async () => {
  const store = await newStore();
  const res = await submitReport({ ...good, website: 'http://spam' }, { ip: '1.1.1.1' }, { store, now: NOW });
  assert.equal(res.ignored, true);
  assert.equal((await store.listReports()).length, 0);
});

test('moderation verifies, validates status and 404s on unknown ids', async () => {
  const store = await newStore();
  const { report } = await submitReport(good, { ip: '1.1.1.1' }, { store, now: NOW });
  const v = await moderateReport(report.id, { status: 'verified', note: 'Confirmed with police' }, { store, now: NOW });
  assert.equal(v.status, 'verified');
  assert.equal(v.moderatedAt, NOW.toISOString());
  assert.ok(!('ipHash' in v));
  assert.deepEqual(await store.countReportsByStatus(), { pending: 0, verified: 1, rejected: 0 });
  await assert.rejects(moderateReport(report.id, { status: 'approved' }, { store }), { status: 400 });
  await assert.rejects(moderateReport('nope', { status: 'verified' }, { store }), { status: 404 });
});

test('json store persists to disk and reloads', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'sz-'));
  const a = createJsonStore({ dir });
  const { report } = await submitReport(good, { ip: '1.1.1.1' }, { store: a, now: NOW });
  assert.ok(JSON.parse(await readFile(path.join(dir, 'store.json'), 'utf-8')).reports.length === 1);
  const b = createJsonStore({ dir });
  assert.equal((await b.getReport(report.id)).city, 'Karachi');
});
