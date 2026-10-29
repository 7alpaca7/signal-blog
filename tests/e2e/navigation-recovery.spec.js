import { expect, test } from '@playwright/test';

test('详情页返回首页、归档与历史导航正常', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/articles/denodet-attention-feature-denoising/');
  await expect(page.locator('.markdown-body')).toBeVisible();
  await page.getByRole('link', { name: 'SIGNAL 首页', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/IDEAS/);
  await page.goBack();
  await expect(page.locator('.markdown-body')).toBeVisible();
  await page.getByRole('link', { name: '← 文章归档', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/FIELD/);
  await page.goBack();
  await expect(page.locator('.markdown-body')).toBeVisible();
  await page.goForward();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/FIELD/);
});

test('旧页面的路由资源失效后重新打开目标地址', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/articles/denodet-attention-feature-denoising/');
  await expect(page.locator('.markdown-body')).toBeVisible();
  let blocked = false;
  await page.route(/\/HomePage-[^/]+\.js$/, async (route) => {
    if (!blocked) {
      blocked = true;
      await route.abort('failed');
    } else {
      await route.continue();
    }
  });
  // 键盘触发避免悬停预取抢先消耗这次失败，验证真实导航错误的恢复。
  await page.getByRole('link', { name: 'SIGNAL 首页', exact: true }).dispatchEvent('click', {
    button: 0,
  });
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/IDEAS/);
  expect(blocked).toBe(true);
});
