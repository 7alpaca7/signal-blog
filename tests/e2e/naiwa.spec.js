import fs from 'node:fs';
import { createHash } from 'node:crypto';

import { expect, test } from '@playwright/test';

const resource = JSON.parse(fs.readFileSync('content/resources/naiwa-source.json', 'utf8'));

test('NAIWA 记录、沙箱降级交互与原始源码下载', async ({ page, request }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  // 单独验证 CDN 故障路径，不让外部服务可用性决定回归结果；真实素材另行联网检查。
  await page.route(/https:\/\/(cdn\.jsdelivr\.net|unpkg\.com)\//, (route) => route.abort());
  await page.route('https://nailong-studio.github.io/**', (route) =>
    route.fulfill({
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800"><rect width="600" height="800" fill="#dce7e7"/></svg>',
    }),
  );
  await page.goto('/articles?category=创意实验');
  await page.getByRole('link', { name: /奶蛙 · NAIWA：沿景深/ }).click();
  await expect(page).toHaveURL(/\/experiments\/naiwa$/);
  await expect(page.locator('iframe')).toHaveAttribute('sandbox', 'allow-scripts');
  await expect(page.locator('iframe')).toHaveAttribute('title', /NAIWA/);
  const frame = page.frameLocator('iframe');
  await expect(frame.locator('body')).toHaveClass(/backup/);
  await frame.getByRole('button', { name: '下一幅作品' }).click();
  await expect(frame.locator('#index')).toHaveText('02 / 06');
  await frame.getByRole('button', { name: '6：远方相遇', exact: true }).click();
  await expect(frame.locator('#index')).toHaveText('06 / 06');
  await expect(frame.getByRole('button', { name: '下一幅作品' })).toBeDisabled();
  expect(
    await frame.locator('html').evaluate((el) => el.scrollHeight - innerHeight),
  ).toBeLessThanOrEqual(2);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
  ).toBeLessThanOrEqual(2);
  await page.getByRole('link', { name: '源码与素材说明 ↗' }).click();
  await expect(page.getByRole('heading', { name: resource.name })).toBeVisible();
  const zip = await request.get('/downloads/naiwa-source.zip');
  expect(zip.ok()).toBe(true);
  expect(
    createHash('sha256')
      .update(await zip.body())
      .digest('hex'),
  ).toBe(resource.sha256);
});

test('作品未准备好时不接受父窗口伪造就绪，图片失败不自动退出', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route(/https:\/\/(cdn\.jsdelivr\.net|unpkg\.com)\//, (route) => route.abort());
  let release;
  let requested = false;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  await page.route('https://nailong-studio.github.io/**', async (route) => {
    if (route.request().url().endsWith('/p-9.webp')) {
      requested = true;
      await gate;
      await route.abort();
    } else
      await route.fulfill({
        contentType: 'image/svg+xml',
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"/>',
      });
  });
  await page.goto('/experiments/naiwa', { waitUntil: 'domcontentloaded' });
  const loader = page.getByRole('dialog', { name: '小黄脸喝可乐开场动画' });
  await expect.poll(() => requested).toBe(true);
  await page.evaluate(() => window.postMessage({ type: 'signal:showcase-ready', error: '' }, '*'));
  await expect(loader).toBeVisible();
  release();
  await expect(loader.getByRole('alert')).toContainText('加载失败');
  await expect(loader.getByRole('button', { name: '重新加载页面 ↻' })).toBeEnabled();
});
