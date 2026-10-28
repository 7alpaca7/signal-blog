<script setup>
import { computed, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';

import { ArticleBody, useArticle } from '@/modules/articles/index.js';
import { ArticleLike } from '@/modules/engagement/index.js';
import { ReadingScrollbar, useReadingPosition } from '@/modules/reader/index.js';
import PixelMascot from '@/shared/brand/PixelMascot.vue';
import ResourceState from '@/shared/ui/ResourceState.vue';

const articleRoot = ref(/** @type {HTMLElement|null} */ (null));
const fontSize = ref(17);
const light = ref(false);
const { progress, activeHeading, seek } = useReadingPosition(articleRoot);
const route = useRoute();
const slug = computed(() => String(route.params.slug ?? ''));
const { data: article, status, error, reload } = useArticle(() => slug.value);
</script>

<template>
  <div
    class="page article-page"
    :class="{ 'light-reading': light }"
    :style="{ '--reading-font': `${fontSize}px` }"
  >
    <ReadingScrollbar v-if="article" :progress="progress" @seek="seek" />
    <div
      class="reading-progress"
      role="progressbar"
      aria-label="文章阅读进度"
      :aria-valuenow="Math.round(progress / 10)"
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <span :style="{ transform: `scaleX(${progress / 1000})` }" />
    </div>
    <RouterLink class="text-link" :to="{ name: 'archive' }">← 文章归档</RouterLink>
    <ResourceState :status="status" :error="error" @retry="reload" />
    <div v-if="status === 'success' && article" class="article-layout">
      <article :key="slug" ref="articleRoot">
        <p class="eyebrow category">{{ article.category }} / {{ article.tags.join(' · ') }}</p>
        <h1>{{ article.title }}</h1>
        <p class="meta">{{ article.publishedAt }} · {{ article.readingMinutes }} MIN READ</p>
        <p class="lead">{{ article.excerpt }}</p>
        <ArticleBody :article="article" />
        <ArticleLike :article-id="article.id" />
      </article>
      <aside>
        <p class="eyebrow">ON THIS PAGE</p>
        <nav aria-label="文章目录">
          <RouterLink
            v-for="section in article.sections"
            :key="section.id"
            :to="{ hash: `#${section.id}` }"
            :aria-current="activeHeading === section.id ? 'location' : undefined"
            >{{ section.title }}</RouterLink
          >
        </nav>
        <div class="reading-settings">
          <span>字号</span
          ><button
            type="button"
            aria-label="缩小字号"
            :disabled="fontSize <= 16"
            @click="fontSize--"
          >
            A−</button
          ><button
            type="button"
            aria-label="放大字号"
            :disabled="fontSize >= 20"
            @click="fontSize++"
          >
            A＋</button
          ><button type="button" @click="light = !light">
            {{ light ? '深色阅读 ◑' : '浅色阅读 ◐' }}
          </button>
        </div>
        <div class="reader-companion">
          <PixelMascot size="small" :interactive="false" />慢慢读，我在这里。
        </div>
        <p class="demo-note">阅读进度 · {{ Math.round(progress / 10) }}% 已读</p>
      </aside>
    </div>
    <section v-else-if="status === 'success'" class="missing">
      <h1>这篇记录还不存在</h1>
      <RouterLink class="text-link" to="/articles">查看其他记录 ↗</RouterLink>
    </section>
  </div>
</template>

<style scoped>
.article-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 170px;
  gap: 60px;
  margin-top: 45px;
}
.category {
  color: var(--color-acid);
}
h1 {
  font-size: clamp(28px, 4vw, 42px);
  font-weight: 500;
  line-height: 1.45;
  margin: 22px 0;
}
.meta {
  font: 11px var(--font-mono);
  color: var(--color-muted);
}
.lead {
  font-size: 20px;
  line-height: 1.9;
  padding: 35px 0;
  margin-top: 25px;
  border-block: 1px solid var(--color-line);
}
section {
  margin-top: 50px;
  scroll-margin-top: 110px;
}
h2 {
  font-size: 24px;
  font-weight: 500;
  margin-bottom: 20px;
}
h2 span {
  font: 12px var(--font-mono);
  color: var(--color-acid);
  margin-right: 15px;
}
section p {
  line-height: 2.1;
  color: var(--color-muted);
  margin-top: 20px;
}
aside {
  position: sticky;
  top: calc(var(--header-height, 81px) + 30px);
  align-self: start;
  border-left: 1px solid var(--color-line);
  padding-left: 24px;
}
nav {
  display: grid;
  gap: 20px;
  margin-top: 30px;
  font-size: 12px;
}
nav a:hover {
  color: var(--color-acid);
}
.demo-note {
  font-size: 11px;
  color: var(--color-muted);
  margin-top: 40px;
}
.missing {
  padding: 50px 0;
}
@media (max-width: 700px) {
  .article-layout {
    grid-template-columns: 1fr;
    gap: 30px;
  }
  aside {
    position: static;
    grid-row: 1;
    border: 0;
    padding: 0;
  }
  nav {
    display: flex;
    flex-wrap: wrap;
    margin-top: 20px;
    gap: 15px;
  }
  .demo-note {
    display: none;
  }
  .lead {
    font-size: 18px;
  }
}

.article-layout > article {
  background: color-mix(in srgb, var(--color-bg) 95%, transparent);
  padding: 16px;
  margin-inline: -16px;
}
.article-layout > aside {
  background: color-mix(in srgb, var(--color-bg) 92%, transparent);
}
.article-layout section p {
  font-size: var(--reading-font);
}
.reading-progress {
  position: fixed;
  top: var(--header-height, 81px);
  left: 0;
  right: 0;
  height: 2px;
  z-index: 11;
  pointer-events: none;
}
.reading-progress span {
  display: block;
  height: 100%;
  background: var(--color-acid);
  transform-origin: left;
}
nav a[aria-current='location'] {
  color: var(--color-acid);
}
nav a {
  transition: transform var(--motion-settle);
}
nav a:hover {
  transform: translateX(4px);
}
.reading-settings {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 30px;
  font-size: 12px;
}
.reading-settings button {
  padding: 7px;
  font-size: 12px;
}
.reader-companion {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 10px;
  color: var(--color-muted);
  margin-top: 30px;
}
.light-reading {
  --color-bg: #f3f2e9;
  --color-text: #24291f;
  --color-muted: #626b59;
  --color-acid: #48611c;
  --color-line: #d2d7c9;
  --color-surface: #e8ebdf;
  color: var(--color-text);
  background: var(--color-bg);
}
@media (max-width: 700px) {
  .reading-progress {
    top: var(--header-height, 81px);
  }
  .reader-companion {
    display: none;
  }
}
</style>
