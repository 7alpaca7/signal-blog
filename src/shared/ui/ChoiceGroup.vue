<script setup>
import { nextTick, onMounted, onScopeDispose, ref, watch } from 'vue';

const props = defineProps({
  modelValue: { type: String, default: '' },
  options: {
    type: /** @type {import('vue').PropType<{value: string, label: string, count?: number}[]>} */ (
      Array
    ),
    required: true,
  },
  label: { type: String, required: true },
  variant: { type: String, default: 'category' },
  toggleable: { type: Boolean, default: false },
});
const emit = defineEmits(['update:modelValue']);
const root = ref(/** @type {HTMLElement|null} */ (null));
const ready = ref(false);
const selected = ref(false);
/** @type {ResizeObserver|undefined} */
let observer;

function measureSelection() {
  const group = root.value;
  if (!group) return;
  const button = [...group.querySelectorAll('button')].find(
    (element) => element.dataset.value === props.modelValue,
  );
  selected.value = !!button;
  if (!button) return;
  // offset 坐标不受按下缩放影响；直接设置 CSS 变量，避免测量结果触发 Vue 重绘循环。
  group.style.setProperty('--choice-x', `${button.offsetLeft}px`);
  group.style.setProperty('--choice-y', `${button.offsetTop}px`);
  group.style.setProperty('--choice-width', `${button.offsetWidth}px`);
  group.style.setProperty('--choice-height', `${button.offsetHeight}px`);
  ready.value = true;
}
watch(
  () => [props.modelValue, props.options],
  async () => {
    await nextTick();
    measureSelection();
  },
);
onMounted(() => {
  measureSelection();
  // 分组换行与断点切换均重新测量；观察器随组件卸载断开，不创建常驻 RAF。
  observer = new ResizeObserver(measureSelection);
  if (root.value) observer.observe(root.value);
});
onScopeDispose(() => observer?.disconnect());
</script>

<template>
  <div
    ref="root"
    class="choice-group"
    :class="[variant, { ready, 'has-selection': selected }]"
    role="group"
    :aria-label="label"
  >
    <span class="selection" aria-hidden="true" />
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      :data-value="option.value"
      :aria-pressed="modelValue === option.value"
      @click="
        emit('update:modelValue', toggleable && modelValue === option.value ? '' : option.value)
      "
    >
      <span>{{ option.label }}</span
      ><span v-if="option.count !== undefined" class="count">{{ option.count }}</span>
    </button>
  </div>
</template>

<style scoped>
.choice-group {
  position: relative;
  isolation: isolate;
}
.category {
  display: grid;
  gap: 4px;
}
.selection {
  position: absolute;
  top: 0;
  left: 0;
  width: var(--choice-width, 0px);
  height: var(--choice-height, 0px);
  transform: translate(var(--choice-x, 0px), var(--choice-y, 0px));
  background: var(--color-acid);
  opacity: 0;
  pointer-events: none;
  z-index: -1;
}
.ready .selection {
  transition:
    transform var(--motion-choice) var(--motion-choice-ease),
    width var(--motion-choice) var(--motion-choice-ease),
    height var(--motion-choice) var(--motion-choice-ease),
    opacity var(--motion-control);
}
.has-selection .selection {
  opacity: 1;
}
button {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  min-height: 44px;
  text-align: left;
  background: transparent;
  border: 1px solid transparent;
  transition:
    color var(--motion-control),
    transform var(--motion-control) var(--motion-choice-ease),
    border-color var(--motion-control);
}
button:hover {
  border-color: color-mix(in srgb, var(--color-acid) 40%, transparent);
}
button:active {
  transform: translateY(1px) scale(0.98);
}
.category button[aria-pressed='true'] {
  color: var(--color-bg);
}
.count {
  font: 11px var(--font-mono);
  opacity: 0.7;
}
.topic {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}
.topic .selection {
  background: color-mix(in srgb, var(--color-acid) 13%, transparent);
  box-shadow: inset 0 0 0 1px var(--color-acid);
}
.topic button {
  font-size: 11px;
  padding: 8px;
  border-color: var(--color-line);
}
.topic button[aria-pressed='true'] {
  color: var(--color-acid);
  border-color: transparent;
}
@media (max-width: 700px) {
  .category {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }
}
</style>
