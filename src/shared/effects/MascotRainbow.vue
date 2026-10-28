<script setup>
import { onMounted, ref } from 'vue';

const canvas = ref(/** @type {HTMLCanvasElement|null} */ (null));
onMounted(() => {
  const ctx = canvas.value?.getContext('2d');
  if (!ctx) return;
  // 阶梯式像素彩虹，六条色带共用一个几何中心，不遮住脸和饮料。
  const colors = ['#ff8a9b', '#ffb96e', '#f4ef86', '#a5e99b', '#83d8f3', '#c4a6ff'];
  for (let y = 0; y < 72; y += 3)
    for (let x = 0; x < 150; x += 3) {
      const radius = Math.hypot(x - 75, y - 72);
      const band = Math.floor((69 - radius) / 5);
      if (band < 0 || band >= colors.length) continue;
      ctx.fillStyle = colors[band];
      ctx.fillRect(x, y, 3, 3);
    }
});
</script>

<template>
  <span class="rainbow-celebration" aria-hidden="true"
    ><canvas ref="canvas" class="pixel-rainbow" width="150" height="75" /><span class="spark left"
      >✦</span
    ><span class="spark right">✦</span></span
  >
</template>

<style scoped>
.rainbow-celebration {
  position: absolute;
  inset: -38px 0 auto;
  height: 80px;
  pointer-events: none;
  z-index: 2;
  animation: rainbow-cheer var(--motion-peace) ease-out both;
}
.pixel-rainbow {
  display: block;
  width: 160px;
  max-width: 100%;
  height: 80px;
  margin: auto;
  image-rendering: pixelated;
}
.spark {
  position: absolute;
  top: 54px;
  color: #fff5b8;
  font: 22px var(--font-mono);
}
.left {
  left: 9px;
}
.right {
  right: 9px;
  color: #c4a6ff;
}
@keyframes rainbow-cheer {
  0% {
    opacity: 0;
    transform: translateY(14px) scale(0.75);
  }
  18% {
    opacity: 1;
    transform: translateY(0) scale(1.04);
  }
  45%,
  65% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-15px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .rainbow-celebration {
    animation: none;
  }
}
</style>
