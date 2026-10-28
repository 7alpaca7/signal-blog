<script setup>
import { RouterLink } from 'vue-router';

import PixelMascot from '@/shared/brand/PixelMascot.vue';
</script>

<template>
  <section class="page not-found">
    <PixelMascot />
    <p class="eyebrow">404 / OUT OF SIGNAL</p>
    <h1>这条信号暂时没有抵达。</h1>
    <p>页面可能已移动，回到记录里继续探索吧。</p>
    <RouterLink class="text-link" to="/articles">查看全部记录 ↗</RouterLink>
  </section>
</template>

<style scoped>
.not-found {
  display: grid;
  justify-items: center;
  text-align: center;
  gap: 25px;
  min-height: 70vh;
  align-content: center;
}
.not-found h1 {
  font-size: clamp(24px, 4vw, 36px);
  font-weight: 500;
}
.not-found > p:last-of-type {
  color: var(--color-muted);
}
</style>
