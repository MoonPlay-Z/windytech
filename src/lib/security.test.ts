import assert from 'node:assert/strict';
import { test } from 'node:test';

process.env.PUBLIC_SITE_URL = 'https://windytech.studio';
const { sameOrigin } = await import('./security');

test('sameOrigin accepts the configured public origin behind a proxy', () => {
  const request = new Request('http://127.0.0.1:4321/api/admin/login', {
    method: 'POST',
    headers: { origin: 'https://windytech.studio' },
  });

  assert.equal(sameOrigin(request), true);
});

test('sameOrigin accepts direct same-origin local requests', () => {
  const request = new Request('http://localhost:4321/api/admin/login', {
    method: 'POST',
    headers: { origin: 'http://localhost:4321' },
  });

  assert.equal(sameOrigin(request), true);
});

test('sameOrigin accepts the public proxy host on Render', () => {
  // El adaptador Node ve una URL interna; X-Forwarded-Host trae el host público.
  const request = new Request('http://10.0.0.5:10000/api/auth/logout', {
    method: 'POST',
    headers: {
      origin: 'https://windytech-web.onrender.com',
      'x-forwarded-host': 'windytech-web.onrender.com',
      'x-forwarded-proto': 'https',
    },
  });

  assert.equal(sameOrigin(request), true);
});

test('sameOrigin accepts apex and www as the same site', () => {
  const request = new Request('http://127.0.0.1:4321/api/auth/logout', {
    method: 'POST',
    headers: { origin: 'https://windytech.studio' },
  });

  assert.equal(sameOrigin(request), true);
});

test('sameOrigin accepts the www alias of the canonical apex', () => {
  const request = new Request('http://127.0.0.1:4321/api/auth/logout', {
    method: 'POST',
    headers: { origin: 'https://www.windytech.studio' },
  });

  assert.equal(sameOrigin(request), true);
});

test('sameOrigin rejects a different port on the same host', () => {
  const request = new Request('http://localhost:4321/api/auth/logout', {
    method: 'POST',
    headers: { origin: 'http://localhost:9999' },
  });

  assert.equal(sameOrigin(request), false);
});

test('sameOrigin rejects unrelated hosts and sibling subdomains', () => {
  const foreignRequest = new Request('http://127.0.0.1:4321/api/admin/login', {
    method: 'POST',
    headers: { origin: 'https://evil.example' },
  });
  const siblingSubdomainRequest = new Request('http://127.0.0.1:4321/api/admin/login', {
    method: 'POST',
    headers: { origin: 'https://evil.windytech.studio' },
  });

  assert.equal(sameOrigin(foreignRequest), false);
  assert.equal(sameOrigin(siblingSubdomainRequest), false);
});
