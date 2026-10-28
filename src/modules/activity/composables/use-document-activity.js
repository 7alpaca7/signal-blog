import { computed, ref, watch } from 'vue';

import { useAsyncResource } from '@/shared/composables/use-async-resource.js';

import { createMonthCells, groupActivity, toBlogDate } from '../model/activity-calendar.js';
import { useActivityRepository } from '../services/activity-repository.js';

/** 月份、日期选择与请求生命周期集中管理；统计口径只依赖当前月日志。 */
export function useDocumentActivity() {
  const repository = useActivityRepository();
  const today = toBlogDate(new Date());
  const month = ref(today.slice(0, 7));
  const selectedDay = ref(today);
  const knownMonths = ref([month.value]);
  const { data, status, error, reload } = useAsyncResource(
    () => month.value,
    (value, signal) => repository.listByMonth(value, { signal }),
  );
  const months = computed(() =>
    [...new Set([today.slice(0, 7), ...knownMonths.value])].sort().reverse(),
  );
  const groups = computed(() => groupActivity(data.value?.entries ?? []));
  const cells = computed(() => createMonthCells(month.value, groups.value, today));
  const changes = computed(() => data.value?.entries ?? []);
  const activeDays = computed(() => Object.keys(groups.value).length);
  const created = computed(
    () => changes.value.filter((entry) => entry.action === 'created').length,
  );
  const selectedEntries = computed(() => groups.value[selectedDay.value] ?? []);
  watch(data, (result) => {
    if (!result) return;
    knownMonths.value = result.months;
    selectedDay.value =
      month.value === today.slice(0, 7)
        ? today
        : Object.keys(groups.value).sort().at(-1) || `${month.value}-01`;
  });
  function moveMonth(/** @type {number} */ direction) {
    const index = months.value.indexOf(month.value);
    const next = months.value[index + direction];
    if (next) month.value = next;
  }
  return {
    today,
    month,
    months,
    selectedDay,
    cells,
    changes,
    activeDays,
    created,
    selectedEntries,
    status,
    error,
    reload,
    moveMonth,
  };
}
