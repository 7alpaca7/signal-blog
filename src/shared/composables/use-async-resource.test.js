import { flushPromises } from '@vue/test-utils';
import { effectScope, nextTick, ref } from 'vue';
import { describe, expect, it } from 'vitest';

import { useAsyncResource } from './use-async-resource.js';

describe('异步资源生命周期', () => {
  it('丢弃不遵守 abort 的旧请求结果，并在销毁时中止当前请求', async () => {
    const key = ref('first');
    const requests = [];
    const scope = effectScope();
    const resource = scope.run(() =>
      useAsyncResource(
        () => key.value,
        (value, signal) => new Promise((resolve) => requests.push({ value, signal, resolve })),
      ),
    );
    key.value = 'second';
    await nextTick();
    expect(requests[0].signal.aborted).toBe(true);
    requests[1].resolve('new');
    await flushPromises();
    requests[0].resolve('old');
    await flushPromises();
    expect(resource.data.value).toBe('new');
    scope.stop();
    expect(requests[1].signal.aborted).toBe(true);
  });
  it('失败可重试，不将异常表示为空成功', async () => {
    let shouldFail = true;
    const scope = effectScope();
    const resource = scope.run(() =>
      useAsyncResource(
        () => 'article',
        async () => {
          if (shouldFail) throw new Error('读取失败');
          return '正文';
        },
      ),
    );
    await flushPromises();
    expect(resource.status.value).toBe('error');
    expect(resource.error.value).toBe('读取失败');
    shouldFail = false;
    await resource.reload();
    expect(resource.status.value).toBe('success');
    expect(resource.data.value).toBe('正文');
    scope.stop();
  });
});
