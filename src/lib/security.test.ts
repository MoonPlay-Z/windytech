import assert from 'node:assert/strict';
import { test } from 'node:test';

process.env.PUBLIC_SITE_URL = 'https://www.windytech.studio';
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
