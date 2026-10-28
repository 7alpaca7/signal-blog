import { onMounted, onScopeDispose } from 'vue';

/**
 * 布局拥有页头尺寸，将测量值暴露为共享 CSS 变量；窄屏换行后目录/进度仍对齐。
 * @param {import('vue').Ref<HTMLElement|null>} header
 */
export function useHeaderOffset(header) {
  /** @type {ResizeObserver|undefined} */ let observer;
  onMounted(() => {
    observer = new ResizeObserver(([entry]) => {
      document.documentElement.style.setProperty(
        '--header-height',
        `${entry.target.getBoundingClientRect().height}px`,
      );
    });
    if (header.value) observer.observe(header.value);
  });
  onScopeDispose(() => {
    observer?.disconnect();
    document.documentElement.style.removeProperty('--header-height');
  });
}
