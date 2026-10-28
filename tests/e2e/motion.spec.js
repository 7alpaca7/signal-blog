import { expect, test } from '@playwright/test';

import { openBlog } from './helpers/navigation.js';

test('背景持续绘制，开关可以停止效果', async ({ page }) => {
  await openBlog(page, '/articles');
  const canvas = page.locator('.ambient-background');
  await expect(canvas).toHaveAttribute('data-running', 'true');
  const initial = await canvas.evaluate((element) => element.toDataURL());
  await expect.poll(() => canvas.evaluate((element) => element.toDataURL())).not.toBe(initial);
  await page.getByRole('button', { name: '动效 ON', exact: true }).click();
  await expect(canvas).toHaveAttribute('data-running', 'false');
  await page.getByRole('button', { name: '动效 OFF', exact: true }).click();
  await expect(canvas).toHaveAttribute('data-running', 'true');
});

test('点击爱心不打断自动芬达，结束后恢复普通笑脸', async ({ page }) => {
  await openBlog(page, '/articles');
  const mascot = page.getByRole('button', { name: '逗逗小黄脸' });
  await expect(mascot).toHaveAttribute('data-action', 'drinking', { timeout: 16000 });
  await mascot.click();
  await expect(mascot.locator('.pixel-heart')).toHaveCount(4);
  await expect(mascot).toHaveAttribute('data-action', 'drinking');
  await expect(mascot).toHaveAttribute('data-action', 'idle', { timeout: 8000 });
});

test('阅读进度与点赞反馈可用，系统减少动态效果停止自动播放', async ({ page }) => {
  await openBlog(page, '/articles/architecture-and-project-setup');
  await page.getByRole('button', { name: '♡ 点赞 0', exact: true }).click();
  await expect(page.getByRole('button', { name: '♥ 已点赞 1', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.locator('.like-section .pixel-mascot')).toHaveAttribute(
    'data-action',
    'drinking',
  );
  await expect(page.getByRole('progressbar', { name: '文章阅读进度' })).not.toHaveAttribute(
    'aria-valuenow',
    '0',
  );
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.ambient-background')).toHaveAttribute('data-running', 'false');
  await expect(page.getByRole('button', { name: '减少动态效果', exact: true })).toBeDisabled();
});

test('首页三杯同步比耶彩虹与归档芬达害羞独立', async ({ page }, testInfo) => {
  await openBlog(page, '/');
  const home = page.getByRole('button', { name: '逗逗小黄脸' });
  await expect(home).toHaveAttribute('data-beverage', 'trio');
  await expect(home).toHaveAttribute('data-action', 'drinking', { timeout: 16000 });
  await expect
    .poll(() =>
      home.locator('canvas').evaluate((canvas) => {
        const pixels = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
        const colors = new Set();
        for (let index = 0; index < pixels.length; index += 4) {
          const color = `${pixels[index]},${pixels[index + 1]},${pixels[index + 2]}`;
          if (['189,65,64', '43,151,85', '255,138,32'].includes(color) && pixels[index + 3] > 0)
            colors.add(color);
        }
        return colors.size;
      }),
    )
    .toBe(3);
  await page.screenshot({ path: testInfo.outputPath('home-trio.png') });
  await home.click();
  await expect(home).toHaveAttribute('data-reaction', 'peace');
  await expect(home.locator('.pixel-rainbow')).toBeVisible();
  await expect(page.locator('.mascot-area')).toHaveCSS('clip-path', 'none');
  await expect(home.locator('.pixel-heart')).toHaveCount(4);
  await expect(home).toHaveAttribute('data-action', 'drinking');
  await expect(home.locator('.pixel-rainbow')).toHaveCount(0, { timeout: 5000 });
  await page.getByRole('link', { name: '全部记录', exact: true }).click();
  const archive = page.getByRole('button', { name: '逗逗小黄脸' });
  await expect(archive).toHaveAttribute('data-beverage', 'fanta');
  await archive.click();
  await expect(archive).toHaveAttribute('data-reaction', 'affection');
  await expect(archive.locator('.pixel-heart')).toHaveCount(4);
  await expect(archive.locator('.pixel-rainbow')).toHaveCount(0);
});
