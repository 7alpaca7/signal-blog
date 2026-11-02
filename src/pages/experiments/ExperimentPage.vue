<script setup>
import { computed, onMounted, onScopeDispose, ref, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';

import { usePageReadiness } from '@/shared/navigation/page-readiness.js';

import { useResources } from '@/modules/resources/index.js';

const route = useRoute();
const resources = useResources();
const resource = computed(() =>
  resources.find((item) => item.preview === `/experiments/${route.params.id}`),
);
const frame = ref(/** @type {HTMLIFrameElement|null} */ (null));
const loaded = ref(false);
const readiness = usePageReadiness();
let releaseFrame = () => {};
watch(
  () => resource.value?.embedUrl,
  (url) => {
    releaseFrame();
    loaded.value = false;
    if (url) releaseFrame = readiness?.track() ?? (() => {});
  },
  { immediate: true },
);
onScopeDispose(() => releaseFrame());
const message = ref('');
const contentHeight = ref(650);
/** 沙箱 iframe 为不透明来源，只接受当前窗口的高度消息，不信任任意外部消息。 */
function receiveHeight(/** @type {MessageEvent} */ event) {
  if (event.source !== frame.value?.contentWindow) return;
  if (event.data?.type === 'signal:showcase-ready') {
    if (typeof event.data.error !== 'string') return;
    if (event.data.error) readiness?.fail(event.data.error.slice(0, 160));
    else loaded.value = true;
    releaseFrame();
    return;
  }
  if (event.data?.type !== 'signal:showcase-height') return;
  const height = event.data.height;
  if (typeof height === 'number' && Number.isFinite(height) && height >= 200 && height <= 50_000)
    contentHeight.value = Math.ceil(height);
}
onMounted(() => window.addEventListener('message', receiveHeight));
onScopeDispose(() => window.removeEventListener('message', receiveHeight));
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
      :key="resource.id"
      ref="frame"
      :src="resource.embedUrl"
      :style="{ '--experiment-height': `${contentHeight}px` }"
      :title="`${resource.name} · 在线体验`"
      sandbox="allow-scripts"
      allow="fullscreen"
      allowfullscreen
      referrerpolicy="no-referrer"
    />
    <p class="experiment-note">
      原作品独立运行 · 按作品内提示操作 · 图片来自外部素材地址，加载状态以作品内提示为准。
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
  height: var(--experiment-height, 650px);
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
  .experiment-toolbar > span {
    flex-basis: 100%;
    order: 3;
  }
}
</style>
