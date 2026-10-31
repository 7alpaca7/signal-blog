<script setup>
import { onMounted, ref } from 'vue';

import PixelMascot from '@/shared/brand/PixelMascot.vue';
import { MOTION } from '@/shared/motion/tokens.js';
import { useMotionScope } from '@/shared/motion/use-motion-scope.js';
import { useMotionPreference } from '@/shared/motion/use-motion-preference.js';

const root = ref(/** @type {HTMLElement|null} */ (null));
const lid = ref(/** @type {SVGGElement|null} */ (null));
const glow = ref(/** @type {SVGGElement|null} */ (null));
const motion = useMotionPreference();
const opened = ref(false);
let elapsed = 0;
let action = 0;
let position = 0;
let velocity = 0;
const hovering = ref(false);

/** 点击只触发宝箱轨道，不触碰旁边小黄脸的动作时钟。 */
function openChest() {
  if (action > 0) return;
  action = MOTION.chest.cycle;
  opened.value = true;
  if (!motion.active) {
    opened.value = !root.value?.hasAttribute('data-open');
    root.value?.toggleAttribute('data-open', opened.value);
    paint(opened.value ? 1 : 0);
    action = 0;
  }
}
function paint(value = position) {
  lid.value?.setAttribute(
    'transform',
    `translate(0 ${-value * 32}) rotate(${-value * 12} 170 100)`,
  );
  glow.value?.setAttribute('opacity', String(Math.max(0, value)));
}
onMounted(() => paint(0));
// 高频弹簧状态在闭包内；共享调度器负责离屏/后台暂停及卸载退订。
useMotionScope(root, (delta) => {
  elapsed += delta;
  if (elapsed >= MOTION.chest.interval && action <= 0) {
    elapsed = 0;
    action = MOTION.chest.cycle;
    opened.value = true;
  }
  action = Math.max(0, action - delta);
  const target = action > MOTION.chest.cycle * 0.3 ? 1 : hovering.value ? 0.18 : 0;
  const { stiffness, damping, mass } = MOTION.chest;
  velocity += (((target - position) * stiffness - velocity * damping) / mass) * delta;
  position += velocity * delta;
  paint();
  if (action === 0 && opened.value) opened.value = false;
});
</script>

<template>
  <div class="treasure-scene">
    <div class="scene-grid" aria-hidden="true" />
    <span class="coordinate">VAULT_01 / KEEP THE GOOD STUFF</span>
    <div class="vault-mascot"><PixelMascot beverage="fanta" reaction="affection" /></div>
    <button
      ref="root"
      class="chest"
      type="button"
      :aria-pressed="opened"
      aria-label="打开像素宝箱"
      @click="openChest"
      @pointerenter="hovering = true"
      @pointerleave="hovering = false"
      @focus="hovering = true"
      @blur="hovering = false"
    >
      <svg
        viewBox="0 0 240 200"
        role="img"
        aria-label="金属包角的像素木宝箱"
        shape-rendering="crispEdges"
      >
        <ellipse cx="126" cy="178" rx="90" ry="9" fill="#000" opacity=".3" />
        <g ref="glow" opacity="0">
          <path
            d="M65 122 L43 24 L79 50 L111 17 L145 47 L186 26 L175 128Z"
            fill="#d9ff61"
            opacity=".13"
          />
          <path
            d="M62 53h5v-5h5v5h5v5h-5v5h-5v-5h-5z M168 35h5v-5h5v5h5v5h-5v5h-5v-5h-5z"
            fill="#d9ff61"
          />
          <path d="M109 57h24v30h-24z" fill="#e9eddc" />
          <path d="M114 65h14v3h-14zm0 7h10v3h-10z" fill="#748942" />
        </g>
        <path d="M48 109h145v57h-8v9H56v-9h-8z" fill="#5f3828" stroke="#201c18" stroke-width="6" />
        <path d="M58 120h126v10H58zm0 26h126v10H58z" fill="#875137" />
        <path d="M55 110h17v61H55zm111 0h17v61h-17z" fill="#b2a16c" />
        <path d="M58 114h5v45h-5zm111 0h5v45h-5z" fill="#e0cd8c" />
        <g ref="lid">
          <path
            d="M48 110V83h9V72h125v11h11v27z"
            fill="#9c633d"
            stroke="#201c18"
            stroke-width="6"
          />
          <path d="M59 80h112v8H59z" fill="#bf8753" />
          <path d="M48 103h145v10H48z" fill="#c7b275" />
          <path d="M57 76h16v28H57zm109 0h16v28h-16z" fill="#dbc88c" />
          <path d="M109 101h25v29h-25z" fill="#d9ff61" stroke="#242d1c" stroke-width="4" />
          <path d="M119 109h6v11h-6z" fill="#303b22" />
        </g>
      </svg>
    </button>
    <span class="scene-caption">{{
      opened ? 'FOUND SOMETHING GOOD ✦' : '点击宝箱，发现一点好东西 ↗'
    }}</span>
  </div>
</template>

<style scoped>
.treasure-scene {
  position: relative;
  width: 100%;
  min-height: 340px;
  border: 1px solid var(--color-line);
  background: #151a15;
  overflow: hidden;
}
.scene-grid {
  position: absolute;
  inset: 45% -30% -80%;
  background:
    linear-gradient(#d9ff6114 1px, transparent 1px),
    linear-gradient(90deg, #d9ff6114 1px, transparent 1px);
  background-size: 28px 28px;
  transform: perspective(260px) rotateX(55deg);
}
.coordinate {
  position: absolute;
  top: 18px;
  left: 18px;
  font: 9px var(--font-mono);
  color: var(--color-muted);
}
.chest {
  position: absolute;
  width: 245px;
  right: 4%;
  bottom: 36px;
  border: 0;
  background: transparent;
  padding: 0;
}
.chest svg {
  display: block;
  width: 100%;
  overflow: visible;
}
.vault-mascot {
  position: absolute;
  left: 3%;
  bottom: 80px;
  transform: scale(0.67);
  transform-origin: bottom left;
}
.scene-caption {
  position: absolute;
  bottom: 16px;
  left: 20px;
  font: 10px var(--font-mono);
  color: var(--color-acid);
}
@media (max-width: 400px) {
  .chest {
    width: 210px;
    right: 0;
  }
  .vault-mascot {
    left: 0;
    transform: scale(0.55);
  }
}
</style>
