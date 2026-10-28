<script setup>
import { RouterLink } from 'vue-router';

defineProps({
  articles: {
    type: /** @type {import('vue').PropType<import('../model/article-contracts.js').Article[]>} */ (
      Array
    ),
    required: true,
  },
});
function setEntryDirection(/** @type {PointerEvent} */ event) {
  const element = /** @type {HTMLElement} */ (event.currentTarget);
  const rect = element.getBoundingClientRect();
  element.style.setProperty(
    '--entry-direction',
    event.clientY < rect.top + rect.height / 2 ? '-100%' : '100%',
  );
}
</script>

<template>
  <TransitionGroup name="archive-list" tag="div" class="article-list">
    <RouterLink
      v-for="(article, index) in articles"
      :key="article.id"
      class="article-row"
      :to="{ name: 'article', params: { slug: article.slug } }"
      :style="{ '--row-delay': `${index * 0.03}s` }"
      @pointerenter="setEntryDirection"
    >
      <time :datetime="article.publishedAt">{{ article.publishedAt }}</time>
      <div>
        <span class="eyebrow category">{{ article.category }}</span>
        <h3>{{ article.title }}</h3>
        <p>{{ article.excerpt }}</p>
        <span class="article-meta"
          >{{ article.tags.join(' / ') }} · {{ article.readingMinutes }} MIN READ</span
        >
      </div>
      <span class="arrow" aria-hidden="true">↗</span>
    </RouterLink>
  </TransitionGroup>
</template>

<style scoped>
.article-row {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  transition: transform var(--motion-settle) cubic-bezier(0.2, 1.4, 0.4, 1);
  display: grid;
  grid-template-columns: 100px minmax(0, 1fr) 24px;
  gap: 24px;
  padding: 30px 0;
  border-bottom: 1px solid var(--color-line);
}
.article-row:hover h3,
.category {
  color: var(--color-acid);
}
time {
  font: 12px var(--font-mono);
  color: var(--color-muted);
  padding-top: 3px;
}
h3 {
  font-size: 22px;
  font-weight: 500;
  line-height: 1.5;
  margin: 9px 0;
}
p {
  font-size: 14px;
  color: var(--color-muted);
  line-height: 1.8;
}
.article-meta {
  display: block;
  margin-top: 16px;
  font: 11px var(--font-mono);
  color: var(--color-muted);
}
.arrow {
  font-size: 27px;
  align-self: center;
  color: var(--color-acid);
}
@media (max-width: 640px) {
  .article-row {
    grid-template-columns: 1fr 22px;
    gap: 12px;
  }
  time {
    grid-column: 1 / -1;
  }
  h3 {
    font-size: 19px;
  }
}

.article-row::before {
  content: '';
  position: absolute;
  inset: 0;
  background: #d9ff6110;
  transform: translateY(var(--entry-direction, 100%));
  transition: transform var(--motion-hover) ease-out;
  z-index: -1;
}
.article-row:hover::before,
.article-row:focus-visible::before {
  transform: translateY(0);
}
.article-row:hover {
  transform: translateX(4px);
}
.article-row:active {
  transform: translateX(2px) scale(0.995);
}
.arrow {
  transition: transform var(--motion-settle) cubic-bezier(0.2, 1.5, 0.4, 1);
}
.article-row:hover .arrow {
  transform: translate(4px, -4px);
}

.archive-list-enter-active {
  transition:
    opacity var(--motion-settle),
    transform var(--motion-settle);
  transition-delay: var(--row-delay);
}
.archive-list-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.article-list {
  position: relative;
}
.archive-list-leave-active {
  position: absolute;
  width: 100%;
  pointer-events: none;
  transition:
    opacity var(--motion-result-exit),
    transform var(--motion-result-exit);
}
.archive-list-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
.archive-list-move {
  transition: transform var(--motion-settle);
}
</style>
