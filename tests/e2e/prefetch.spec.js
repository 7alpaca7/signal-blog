import { expect, test } from '@playwright/test';

import { openBlog } from './helpers/navigation.js';

test('指向文章链接后提前获取正文，点击沿用同一资源', async ({ page }) => {
  const requested = [];
  page.on('request', (request) => {
    if (/architecture-and-project-setup-[^/]+\.js$/.test(request.url()))
      requested.push(request.url());
  });
  await openBlog(page, '/articles');
  const article = page.getByRole('link', { name: /开发日志 01/ });
  // 键盘聚焦和鼠标悬停共享同一意图预取入口，触屏也可以使用。
  await article.focus();
  await expect.poll(() => requested.length).toBe(1);
  await article.click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    '开发日志 01：搭建 SIGNAL 的前端工程',
  );
  await expect(page.locator('.markdown-body h2#boundaries')).toBeVisible();
  expect(requested).toHaveLength(1);
});
