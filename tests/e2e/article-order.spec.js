import { expect, test } from '@playwright/test';

/** 从实际 time 属性核对时刻，避免测试仅比较已经截断的日期。 */
async function timestamps(page) {
  return page
    .locator('.article-row time')
    .evaluateAll((elements) =>
      elements.map((element) => Date.parse(element.getAttribute('datetime'))),
    );
}

test('首页和归档同日按具体时间倒序，最早排序按时间正序', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(
    page.getByRole('region', { name: '最近的记录' }).locator('.article-row'),
  ).toHaveCount(3);
  const recent = await timestamps(page);
  expect(recent).toEqual([...recent].sort((a, b) => b - a));
  await expect(page.locator('.article-row time small').first()).toContainText(/\d{2}:\d{2}/);
  await page
    .getByRole('navigation', { name: '主导航' })
    .getByRole('link', { name: '全部记录' })
    .click();
  await expect.poll(() => page.locator('.article-row').count()).toBeGreaterThan(3);
  const latest = await timestamps(page);
  expect(latest).toEqual([...latest].sort((a, b) => b - a));
  await page.getByRole('combobox', { name: '排序' }).selectOption('old');
  await expect
    .poll(async () => {
      const values = await timestamps(page);
      return values.every((value, index) => index === 0 || value >= values[index - 1]);
    })
    .toBe(true);
});
