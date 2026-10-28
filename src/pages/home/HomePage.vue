<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';

import { DocumentActivity } from '@/modules/activity/index.js';
import { ArticleList, useArticles } from '@/modules/articles/index.js';
import PixelMascot from '@/shared/brand/PixelMascot.vue';
import ResourceState from '@/shared/ui/ResourceState.vue';

const { data, status, error, reload } = useArticles();
const recentArticles = computed(() => data.value?.slice(0, 3) ?? []);
</script>

<template>
  <div class="page">
    <section class="hero">
      <div>
        <p class="eyebrow">CREATIVE DEVELOPER / PERSONAL BLOG</p>
        <h1 class="display-title">IDEAS.<br /><span class="acid">IN PLAY.</span></h1>
        <p class="intro">
          写代码，也收集灵感。<br /><span>关于开发、设计，以及那些值得留下的过程。</span>
        </p>
        <RouterLink class="text-link explore" to="/articles">探索全部记录 ↗</RouterLink>
      </div>
      <div class="mascot-area">
        <PixelMascot beverage="trio" reaction="peace" />
      </div>
    </section>
    <section aria-labelledby="recent-title">
      <div class="section-heading">
        <h2 id="recent-title">最近的记录</h2>
        <RouterLink class="text-link" to="/articles">全部记录 ↗</RouterLink>
      </div>
      <ResourceState :status="status" :error="error" @retry="reload" />
      <ArticleList v-if="status === 'success'" :articles="recentArticles" />
    </section>
    <DocumentActivity />
  </div>
</template>

<style scoped>
.hero {
  display: grid;
  grid-template-columns: 1fr 220px;
  align-items: center;
  gap: 30px;
  padding-bottom: 80px;
  margin-bottom: 45px;
  border-bottom: 1px solid var(--color-line);
}
.intro {
  font-size: 18px;
  line-height: 1.9;
}
.intro span {
  color: var(--color-muted);
  font-size: 14px;
}
.explore {
  display: inline-block;
  margin-top: 28px;
}
.mascot-area {
  display: grid;
  justify-items: center;
  gap: 25px;
}
.mascot-caption {
  font: 11px var(--font-mono);
  color: var(--color-orange);
}
@media (max-width: 640px) {
  .hero {
    grid-template-columns: 1fr;
    padding-bottom: 40px;
  }
  .mascot-area {
    justify-self: end;
    margin-top: -90px;
    transform: scale(0.65);
    transform-origin: right bottom;
  }
  .intro {
    font-size: 16px;
    max-width: 75%;
  }
}
</style>
