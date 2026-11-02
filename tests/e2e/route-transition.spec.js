import { expect, test } from '@playwright/test';

import { openBlog } from './helpers/navigation.js';

test('转场超过原固定时长仍等待正文，就绪后退场；同页目录不重播', async ({ page }) => {
  await openBlog(page, '/articles');
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  await page.route('**/*architecture-and-project-setup*.js', async (route) => {
    await gate;
    await route.continue();
  });
  await page.getByRole('link', { name: /开发日志 01/ }).dispatchEvent('click');
  const curtain = page.locator('.route-curtain');
  await expect(curtain).toHaveAttribute('data-beverage', 'cola');
  await page.waitForTimeout(2300);
  await expect(curtain).toBeVisible();
  release();
  await expect(curtain).toHaveCount(0);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('开发日志 01');
  await page
    .getByRole('navigation', { name: '文章目录' })
    .getByRole('link', { name: '把职责放到合适的位置' })
    .click();
  await expect(page).toHaveURL(/#boundaries$/);
  await expect(curtain).toHaveCount(0);
});

test('缓存页面连续切换后释放交互锁', async ({ page }) => {
  await openBlog(page, '/articles/architecture-and-project-setup');
  await page.getByRole('link', { name: '← 文章归档' }).click();
  await expect(page.locator('.route-curtain')).toHaveCount(0);
  await page.getByRole('link', { name: /开发日志 01/ }).click();
  await expect(page.locator('.route-curtain')).toHaveCount(0);
  await page.getByRole('link', { name: '← 文章归档' }).click();
  await expect(page).toHaveURL(/\/articles$/);
  await expect(page.locator('.route-curtain')).toHaveCount(0);
  await expect(page.locator('.app-shell > div[inert]')).toHaveCount(0);
});
