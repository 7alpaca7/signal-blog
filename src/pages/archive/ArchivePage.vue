<script setup>
import { computed, onScopeDispose, ref, watch } from 'vue';

import {
  ArticleList,
  filterArticles,
  useArchiveQuery,
  useArticles,
} from '@/modules/articles/index.js';
import PixelMascot from '@/shared/brand/PixelMascot.vue';
import ChoiceGroup from '@/shared/ui/ChoiceGroup.vue';
import ResourceState from '@/shared/ui/ResourceState.vue';

const { data, status, error, reload } = useArticles();
const { query, update, reset } = useArchiveQuery();
const search = ref(query.value.keyword);
const categories = computed(() => [
  ...new Set(data.value?.map((article) => article.category) ?? []),
]);
const tags = computed(() => [...new Set(data.value?.flatMap((article) => article.tags) ?? [])]);
const categoryOptions = computed(() => [
  { value: '', label: '全部记录', count: data.value?.length ?? 0 },
  ...categories.value.map((category) => ({
    value: category,
    label: category,
    count: data.value?.filter((article) => article.category === category).length ?? 0,
  })),
]);
const tagOptions = computed(() => tags.value.map((tag) => ({ value: tag, label: `# ${tag}` })));
const years = computed(() => [
  ...new Set(data.value?.map((article) => article.publishedAt.slice(0, 4)) ?? []),
]);
const filtered = computed(() => filterArticles(data.value ?? [], query.value));
let searchTimer = /** @type {ReturnType<typeof setTimeout>|undefined} */ (undefined);
watch(
  () => query.value.keyword,
  (value) => {
    search.value = value;
  },
);
watch(search, (value) => {
  clearTimeout(searchTimer);
  if (value.trim() === query.value.keyword) return;
  searchTimer = setTimeout(() => update({ q: value }, true), 250);
});
onScopeDispose(() => clearTimeout(searchTimer));
</script>

<template>
  <div class="page">
    <section class="archive-hero">
      <div>
        <p class="eyebrow">THE PERSONAL INDEX / 个人记录索引</p>
        <h1 class="display-title">FIELD<br /><span class="acid">NOTES.</span></h1>
        <p>把想法写下来，把过程留下来。</p>
      </div>
      <PixelMascot beverage="fanta" reaction="affection" />
    </section>
    <div class="archive-layout">
      <aside aria-label="记录筛选">
        <p class="eyebrow">BROWSE BY / 分类</p>
        <ChoiceGroup
          :model-value="query.category"
          :options="categoryOptions"
          label="文章分类"
          @update:model-value="update({ category: $event })"
        />
        <p class="eyebrow topics-heading">TOPICS / 话题</p>
        <ChoiceGroup
          :model-value="query.tag"
          :options="tagOptions"
          label="文章话题"
          variant="topic"
          toggleable
          @update:model-value="update({ tag: $event })"
        />
      </aside>
      <section aria-label="文章结果">
        <div class="filters">
          <input
            v-model="search"
            type="search"
            aria-label="搜索记录"
            placeholder="搜索标题、内容或话题…"
            maxlength="100"
          /><select
            :value="query.year"
            aria-label="筛选年份"
            @change="update({ year: /** @type {HTMLSelectElement} */ ($event.target).value })"
          >
            <option value="">全部年份</option>
            <option v-for="year in years" :key="year">{{ year }}</option></select
          ><select
            :value="query.sort"
            aria-label="排序"
            @change="update({ sort: /** @type {HTMLSelectElement} */ ($event.target).value })"
          >
            <option value="new">最新在前 ↓</option>
            <option value="old">最早在前 ↑</option>
          </select>
        </div>
        <div class="results">
          <span role="status">{{ filtered.length }} 篇记录</span
          ><button @click="reset">清除筛选 ×</button>
        </div>
        <ResourceState :status="status" :error="error" @retry="reload" />
        <ArticleList v-if="status === 'success' && filtered.length" :articles="filtered" />
        <div v-else-if="status === 'success'" class="empty">
          <h2>这里暂时还没有记录</h2>
          <p>试试其他关键词，或清除筛选。</p>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.archive-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding-bottom: 40px;
  border-bottom: 1px solid var(--color-line);
}
.archive-hero p:last-child {
  color: var(--color-muted);
}
.archive-layout {
  display: grid;
  grid-template-columns: 185px minmax(0, 1fr);
  gap: 40px;
  margin-top: 40px;
}
aside {
  position: sticky;
  top: 110px;
  align-self: start;
}
aside > .eyebrow {
  margin-bottom: 20px;
}
.topics-heading {
  margin-top: 28px;
}
.filters {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
input {
  flex: 1;
  min-width: 160px;
}
select {
  font-size: 12px;
}
.results {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;
  color: var(--color-muted);
  font-size: 12px;
}
.results button {
  border: 0;
  background: none;
  color: var(--color-acid);
}
.empty {
  padding: 60px 0;
  text-align: center;
}
.empty h2 {
  font-size: 20px;
}
.empty p {
  margin-top: 15px;
  color: var(--color-muted);
}
@media (max-width: 700px) {
  .archive-layout {
    grid-template-columns: 1fr;
    gap: 25px;
  }
  aside {
    position: static;
  }
  .archive-hero :deep(.pixel-mascot) {
    width: 95px;
    height: 95px;
  }
}
</style>
