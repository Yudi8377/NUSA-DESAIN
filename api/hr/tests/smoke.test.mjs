import test from 'node:test';
import assert from 'node:assert/strict';

process.env.ALLOWED_ORIGINS = 'https://yudi8377.github.io,http://localhost:5173';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://invalid:invalid@127.0.0.1:5432/unused';

const { default: handler } = await import('../dist/index.mjs');

test('health endpoint returns a non-sensitive service status', async () => {
  const response = await handler.fetch(new Request('https://local.test/health'));
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.data.status, 'ok');
  assert.equal(body.data.service, 'nusa-design-api');
  assert.ok(body.meta.requestId);
});

test('protected endpoints reject requests without a bearer token', async () => {
  const response = await handler.fetch(new Request('https://local.test/api/organizations'));
  assert.equal(response.status, 401);
  const body = await response.json();
  assert.equal(body.error.message, 'Sesi login diperlukan.');
  assert.ok(body.error.requestId);
});

test('browser CORS only reflects an allowlisted origin', async () => {
  const allowed = await handler.fetch(new Request('https://local.test/health', { headers: { Origin: 'https://yudi8377.github.io' } }));
  assert.equal(allowed.headers.get('access-control-allow-origin'), 'https://yudi8377.github.io');
  const denied = await handler.fetch(new Request('https://local.test/health', { headers: { Origin: 'https://attacker.invalid' } }));
  assert.equal(denied.status, 403);
  assert.equal(denied.headers.get('access-control-allow-origin'), null);
});
