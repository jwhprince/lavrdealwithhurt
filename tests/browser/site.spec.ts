import { test, expect } from '@playwright/test';

for (const width of [375, 414, 768, 1024, 1440]) {
  test(`layout, images and navigation at ${width}px`, async ({ page }) => {
    const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/'); await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('VOLTA');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    for (const section of ['directions', 'about', 'teacher', 'trial', 'location', 'contacts']) {
      await page.locator(`#${section}`).scrollIntoViewIfNeeded();
    }
    await expect(page.locator('main img')).toHaveCount(4);
    for (const image of await page.locator('main img').all()) {
      await image.scrollIntoViewIfNeeded();
      await expect.poll(() => image.evaluate(element => ({ loaded: (element as HTMLImageElement).complete && (element as HTMLImageElement).naturalWidth > 0, src: element.getAttribute('src') })), { timeout: 15000 }).toMatchObject({ loaded: true });
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    if (width < 1024) {
      const menu = page.getByRole('button', { name: 'Открыть меню' }); await menu.click();
      await expect(page.getByRole('navigation')).toBeVisible();
      await page.keyboard.press('Escape'); await expect(menu).toBeFocused();
      await menu.click(); await page.getByRole('navigation').getByRole('link', { name: 'Направления' }).click();
      await expect(page.getByRole('navigation')).toBeHidden();
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: `test-results/volta-${width}.png`, fullPage: true });
    expect(errors).toEqual([]);
  });
}

test('booking validates consent, prevents double submission and returns focus', async ({ page }) => {
  await page.goto('/');
  const trigger = page.getByRole('button', { name: 'Бесплатное пробное занятие' }); await trigger.click();
  const dialog = page.getByRole('dialog'); await expect(dialog).toBeVisible();
  await page.getByLabel('Ваше имя').fill('Анна'); await page.getByLabel('Телефон', { exact: true }).fill('+7 (999) 123-45-67');
  let calls = 0;
  await page.route('**/api/leads', async route => {
    calls++; expect(route.request().postDataJSON().consent).toBe(true);
    await new Promise(resolve => setTimeout(resolve, 250));
    await route.fulfill({ json: { ok: true, message: 'OK' } });
  });
  const submit = page.getByRole('button', { name: 'Записаться бесплатно' });
  await submit.click(); expect(calls).toBe(0);
  await page.getByRole('checkbox').check(); await submit.click();
  await expect(page.getByRole('button', { name: 'Отправляем…' })).toBeDisabled();
  await expect(dialog.getByRole('status')).toContainText('Заявка отправлена'); expect(calls).toBe(1);
  await page.getByRole('button', { name: 'До встречи в VOLTA' }).click(); await expect(trigger).toBeFocused();
});

test('SMTP errors preserve form data; direction buttons preselect; Escape closes', async ({ page }) => {
  await page.goto('/'); await page.getByRole('button', { name: 'Попробовать', exact: true }).nth(1).click();
  await expect(page.getByLabel('Направление', { exact: false })).toHaveValue('baby');
  await page.getByLabel('Ваше имя').fill('Анна'); await page.getByLabel('Телефон', { exact: true }).fill('+79991234567');
  await page.getByRole('checkbox').check();
  await page.route('**/api/leads', route => route.fulfill({ status: 503, json: { ok: false, message: 'Попробуйте ещё раз.' } }));
  await page.getByRole('button', { name: 'Записаться бесплатно' }).click();
  await expect(page.getByRole('dialog').getByRole('alert')).toContainText('Попробуйте ещё раз');
  await expect(page.getByLabel('Ваше имя')).toHaveValue('Анна');
  await page.keyboard.press('Escape'); await expect(page.getByRole('dialog')).not.toBeVisible();
});

test('HTML SEO, legal pages, reduced motion and deferred media', async ({ page, request }) => {
  const html = await (await request.get('/')).text();
  expect(html).toContain('Пятницкое шоссе'); expect(html).toContain('application/ld+json');
  expect(html).toContain('noindex'); expect(html).toContain('rel="canonical"');
  await page.emulateMedia({ reducedMotion: 'reduce' }); await page.goto('/');
  await expect(page.locator('iframe')).toHaveCount(0);
  await expect(page.locator('video')).toHaveAttribute('preload', 'none');
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');
  await page.route('**/yandex.ru/map-widget/**', route => route.fulfill({ body: '<p>Test map</p>', contentType: 'text/html' }));
  await page.getByRole('button', { name: 'Показать Яндекс Карту' }).click(); await expect(page.locator('iframe')).toHaveCount(1);
  for (const path of ['/privacy', '/consent']) { await page.goto(path); await expect(page.locator('h1')).toHaveCount(1); await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/); }
  const robots = await (await request.get('/robots.txt')).text(); expect(robots).toContain('Disallow: /');
  const sitemap = await (await request.get('/sitemap.xml')).text(); expect(sitemap).not.toContain('<loc>');
});

test('page content remains accessible without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false }); const page = await context.newPage();
  await page.goto('/'); await expect(page.getByRole('heading', { level: 1 })).toContainText('VOLTA');
  await expect(page.getByRole('heading', { name: 'Анастасия Маврина' })).toBeVisible();
  await expect(page.locator('address')).toContainText('Пятницкое шоссе, 25к1'); await context.close();
});

test('mobile menu booking returns focus to the menu toggle', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 }); await page.goto('/');
  await page.getByRole('button', { name: 'Открыть меню' }).click();
  await page.getByRole('navigation').getByRole('button', { name: 'Пробное занятие' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Открыть меню' })).toBeFocused();
});
