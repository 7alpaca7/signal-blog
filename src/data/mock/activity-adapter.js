import { groupActivity, isCalendarMonth } from '@/modules/activity/model/activity-calendar.js';

import { demoDocumentActivity } from '../fixtures/document-activity.js';

/** 演示仓库只读取明确的文档日志。未来月份和未来日志均不会生成虚假打卡。 */
export function createMockActivityRepository() {
  /** @type {import('@/modules/activity/model/activity-contracts.js').ActivityRepository} */
  const repository = {
    async listByMonth(month, { signal } = {}) {
      signal?.throwIfAborted();
      if (!isCalendarMonth(month)) throw new Error('请选择有效月份。');
      const entries = demoDocumentActivity.filter(
        (entry) => new Date(entry.occurredAt).getTime() <= Date.now(),
      );
      const groups = groupActivity(entries);
      const months = [...new Set(Object.keys(groups).map((day) => day.slice(0, 7)))]
        .sort()
        .reverse();
      const selected = Object.entries(groups)
        .filter(([day]) => day.startsWith(month))
        .flatMap(([, items]) => items);
      return structuredClone({ entries: selected, months });
    },
  };
  return repository;
}
