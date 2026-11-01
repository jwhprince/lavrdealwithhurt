import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const base = process.env.SMOKE_URL || 'http://127.0.0.1:3000';
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true });
await mkdir('test-results', { recursive: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    window.voltaMetrics = { lcp: 0, cls: 0 };
    new PerformanceObserver(list => { for (const entry of list.getEntries()) window.voltaMetrics.lcp = entry.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver(list => { for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.voltaMetrics.cls += entry.value; }).observe({ type: 'layout-shift', buffered: true });
  });
  const response = await page.goto(base, { waitUntil: 'networkidle' });
  assert.equal(response.status(), 200);
  await page.evaluate(() => document.fonts.ready);
  const performance = await page.evaluate(() => ({ ...window.voltaMetrics, resources: window.performance.getEntriesByType('resource').length, transferredBytes: window.performance.getEntriesByType('resource').reduce((sum, entry) => sum + entry.transferSize, 0) }));
  await page.screenshot({ path: 'test-results/production-desktop.png' });
  assert.equal(await page.locator('h1').count(), 1);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.screenshot({ path: 'test-results/production-mobile.png' });
  const video = page.locator('video'); await video.scrollIntoViewIfNeeded();
  await video.evaluate(async element => { element.muted = true; await element.play(); });
  await page.waitForFunction(() => document.querySelector('video').currentTime > 0.2);
  await video.evaluate(element => element.pause());
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ status: 'passed', localDesktopPerformance: performance, mobileVideo: 'plays', consoleErrors: errors.length }, null, 2));
} finally { await browser.close(); }
