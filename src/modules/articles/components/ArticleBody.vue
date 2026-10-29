<script setup>
import 'katex/dist/katex.min.css';
defineProps({
  article: {
    type: /** @type {import('vue').PropType<import('../model/article-contracts.js').Article>} */ (
      Object
    ),
    required: true,
  },
});
</script>

<template>
  <!-- 仅渲染构建插件净化后的 HTML；禁止将评论或其他原始输入传入此入口。 -->
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div v-if="article.html !== undefined" class="markdown-body" v-html="article.html" />
  <div v-else class="markdown-body">
    <section v-for="section in article.sections" :id="section.id" :key="section.id">
      <h2>{{ section.title }}</h2>
      <p v-for="paragraph in section.paragraphs" :key="paragraph">{{ paragraph }}</p>
    </section>
  </div>
</template>

<style scoped>
.markdown-body {
  font-size: var(--reading-font, 17px);
  line-height: 2.1;
  overflow-wrap: anywhere;
}
.markdown-body :deep(h2),
.markdown-body :deep(h3) {
  scroll-margin-top: calc(var(--header-height, 81px) + 30px);
  margin: 50px 0 20px;
  color: var(--color-text);
  font-weight: 500;
  line-height: 1.5;
}
.markdown-body :deep(h2) {
  font-size: 24px;
}
.markdown-body :deep(h3) {
  font-size: 20px;
}
.markdown-body :deep(p),
.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  margin-top: 20px;
  color: var(--color-muted);
}
.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  padding-left: 1.5em;
}
.markdown-body :deep(ul) {
  list-style: disc;
}
.markdown-body :deep(ol) {
  list-style: decimal;
}
.markdown-body :deep(a) {
  color: var(--color-acid);
  text-decoration: underline;
}
.markdown-body :deep(blockquote) {
  border-left: 3px solid var(--color-acid);
  margin: 24px 0;
  padding-left: 20px;
}
.markdown-body :deep(pre) {
  overflow-x: auto;
  max-width: 100%;
  padding: 20px;
  margin: 24px 0;
  background: var(--color-surface);
  font: 13px/1.8 var(--font-mono);
}
.markdown-body :deep(code) {
  font-family: var(--font-mono);
}
.markdown-body :deep(img) {
  max-width: 100%;
  height: auto;
}
.markdown-body :deep(table) {
  display: block;
  overflow-x: auto;
  margin: 24px 0;
  border-collapse: collapse;
}
.markdown-body :deep(th),
.markdown-body :deep(td) {
  border: 1px solid var(--color-line);
  padding: 8px 14px;
}
.markdown-body :deep(.katex-display) {
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  padding-block: 10px;
}
.markdown-body :deep(.katex) {
  font-size: 1.05em;
}
</style>
