<script setup>
import { computed } from 'vue';

const props = defineProps({
  cells: {
    type: /** @type {import('vue').PropType<ReturnType<import('../model/activity-calendar.js').createMonthCells>>} */ (
      Array
    ),
    required: true,
  },
  selectedDay: { type: String, required: true },
  today: { type: String, required: true },
});
const emit = defineEmits(['select', 'focusDate']);
const weekdays = ['一', '二', '三', '四', '五', '六', '日'];
const padded = computed(() => [
  ...props.cells,
  ...Array.from({ length: 42 - props.cells.length }, () => null),
]);
/** 方向键按日期移动，Home/End 移到所在周首尾；Enter/空格沿用原生按钮。 */
function onKey(/** @type {KeyboardEvent} */ event, /** @type {string} */ date) {
  const current = new Date(`${date}T00:00:00Z`);
  const weekday = (current.getUTCDay() + 6) % 7;
  const offset = {
    ArrowLeft: -1,
    ArrowRight: 1,
    ArrowUp: -7,
    ArrowDown: 7,
    Home: -weekday,
    End: 6 - weekday,
  }[event.key];
  if (offset === undefined) return;
  event.preventDefault();
  const next = new Date(current.getTime() + offset * 86_400_000).toISOString().slice(0, 10);
  if (next <= props.today) emit('focusDate', next);
}
</script>

<template>
  <div class="calendar-content">
    <div class="weekdays" aria-hidden="true">
      <span v-for="day in weekdays" :key="day">{{ day }}</span>
    </div>
    <div class="days" aria-label="每日文档变更记录">
      <template v-for="(cell, index) in padded" :key="cell?.date || index">
        <span v-if="!cell || cell.empty" class="blank" aria-hidden="true" />
        <button
          v-else
          type="button"
          class="day"
          :class="[`level-${cell.level}`, { today: cell.date === today }]"
          :data-date="cell.date"
          :disabled="cell.future"
          :aria-label="`${cell.date}，${cell.future ? '尚未到来' : `${cell.count} 次文档变更`}`"
          :aria-current="cell.date === today ? 'date' : undefined"
          :aria-pressed="selectedDay === cell.date"
          :title="`${cell.date} · ${cell.future ? '尚未到来' : `${cell.count} 次变更`}`"
          @click="emit('select', cell.date)"
          @keydown="onKey($event, cell.date)"
        >
          {{ cell.day }}<span v-if="cell.count" class="activity-dot" aria-hidden="true" />
        </button>
      </template>
    </div>
  </div>
</template>

<style scoped>
.weekdays,
.days {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 5px;
}
.weekdays {
  color: var(--color-muted);
  text-align: center;
  font: 10px var(--font-mono);
  margin-bottom: 10px;
}
.day,
.blank {
  min-width: 0;
  height: 38px;
}
.day {
  position: relative;
  min-height: 0;
  border: 0;
  padding: 0;
  font: 12px var(--font-mono);
  color: var(--color-muted);
  transition:
    background var(--motion-hover),
    transform var(--motion-hover);
}
.day:not(:disabled):hover {
  transform: translateY(-2px);
}
.day[aria-pressed='true'] {
  outline: 2px solid var(--color-orange);
  outline-offset: 1px;
  z-index: 1;
}
.day.today {
  box-shadow: inset 0 0 0 2px var(--color-acid);
}
.day:disabled {
  opacity: 0.55;
  cursor: default;
  background: transparent;
  box-shadow: inset 0 0 0 1px var(--color-line);
}
.activity-dot {
  position: absolute;
  width: 3px;
  height: 3px;
  bottom: 4px;
  left: calc(50% - 1px);
  background: currentColor;
}
.level-0 {
  background: var(--activity-level-0);
  box-shadow: inset 0 0 0 1px #343b30;
}
.level-1 {
  background: var(--activity-level-1);
  color: #101211;
}
.level-2 {
  background: var(--activity-level-2);
  color: #101211;
}
.level-3 {
  background: var(--activity-level-3);
  color: #101211;
}
.level-4 {
  background: var(--activity-level-4);
  color: #101211;
}
@media (pointer: coarse) {
  .day,
  .blank {
    height: 42px;
  }
}
</style>
