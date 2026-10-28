<script setup>
import { ref } from 'vue';
import { RouterLink } from 'vue-router';

import PixelMascot from '@/shared/brand/PixelMascot.vue';
import { useMotionPreference } from '@/shared/motion/use-motion-preference.js';
import { useHeaderOffset } from '@/shared/motion/use-header-offset.js';
const header = ref(/** @type {HTMLElement|null} */ (null));
useHeaderOffset(header);
const motion = useMotionPreference();
</script>

<template>
  <a class="skip-link" href="#main-content">跳至正文</a>
  <header ref="header" class="site-header">
    <RouterLink class="brand" to="/" aria-label="SIGNAL 首页"
      ><PixelMascot size="small" /><strong>SIGNAL<sup>®</sup></strong></RouterLink
    >
    <nav aria-label="主导航">
      <RouterLink to="/" exact-active-class="is-active">首页</RouterLink
      ><RouterLink to="/articles" active-class="is-active">全部记录</RouterLink>
    </nav>
    <button
      class="motion-toggle"
      type="button"
      :aria-pressed="motion.active"
      :disabled="motion.reduced"
      @click="motion.toggle"
    >
      {{ motion.reduced ? '减少动态效果' : motion.active ? '动效 ON' : '动效 OFF' }}</button
    ><span class="demo-badge">DEMO / 示例内容</span>
  </header>
  <main id="main-content"><slot /></main>
  <footer class="site-footer">
    <strong>SIGNAL®</strong><span>THINK. MAKE. DOCUMENT. REPEAT.</span
    ><span>保持好奇，继续记录 ↗</span>
  </footer>
</template>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 45px;
  padding: 20px var(--page-gutter);
  background: var(--color-bg);
  border-bottom: 1px solid var(--color-line);
}
.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}
.brand strong {
  font-size: 24px;
  letter-spacing: -1px;
}
sup {
  font-size: 10px;
}
nav {
  display: flex;
  gap: 25px;
  font-size: 13px;
  color: var(--color-muted);
}
nav a {
  display: flex;
  align-items: center;
}
.is-active {
  color: var(--color-acid);
}
.motion-toggle {
  margin-left: auto;
  font: 11px var(--font-mono);
  color: var(--color-acid);
  white-space: nowrap;
}
.demo-badge {
  font: 10px var(--font-mono);
  color: var(--color-muted);
}
.site-footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 20px;
  padding: 28px var(--page-gutter);
  border-top: 1px solid var(--color-line);
  font: 11px var(--font-mono);
  color: var(--color-muted);
}
.skip-link {
  position: fixed;
  top: -100px;
  left: 20px;
  z-index: 20;
  background: var(--color-acid);
  color: var(--color-bg);
  padding: 10px;
}
.skip-link:focus {
  top: 10px;
}
@media (max-width: 640px) {
  .site-header {
    gap: 20px;
    flex-wrap: wrap;
    padding-block: 12px;
  }
  nav {
    margin-left: auto;
    gap: 15px;
  }
  .demo-badge {
    display: none;
  }
}
</style>
