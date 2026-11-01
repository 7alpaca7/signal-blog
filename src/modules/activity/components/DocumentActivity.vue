<script setup>
import { nextTick, ref, watch } from 'vue';
import ResourceState from '@/shared/ui/ResourceState.vue';

import { useDocumentActivity } from '../composables/use-document-activity.js';
import ActivityCalendar from './ActivityCalendar.vue';
import ActivityDayDetails from './ActivityDayDetails.vue';

const {
  month,
  months,
  selectedDay,
  today,
  calendars,
  changes,
  activeDays,
  created,
  selectedEntries,
  status,
  error,
  reload,
  moveMonth,
  goToday,
} = useDocumentActivity();
const region = ref(/** @type {HTMLElement|null} */ (null));
const pendingFocus = ref('');
async function focusPending() {
  if (status.value !== 'success' || !pendingFocus.value) return;
  await nextTick();
  const button = region.value?.querySelector(`button[data-date="${pendingFocus.value}"]`);
  if (button instanceof HTMLButtonElement) {
    button.focus({ preventScroll: true });
    pendingFocus.value = '';
  }
}
function focusDate(/** @type {string} */ date) {
  if (date > today.value || date.slice(0, 7) < calendars.value[0].month) return;
  pendingFocus.value = date;
  if (!calendars.value.some((calendar) => calendar.month === date.slice(0, 7)))
    month.value = date.slice(0, 7);
  else void focusPending();
}
watch(status, () => {
  void focusPending();
});
</script>

<template>
  <section ref="region" class="document-activity" aria-labelledby="activity-title">
    <div class="section-heading">
      <div>
        <p class="eyebrow">SMALL STEPS, EVERY DAY.</p>
        <h2 id="activity-title">创作足迹</h2>
      </div>
      <span class="activity-label">文档提交记录 / 本地 Markdown</span>
    </div>
    <div class="activity-toolbar">
      <p>每一次新增，每一处修改，都算一步。</p>
      <div class="month-controls">
        <button
          type="button"
          aria-label="查看更早月份"
          :disabled="months.indexOf(month) === months.length - 1 || status === 'loading'"
          @click="moveMonth(1)"
        >
          ←</button
        ><select v-model="month" aria-label="文档活动月份">
          <option v-for="value in months" :key="value" :value="value">
            {{ value.replace('-', ' / ') }} 为止
          </option></select
        ><button
          type="button"
          aria-label="查看更新月份"
          :disabled="months.indexOf(month) === 0 || status === 'loading'"
          @click="moveMonth(-1)"
        >
          →
        </button>
        <button type="button" @click="goToday">回到今天</button>
      </div>
    </div>
    <ResourceState :status="status" :error="error" @retry="reload" /><template
      v-if="status === 'success'"
      ><p class="range-label">{{ calendars[0]?.month }} — {{ month }} · 三个月文档记录</p>
      <div class="activity-stats" aria-live="polite">
        <span
          ><b>{{ changes.length }}</b> 次文档变更</span
        ><span
          ><b>{{ activeDays }}</b> 天有记录</span
        ><span
          >新增 <strong>{{ created }}</strong> / 修改
          <strong>{{ changes.length - created }}</strong></span
        >
      </div>
      <div class="calendar-months">
        <section
          v-for="calendar in calendars"
          :key="calendar.month"
          class="month-card"
          :aria-label="`${calendar.month} 月历`"
        >
          <header>
            <h3>{{ calendar.month.replace('-', ' 年 ') }} 月</h3>
            <span>{{ calendar.count }} 次变更</span>
          </header>
          <ActivityCalendar
            :cells="calendar.cells"
            :selected-day="selectedDay"
            :today="today"
            @select="selectedDay = $event"
            @focus-date="focusDate"
          />
        </section>
      </div>
      <div class="calendar-help">
        <span>深灰：无记录 · 绿色：有记录（越亮次数越多）</span
        ><span>绿框：今天 · 橙框：选中 · 淡色：未来日期</span>
      </div>
      <ActivityDayDetails :date="selectedDay" :entries="selectedEntries" />
    </template>

    <p class="activity-footnote">
      按北京时间统计博客文档的新增与修改；同一文档多次修改分别计数。数据来自文章的发布与修订日志，文件保存不会自动累加打卡。
    </p>
  </section>
</template>

<style scoped>
.document-activity {
  --activity-level-0: #20241f;
  --activity-level-1: #789c41;
  --activity-level-2: #a1bd43;
  --activity-level-3: #c0da50;
  --activity-level-4: var(--color-acid);
  margin-top: 65px;
  padding-top: 40px;
  border-top: 1px solid var(--color-line);
}
.section-heading .eyebrow {
  margin-bottom: 12px;
}
.activity-label {
  color: var(--color-muted);
  font: 11px var(--font-mono);
}
.activity-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}
.activity-toolbar p {
  color: var(--color-muted);
  font-size: 13px;
}
.month-controls {
  display: flex;
  align-items: center;
  gap: 7px;
}
.month-controls button {
  padding: 8px 12px;
}
.month-controls select {
  font: 12px var(--font-mono);
}
.activity-stats {
  display: flex;
  align-items: baseline;
  gap: 30px;
  flex-wrap: wrap;
  padding: 28px 0;
  color: var(--color-muted);
  font-size: 12px;
}
.activity-stats b {
  color: var(--color-acid);
  font: 28px var(--font-mono);
  margin-right: 7px;
}
.activity-stats strong {
  color: var(--color-text);
  font-weight: 400;
}
.range-label {
  margin-top: 24px;
  color: var(--color-muted);
  font: 11px var(--font-mono);
}
.activity-footnote {
  color: var(--color-muted);
  font-size: 11px;
  line-height: 1.8;
  margin-top: 28px;
}
@media (max-width: 760px) {
  .activity-stats {
    gap: 18px;
  }
  .month-controls select {
    font-size: 16px;
  }
}

.calendar-months {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
}
.month-card {
  padding: 18px;
  border: 1px solid var(--color-line);
  background: var(--color-bg);
  min-width: 0;
}
.month-card header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 22px;
}
.month-card h3 {
  font: 14px var(--font-mono);
}
.month-card header span {
  font-size: 10px;
  color: var(--color-muted);
}
.intensity-legend {
  display: flex;
  gap: 6px;
  align-items: center;
}
.intensity-legend i {
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 1px solid var(--color-line);
}
.calendar-help {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
  color: var(--color-muted);
  font-size: 10px;
  line-height: 1.8;
  margin: 22px 0 30px;
}
.month-controls {
  flex-wrap: wrap;
}
@media (max-width: 900px) {
  .calendar-months {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .month-card:last-child {
    grid-column: 1/-1;
    max-width: 420px;
    width: 100%;
    justify-self: center;
  }
}
@media (max-width: 560px) {
  .calendar-months {
    grid-template-columns: 1fr;
  }
  .month-card:last-child {
    grid-column: auto;
    max-width: none;
  }
  .month-card {
    padding: 18px;
  }
}
</style>
