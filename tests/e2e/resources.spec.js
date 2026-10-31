import { expect, test } from '@playwright/test';

test('资源仓库搜索、空态、详情下载与文章关联形成闭环', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/resources');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/RESOURCE/);
  const chest = page.getByRole('button', { name: '打开像素宝箱' });
  await chest.click();
  await expect(chest).toHaveAttribute('aria-pressed', 'true');
  await chest.click();
  await expect(chest).toHaveAttribute('aria-pressed', 'false');
  await page.getByRole('button', { name: /系统镜像/ }).click();
  await expect(page.getByRole('heading', { name: '这里还没有收录。' })).toBeVisible();
  await page.getByRole('button', { name: '查看全部资源 ↗' }).click();
  await page.getByRole('searchbox', { name: '搜索资源' }).fill('不存在的资源');
  await expect(page.getByRole('heading', { name: '这里还没有收录。' })).toBeVisible();
  await page.getByRole('searchbox', { name: '搜索资源' }).fill('SIGNAL');
  await page.getByRole('link', { name: /SIGNAL 博客源码/ }).click();
  await expect(page.getByRole('link', { name: '前往 GitHub 下载 ZIP ↗' })).toHaveAttribute(
    'href',
    /github\.com\/7alpaca7\/signal-blog\/archive/,
  );
  await page.reload();
  await expect(page.getByRole('heading', { name: 'SIGNAL 博客源码' })).toBeVisible();
  await page.getByRole('link', { name: '前端工程搭建 ↗' }).click();
  const related = page.getByRole('region', { name: '本文相关资源' });
  await related.getByRole('link', { name: /SIGNAL 博客源码/ }).click();
  await expect(page).toHaveURL(/\/resources\/signal-source$/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: test.info().outputPath('resource-detail.png') });
});

test('宝箱开合与小黄脸反馈独立，关闭动效仍能使用', async ({ page }) => {
  await page.goto('/resources');
  await page.getByRole('button', { name: '跳过开场，进入博客 ↗' }).click();
  const chest = page.getByRole('button', { name: '打开像素宝箱' });
  await chest.click();
  const lid = chest.locator('svg > g').last();
  await expect
    .poll(() => lid.getAttribute('transform'))
    .not.toBe('translate(0 0) rotate(0 170 100)');
  await page.getByRole('button', { name: '逗逗小黄脸' }).click();
  await expect(chest).toHaveAttribute('aria-pressed', 'true');
  await expect(chest).toHaveAttribute('aria-pressed', 'false', { timeout: 7000 });
  await page.screenshot({ path: test.info().outputPath('resource-vault.png') });
});
