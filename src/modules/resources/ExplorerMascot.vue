<script setup>
import { ref } from 'vue';

import { MOTION } from '@/shared/motion/tokens.js';
import { useMotionScope } from '@/shared/motion/use-motion-scope.js';
import { useMotionPreference } from '@/shared/motion/use-motion-preference.js';

const root = ref(/** @type {HTMLElement|null} */ (null));
const hand = ref(/** @type {SVGGElement|null} */ (null));
const face = ref(/** @type {SVGGElement|null} */ (null));
const greeting = ref(false);
const motion = useMotionPreference();
let elapsed = 0;
let feedback = 0;
/** 资源页专属招呼，不复用饮料或害羞动作，也不控制宝箱时钟。 */
function greet() {
  feedback = MOTION.explorer.wave;
  greeting.value = motion.active ? true : !greeting.value;
}
useMotionScope(root, (delta) => {
  elapsed += delta;
  feedback = Math.max(0, feedback - delta);
  const phase = elapsed % MOTION.explorer.interval;
  const waving = feedback > 0 || phase < MOTION.explorer.wave;
  const angle = waving
    ? Math.sin(elapsed * MOTION.explorer.waveSpeed) * MOTION.explorer.waveAngle
    : 0;
  hand.value?.setAttribute('transform', `rotate(${angle} 87 75)`);
  const blink =
    phase > MOTION.explorer.blink && phase < MOTION.explorer.blink + MOTION.mascot.blinkLength;
  face.value?.setAttribute(
    'transform',
    `translate(0 ${blink ? 61 : 0}) scale(1 ${blink ? 0.05 : 1})`,
  );
  if (!feedback && greeting.value) greeting.value = false;
});
</script>

<template>
  <button
    ref="root"
    class="explorer"
    type="button"
    aria-label="和探险家小黄脸打招呼"
    :aria-pressed="greeting"
    @click="greet"
  >
    <svg
      viewBox="0 0 120 130"
      role="img"
      aria-label="戴探险帽、挥手的小黄脸"
      shape-rendering="crispEdges"
    >
      <path d="M26 47h10V37h44v10h12v12h7v34h-8v12H79v8H37v-8H26V93h-8V60h8z" fill="#b8d849" />
      <path d="M25 49h11V39h41v10h12v12h6v30h-8v11H76v7H37v-8H26V91h-7V61h6z" fill="#d9ff61" />
      <g ref="face" fill="#20261b"><path d="M37 61h6v13h-6zm30 0h6v13h-6z" /></g>
      <path d="M35 84h6v6h29v-6h6v10H65v6H47v-6H35z" fill="#20261b" />
      <path d="M23 51V33h9V22h44v7h8v22z" fill="#b28a50" />
      <path d="M32 27h36v7H32z" fill="#dec18a" />
      <path d="M23 42h61v10H23z" fill="#665033" />
      <path d="M13 50h82v9H13z" fill="#d7b97e" />
      <path d="M18 58h73v5H18z" fill="#8e703f" />
      <path d="M63 40h13v11H63z" fill="#d9ff61" />
      <path d="M67 43h5v5h-5z" fill="#455028" />
      <path d="M33 104l12 10h25l12-10v16H33z" fill="#ac7d48" />
      <path d="M43 108h28v7H43z" fill="#e6c991" />
      <g ref="hand">
        <path d="M85 85h9V70h-3V56h5v10h3V50h5v16h3V54h5v18h-4v16h-9v8H85z" fill="#d9ff61" />
        <path d="M95 75h10v4H95z" fill="#a6c546" />
      </g>
      <g v-if="greeting" fill="#d9ff61">
        <path d="M94 16h4v-5h4v5h5v4h-5v5h-4v-5h-4z" />
        <path d="M8 26h4v-5h4v5h5v4h-5v5h-4v-5H8z" />
      </g>
    </svg>
    <span>{{ greeting ? 'HELLO, EXPLORER! ✦' : '一起发现好东西 ↗' }}</span>
  </button>
</template>

<style scoped>
.explorer {
  display: block;
  padding: 0;
  border: 0;
  background: transparent;
  width: 155px;
  color: var(--color-acid);
}
svg {
  display: block;
  width: 100%;
  overflow: visible;
}
span {
  display: block;
  margin-top: 8px;
  font: 9px var(--font-mono);
  white-space: nowrap;
}
</style>
