import { expect, test } from '@playwright/test';

import { openBlog } from './helpers/navigation.js';

test('三个月按真实日期排列，未来禁用，跨月键盘与记录跳转正常', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-11-01T08:00:00+08:00'));
  await openBlog(page, '/');
  const activity = page.getByRole('region', { name: '创作足迹', exact: true });
  await activity.scrollIntoViewIfNeeded();
  const september = activity.getByRole('region', { name: '2026-09 月历', exact: true });
  const october = activity.getByRole('region', { name: '2026-10 月历', exact: true });
  const november = activity.getByRole('region', { name: '2026-11 月历', exact: true });
  await expect(september.locator('.day')).toHaveCount(30);
  await expect(october.locator('.day')).toHaveCount(31);
  await expect(november.locator('.day')).toHaveCount(30);
  await expect(
    october.getByRole('button', { name: '2026-10-31，1 次文档变更', exact: true }),
  ).toHaveText('31');
  await expect(
    november.getByRole('button', { name: '2026-11-02，尚未到来', exact: true }),
  ).toBeDisabled();
  const lastDay = october.getByRole('button', { name: '2026-10-31，1 次文档变更', exact: true });
  await lastDay.click();
  const details = activity.getByRole('region', { name: '当日文档变更详情' });
  await expect(details.getByRole('link', { name: /MLDet/ })).toBeVisible();
  await lastDay.press('ArrowRight');
  const today = november.getByRole('button', { name: '2026-11-01，0 次文档变更', exact: true });
  await expect(today).toBeFocused();
  await today.press('ArrowRight');
  await expect(today).toBeFocused();
  await today.press('Enter');
  await expect(details.getByText('这一天没有文档变更。')).toBeVisible();
  await activity.getByRole('button', { name: '回到今天' }).click();
  await expect(today).toHaveAttribute('aria-current', 'date');
  await expect(today).toHaveAttribute('aria-pressed', 'true');
  expect(await activity.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(
    true,
  );
  await activity.screenshot({ path: test.info().outputPath('month-calendars.png') });
  await lastDay.click();
  await details.getByRole('link', { name: /MLDet/ }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/MLDet/);
});

test('月份浏览补齐无记录月份，回到今天恢复当前窗口与选中日', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-11-01T08:00:00+08:00'));
  await openBlog(page, '/');
  const activity = page.getByRole('region', { name: '创作足迹', exact: true });
  const select = activity.getByRole('combobox', { name: '文档活动月份' });
  await select.selectOption('2026-09');
  await expect(activity.getByRole('region', { name: '2026-07 月历', exact: true })).toBeVisible();
  await expect(activity.getByRole('button', { name: '查看更早月份' })).toBeDisabled();
  await expect(
    activity.getByRole('region', { name: '当日文档变更详情' }).getByText('这一天没有文档变更。'),
  ).toBeVisible();
  await activity.getByRole('button', { name: '回到今天' }).click();
  await expect(select).toHaveValue('2026-11');
  await expect(activity.getByRole('button', { name: '查看更新月份' })).toBeDisabled();
  await expect(
    activity.getByRole('button', { name: '2026-11-01，0 次文档变更', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
});
