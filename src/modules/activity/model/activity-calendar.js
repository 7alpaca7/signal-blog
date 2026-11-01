/** @typedef {import('./activity-contracts.js').DocumentActivity} DocumentActivity */
const BLOG_DATE = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Shanghai',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** 根据博客时区生成稳定的 YYYY-MM-DD，不依赖浏览器所在时区。 */
export function toBlogDate(/** @type {Date} */ date) {
  const parts = BLOG_DATE.formatToParts(date);
  const field = (/** @type {string} */ type) =>
    parts.find((part) => part.type === type)?.value || '';
  return `${field('year')}-${field('month')}-${field('day')}`;
}

/** 一天多次修改分别计数；同一文档不去重，以免隐藏真实的变更频次。 */
export function groupActivity(/** @type {DocumentActivity[]} */ entries) {
  /** @type {Record<string, DocumentActivity[]>} */
  const groups = {};
  for (const entry of entries) {
    const day = toBlogDate(new Date(entry.occurredAt));
    (groups[day] ||= []).push(entry);
  }
  Object.values(groups).forEach((items) =>
    items.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()),
  );
  return groups;
}

/** 月份必须是真实 YYYY-MM，拒绝 00/13 等浏览器会自动归一化的月份。 */
export function isCalendarMonth(/** @type {string} */ month) {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(month) && Number(month.slice(0, 4)) >= 1000;
}

/** 创建周一至周日纵排的贡献格。日历算法用 UTC 避免 DST 引起日期跳动。 */
export function createMonthCells(
  /** @type {string} */ month,
  /** @type {Record<string, DocumentActivity[]>} */ groups,
  /** @type {string} */ today,
) {
  if (!isCalendarMonth(month)) throw new Error('月份格式无效。');
  const [year, number] = month.split('-').map(Number);
  const offset = (new Date(Date.UTC(year, number - 1, 1)).getUTCDay() + 6) % 7;
  const days = new Date(Date.UTC(year, number, 0)).getUTCDate();
  return Array.from({ length: Math.ceil((offset + days) / 7) * 7 }, (_, index) => {
    const day = index - offset + 1;
    const date = `${month}-${String(day).padStart(2, '0')}`;
    const count = groups[date]?.length || 0;
    return {
      date,
      day,
      count,
      empty: day < 1 || day > days,
      future: date > today,
      level: Math.min(4, count),
    };
  });
}

/** 最近 26 周连续展示，周一开始；UTC 运算避免跨年、闰日和夏令时误差。 */
export function createRecentCells(
  /** @type {Record<string, DocumentActivity[]>} */ groups,
  /** @type {string} */ today,
) {
  const current = new Date(`${today}T00:00:00Z`);
  const offset = (current.getUTCDay() + 6) % 7;
  const start = current.getTime() - (25 * 7 + offset) * 86_400_000;
  return Array.from({ length: 26 * 7 }, (_, index) => {
    const date = new Date(start + index * 86_400_000).toISOString().slice(0, 10);
    const count = groups[date]?.length || 0;
    return {
      date,
      day: Number(date.slice(8)),
      count,
      empty: false,
      future: date > today,
      level: Math.min(4, count),
    };
  });
}
