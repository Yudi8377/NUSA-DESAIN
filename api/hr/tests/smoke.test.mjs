import test from 'node:test';
import assert from 'node:assert/strict';

process.env.ALLOWED_ORIGINS = 'https://yudi8377.github.io,http://localhost:5173';
process.env.NEON_AUTH_BASE_URL = 'https://auth.test/neondb/auth';
process.env.NEON_AUTH_JWKS_URL = 'https://auth.test/neondb/auth/.well-known/jwks.json';
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

test('all protected organization, project, task, and HR routes reject missing bearer tokens', async () => {
  const paths = [
    '/api/organizations',
    '/api/hr/employees',
    '/api/projects',
    '/api/projects/00000000-0000-4000-8000-000000000001/tasks',
  ];
  for (const path of paths) {
    const response = await handler.fetch(new Request('https://local.test' + path));
    assert.equal(response.status, 401, path);
    const body = await response.json();
    assert.equal(body.error.message, 'Sesi login diperlukan.', path);
    assert.ok(body.error.requestId, path);
  }
});

test('browser CORS only reflects an allowlisted origin', async () => {
  const allowed = await handler.fetch(new Request('https://local.test/health', { headers: { Origin: 'https://yudi8377.github.io' } }));
  assert.equal(allowed.headers.get('access-control-allow-origin'), 'https://yudi8377.github.io');
  const denied = await handler.fetch(new Request('https://local.test/health', { headers: { Origin: 'https://attacker.invalid' } }));
  assert.equal(denied.status, 403);
  assert.equal(denied.headers.get('access-control-allow-origin'), null);
});
