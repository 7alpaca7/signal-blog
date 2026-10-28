import { expect, test } from '@playwright/test';

test('Pages 子路径首页、归档、文章直达与刷新均可用', async ({ page }) => {
  test.skip(!process.env.PAGES_TEST_URL, '需要显式指定无 SPA rewrite 的 Pages 测试地址。');
  const base = process.env.PAGES_TEST_URL;
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const failures = [];
  page.on('requestfailed', (request) => failures.push(request.url()));
  const home = await page.goto(base);
  expect(home.status()).toBe(200);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/IDEAS/);
  await page.getByRole('link', { name: '探索全部记录 ↗' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/FIELD/);
  const detailUrl = new URL('articles/architecture-and-project-setup/', base).href;
  const detail = await page.goto(detailUrl);
  expect(detail.status()).toBe(200);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    '开发日志 01：搭建 SIGNAL 的前端工程',
  );
  const reload = await page.reload();
  expect(reload.status()).toBe(200);
  await expect(page.locator('.markdown-body h2#boundaries')).toBeVisible();
  expect(await page.locator('link[rel="icon"]').getAttribute('href')).toContain(
    '/signal-blog/favicon.svg',
  );
  expect(failures).toEqual([]);
});
