<script setup>
defineProps({ progress: { type: Number, required: true } });
defineEmits(['seek']);
</script>

<template>
  <div class="reading-rail">
    <span>{{ Math.round(progress / 10) }}%</span
    ><input
      type="range"
      min="0"
      max="1000"
      step="1"
      :value="progress"
      aria-label="滚动阅读位置"
      aria-orientation="vertical"
      @input="$emit('seek', Number(/** @type {HTMLInputElement} */ ($event.target).value))"
    /><span>READ</span>
  </div>
</template>

<style scoped>
.reading-rail {
  position: fixed;
  right: 8px;
  top: calc(var(--header-height, 81px) + 40px);
  bottom: 35px;
  z-index: 9;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  font: 9px var(--font-mono);
  color: var(--color-acid);
}
input {
  appearance: none;
  writing-mode: vertical-lr;
  direction: ltr;
  height: 100%;
  width: 16px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: ns-resize;
}
input::-webkit-slider-runnable-track {
  width: 2px;
  background: #d9ff6138;
}
input::-webkit-slider-thumb {
  appearance: none;
  width: 7px;
  height: 38px;
  background: var(--color-acid);
  margin-left: -2px;
}
input::-moz-range-track {
  width: 2px;
  background: #d9ff6138;
}
input::-moz-range-thumb {
  width: 7px;
  height: 38px;
  border: 0;
  border-radius: 0;
  background: var(--color-acid);
}
@media (max-width: 700px) {
  .reading-rail {
    right: 1px;
    top: calc(var(--header-height, 81px) + 40px);
  }
}
</style>
