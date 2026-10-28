<script setup>
defineProps({
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
const weekdays = ['一', '二', '三', '四', '五', '六', '日'];
</script>

<template>
  <div class="calendar-content">
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
            @click="emit('select', cell.date)"
          >
            {{ cell.day }}
          </button></template
        >
      </div>
    </div>
    <div class="legend">
      <span>少</span
      ><i v-for="level in [0, 1, 2, 3, 4]" :key="level" :class="`level-${level}`" /><span>多</span>
    </div>
  </div>
</template>

<style scoped>
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
  background: #22271f;
}
.level-1 {
  background: #42572b;
  color: #e0edc9;
}
.level-2 {
  background: #718d3b;
  color: #101211;
}
.level-3 {
  background: #abc849;
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
</style>
