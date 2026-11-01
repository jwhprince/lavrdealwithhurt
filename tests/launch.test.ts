import test from 'node:test';
import assert from 'node:assert/strict';
import { launchErrors } from '../src/lib/launch';
test('safe preview works with no credentials', () => assert.deepEqual(launchErrors({}), []));
test('indexable deployment cannot skip real domain, contacts, legal or SMTP settings', () => {
  const errors = launchErrors({ INDEXABLE: 'true', SITE_URL: 'https://volta.example' });
  assert.ok(errors.some(e => e.includes('HTTPS-домен')));
  for (const key of ['CONTACT_PHONE', 'SMTP_HOST', 'LEGAL_OPERATOR']) assert.ok(errors.some(e => e.includes(key)));
});
test('invalid URL and unsafe external links are rejected', () => {
  assert.ok(launchErrors({ SITE_URL: 'wrong' }).length);
  assert.ok(launchErrors({ SITE_URL: 'https://example.org/path' }).length);
  assert.ok(launchErrors({ SOCIAL_VK: 'javascript:alert(1)' }).length);
});
