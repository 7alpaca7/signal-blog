import { describe, expect, it } from 'vitest';

import {
  createMonthCells,
  groupActivity,
  isCalendarMonth,
  toBlogDate,
} from './activity-calendar.js';

describe('博客文档贡献日历', () => {
  it('按北京时间跨日/跨月聚合，不按浏览器本地日期', () => {
    expect(toBlogDate(new Date('2026-10-31T16:01:00Z'))).toBe('2026-11-01');
    const groups = groupActivity([
      { id: 'a', occurredAt: '2026-10-31T16:01:00Z' },
      { id: 'b', occurredAt: '2026-11-01T00:00:00+08:00' },
    ]);
    expect(groups['2026-11-01'].map((entry) => entry.id)).toEqual(['a', 'b']);
  });
  it('闰年二月有 29 天，未来日期保留但禁用，空白格不计入日期', () => {
    const cells = createMonthCells('2024-02', {}, '2024-02-10');
    const dates = cells.filter((cell) => !cell.empty);
    expect(dates).toHaveLength(29);
    expect(dates.filter((cell) => cell.future)).toHaveLength(19);
    expect(dates[28].date).toBe('2024-02-29');
    expect(cells.length % 7).toBe(0);
  });
  it('同日重复文档修改分别计数，无日志的日期仍可选择', () => {
    const entries = [
      { id: 'a', articleId: 'same', occurredAt: '2026-10-28T08:00:00+08:00' },
      { id: 'b', articleId: 'same', occurredAt: '2026-10-28T09:00:00+08:00' },
    ];
    const cells = createMonthCells('2026-10', groupActivity(entries), '2026-10-28');
    expect(cells.find((cell) => cell.date === '2026-10-28').count).toBe(2);
    expect(cells.find((cell) => cell.date === '2026-10-01').count).toBe(0);
  });
  it('拒绝非法月份，不被 Date 自动归一化成下一年', () => {
    expect(isCalendarMonth('2026-13')).toBe(false);
    expect(isCalendarMonth('2026-00')).toBe(false);
    expect(() => createMonthCells('2026-13', {}, '2026-10-28')).toThrow('月份格式无效');
  });
});
