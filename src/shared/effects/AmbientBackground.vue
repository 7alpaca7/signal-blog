<script setup>
import { onMounted, onScopeDispose, ref, watch } from 'vue';

import { MOTION } from '@/shared/motion/tokens.js';
import { useMotionScope } from '@/shared/motion/use-motion-scope.js';
import { useMotionPreference } from '@/shared/motion/use-motion-preference.js';

import { createFireworksEngine, drawFireworks } from './fireworks-engine.js';

const props = defineProps({
  quiet: { type: Boolean, default: false },
  suspended: { type: Boolean, default: false },
});
const canvas = ref(/** @type {HTMLCanvasElement|null} */ (null));
const motion = useMotionPreference();
const fireworks = createFireworksEngine();
/** @type {{x: number, y: number, phase: number}[]} */
let grid = [];
const buckets = Array.from(
  { length: MOTION.background.alphaLevels },
  () => /** @type {number[]} */ ([]),
);
const colors = buckets.map(
  (_, index) => `rgba(217,255,97,${(index / (buckets.length - 1)) * 0.65})`,
);
let width = 0,
  height = 0,
  time = 0,
  sincePaint = 0;
let pointerX = -500,
  pointerY = -500,
  x = -500,
  y = -500;
/** @type {ResizeObserver|undefined} */ let resizeObserver;
/** @type {{x:number,y:number,age:number}[]} */ let ripples = [];
function resize() {
  const element = canvas.value;
  if (!element) return;
  width = element.clientWidth;
  height = element.clientHeight;
  // 像素背景无需高 DPR 的大位图；保持 CSS 像素分辨率，减少全屏清除和合成带宽。
  const ratio = Math.min(devicePixelRatio || 1, MOTION.background.pixelRatio);
  grid = [];
  for (let gx = 10; gx < width; gx += MOTION.background.grid)
    for (let gy = 10; gy < height; gy += MOTION.background.grid)
      grid.push({ x: gx, y: gy, phase: gx * 0.014 + gy * 0.009 });
  element.width = width * ratio;
  element.height = height * ratio;
  element.getContext('2d')?.setTransform(ratio, 0, 0, ratio, 0, 0);
  paint();
}
function paint() {
  const ctx = canvas.value?.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, width, height);
  const config = MOTION.background;
  for (const bucket of buckets) bucket.length = 0;
  for (const point of grid) {
    const dx = point.x - x;
    const dy = point.y - y;
    const squared = dx * dx + dy * dy;
    const near =
      squared < config.pointerRadius ** 2 ? 1 - Math.sqrt(squared) / config.pointerRadius : 0;
    let glow = 0;
    for (const ripple of ripples) {
      const distance = Math.hypot(point.x - ripple.x, point.y - ripple.y);
      glow = Math.max(
        glow,
        Math.max(0, 1 - Math.abs(distance - ripple.age * 180) / 30) * (1 - ripple.age / 1.5),
      );
    }
    const crest = Math.max(0, Math.sin(point.phase - time * 0.85)) ** 14;
    const alpha = Math.min(0.65, 0.05 + crest * 0.15 + near * 0.3 + glow * 0.6);
    const bucket = buckets[Math.round((alpha / 0.65) * (buckets.length - 1))];
    bucket.push(point.x, point.y, glow > 0.2 ? 4 : 2);
  }
  // 将相近透明度的点批量绘制，避免每格创建颜色字符串并切换 Canvas 状态。
  buckets.forEach((bucket, index) => {
    if (!bucket.length) return;
    ctx.fillStyle = colors[index];
    for (let i = 0; i < bucket.length; i += 3)
      ctx.fillRect(bucket[i], bucket[i + 1], bucket[i + 2], bucket[i + 2]);
  });
  for (let band = 0; band < 5; band++) {
    ctx.strokeStyle = '#d9ff6128';
    ctx.beginPath();
    let previousY = 0;
    for (let gx = 0; gx <= width + 16; gx += 16) {
      const gy =
        90 +
        band * 145 +
        Math.round((Math.sin(gx / 145 - time * config.waveSpeed + band) * config.waveHeight) / 8) *
          8;
      if (!gx) ctx.moveTo(gx, gy);
      else {
        ctx.lineTo(gx, previousY);
        ctx.lineTo(gx, gy);
      }
      previousY = gy;
    }
    ctx.stroke();
    for (let j = 0; j < 3; j++) {
      const gx = ((time * config.packetSpeed + (j * width) / 3 + band * 101) % (width + 60)) - 30;
      const gy =
        90 +
        band * 145 +
        Math.round((Math.sin(gx / 145 - time * config.waveSpeed + band) * config.waveHeight) / 8) *
          8;
      ctx.fillStyle = '#d9ff6170';
      ctx.fillRect(gx, gy - 1, 9, 3);
    }
  }
  if (motion.active) drawFireworks(ctx, fireworks, height, width, props.quiet);
}
function frame(/** @type {number} */ delta) {
  time += delta;
  sincePaint += delta;
  x += (pointerX - x) * 0.08;
  y += (pointerY - y) * 0.08;
  ripples.forEach((ripple) => {
    ripple.age += delta;
  });
  ripples = ripples.filter((ripple) => ripple.age < 1.5);
  fireworks.advance(delta, width, height, props.quiet);
  const interval = 1 / (width < 600 ? MOTION.background.mobileFps : MOTION.background.fps);
  // RAF 时间戳有亚毫秒舍入；留出容差，避免 60 Hz 下因 16.6/16.7ms 波动误跳帧。
  if (sincePaint + MOTION.frameTolerance >= interval) {
    sincePaint = Math.max(0, sincePaint - interval) % interval;
    paint();
  }
}
function pointer(/** @type {PointerEvent} */ event) {
  pointerX = event.clientX;
  pointerY = event.clientY;
}
function click(/** @type {MouseEvent} */ event) {
  if (!motion.active) return;
  ripples.push({ x: event.clientX, y: event.clientY, age: 0 });
  ripples = ripples.slice(-8);
}
watch(
  () => motion.active,
  (active) => {
    if (!active) {
      fireworks.clear();
      ripples = [];
      paint();
    }
  },
);
onMounted(() => {
  resizeObserver = new ResizeObserver(resize);
  if (canvas.value) resizeObserver.observe(canvas.value);
  document.addEventListener('pointermove', pointer, { passive: true });
  document.addEventListener('click', click, { passive: true });
  resize();
});
onScopeDispose(() => {
  resizeObserver?.disconnect();
  document.removeEventListener('pointermove', pointer);
  document.removeEventListener('click', click);
});
useMotionScope(canvas, frame, { enabled: () => !props.suspended });
</script>

<template>
  <canvas
    ref="canvas"
    class="ambient-background"
    aria-hidden="true"
    :data-running="motion.active"
  />
</template>

<style scoped>
.ambient-background {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100dvh;
  z-index: -1;
  pointer-events: none;
}
</style>
