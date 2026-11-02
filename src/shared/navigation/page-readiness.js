import { inject, nextTick, onScopeDispose, provide, ref, watch } from 'vue';

/** @type {import('vue').InjectionKey<ReturnType<typeof createPageReadiness>>} */
const PAGE_READINESS = Symbol('page-readiness');
/**
 * 当前页面全部图片主动加载并解码，字体完成后才就绪；失败返回明确错误，不按超时放行。
 * @param {HTMLElement|null} root
 * @param {AbortSignal} signal
 * @param {(message: string) => void} onFailure
 * @returns {Promise<string[]>}
 */
async function waitForPageAssets(root, signal, onFailure) {
  if (!root || signal.aborted) return [];
  return new Promise((resolve) => {
    const failures = /** @type {string[]} */ ([]);
    const cleanups = /** @type {Array<() => void>} */ ([]);
    let remaining = 1;
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      cleanups.forEach((cleanup) => cleanup());
      resolve(failures);
    };
    const done = () => {
      remaining -= 1;
      if (!remaining) finish();
    };
    signal.addEventListener('abort', finish, { once: true });
    cleanups.push(() => signal.removeEventListener('abort', finish));
    for (const image of root.querySelectorAll('img')) {
      if (!(image instanceof HTMLImageElement)) continue;
      remaining += 1;
      let settled = false;
      const loaded = async () => {
        if (settled) return;
        settled = true;
        image.removeEventListener('load', loaded);
        image.removeEventListener('error', loaded);
        try {
          if (!image.naturalWidth) throw new Error('image unavailable');
          await image.decode?.();
        } catch {
          const message = `${image.alt || '页面图片'}加载失败`;
          failures.push(message);
          if (!signal.aborted) onFailure(message);
        } finally {
          done();
        }
      };
      cleanups.push(() => {
        image.removeEventListener('load', loaded);
        image.removeEventListener('error', loaded);
      });
      image.addEventListener('load', loaded, { once: true });
      image.addEventListener('error', loaded, { once: true });
      image.loading = 'eager';
      if (image.complete) void loaded();
    }
    remaining += 1;
    Promise.resolve(document.fonts?.ready)
      .then(() => {
        if (document.fonts && [...document.fonts].some((font) => font.status === 'error'))
          failures.push('页面字体加载失败');
      })
      .catch(() => failures.push('页面字体加载失败'))
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
  const error = ref('');
  const committed = ref(false);
  let epoch = 0;
  let disposed = false;
  let controller = new AbortController();
  function begin() {
    epoch += 1;
    error.value = '';
    controller.abort();
    ready.value = false;
    pending.value = 0;
    committed.value = false;
  }
  function fail(/** @type {string} */ message) {
    error.value = message;
    ready.value = false;
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
      const failures = await waitForPageAssets(getRoot(), signal, fail);
      await nextTick();
      if (signal.aborted || disposed || pending.value) return;
      if (failures.length) fail(failures.join('；'));
      if (!error.value) ready.value = true;
    },
    { flush: 'post' },
  );
  function dispose() {
    disposed = true;
    controller.abort();
    stop();
  }
  return { ready, pending, error, fail, begin, commit, track, dispose };
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
