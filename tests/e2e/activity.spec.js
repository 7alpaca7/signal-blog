import { expect, test } from '@playwright/test';

import { openBlog } from './helpers/navigation.js';

test('开发日志打卡支持日期、空状态和文章跳转', async ({ page }) => {
  // 固定业务日期而不冻结 RAF，让未来日期与本地日志的断言可重复。
  await page.clock.setFixedTime(new Date('2026-10-28T23:59:00+08:00'));
  await openBlog(page, '/');
  const activity = page.getByRole('region', { name: '创作足迹', exact: true });
  await activity.scrollIntoViewIfNeeded();
  await expect(activity.getByRole('combobox', { name: '文档活动月份' })).toHaveValue('2026-10');
  await activity.getByRole('button', { name: '2026-10-28，4 次文档变更', exact: true }).click();
  const details = activity.getByRole('region', { name: '当日文档变更详情' });
  await expect(details.getByRole('status')).toHaveText('4 次文档变更');
  await activity.getByRole('button', { name: '2026-10-01，0 次文档变更', exact: true }).click();
  await expect(details.getByText('这一天没有文档变更。')).toBeVisible();
  await expect(
    activity.getByRole('button', { name: '2026-10-29，尚未到来', exact: true }),
  ).toBeDisabled();
  await activity.getByRole('button', { name: '2026-10-28，4 次文档变更', exact: true }).click();
  await expect(activity.getByRole('button', { name: '查看更早月份' })).toBeDisabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await details.getByRole('link', { name: /开发日志 04：排查卡顿与资源加载/ }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    '开发日志 04：排查卡顿与资源加载',
  );
});
