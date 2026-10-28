import { expect, test } from '@playwright/test';

import { openBlog } from './helpers/navigation.js';

test('每次页面切换都复用原版可乐动作，同页筛选不重播', async ({ page }) => {
  await openBlog(page, '/');
  const curtain = page.locator('.route-curtain');
  await page.getByRole('link', { name: '探索全部记录 ↗' }).click();
  await expect(curtain).toHaveAttribute('data-beverage', 'cola');
  await expect(curtain.locator('canvas')).toHaveAttribute('data-phase', '喝一口可乐');
  await expect(curtain).toHaveCount(0);
  await page.getByRole('link', { name: /开发日志 01/ }).click();
  await expect(curtain.locator('canvas')).toHaveAttribute('data-phase', '喝一口可乐');
  await expect(curtain).toHaveCount(0);
  await page
    .getByRole('navigation', { name: '文章目录' })
    .getByRole('link', { name: '把职责放到合适的位置' })
    .click();
  await expect(page).toHaveURL(/#boundaries$/);
  await expect(curtain).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('link', { name: '← 文章归档' }).click();
  await expect(page).toHaveURL(/\/articles$/);
  await expect(curtain).toHaveCount(0);
});
