<script setup>
import { computed, onMounted, onScopeDispose, ref, watch } from 'vue';

import MascotRainbow from '@/shared/effects/MascotRainbow.vue';
import { MOTION } from '@/shared/motion/tokens.js';
import { useMotionScope } from '@/shared/motion/use-motion-scope.js';
import { useMotionPreference } from '@/shared/motion/use-motion-preference.js';

import { renderMascot } from './mascot-renderer.js';
import { advanceMascot, createMascotState, showAffection, showPeace } from './mascot-state.js';

const props = defineProps({
  size: { type: String, default: 'large' },
  mode: {
    type: /** @type {import('vue').PropType<import('./mascot-state.js').MascotMode>} */ (String),
    default: 'auto',
  },
  beverage: {
    type: /** @type {import('vue').PropType<'fanta'|'sprite'|'trio'>} */ (String),
    default: 'fanta',
  },
  reaction: {
    type: /** @type {import('vue').PropType<'affection'|'peace'>} */ (String),
    default: 'affection',
  },
  interactive: { type: Boolean, default: true },
});
const element = ref(/** @type {HTMLElement|null} */ (null));
const canvas = ref(/** @type {HTMLCanvasElement|null} */ (null));
const motion = useMotionPreference();
const state = createMascotState();
const canInteract = computed(() => props.interactive && props.size !== 'small');
const hearts = ref(/** @type {{id:number, drift:number}[]} */ ([]));
const action = ref('idle');
const celebrating = ref(false);
const celebrationId = ref(0);
const caption = computed(() => {
  if (celebrating.value) return 'PEACE & LOVE_';
  if (action.value === 'drinking') {
    if (props.beverage === 'trio') return 'COLA + SPRITE + FANTA_';
    return props.beverage === 'sprite' ? 'SPRITE BREAK_' : 'FANTA BREAK_';
  }
  return 'KEEP EXPLORING_';
});
let feedbackTimer = /** @type {ReturnType<typeof setTimeout>|undefined} */ (undefined);
let sincePaint = 0;
let lastBlink = false;
let wasChanging = false;
let heartId = 0,
  x = 0,
  y = 0,
  vx = 0,
  vy = 0,
  targetX = 0,
  targetY = 0;

function paint() {
  const ctx = canvas.value?.getContext('2d');
  if (ctx) renderMascot(ctx, state, props.mode, props.beverage);
}
function advance(/** @type {number} */ delta) {
  const mode = props.size === 'small' ? 'idle' : props.mode;
  advanceMascot(state, delta, mode);
  const spring = MOTION.spring;
  vx += ((targetX - x) * spring.stiffness - vx * spring.damping) * delta;
  vy += ((targetY - y) * spring.stiffness - vy * spring.damping) * delta;
  x += vx * delta;
  y += vy * delta;
  const bob =
    props.size === 'small'
      ? 0
      : Math.sin((state.time * Math.PI * 2) / MOTION.mascot.float) * MOTION.mascot.floatDistance;
  if (canvas.value)
    canvas.value.style.transform = `translate(${x}px,${y + bob}px) rotate(${props.size === 'small' ? 0 : -7}deg)`;
  action.value = state.drinkTime >= 0 ? 'drinking' : 'idle';
  sincePaint += delta;
  const blink = state.time % MOTION.mascot.blink > MOTION.mascot.blink - MOTION.mascot.blinkLength;
  const changing = state.drinkTime >= 0 || state.blush > 0 || state.peace > 0;
  // 浮动走 CSS transform，静止面孔只在眨眼边界重画；饮料与腮红保持稳定绘制节奏。
  if (
    (changing && sincePaint >= 1 / MOTION.mascot.fps) ||
    blink !== lastBlink ||
    (wasChanging && !changing)
  ) {
    sincePaint %= 1 / MOTION.mascot.fps;
    paint();
  }
  lastBlink = blink;
  wasChanging = changing;
}
function move(/** @type {PointerEvent} */ event) {
  if (!motion.active || !canInteract.value || event.pointerType === 'touch') return;
  const rect = element.value?.getBoundingClientRect();
  if (!rect) return;
  targetX = (event.clientX - rect.left - rect.width / 2) * MOTION.spring.attraction;
  targetY = (event.clientY - rect.top - rect.height / 2) * MOTION.spring.attraction;
}
function affection() {
  if (props.reaction === 'peace') {
    showPeace(state);
    celebrating.value = true;
    celebrationId.value++;
  } else showAffection(state);
  clearTimeout(feedbackTimer);
  feedbackTimer = setTimeout(
    () => {
      hearts.value = [];
      state.blush = 0;
      state.peace = 0;
      celebrating.value = false;
      paint();
    },
    (props.reaction === 'peace' ? MOTION.mascot.peace : MOTION.mascot.blush) * 1000,
  );
  hearts.value = [
    ...hearts.value,
    ...Array.from({ length: 4 }, () => ({ id: heartId++, drift: Math.random() * 50 - 25 })),
  ].slice(-16);
  paint();
}
function removeHeart(/** @type {number} */ id) {
  hearts.value = hearts.value.filter((heart) => heart.id !== id);
}
watch(
  () => props.mode,
  () => {
    state.drinkTime = -1;
    state.time = 0;
    paint();
  },
);
watch(
  () => motion.active,
  (active) => {
    if (!active) {
      hearts.value = [];
      state.blush = 0;
      state.peace = 0;
      celebrating.value = false;
      if (canvas.value) canvas.value.style.transform = '';
      paint();
    }
  },
);
onMounted(paint);
onScopeDispose(() => clearTimeout(feedbackTimer));
useMotionScope(element, advance, { enabled: () => props.size !== 'small' });
</script>

<template>
  <component
    :is="canInteract ? 'button' : 'span'"
    ref="element"
    :class="['pixel-mascot', size, { trio: beverage === 'trio' }]"
    :type="canInteract ? 'button' : undefined"
    :aria-label="canInteract ? '逗逗小黄脸' : '像素笑脸'"
    :data-action="action"
    :data-beverage="beverage"
    :data-reaction="celebrating ? 'peace' : 'affection'"
    @pointermove="move"
    @pointerleave="
      targetX = 0;
      targetY = 0;
    "
    @click="canInteract && affection()"
  >
    <MascotRainbow v-if="celebrating" :key="celebrationId" />
    <canvas
      ref="canvas"
      :width="size === 'small' ? 50 : 100"
      :height="size === 'small' ? 40 : beverage === 'trio' ? 100 : 80"
      aria-hidden="true"
    />
    <span class="heart-layer" aria-hidden="true"
      ><span
        v-for="heart in hearts"
        :key="heart.id"
        class="pixel-heart"
        :style="{ '--heart-drift': `${heart.drift}px`, left: `${25 + (heart.id % 4) * 15}%` }"
        @animationend="removeHeart(heart.id)"
        >♥</span
      ></span
    >
    <span v-if="canInteract" class="caption" aria-hidden="true">{{ caption }}</span>
  </component>
</template>

<style scoped>
.pixel-mascot {
  position: relative;
  display: inline-block;
  width: 190px;
  height: 185px;
  border: 0;
  padding: 0;
  background: transparent;
  flex-shrink: 0;
  isolation: isolate;
}
canvas {
  /* 扩展画布只为左手留空间，反向偏移后脸和右手饮料保持原来的位置与大小。 */
  position: relative;
  left: -19.047619%;
  width: 119.047619%;
  transform-origin: 58% 50%;
  height: 100%;
  image-rendering: pixelated;
  pointer-events: none;
}
/* 三杯多留底部空间；缩放倍率不变，脸和左手不缩小，也不裁切举杯起始帧。 */
.trio canvas {
  height: 125%;
  transform-origin: 58% 40%;
}
.trio .caption {
  top: 125%;
}
.small {
  width: 32px;
  height: 30px;
}
.caption {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  text-align: center;
  color: var(--color-orange);
  font: 10px var(--font-mono);
}
.heart-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.pixel-heart {
  position: absolute;
  top: 30%;
  color: #ff8aaa;
  font-size: 0;
  width: 14px;
  height: 14px;
  background: currentColor;
  clip-path: polygon(
    0 14%,
    14% 14%,
    14% 0,
    43% 0,
    43% 14%,
    57% 14%,
    57% 0,
    86% 0,
    86% 14%,
    100% 14%,
    100% 57%,
    86% 57%,
    86% 71%,
    71% 71%,
    71% 86%,
    57% 86%,
    57% 100%,
    43% 100%,
    43% 86%,
    29% 86%,
    29% 71%,
    14% 71%,
    14% 57%,
    0 57%
  );
  animation: mascot-love var(--motion-heart) ease-out both;
}
@keyframes mascot-love {
  0% {
    opacity: 0;
    transform: scale(0.5);
  }
  15% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translate(var(--heart-drift), -90px) scale(1.15);
  }
}
@media (prefers-reduced-motion: reduce) {
  .pixel-heart {
    animation: none;
    top: 0;
  }
}
</style>
