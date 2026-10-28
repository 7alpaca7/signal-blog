import { expect, test } from '@playwright/test';

test('原版可乐开场呈现举杯、喝下和自动退场', async ({ page }) => {
  await page.goto('/');
  const loader = page.getByRole('dialog', { name: '小黄脸喝可乐开场动画' });
  await expect(loader).toBeVisible();
  await expect(loader.getByRole('heading')).toHaveText('稍等，喝口可乐。');
  await expect(loader.locator('canvas')).toHaveAttribute('width', '128');
  await expect(loader.locator('canvas')).toHaveAttribute('data-phase', '举起可乐', {
    timeout: 5000,
  });
  await expect(loader.locator('canvas')).toHaveAttribute('data-phase', '喝一口可乐', {
    timeout: 5000,
  });
  await expect(loader).toBeHidden({ timeout: 10000 });
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
});

test('减少动态效果时不强制等待开场周期', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByRole('dialog', { name: '小黄脸喝可乐开场动画' })).toBeHidden();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});
