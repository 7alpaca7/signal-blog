import fs from 'node:fs';
import { createHash } from 'node:crypto';

import { expect, test } from '@playwright/test';

const publishedDay = fs
  .readFileSync('content/posts/unwoven-visual-experiment.md', 'utf8')
  .match(/publishedAt: '(\d{4}-\d{2}-\d{2})T/)[1];
const resource = JSON.parse(fs.readFileSync('content/resources/unwoven-source.json', 'utf8'));

test('作品记录直接打开展示，分类与源码下载形成闭环', async ({ page, request }) => {
  await page.clock.setFixedTime(new Date(`${publishedDay}T23:59:00+08:00`));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  // 固定测试图仅用于 iframe 交互回归；实际外部素材另外进行真实网络检查。
  await page.route('https://works.cohub.live/**', (route) =>
    route.fulfill({
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800"><rect width="600" height="800" fill="#d9ed7a"/></svg>',
    }),
  );
  await page.goto('/');
  await page
    .getByRole('region', { name: '最近的记录' })
    .getByRole('link', { name: /奶蛙 · UNWOVEN/ })
    .click();
  await expect(page).toHaveURL(/\/experiments\/unwoven$/);
  const iframe = page.locator('iframe');
  await expect(iframe).toHaveAttribute('sandbox', 'allow-scripts');
  const frame = page.frameLocator('iframe');
  await expect(frame.locator('#assetStatus')).toContainText('4 / 4');
  await expect(frame.locator('canvas')).toHaveCount(1);
  await frame.locator('#togglePlay').click();
  await expect(frame.locator('#togglePlay')).toHaveAttribute('aria-pressed', 'false');
  await page.reload();
  await expect(page.locator('iframe')).toBeVisible();
  await page.getByRole('link', { name: '源码与素材说明 ↗' }).click();
  await expect(page.getByRole('heading', { name: '奶蛙 · UNWOVEN 视觉交互源码' })).toBeVisible();
  await expect(page.getByRole('link', { name: '下载源码 ZIP ↓' })).toHaveAttribute(
    'href',
    '/downloads/unwoven-source.zip',
  );
  const zip = await request.get('/downloads/unwoven-source.zip');
  expect(zip.status()).toBe(200);
  expect(
    createHash('sha256')
      .update(await zip.body())
      .digest('hex'),
  ).toBe(resource.sha256);
  await page.getByRole('link', { name: '← 返回资源仓库' }).click();
  await page.getByRole('button', { name: /^前端视觉效果/ }).click();
  await expect(page.getByRole('link', { name: /奶蛙 · UNWOVEN 视觉交互源码/ })).toBeVisible();
  await page
    .getByRole('navigation', { name: '主导航' })
    .getByRole('link', { name: '全部记录' })
    .click();
  await page.getByRole('button', { name: /^创意实验/ }).click();
  const record = page.getByRole('link', { name: /奶蛙 · UNWOVEN：满幅影像/ });
  await expect(record).toHaveAttribute('href', '/experiments/unwoven');
  await page.getByRole('link', { name: 'SIGNAL 首页', exact: true }).click();
  const activity = page.getByRole('region', { name: '创作足迹', exact: true });
  await activity
    .getByRole('button', { name: new RegExp(`^${publishedDay}，\\d+ 次文档变更$`) })
    .click();
  const activityLink = activity
    .getByRole('region', { name: '当日文档变更详情' })
    .getByRole('link', { name: /奶蛙 · UNWOVEN/ });
  await expect(activityLink).toHaveAttribute('href', '/experiments/unwoven');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
