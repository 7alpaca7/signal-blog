<script setup>
import { nextTick, onMounted, onScopeDispose, ref, watch } from 'vue';
import { RouterView, useRoute, useRouter } from 'vue-router';

import AmbientBackground from '@/shared/effects/AmbientBackground.vue';
import { MOTION_CSS } from '@/shared/motion/tokens.js';
import { provideMotionScheduler } from '@/shared/motion/use-motion-scope.js';
import { useMotionPreference } from '@/shared/motion/use-motion-preference.js';
import InitialLoader from '@/shared/navigation/InitialLoader.vue';
import RouteTransition from '@/shared/navigation/RouteTransition.vue';

import BlogLayout from './layouts/BlogLayout.vue';
import { useRoutePrefetch } from './router/use-route-prefetch.js';

provideMotionScheduler();
const route = useRoute();
const router = useRouter();
const motion = useMotionPreference();
const prefetch = useRoutePrefetch();
const opening = ref(true);
const contentReady = ref(false);
onMounted(async () => {
  await nextTick();
  contentReady.value = true;
});
async function completeOpening() {
  opening.value = false;
  await nextTick();
  const heading = document.querySelector('main h1');
  if (heading instanceof HTMLElement) {
    heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
  }
}
const transitioning = ref(false);
const direction = ref('forward');
const transitionKey = ref(0);
// 在懒加载路由组件前就给出点击反馈，避免下载完成后才开始播放转场。
const removeBeforeHook = router.beforeEach((to, from) => {
  if (opening.value || to.path === from.path || !motion.active) return;
  direction.value = to.name === 'article' ? 'forward' : 'backward';
  transitionKey.value += 1;
  transitioning.value = true;
});
const removeAfterHook = router.afterEach((_to, _from, failure) => {
  if (failure) transitioning.value = false;
});
const removeErrorHook = router.onError(() => {
  transitioning.value = false;
});
watch(
  () => motion.active,
  (active) => {
    if (!active) transitioning.value = false;
  },
);
onScopeDispose(() => {
  removeBeforeHook();
  removeAfterHook();
  removeErrorHook();
});
</script>

<template>
  <div class="app-shell" :style="MOTION_CSS" :data-motion="motion.active ? 'on' : 'off'">
    <AmbientBackground :quiet="route.name === 'article'" :suspended="opening || transitioning" />
    <div
      :inert="opening || undefined"
      @pointerover="prefetch"
      @focusin="prefetch"
      @pointerdown="prefetch"
    >
      <BlogLayout><RouterView /></BlogLayout>
    </div>
    <InitialLoader :ready="contentReady" @complete="completeOpening" />
    <RouteTransition
      :key="transitionKey"
      :active="transitioning"
      :direction="direction"
      @complete="transitioning = false"
    />
  </div>
</template>

<style scoped>
.app-shell {
  position: relative;
  isolation: isolate;
  min-height: 100dvh;
}
</style>
