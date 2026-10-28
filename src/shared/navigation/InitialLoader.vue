<script setup>
import { onMounted, onScopeDispose, ref, watch } from 'vue';

import { drawColaFriend } from '@/shared/brand/cola-renderer.js';
import { MOTION } from '@/shared/motion/tokens.js';
import { useMotionScope } from '@/shared/motion/use-motion-scope.js';
import { useMotionPreference } from '@/shared/motion/use-motion-preference.js';

const props = defineProps({ ready: { type: Boolean, default: false } });
const emit = defineEmits(['complete']);
const root = ref(/** @type {HTMLElement|null} */ (null));
const canvas = ref(/** @type {HTMLCanvasElement|null} */ (null));
const skipButton = ref(/** @type {HTMLButtonElement|null} */ (null));
const motion = useMotionPreference();
const visible = ref(true);
const phase = ref('等一小会儿');
const completedCycle = ref(false);
let elapsed = 0;
const previousOverflow = document.documentElement.style.overflow;
function restoreScroll() {
  document.documentElement.style.overflow = previousOverflow;
}
function complete() {
  restoreScroll();
  emit('complete');
}
onScopeDispose(restoreScroll);

function finish() {
  if (!props.ready) return;
  visible.value = false;
}
function paint() {
  const ctx = canvas.value?.getContext('2d');
  if (!ctx) return;
  const frame = drawColaFriend(ctx, elapsed, { reduced: !motion.active });
  if (phase.value !== frame.phase) phase.value = frame.phase;
}
function frame(/** @type {number} */ delta) {
  if (!visible.value) return;
  elapsed += delta;
  // 首次开场保留一轮动作；不伪造加载百分比，内容就绪后始终允许用户跳过。
  if (elapsed >= MOTION.cola.cycle) {
    completedCycle.value = true;
    if (props.ready) {
      finish();
      return;
    }
    elapsed %= MOTION.cola.cycle;
  }
  paint();
}
watch(
  () => [props.ready, motion.active, completedCycle.value],
  () => {
    if (props.ready && (!motion.active || completedCycle.value)) finish();
  },
);
onMounted(() => {
  document.documentElement.style.overflow = 'hidden';
  paint();
  if (props.ready && !motion.active) finish();
  else skipButton.value?.focus({ preventScroll: true });
});
useMotionScope(root, frame);
</script>

<template>
  <Transition name="initial-loader" @after-leave="complete">
    <section
      v-if="visible"
      ref="root"
      class="initial-loader"
      role="dialog"
      aria-modal="true"
      aria-label="小黄脸喝可乐开场动画"
    >
      <header><span>SIGNAL :)</span><span>LOADING MOTION / COLA BREAK</span></header>
      <div class="loader-scene">
        <canvas
          ref="canvas"
          width="128"
          height="128"
          role="img"
          aria-label="小黄脸举起红色 COLA 杯，喝一口，满足地微笑，再轻轻放下"
          :data-phase="phase"
        />
        <h2>稍等，喝口可乐。</h2>
        <p>A LITTLE BREAK. MORE GOOD IDEAS.</p>
        <div class="loader-dots" aria-hidden="true"><i /><i /><i /><i /></div>
      </div>
      <footer>
        <span role="status">{{ phase }}</span
        ><button ref="skipButton" type="button" :disabled="!ready" @click="finish">
          {{ ready ? '跳过开场，进入博客 ↗' : '正在准备内容…' }}
        </button>
      </footer>
    </section>
  </Transition>
</template>

<style scoped>
.initial-loader {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: flex;
  flex-direction: column;
  background: var(--color-bg);
  color: var(--color-text);
}
header {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding: 28px var(--page-gutter);
  font: 10px var(--font-mono);
  letter-spacing: 1.8px;
  color: var(--color-muted);
}
header span:first-child {
  color: var(--color-acid);
  font-weight: 700;
}
.loader-scene {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px 20px 45px;
}
canvas {
  width: 288px;
  height: 288px;
  max-width: 90%;
  image-rendering: pixelated;
}
h2 {
  font-size: 20px;
  font-weight: 400;
  letter-spacing: 2px;
  margin-bottom: 13px;
}
p {
  font: 10px var(--font-mono);
  letter-spacing: 2px;
  color: var(--color-muted);
  text-align: center;
}
.loader-dots {
  display: flex;
  gap: 7px;
  margin-top: 20px;
  height: 12px;
  align-items: center;
}
i {
  width: 5px;
  height: 5px;
  background: var(--color-acid);
}
footer {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 24px;
  padding: 18px 20px;
  border-top: 1px solid var(--color-line);
  background: var(--color-surface);
  font: 11px var(--font-mono);
  color: var(--color-muted);
}
button {
  font-size: 11px;
}
.initial-loader-leave-active {
  transition:
    opacity var(--motion-loader),
    clip-path var(--motion-loader) cubic-bezier(0.7, 0, 0.3, 1);
  pointer-events: none;
}
.initial-loader-leave-to {
  opacity: 0;
  clip-path: inset(0 0 100% 0);
}
@media (max-width: 420px) {
  header {
    padding: 20px;
    font-size: 8px;
  }
  canvas {
    width: 256px;
    height: 256px;
  }
  h2 {
    font-size: 17px;
  }
}
</style>
