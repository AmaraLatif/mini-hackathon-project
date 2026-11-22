import { test } from 'node:test';
import assert from 'node:assert/strict';

// Config is read at import time, so set the key first and import the app dynamically.
process.env.GEMINI_API_KEY = 'test-key';
const realFetch = globalThis.fetch;
let geminiCalls = 0;

globalThis.fetch = async (url, init) => {
  if (String(url).includes('generativelanguage.googleapis.com')) {
    geminiCalls += 1;
    const payload = {
      summary: 'Test summary for the area.',
      tips: ['Tip one.', 'Tip two.', 'Tip three.', 'Tip four.', 'Tip five.'],
      emergencyActions: ['Action one.', 'Action two.', 'Action three.'],
    };
    return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify(payload) }] } }] }), { status: 200 });
  }
  return realFetch(url, init);
};

const { default: app } = await import('../src/app.js');

test('uses Gemini text but keeps our own score and emergency numbers', async () => {
  const server = app.listen(0);
  const base = `http://127.0.0.1:${server.address().port}`;
  const body = await (await realFetch(`${base}/api/advisor/lhr-gulberg`)).json();
  server.close();

  assert.equal(body.source, 'gemini');
  assert.equal(body.summary, 'Test summary for the area.');
  assert.equal(body.tips.length, 5);
  assert.equal(body.safetyScore, 81); // Low (82) minus Fraud / Scams penalty (1)
  assert.ok(body.emergency.contacts.some((c) => c.number === '15'));
  assert.equal(geminiCalls, 1);
});
