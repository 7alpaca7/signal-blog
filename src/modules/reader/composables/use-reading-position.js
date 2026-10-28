import { onMounted, onScopeDispose, ref, watch } from 'vue';

/**
 * 章节位置只在内容/尺寸变化时测量；scroll 事件合并到单次待执行 RAF，避免每次滚动强制布局。
 * 此 RAF 仅在滚动时存在，卸载取消；不建立第二个常驻动画循环。
 * @param {import('vue').Ref<HTMLElement|null>} article
 */
export function useReadingPosition(article) {
  const progress = ref(0);
  const activeHeading = ref('');
  let start = 0;
  let distance = 1;
  let headerHeight = 81;
  let pendingFrame = 0;
  /** @type {{id: string, top: number}[]} */
  let headings = [];
  /** @type {ResizeObserver|undefined} */
  let observer;

  function update() {
    pendingFrame = 0;
    if (!article.value) return;
    const scrollY = window.scrollY;
    progress.value = Math.round(Math.max(0, Math.min(1, (scrollY - start) / distance)) * 1000);
    let current = headings[0]?.id || '';
    for (const heading of headings) {
      if (heading.top > scrollY + headerHeight + 80) break;
      current = heading.id;
    }
    activeHeading.value = current;
  }
  function scheduleUpdate() {
    if (!pendingFrame) pendingFrame = requestAnimationFrame(update);
  }
  function measure() {
    const root = article.value;
    if (!root) return;
    headerHeight =
      Number.parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--header-height'),
      ) || 81;
    const scrollY = window.scrollY;
    start = root.getBoundingClientRect().top + scrollY - headerHeight - 24;
    distance = Math.max(1, root.offsetHeight - window.innerHeight + 160);
    headings = [
      ...root.querySelectorAll('section[id], .markdown-body h2[id], .markdown-body h3[id]'),
    ].map((heading) => ({ id: heading.id, top: heading.getBoundingClientRect().top + scrollY }));
    scheduleUpdate();
  }
  function seek(/** @type {number} */ value) {
    window.scrollTo({ top: start + (distance * value) / 1000, behavior: 'instant' });
  }
  watch(
    article,
    (element) => {
      observer?.disconnect();
      headings = [];
      if (element) observer?.observe(element);
      measure();
    },
    { flush: 'post' },
  );
  onMounted(() => {
    observer = new ResizeObserver(measure);
    if (article.value) observer.observe(article.value);
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', measure);
    measure();
  });
  onScopeDispose(() => {
    observer?.disconnect();
    cancelAnimationFrame(pendingFrame);
    window.removeEventListener('scroll', scheduleUpdate);
    window.removeEventListener('resize', measure);
  });
  return { progress, activeHeading, seek };
}
