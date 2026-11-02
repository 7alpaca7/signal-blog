import { inject, nextTick, onScopeDispose, provide, ref, watch } from 'vue';

/** @type {import('vue').InjectionKey<ReturnType<typeof createPageReadiness>>} */
const PAGE_READINESS = Symbol('page-readiness');
const ASSET_WAIT_MS = 6000;

/**
 * 等待首屏图片、字体完成或失败；不等待屏外懒加载图片，也不让外部资源永久阻塞导航。
 * @param {HTMLElement|null} root
 * @param {AbortSignal} signal
 */
async function waitForFirstScreen(root, signal) {
  if (!root || signal.aborted) return;
  await new Promise((resolve) => {
    const cleanups = /** @type {Array<() => void>} */ ([]);
    let remaining = 1;
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      cleanups.forEach((cleanup) => cleanup());
      resolve(undefined);
    };
    const done = () => {
      remaining -= 1;
      if (!remaining) finish();
    };
    signal.addEventListener('abort', finish, { once: true });
    cleanups.push(() => signal.removeEventListener('abort', finish));
    const timer = setTimeout(finish, ASSET_WAIT_MS);
    cleanups.push(() => clearTimeout(timer));
    for (const image of root.querySelectorAll('main img')) {
      if (!(image instanceof HTMLImageElement)) continue;
      const bounds = image.getBoundingClientRect();
      if (bounds.top >= innerHeight || bounds.bottom <= 0) continue;
      remaining += 1;
      let settled = false;
      const loaded = () => {
        if (settled) return;
        settled = true;
        image.removeEventListener('load', loaded);
        image.removeEventListener('error', loaded);
        // decode 保证已下载图片可以呈现；失败也放行，由正文显示原有错误状态。
        Promise.resolve(image.decode?.())
          .catch(() => {})
          .finally(done);
      };
      cleanups.push(() => {
        image.removeEventListener('load', loaded);
        image.removeEventListener('error', loaded);
      });
      image.addEventListener('load', loaded, { once: true });
      image.addEventListener('error', loaded, { once: true });
      image.loading = 'eager';
      if (image.complete) loaded();
    }
    remaining += 1;
    Promise.resolve(document.fonts?.ready)
      .catch(() => {})
      .finally(done);
    done();
  });
}

/**
 * 每次导航建立独立代次，旧请求的完成不能解锁新页面。
 * @param {() => HTMLElement|null} getRoot
 */
export function createPageReadiness(getRoot) {
  const ready = ref(false);
  const pending = ref(0);
  const committed = ref(false);
  let epoch = 0;
  let disposed = false;
  let controller = new AbortController();
  function begin() {
    epoch += 1;
    controller.abort();
    ready.value = false;
    pending.value = 0;
    committed.value = false;
  }
  function commit() {
    committed.value = true;
  }
  function track() {
    const current = epoch;
    pending.value += 1;
    ready.value = false;
    let released = false;
    return () => {
      if (released || current !== epoch || disposed) return;
      released = true;
      pending.value -= 1;
    };
  }
  const stop = watch(
    [pending, committed],
    async ([count, mounted]) => {
      controller.abort();
      controller = new AbortController();
      const signal = controller.signal;
      if (count || !mounted) return;
      await nextTick();
      await waitForFirstScreen(getRoot(), signal);
      await nextTick();
      if (!signal.aborted && !disposed && !pending.value) ready.value = true;
    },
    { flush: 'post' },
  );
  function dispose() {
    disposed = true;
    controller.abort();
    stop();
  }
  return { ready, pending, begin, commit, track, dispose };
}

/** App 装配页面加载协调器。 */
export function providePageReadiness(/** @type {() => HTMLElement|null} */ getRoot) {
  const state = createPageReadiness(getRoot);
  provide(PAGE_READINESS, state);
  onScopeDispose(state.dispose);
  return state;
}

/** 可独立运行的资源组件在没有 App 提供器时无需等待。 */
export function usePageReadiness() {
  return inject(PAGE_READINESS, null);
}
