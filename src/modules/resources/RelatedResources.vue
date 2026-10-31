<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';

import { useResources } from './services.js';

const props = defineProps({ slug: { type: String, required: true } });
const catalog = useResources();
const related = computed(() => catalog.filter((item) => item.articles.includes(props.slug)));
</script>
<template>
  <section v-if="related.length" class="related-resources" aria-label="本文相关资源">
    <p class="eyebrow">TAKE SOMETHING WITH YOU / 本文相关资源</p>
    <RouterLink v-for="item in related" :key="item.id" :to="`/resources/${item.id}`"
      ><span aria-hidden="true">▣</span>
      <div>
        <strong>{{ item.name }}</strong>
        <p>{{ item.format }} · {{ item.platform }} · 查看说明与下载</p>
      </div>
      <span>↗</span></RouterLink
    >
  </section>
</template>
<style scoped>
.related-resources {
  margin-top: 45px;
  padding-top: 25px;
  border-top: 1px solid var(--color-line);
}
a {
  display: flex;
  align-items: center;
  gap: 18px;
  border: 1px solid var(--color-line);
  background: var(--color-surface);
  padding: 20px;
  margin-top: 18px;
}
a:hover {
  border-color: var(--color-acid);
}
a > span {
  color: var(--color-acid);
  font-size: 26px;
}
a > span:last-child {
  margin-left: auto;
}
strong {
  font-size: 16px;
  font-weight: 500;
}
p:not(.eyebrow) {
  color: var(--color-muted);
  font-size: 11px;
  margin-top: 7px;
}
</style>
