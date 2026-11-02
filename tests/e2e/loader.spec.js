import { expect, test } from '@playwright/test';

test('首次加载真实等待正文 chunk，完成后直接退场，不强制播完品牌周期', async ({ page }) => {
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  await page.route('**/*architecture-and-project-setup*.js', async (route) => {
    await gate;
    await route.continue();
  });
  await page.goto('/articles/architecture-and-project-setup', { waitUntil: 'domcontentloaded' });
  const loader = page.getByRole('dialog', { name: '小黄脸喝可乐开场动画' });
  await expect(loader).toBeVisible();
  await expect(loader.getByRole('button')).toBeDisabled();
  await expect(loader.locator('canvas')).toHaveAttribute('width', '128');
  await page.waitForTimeout(2000);
  await expect(loader).toBeVisible();
  release();
  await expect(loader).toBeHidden({ timeout: 4000 });
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
});

test('减少动态效果时依然等待实际内容，不强制播放动作', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByRole('dialog', { name: '小黄脸喝可乐开场动画' })).toBeHidden();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('正文已到达仍等待首屏图片，图片失败也能进入页面', async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 1800 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  let release;
  let requested = false;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  await page.route('**/images/risograph-milk-frog/main.png', async (route) => {
    requested = true;
    await gate;
    await route.abort();
  });
  await page.goto('/articles/risograph-milk-frog', { waitUntil: 'domcontentloaded' });
  await expect.poll(() => requested).toBe(true);
  const loader = page.getByRole('dialog', { name: '小黄脸喝可乐开场动画' });
  await expect(loader).toBeVisible();
  await expect(page.locator('main h1')).toContainText('当代 Risograph');
  release();
  await expect(loader).toBeHidden();
  await expect(page.locator('main h1')).toBeFocused();
});

test('首页组件未下载时已经显示加载反馈，完成后最近记录与日历可用', async ({ page }) => {
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  await page.route('**/HomePage-*.js', async (route) => {
    await gate;
    await route.continue();
  });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const loader = page.getByRole('dialog', { name: '小黄脸喝可乐开场动画' });
  await expect(loader).toBeVisible();
  await expect(loader.getByRole('button')).toBeDisabled();
  await expect(page.locator('main h1')).toHaveCount(0);
  await page.waitForTimeout(1000);
  await expect(loader).toBeVisible();
  release();
  await expect(loader).toBeHidden();
  await expect(
    page.getByRole('region', { name: '最近的记录' }).locator('.article-row'),
  ).toHaveCount(3);
  await expect(page.getByRole('region', { name: '创作足迹', exact: true })).toBeVisible();
  await expect(page.locator('.app-shell > div[inert]')).toHaveCount(0);
});

test('主脚本尚未下载时显示静态启动反馈', async ({ page }) => {
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  await page.route('**/assets/index-*.js', async (route) => {
    await gate;
    await route.continue();
  });
  await page.goto('/', { waitUntil: 'commit' });
  await expect(page.locator('.boot-status')).toBeVisible();
  await expect(page.locator('.boot-status')).toContainText('正在准备页面');
  release();
  await expect(page.locator('.boot-status')).toHaveCount(0);
  await expect(page.getByRole('dialog', { name: '小黄脸喝可乐开场动画' })).toBeHidden();
});
