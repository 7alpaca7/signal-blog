import { inject, onMounted, onScopeDispose, provide, ref, watch } from 'vue';

import { createFrameScheduler } from './frame-scheduler.js';
import { useMotionPreference } from './use-motion-preference.js';

/** @type {import('vue').InjectionKey<ReturnType<typeof createFrameScheduler>>} */
const SCHEDULER = Symbol('motion-scheduler');

/** App 创建并持有调度器；卸载时释放唯一的 document 监听。 */
export function provideMotionScheduler() {
  const scheduler = createFrameScheduler();
  const preference = useMotionPreference();
  const visible = ref(!document.hidden);
  const onVisibility = () => {
    visible.value = !document.hidden;
  };
  provide(SCHEDULER, scheduler);
  watch(
    () => preference.active && visible.value,
    (value) => scheduler.setActive(value),
    { immediate: true },
  );
  document.addEventListener('visibilitychange', onVisibility);
  onScopeDispose(() => {
    document.removeEventListener('visibilitychange', onVisibility);
    scheduler.dispose();
  });
}

/**
 * 元素可见且启用时订阅；节点被 v-if 移除或卸载后立即退订。
 * @param {import('vue').Ref<HTMLElement|null>} element
 * @param {(delta: number) => void} draw
 * @param {{enabled?: () => boolean}} options 静态角色可关闭持续订阅。
 */
export function useMotionScope(element, draw, options = {}) {
  const injectedScheduler = inject(SCHEDULER);
  if (!injectedScheduler) throw new Error('App 尚未提供 motion scheduler。');
  const scheduler = injectedScheduler;
  let unsubscribe = () => {};
  let intersecting = false;
  /** @type {IntersectionObserver|undefined} */
  let observer;
  function updateSubscription() {
    unsubscribe();
    unsubscribe =
      intersecting && (options.enabled?.() ?? true) ? scheduler.subscribe(draw) : () => {};
  }
  watch(() => options.enabled?.() ?? true, updateSubscription);
  watch(
    element,
    (current, previous) => {
      if (previous) observer?.unobserve(previous);
      intersecting = false;
      updateSubscription();
      if (current) observer?.observe(current);
    },
    { flush: 'post' },
  );
  onMounted(() => {
    observer = new IntersectionObserver(([entry]) => {
      intersecting = entry.isIntersecting;
      updateSubscription();
    });
    if (element.value) observer.observe(element.value);
  });
  onScopeDispose(() => {
    unsubscribe();
    observer?.disconnect();
  });
}
