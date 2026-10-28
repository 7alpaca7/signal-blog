<script setup>
import { onMounted, ref } from 'vue';

import { drawColaFriend } from '@/shared/brand/cola-renderer.js';
import { MOTION } from '@/shared/motion/tokens.js';
import { useMotionScope } from '@/shared/motion/use-motion-scope.js';

defineProps({
  active: { type: Boolean, default: false },
  direction: { type: String, default: 'forward' },
});
const emit = defineEmits(['complete']);
const root = ref(/** @type {HTMLElement|null} */ (null));
const canvas = ref(/** @type {HTMLCanvasElement|null} */ (null));
const phase = ref('举起可乐');
let elapsed = 0;

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
  if (elapsed >= MOTION.route) {
    emit('complete');
    return;
  }
  paint();
});
onMounted(paint);
</script>

<template>
  <div
    v-if="active"
    ref="root"
    class="route-curtain"
    :class="direction"
    aria-hidden="true"
    data-beverage="cola"
  >
    <canvas
      ref="canvas"
      width="128"
      height="128"
      :data-phase="phase"
      aria-label="小黄脸喝可乐转场"
    />
    <span>喝口可乐，接着探索。</span>
    <small>COLA BREAK / KEEP EXPLORING_</small>
  </div>
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
  pointer-events: none;
  background: #363046;
  color: #f0f0e8;
  animation: route-cover var(--motion-route) cubic-bezier(0.7, 0, 0.3, 1) both;
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
@keyframes route-cover {
  0% {
    clip-path: inset(100% 0 0);
  }
  14%,
  83% {
    clip-path: inset(0);
  }
  100% {
    clip-path: inset(0 0 100%);
  }
}
.backward {
  animation-name: route-cover-back;
}
@keyframes route-cover-back {
  0% {
    clip-path: inset(0 0 100%);
  }
  14%,
  83% {
    clip-path: inset(0);
  }
  100% {
    clip-path: inset(100% 0 0);
  }
}
</style>
