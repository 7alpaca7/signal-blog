<script setup>
import { RouterLink } from 'vue-router';

defineProps({
  date: { type: String, required: true },
  entries: {
    type: /** @type {import('vue').PropType<import('../model/activity-contracts.js').DocumentActivity[]>} */ (
      Array
    ),
    required: true,
  },
});
const clock = new Intl.DateTimeFormat('zh-CN', {
  timeZone: 'Asia/Shanghai',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});
</script>

<template>
  <section class="day-details" aria-label="当日文档变更详情">
    <div class="details-heading">
      <h3>{{ date }}</h3>
      <span role="status">{{ entries.length }} 次文档变更</span>
    </div>
    <div v-if="!entries.length" class="empty-day">
      <span aria-hidden="true">[ · _ · ]</span>
      <p>这一天没有文档变更。</p>
      <small>记录会在新增或修改博客文档时出现。</small>
    </div>
    <ol v-else>
      <li v-for="entry in entries" :key="entry.id">
        <div class="entry-meta">
          <span :class="entry.action">{{ entry.action === 'created' ? '+ 新增' : '~ 修改' }}</span
          ><time :datetime="entry.occurredAt">{{ clock.format(new Date(entry.occurredAt)) }}</time>
        </div>
        <RouterLink :to="{ name: 'article', params: { slug: entry.articleSlug } }"
          >{{ entry.documentTitle }} <span aria-hidden="true">↗</span></RouterLink
        >
        <p>{{ entry.summary }}</p>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.day-details {
  min-width: 0;
}
.details-heading {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid var(--color-line);
  padding-bottom: 18px;
}
h3 {
  font: 19px var(--font-mono);
}
.details-heading > span {
  font-size: 11px;
  color: var(--color-muted);
}
ol {
  list-style: none;
  padding: 0;
  margin: 0;
}
li {
  padding: 18px 0;
  border-bottom: 1px solid var(--color-line);
}
.entry-meta {
  display: flex;
  gap: 15px;
  font: 10px var(--font-mono);
  margin-bottom: 9px;
  color: var(--color-muted);
}
.created {
  color: var(--color-acid);
}
.updated {
  color: var(--color-orange);
}
a {
  display: inline-block;
  font-size: 14px;
  line-height: 1.7;
}
a:hover {
  color: var(--color-acid);
}
a span {
  color: var(--color-acid);
}
li p {
  color: var(--color-muted);
  font-size: 12px;
  line-height: 1.8;
  margin-top: 7px;
}
.empty-day {
  padding: 45px 0;
  color: var(--color-muted);
}
.empty-day > span {
  color: var(--color-acid);
  font: 26px var(--font-mono);
}
.empty-day p {
  margin-top: 20px;
  font-size: 14px;
}
small {
  font-size: 11px;
  display: block;
  margin-top: 10px;
}
</style>
