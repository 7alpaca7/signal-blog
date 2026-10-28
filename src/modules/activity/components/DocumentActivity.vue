<script setup>
import ResourceState from '@/shared/ui/ResourceState.vue';

import { useDocumentActivity } from '../composables/use-document-activity.js';
import ActivityCalendar from './ActivityCalendar.vue';
import ActivityDayDetails from './ActivityDayDetails.vue';

const {
  month,
  months,
  selectedDay,
  today,
  cells,
  changes,
  activeDays,
  created,
  selectedEntries,
  status,
  error,
  reload,
  moveMonth,
} = useDocumentActivity();
</script>

<template>
  <section class="document-activity" aria-labelledby="activity-title">
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
            {{ value.replace('-', ' / ') }}
          </option></select
        ><button
          type="button"
          aria-label="查看更新月份"
          :disabled="months.indexOf(month) === 0 || status === 'loading'"
          @click="moveMonth(-1)"
        >
          →
        </button>
      </div>
    </div>
    <ResourceState :status="status" :error="error" @retry="reload" /><template
      v-if="status === 'success'"
      ><div class="activity-stats" aria-live="polite">
        <span
          ><b>{{ changes.length }}</b> 次文档变更</span
        ><span
          ><b>{{ activeDays }}</b> 天有记录</span
        ><span
          >新增 <strong>{{ created }}</strong> / 修改
          <strong>{{ changes.length - created }}</strong></span
        >
      </div>
      <div class="activity-body">
        <ActivityCalendar
          :cells="cells"
          :selected-day="selectedDay"
          :today="today"
          @select="selectedDay = $event"
        /><ActivityDayDetails :date="selectedDay" :entries="selectedEntries" /></div
    ></template>
    <p class="activity-footnote">
      按北京时间统计博客文档的新增与修改；同一文档多次修改分别计数。数据来自文章的发布与修订日志，文件保存不会自动累加打卡。
    </p>
  </section>
</template>

<style scoped>
.document-activity {
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
.activity-body {
  display: grid;
  grid-template-columns: minmax(230px, 300px) minmax(0, 1fr);
  gap: 50px;
  align-items: start;
}
.activity-footnote {
  color: var(--color-muted);
  font-size: 11px;
  line-height: 1.8;
  margin-top: 28px;
}
@media (max-width: 760px) {
  .activity-body {
    grid-template-columns: 1fr;
    gap: 30px;
  }
  .activity-stats {
    gap: 18px;
  }
  .month-controls select {
    font-size: 16px;
  }
}
</style>
