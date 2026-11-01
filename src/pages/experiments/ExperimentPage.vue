<script setup>
import { computed, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';

import { useResources } from '@/modules/resources/index.js';

const route = useRoute();
const resources = useResources();
const resource = computed(() =>
  resources.find((item) => item.preview === `/experiments/${route.params.id}`),
);
const frame = ref(/** @type {HTMLIFrameElement|null} */ (null));
const loaded = ref(false);
const message = ref('');
/** 在独立 iframe 内保留原作品的样式和生命周期；脚本不共享博客的同源权限。 */
async function fullscreen() {
  try {
    await frame.value?.requestFullscreen();
  } catch {
    message.value = '当前浏览器不支持全屏，可直接在下方体验。';
  }
}
</script>

<template>
  <section v-if="resource" class="experiment-page">
    <div class="experiment-toolbar">
      <RouterLink to="/articles?category=创意实验">← 创意实验</RouterLink>
      <span>{{ resource.name }}</span>
      <RouterLink :to="`/resources/${resource.id}`">源码与素材说明 ↗</RouterLink>
      <button type="button" @click="fullscreen">全屏体验 ⤢</button>
    </div>
    <p v-if="!loaded" role="status" class="loading">正在载入作品…</p>
    <p v-if="message" role="status">{{ message }}</p>
    <iframe
      ref="frame"
      :src="resource.embedUrl"
      title="奶蛙 UNWOVEN 交互作品"
      sandbox="allow-scripts"
      allow="fullscreen"
      allowfullscreen
      referrerpolicy="no-referrer"
      @load="loaded = true"
    />
    <p class="experiment-note">
      原作品独立运行 · 拖拽影像体验交互 · 图片来自外部素材地址，加载状态以作品内提示为准。
    </p>
  </section>
  <section v-else class="page">
    <h1>这件作品还没有入库。</h1>
    <RouterLink to="/articles?category=创意实验">返回创意实验 ↗</RouterLink>
  </section>
</template>

<style scoped>
.experiment-page {
  width: 100%;
}
.experiment-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 18px;
  padding: 14px var(--page-gutter);
  border-bottom: 1px solid var(--color-line);
  font-size: 12px;
}
.experiment-toolbar > span {
  color: var(--color-muted);
  margin-right: auto;
}
.experiment-toolbar a {
  color: var(--color-acid);
}
.experiment-toolbar button {
  font-size: 11px;
}
iframe {
  display: block;
  border: 0;
  width: 100%;
  height: calc(100dvh - var(--header-height, 81px) - 74px);
  min-height: 650px;
  background: #f8f8f5;
}
iframe:fullscreen {
  height: 100dvh;
}
.loading,
.experiment-note {
  padding: 12px var(--page-gutter);
  color: var(--color-muted);
  font-size: 11px;
}
@media (max-width: 640px) {
  iframe {
    height: 85dvh;
    min-height: 650px;
  }
  .experiment-toolbar > span {
    flex-basis: 100%;
    order: 3;
  }
}
</style>
