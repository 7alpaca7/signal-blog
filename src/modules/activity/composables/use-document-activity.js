import { computed, onScopeDispose, ref, watch } from 'vue';

import { useAsyncResource } from '@/shared/composables/use-async-resource.js';

import {
  createMonthCells,
  groupActivity,
  shiftMonth,
  toBlogDate,
} from '../model/activity-calendar.js';
import { useActivityRepository } from '../services/activity-repository.js';

/** 三个月为一个窗口；取消旧请求并按北京时间更新日期，统计与窗口一致。 */
export function useDocumentActivity() {
  const repository = useActivityRepository();
  const today = ref(toBlogDate(new Date()));
  const month = ref(today.value.slice(0, 7));
  const selectedDay = ref(today.value);
  const knownMonths = ref(/** @type {string[]} */ ([]));
  const visibleMonths = computed(() =>
    [-2, -1, 0].map((offset) => shiftMonth(month.value, offset)),
  );
  const { data, status, error, reload } = useAsyncResource(
    () => `${month.value}:${today.value}`,
    async (_value, signal) => {
      const results = await Promise.all(
        visibleMonths.value.map((key) => repository.listByMonth(key, { signal })),
      );
      return {
        entries: results.flatMap((result) => result.entries),
        months: [...new Set(results.flatMap((result) => result.months))],
      };
    },
  );
  const months = computed(() => {
    const latest = today.value.slice(0, 7);
    const earliest = [...knownMonths.value, shiftMonth(latest, -2)].sort()[0];
    const result = [];
    for (let value = latest; value >= earliest; value = shiftMonth(value, -1)) result.push(value);
    return result;
  });
  const groups = computed(() => groupActivity(data.value?.entries ?? []));
  const calendars = computed(() =>
    visibleMonths.value.map((value) => ({
      month: value,
      cells: createMonthCells(value, groups.value, today.value),
      count: (data.value?.entries ?? []).filter((entry) =>
        toBlogDate(new Date(entry.occurredAt)).startsWith(value),
      ).length,
    })),
  );
  const changes = computed(() => data.value?.entries ?? []);
  const activeDays = computed(() => Object.keys(groups.value).length);
  const created = computed(
    () => changes.value.filter((entry) => entry.action === 'created').length,
  );
  const selectedEntries = computed(() => groups.value[selectedDay.value] ?? []);
  watch(data, (result) => {
    if (!result) return;
    knownMonths.value = result.months;
    if (!visibleMonths.value.includes(selectedDay.value.slice(0, 7))) {
      selectedDay.value =
        month.value === today.value.slice(0, 7)
          ? today.value
          : Object.keys(groups.value).sort().at(-1) || `${month.value}-01`;
    }
  });
  function moveMonth(/** @type {number} */ direction) {
    const next = months.value[months.value.indexOf(month.value) + direction];
    if (next) month.value = next;
  }
  /** 恢复到当前窗口并选中今天；没有变更也明确显示空态。 */
  function goToday() {
    month.value = today.value.slice(0, 7);
    selectedDay.value = today.value;
  }
  let midnightTimer = /** @type {ReturnType<typeof setTimeout>|undefined} */ (undefined);
  function refreshDate() {
    clearTimeout(midnightTimer);
    const previous = today.value;
    today.value = toBlogDate(new Date());
    if (month.value === previous.slice(0, 7)) month.value = today.value.slice(0, 7);
    // 北京时间午夜重新计算；后台限流后，visibilitychange 立即校正日期。
    midnightTimer = setTimeout(
      refreshDate,
      86_400_000 - ((Date.now() + 8 * 3_600_000) % 86_400_000) + 50,
    );
  }
  refreshDate();
  document.addEventListener('visibilitychange', refreshDate);
  onScopeDispose(() => {
    clearTimeout(midnightTimer);
    document.removeEventListener('visibilitychange', refreshDate);
  });
  return {
    today,
    month,
    months,
    calendars,
    selectedDay,
    changes,
    activeDays,
    created,
    selectedEntries,
    status,
    error,
    reload,
    moveMonth,
    goToday,
  };
}
