<script setup>
import { onMounted, ref } from 'vue';

import ExplorerMascot from './ExplorerMascot.vue';
import { MOTION } from '@/shared/motion/tokens.js';
import { useMotionScope } from '@/shared/motion/use-motion-scope.js';
import { useMotionPreference } from '@/shared/motion/use-motion-preference.js';

const root = ref(/** @type {HTMLElement|null} */ (null));
const lid = ref(/** @type {SVGGElement|null} */ (null));
const glow = ref(/** @type {SVGGElement|null} */ (null));
const sparks = ref(/** @type {SVGGElement|null} */ (null));
const rays = ref(/** @type {SVGGElement|null} */ (null));
const rim = ref(/** @type {SVGPathElement|null} */ (null));
const chestBody = ref(/** @type {SVGSVGElement|null} */ (null));
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
    `translate(0 ${-value * MOTION.chest.lidLift}) rotate(${-value * MOTION.chest.lidAngle} 175 99)`,
  );
  const light = Math.max(0, Math.min(1, value));
  glow.value?.setAttribute('opacity', String(light));
  rim.value?.setAttribute('opacity', String(light));
  rays.value?.setAttribute(
    'transform',
    `rotate(${Math.sin(elapsed * MOTION.chest.raySpeed) * MOTION.chest.rayAngle} 129 111)`,
  );
  // 粒子预建，逐帧只更新坐标和透明度，不创建 SVG 节点或 Vue 响应式数组。
  Array.from(sparks.value?.children ?? []).forEach((node, index) => {
    const phase = (elapsed * MOTION.chest.sparkSpeed + index / MOTION.chest.sparkCount) % 1;
    const x = 125 + Math.sin(index * 2.4) * (12 + phase * 62);
    const y = 108 - phase * MOTION.chest.sparkRise;
    node.setAttribute(
      'transform',
      `translate(${x} ${y}) scale(${0.5 + Math.sin(phase * Math.PI) * 0.7})`,
    );
    node.setAttribute('opacity', String(Math.sin(phase * Math.PI) * light));
  });
}
onMounted(() => paint(0));
// 高频弹簧状态在闭包内；共享调度器负责离屏/后台暂停及卸载退订。
useMotionScope(root, (delta) => {
  elapsed += delta;
  // 待机只摇晃与顶盖，不自动开启发光；点击才揭示箱内资源。
  const phase = elapsed % MOTION.chest.interval;
  const shaking = action <= 0 && phase < MOTION.chest.shake;
  const envelope = shaking ? Math.sin((phase / MOTION.chest.shake) * Math.PI) : 0;
  const tilt = Math.sin(elapsed * MOTION.chest.shakeSpeed) * MOTION.chest.shakeAngle * envelope;
  chestBody.value?.style.setProperty('transform', `rotate(${tilt}deg)`);
  action = Math.max(0, action - delta);
  const target = action > MOTION.chest.cycle * 0.3 ? 1 : hovering.value ? 0.18 : 0;
  const { stiffness, damping, mass } = MOTION.chest;
  velocity += (((target - position) * stiffness - velocity * damping) / mass) * delta;
  position += velocity * delta;
  paint();
  if (action <= 0) {
    glow.value?.setAttribute('opacity', '0');
    if (shaking) lid.value?.setAttribute('transform', `translate(0 ${-Math.abs(tilt) * 1.2})`);
  }
  if (action === 0 && opened.value) opened.value = false;
});
</script>

<template>
  <div class="treasure-scene">
    <div class="scene-grid" aria-hidden="true" />
    <span class="coordinate">VAULT_01 / KEEP THE GOOD STUFF</span>
    <div class="vault-mascot"><ExplorerMascot /></div>
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
        ref="chestBody"
        viewBox="0 0 240 200"
        role="img"
        aria-label="金属包角的像素木宝箱"
        shape-rendering="crispEdges"
      >
        <defs>
          <radialGradient id="vault-halo">
            <stop stop-color="#fff6bd" stop-opacity=".8" />
            <stop offset=".35" stop-color="#f9c34d" stop-opacity=".34" />
            <stop offset="1" stop-color="#eaa429" stop-opacity="0" />
          </radialGradient>
          <linearGradient id="vault-beam" x1="0" y1="1" x2="0" y2="0">
            <stop stop-color="#fff5c2" stop-opacity=".8" />
            <stop offset=".5" stop-color="#ffd16b" stop-opacity=".28" />
            <stop offset="1" stop-color="#ffbd43" stop-opacity="0" />
          </linearGradient>
          <linearGradient id="vault-gold" x1="0" y1="0" x2="0.8" y2="1">
            <stop stop-color="#fff0a9" />
            <stop offset=".4" stop-color="#d5a24e" />
            <stop offset="1" stop-color="#88602f" />
          </linearGradient>
        </defs>
        <ellipse cx="127" cy="180" rx="92" ry="10" fill="#000" opacity=".4" />
        <g ref="glow" opacity="0" pointer-events="none">
          <ellipse cx="126" cy="97" rx="109" ry="100" fill="url(#vault-halo)" />
          <ellipse cx="129" cy="174" rx="97" ry="18" fill="url(#vault-halo)" />
          <g ref="rays" fill="url(#vault-beam)">
            <path d="M100 117L27 5h47l57 112z" />
            <path d="M115 118L98 -4h42l4 122z" />
            <path d="M130 116L180 0h46l-73 120z" />
          </g>
          <g ref="sparks" fill="#fff3b8">
            <path
              v-for="index in MOTION.chest.sparkCount"
              :key="index"
              d="M-2-6h4v4h4v4H2v4h-4V2h-4v-4h4z"
            />
          </g>
        </g>
        <!-- 三分之四视角：侧面、箱内暗部、前面与盖子分层，保持光源藏在箱内。 -->
        <path d="M174 103l29-15v68l-28 21z" fill="#3c2924" stroke="#1c1918" stroke-width="5" />
        <path d="M181 111l15-8v43l-15 11z" fill="#73452d" />
        <path d="M185 107l8-4v43l-8 6z" fill="#a27b40" />
        <path d="M47 108l28-18h125l-28 22z" fill="#211c22" stroke="#a5793a" stroke-width="5" />
        <path d="M63 105l18-9h103l-18 12z" fill="#100f15" />
        <path d="M49 112h126v57l-9 10H57l-8-9z" fill="#6c3629" stroke="#211a1a" stroke-width="5" />
        <path d="M57 118h109v12H57z" fill="#a5663e" />
        <path d="M57 134h109v12H57z" fill="#885035" />
        <path d="M57 151h109v12H57z" fill="#925334" />
        <path d="M82 124h27v3H82zm57 14h21v3h-21zm-53 17h29v3H86z" fill="#4d2d27" />
        <path d="M51 110h17v63H51zm101 0h18v63h-18z" fill="url(#vault-gold)" />
        <path d="M51 110h5v57h-5zm101 0h5v57h-5z" fill="#f4d582" />
        <path d="M50 166h122v9H50z" fill="#a77736" />
        <path d="M56 166h109v3H56z" fill="#e0b763" />
        <path d="M57 121h5v5h-5zm0 32h5v5h-5zm101-32h5v5h-5zm0 32h5v5h-5z" fill="#553e29" />
        <path d="M48 110h126v5H48l27-20h126v5H77z" fill="#f5ce74" />
        <path ref="rim" d="M53 108h117l26-15h-117z" fill="#fff9d8" opacity="0" />
        <g ref="lid">
          <path
            d="M46 108V84l8-13 13-8h107l27 16v15l-27 17z"
            fill="#472f25"
            stroke="#211a1a"
            stroke-width="5"
          />
          <path d="M174 70l23 13v10l-23 14z" fill="#8a5932" />
          <path d="M49 87l12-16h101l12 16v23H49z" fill="#ae6a3c" />
          <path d="M61 71h101l9 11H52z" fill="#cc8c50" />
          <path d="M54 89h115v8H54z" fill="#885039" />
          <path
            d="M51 78l11-13h14L65 81v26H51zm97-13h15l12 16v26h-15V81z"
            fill="url(#vault-gold)"
          />
          <path d="M63 66h8l-11 15h-6zM151 66h8l11 14h-6z" fill="#fff0b1" />
          <path d="M47 103h128v10H47z" fill="#d5a650" />
          <path d="M48 103h126v3H48z" fill="#ffe3a1" />
          <path d="M99 99h29v31H99z" fill="#442e22" />
          <path d="M102 98h24v28h-24z" fill="url(#vault-gold)" />
          <path d="M107 102h14v18h-14z" fill="#ffe7a0" />
          <path d="M111 106h6v7h-2v5h-3v-5h-1z" fill="#473523" />
          <path d="M56 88h5v5h-5zm108 0h5v5h-5z" fill="#fff0b3" />
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
  transform-origin: 50% 88%;
}
.vault-mascot {
  position: absolute;
  left: 3%;
  bottom: 75px;
  transform: scale(1);
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
    transform: scale(0.78);
  }
}
</style>
