<script setup>
import { computed, nextTick, ref, watch } from 'vue';
const props = defineProps({
  recent: { type: Boolean, default: false },
  cells: {
    type: /** @type {import('vue').PropType<ReturnType<import('../model/activity-calendar.js').createMonthCells>>} */ (
      Array
    ),
    required: true,
  },
  selectedDay: { type: String, required: true },
  today: { type: String, required: true },
});
const emit = defineEmits(['select']);
const viewport = ref(/** @type {HTMLElement|null} */ (null));
const labels = computed(() => {
  const result = [];
  let previous = '';
  for (let index = 0; index < props.cells.length; index += 7) {
    const cell = props.cells
      .slice(index, index + 7)
      .find((item) => !item.empty && (item.day === 1 || index === 0));
    if (cell && cell.date.slice(0, 7) !== previous) {
      previous = cell.date.slice(0, 7);
      result.push({ column: index / 7 + 1, label: `${Number(cell.date.slice(5, 7))}月` });
    }
  }
  return result;
});
// 小屏保留足够大的点击格，初次与切换范围时定位到最近一周，不随日期选择重置滚动。
watch(
  () => [props.recent, props.cells[0]?.date],
  async () => {
    await nextTick();
    if (viewport.value && props.recent) viewport.value.scrollLeft = viewport.value.scrollWidth;
  },
  { immediate: true },
);
const weekdays = ['一', '二', '三', '四', '五', '六', '日'];
</script>

<template>
  <div class="calendar-content" :class="{ 'recent-calendar': recent }">
    <div
      ref="viewport"
      class="calendar-viewport"
      tabindex="0"
      aria-label="创作热力日历，窄屏可横向滚动"
    >
      <div v-if="recent" class="month-labels" aria-hidden="true">
        <span v-for="label in labels" :key="label.column" :style="{ gridColumn: label.column }">{{
          label.label
        }}</span>
      </div>
      <div class="calendar-grid">
        <div class="weekdays" aria-hidden="true">
          <span v-for="day in weekdays" :key="day">{{ day }}</span>
        </div>
        <div class="days" aria-label="每日文档变更记录">
          <template v-for="(cell, index) in cells" :key="index"
            ><span v-if="cell.empty" class="blank" /><button
              v-else
              type="button"
              class="day"
              :class="[`level-${cell.level}`, { today: cell.date === today }]"
              :disabled="cell.future"
              :aria-label="`${cell.date}，${cell.future ? '尚未到来' : `${cell.count} 次文档变更`}`"
              :aria-pressed="selectedDay === cell.date"
              :title="`${cell.date} · ${cell.count} 次变更`"
              @click="emit('select', cell.date)"
            >
              <span :class="{ 'sr-date': recent }">{{ cell.day }}</span>
            </button></template
          >
        </div>
      </div>
    </div>
    <div class="legend" aria-label="文档变更次数：无、1 次、2 次、3 次、4 次及以上">
      <span>无</span
      ><i v-for="level in [0, 1, 2, 3, 4]" :key="level" :class="`level-${level}`" /><span>多</span>
    </div>
  </div>
</template>

<style scoped>
.calendar-viewport {
  max-width: 100%;
  overflow-x: auto;
  padding: 4px 4px 8px;
}
.recent-calendar {
  --cell-size: 22px;
  --cell-gap: 7px;
}
.recent-calendar .calendar-grid {
  width: max-content;
}
.recent-calendar .days {
  grid-template-rows: repeat(7, var(--cell-size));
  grid-auto-columns: var(--cell-size);
  gap: var(--cell-gap);
}
.recent-calendar .day {
  width: var(--cell-size);
  height: var(--cell-size);
  min-height: 0;
}
.recent-calendar .weekdays {
  grid-template-rows: repeat(7, var(--cell-size));
  gap: var(--cell-gap);
  width: 12px;
}
.month-labels {
  display: grid;
  grid-template-columns: repeat(26, var(--cell-size));
  gap: var(--cell-gap);
  margin-left: 24px;
  margin-bottom: 12px;
  width: max-content;
  font: 10px var(--font-mono);
  color: var(--color-muted);
}
.month-labels span {
  white-space: nowrap;
}
.sr-date {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}
.calendar-grid {
  display: flex;
  gap: 12px;
}
.weekdays {
  display: grid;
  grid-template-rows: repeat(7, 34px);
  gap: 7px;
  align-items: center;
  font: 11px var(--font-mono);
  color: var(--color-muted);
}
.days {
  display: grid;
  grid-auto-flow: column;
  grid-template-rows: repeat(7, 34px);
  grid-auto-columns: 34px;
  gap: 7px;
}
.day {
  width: 34px;
  height: 34px;
  min-height: 0;
  padding: 0;
  border: 0;
  font: 11px var(--font-mono);
  color: var(--color-muted);
  transition:
    transform var(--motion-settle),
    background var(--motion-hover);
}
.day:not(:disabled):hover {
  transform: translateY(-3px);
}
.day[aria-pressed='true'] {
  outline: 2px solid var(--color-orange);
  outline-offset: 2px;
}
.day.today::after {
  content: '';
  display: block;
  margin: 2px auto -5px;
  width: 3px;
  height: 3px;
  background: currentColor;
}
.day:disabled {
  opacity: 0.2;
  cursor: default;
}
.level-0 {
  background: #20241f;
  box-shadow: inset 0 0 0 1px #343b30;
}
.level-1 {
  /* 最低提交档也使用明确的实色，避免与空白日混淆。 */
  background: #789c41;
  color: #101211;
}
.level-2 {
  background: #a1bd43;
  color: #101211;
}
.level-3 {
  background: #c0da50;
  color: #101211;
}
.level-4 {
  background: var(--color-acid);
  color: #101211;
}
.legend {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  margin-top: 20px;
  font-size: 10px;
  color: var(--color-muted);
}
.legend i {
  width: 12px;
  height: 12px;
}
@media (max-width: 400px) {
  .days {
    grid-auto-columns: 29px;
    gap: 5px;
    grid-template-rows: repeat(7, 32px);
  }
  .day {
    width: 29px;
    height: 32px;
  }
  .weekdays {
    grid-template-rows: repeat(7, 32px);
    gap: 5px;
  }
}
@media (pointer: coarse) {
  .days {
    gap: 10px;
    grid-template-rows: repeat(7, 34px);
  }
  .day {
    position: relative;
  }
  .day::before {
    content: '';
    position: absolute;
    inset: -5px;
  }
  .weekdays {
    gap: 10px;
    grid-template-rows: repeat(7, 34px);
  }
}
@media (pointer: coarse) {
  .recent-calendar {
    --cell-size: 24px;
    --cell-gap: 10px;
  }
  .recent-calendar .day::before {
    inset: -4px;
  }
}
</style>
