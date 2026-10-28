import { expect, test } from '@playwright/test';

import { openBlog, finishOpening } from './helpers/navigation.js';

test('首页与归档使用同一文章详情，筛选可刷新恢复', async ({ page }) => {
  await openBlog(page, '/');
  await page
    .getByRole('region', { name: '最近的记录' })
    .getByRole('link', { name: /开发日志 01/ })
    .click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    '开发日志 01：搭建 SIGNAL 的前端工程',
  );
  await expect(page.locator('.markdown-body h2#boundaries')).toHaveText('把职责放到合适的位置');
  await page
    .getByRole('navigation', { name: '文章目录' })
    .getByRole('link', { name: '把职责放到合适的位置' })
    .click();
  await expect(page).toHaveURL(/#boundaries$/);
  await page.getByRole('link', { name: '← 文章归档' }).click();
  await page.getByRole('searchbox', { name: '搜索记录' }).fill('芬达不存在');
  await expect(page).toHaveURL(/q=/);
  await expect(page.getByRole('heading', { name: '这里暂时还没有记录' })).toBeVisible();
  await page.reload();
  await finishOpening(page);
  await expect(page.getByRole('searchbox')).toHaveValue('芬达不存在');
  await page.getByRole('button', { name: '清除筛选 ×' }).click();
  await page.getByRole('link', { name: /开发日志 01/ }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    '开发日志 01：搭建 SIGNAL 的前端工程',
  );
});

test('深链接刷新、文章不存在和未知路由均有明确反馈', async ({ page }) => {
  await openBlog(page, '/articles/architecture-and-project-setup');
  await page.reload();
  await finishOpening(page);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    '开发日志 01：搭建 SIGNAL 的前端工程',
  );
  await openBlog(page, '/articles/not-an-article');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('这篇记录还不存在');
  await openBlog(page, '/missing-page');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('这条信号暂时没有抵达。');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});
