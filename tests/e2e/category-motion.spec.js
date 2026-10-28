import { expect, test } from '@playwright/test';

import { openBlog } from './helpers/navigation.js';

test('分类与话题选中层跟随 URL 和键盘操作，减少动态效果可关闭动画', async ({ page }) => {
  await openBlog(page, '/articles?tag=Creative+Coding');
  const categories = page.getByRole('group', { name: '文章分类' });
  const topics = page.getByRole('group', { name: '文章话题' });
  await categories.getByRole('button', { name: /开发实践/ }).click();
  await expect(page).toHaveURL(/category=/);
  await expect(categories.getByRole('button', { name: /开发实践/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(categories.locator('.selection')).toHaveCSS('opacity', '1');
  await expect(page.getByRole('heading', { name: '这里暂时还没有记录' })).toBeVisible();
  await topics.getByRole('button', { name: '# Creative Coding', exact: true }).click();
  await expect(page).not.toHaveURL(/tag=/);
  await expect(
    page
      .getByRole('region', { name: '文章结果' })
      .locator('.article-row:not(.archive-list-leave-active)'),
  ).toHaveCount(2);
  const motionTopic = topics.getByRole('button', { name: '# Motion', exact: true });
  await motionTopic.focus();
  await page.keyboard.press('Space');
  await expect(motionTopic).toHaveAttribute('aria-pressed', 'true');
  await expect(topics.locator('.selection')).toHaveCSS('opacity', '1');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(topics.locator('.selection')).toHaveCSS('transition-duration', '0s');
  await categories.getByRole('button', { name: /全部记录/ }).click();
  await expect(categories.getByRole('button', { name: /全部记录/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('切换分类、话题和清除筛选保持当前滚动位置', async ({ page }) => {
  await openBlog(page, '/articles');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const categories = page.getByRole('group', { name: '文章分类' });
  const topics = page.getByRole('group', { name: '文章话题' });
  await page.evaluate(() => window.scrollTo({ top: 160, behavior: 'instant' }));
  const categoryButton = categories.getByRole('button', { name: /开发实践/ });
  await categoryButton.focus();
  const beforeCategory = await page.evaluate(() => window.scrollY);
  expect(beforeCategory).toBeGreaterThan(0);
  await page.keyboard.press('Space');
  await expect(categoryButton).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(beforeCategory);
  const topicButton = topics.getByRole('button', { name: '# Motion', exact: true });
  await topicButton.focus();
  const beforeTopic = await page.evaluate(() => window.scrollY);
  await page.keyboard.press('Space');
  await expect(topicButton).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(beforeTopic);
  await page.getByRole('button', { name: '清除筛选 ×' }).focus();
  const beforeReset = await page.evaluate(() => window.scrollY);
  await page.keyboard.press('Space');
  await expect(page).toHaveURL(/\/articles$/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(beforeReset);
});
