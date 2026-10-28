import { onScopeDispose, ref, shallowRef, watch } from 'vue';

/**
 * 读取随 key 变化的资源。切换时取消旧请求，并用序号拒绝迟到的结果。
 * @template T
 * @param {() => string} getKey
 * @param {(key: string, signal: AbortSignal) => Promise<T>} loader
 */
export function useAsyncResource(getKey, loader) {
  const data = /** @type {import('vue').ShallowRef<T|null>} */ (shallowRef(null));
  const status = ref('loading');
  const error = ref('');
  let sequence = 0;
  /** @type {AbortController|undefined} */
  let controller;

  async function reload() {
    controller?.abort();
    controller = new AbortController();
    const current = ++sequence;
    status.value = 'loading';
    error.value = '';
    data.value = null;
    try {
      const result = await loader(getKey(), controller.signal);
      if (current !== sequence) return;
      data.value = result;
      status.value = 'success';
    } catch (cause) {
      if (current !== sequence || controller.signal.aborted) return;
      status.value = 'error';
      error.value = cause instanceof Error ? cause.message : '暂时无法读取内容，请重试。';
    }
  }

  watch(getKey, reload, { immediate: true });
  onScopeDispose(() => {
    sequence += 1;
    controller?.abort();
  });
  return { data, status, error, reload };
}
