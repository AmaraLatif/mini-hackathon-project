import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';

let server;
let base;

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      base = `http://127.0.0.1:${server.address().port}`;
      resolve();
    });
  });
});
after(() => server.close());

const get = async (p) => {
  const res = await fetch(base + p);
  return { status: res.status, body: await res.json() };
};

test('health check', async () => {
  const { status, body } = await get('/api/health');
  assert.equal(status, 200);
  assert.equal(body.status, 'ok');
});

test('lists all 30 sample areas and supports filters', async () => {
  const all = await get('/api/crimes');
  assert.equal(all.body.count, 30);
  const high = await get('/api/crimes?risk=High');
  assert.ok(high.body.data.every((c) => c.riskLevel === 'High'));
  const sukkur = await get('/api/crimes?city=Sukkur');
  assert.equal(sukkur.body.count, 4);
});

test('advisor returns score, tips and emergency info', async () => {
  const { status, body } = await get('/api/advisor/skr-rohri-bypass');
  assert.equal(status, 200);
  assert.ok(body.safetyScore >= 5 && body.safetyScore <= 98);
  assert.ok(body.tips.length >= 3);
  assert.ok(body.emergency.contacts.some((c) => c.number === '15'));
  assert.ok(['gemini', 'fallback'].includes(body.source));
});

test('unknown area gives 404', async () => {
  const { status } = await get('/api/advisor/nope');
  assert.equal(status, 404);
});

test('stats and recent reports', async () => {
  const s = await get('/api/stats');
  assert.equal(s.body.totalAreas, 30);
  const r = await get('/api/reports/recent?limit=3');
  assert.equal(r.body.data.length, 3);
});
