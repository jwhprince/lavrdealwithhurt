import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser', fullyParallel: false, workers: 1,
  use: { baseURL: 'http://127.0.0.1:3100', headless: true, launchOptions: { executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium' }, trace: 'retain-on-failure' },
  webServer: {
    command: 'npm run dev -- --hostname 127.0.0.1 --port 3100',
    url: 'http://127.0.0.1:3100', reuseExistingServer: false, timeout: 120000,
    // Test-only fixture. All UI submissions are intercepted; no email is sent.
    env: { SITE_URL: 'http://127.0.0.1:3100', INDEXABLE: 'false', LEADS_ENABLED: 'true', LEGAL_APPROVED: 'true',
      LEGAL_OPERATOR: 'Тестовый оператор', LEGAL_INN: '000000000000', LEGAL_ADDRESS: 'Тестовый адрес',
      PRIVACY_EMAIL: 'privacy@example.test', LEGAL_RETENTION: 'до завершения теста',
      SMTP_HOST: '127.0.0.1', SMTP_PORT: '9', SMTP_SECURE: 'false', SMTP_USER: 'test', SMTP_PASS: 'test',
      MAIL_FROM: 'test@example.test', LEADS_EMAIL: 'leads@example.test', METRIKA_ENABLED: 'false' },
  },
});
