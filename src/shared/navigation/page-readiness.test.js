import { flushPromises } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import { createPageReadiness } from './page-readiness.js';

describe('页面加载就绪协调', () => {
  it('路由提交后仍等待全部异步正文任务，重复完成不会减成负数', async () => {
    const state = createPageReadiness(() => null);
    const a = state.track();
    const b = state.track();
    state.commit();
    a();
    a();
    await flushPromises();
    expect(state.ready.value).toBe(false);
    expect(state.pending.value).toBe(1);
    b();
    await flushPromises();
    expect(state.ready.value).toBe(true);
    state.dispose();
  });
  it('旧导航完成不能解锁新导航，销毁后不再改变状态', async () => {
    const state = createPageReadiness(() => null);
    const old = state.track();
    state.begin();
    const current = state.track();
    state.commit();
    old();
    await flushPromises();
    expect(state.pending.value).toBe(1);
    expect(state.ready.value).toBe(false);
    state.dispose();
    current();
    await flushPromises();
    expect(state.ready.value).toBe(false);
  });
  it('首屏图片失败后放行，屏外懒加载图片不阻塞', async () => {
    const root = document.createElement('div');
    root.innerHTML = '<main><img><img></main>';
    const [first, below] = root.querySelectorAll('img');
    Object.defineProperty(first, 'complete', { value: false });
    first.getBoundingClientRect = () => ({ top: 20, bottom: 120 });
    below.getBoundingClientRect = () => ({ top: 100000, bottom: 100100 });
    const state = createPageReadiness(() => root);
    state.commit();
    await flushPromises();
    expect(state.ready.value).toBe(false);
    expect(first.loading).toBe('eager');
    expect(below.loading).not.toBe('eager');
    first.dispatchEvent(new Event('error'));
    await flushPromises();
    expect(state.ready.value).toBe(true);
    state.dispose();
  });
});
