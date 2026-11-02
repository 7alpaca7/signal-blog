<script setup>
import { onMounted, ref, watch } from 'vue';

import { drawColaFriend } from '@/shared/brand/cola-renderer.js';
import { MOTION } from '@/shared/motion/tokens.js';
import { useMotionScope } from '@/shared/motion/use-motion-scope.js';

const props = defineProps({
  active: { type: Boolean, default: false },
  ready: { type: Boolean, default: false },
  error: { type: String, default: '' },
  direction: { type: String, default: 'forward' },
});
const emit = defineEmits(['complete', 'retry']);
const root = ref(/** @type {HTMLElement|null} */ (null));
const canvas = ref(/** @type {HTMLCanvasElement|null} */ (null));
const phase = ref('举起可乐');
let elapsed = 0;
// 缓存命中时可能在幕布首次挂载前就绪，仍需释放 App 的交互锁。
watch(
  () => [props.active, props.ready],
  () => {
    if (props.active && props.ready && !root.value) emit('complete');
  },
  { flush: 'post', immediate: true },
);

function paint() {
  const ctx = canvas.value?.getContext('2d');
  if (!ctx) return;
  // 同一原稿按转场时间映射：快速举杯、喝下、满足微笑，不另画简化角色。
  const time = Math.min(elapsed / MOTION.route, 0.999) * MOTION.cola.cycle;
  const result = drawColaFriend(ctx, time);
  if (phase.value !== result.phase) phase.value = result.phase;
}
useMotionScope(root, (delta) => {
  elapsed += delta;
  elapsed %= MOTION.route;
  paint();
});
onMounted(paint);
</script>

<template>
  <Transition name="route-reveal" @after-leave="emit('complete')">
    <div
      v-if="active && !ready"
      ref="root"
      class="route-curtain"
      :class="direction"
      role="status"
      aria-label="正在准备页面"
      data-beverage="cola"
    >
      <canvas
        ref="canvas"
        width="128"
        height="128"
        :data-phase="phase"
        aria-label="小黄脸喝可乐转场"
      />
      <span v-if="error" role="alert">{{ error }}</span>
      <span v-else>喝口可乐，正在准备页面全部资源。</span>
      <button v-if="error" type="button" @click="emit('retry')">重新加载页面 ↻</button>
      <small>COLA BREAK / KEEP EXPLORING_</small>
    </div>
  </Transition>
</template>

<style scoped>
.route-curtain {
  position: fixed;
  inset: 0;
  z-index: 30;
  display: flex;
  flex-direction: column;
  gap: 14px;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  background: #363046;
  color: #f0f0e8;
}
canvas {
  width: min(256px, 65vw);
  height: auto;
  image-rendering: pixelated;
}
span {
  font-size: 16px;
  letter-spacing: 2px;
}
small {
  font: 9px var(--font-mono);
  letter-spacing: 1.5px;
  color: #c5bfd2;
}
.route-reveal-enter-active,
.route-reveal-leave-active {
  transition:
    opacity var(--motion-control) ease,
    clip-path var(--motion-control) cubic-bezier(0.7, 0, 0.3, 1);
}
.route-reveal-enter-from,
.route-reveal-leave-to {
  opacity: 0;
}
.route-reveal-enter-from.forward,
.route-reveal-leave-to.backward {
  clip-path: inset(100% 0 0);
}
.route-reveal-enter-from.backward,
.route-reveal-leave-to.forward {
  clip-path: inset(0 0 100%);
}
</style>
