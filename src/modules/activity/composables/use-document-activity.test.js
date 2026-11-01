import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { afterEach, expect, it, vi } from 'vitest';

import { ACTIVITY_REPOSITORY } from '../services/activity-repository.js';
import { useDocumentActivity } from './use-document-activity.js';

let wrapper;
let state;
const Host = defineComponent({
  setup() {
    state = useDocumentActivity();
    return () => h('div');
  },
});
afterEach(() => {
  wrapper?.unmount();
  vi.useRealTimers();
});

it('请求失败可重试，旧请求不覆盖新窗口，卸载取消当前请求', async () => {
  vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] });
  vi.setSystemTime(new Date('2026-11-01T08:00:00+08:00'));
  let fail = true;
  const pending = [];
  const repository = {
    listByMonth: vi.fn((month, { signal }) => {
      if (fail) return Promise.reject(new Error('读取失败'));
      return new Promise((resolve) => pending.push({ month, signal, resolve }));
    }),
  };
  wrapper = mount(Host, { global: { provide: { [ACTIVITY_REPOSITORY]: repository } } });
  await flushPromises();
  expect(state.status.value).toBe('error');
  expect(state.error.value).toBe('读取失败');
  fail = false;
  void state.reload();
  const previous = pending.splice(0);
  state.month.value = '2026-10';
  await flushPromises();
  expect(previous.every((item) => item.signal.aborted)).toBe(true);
  pending.splice(0).forEach((item) => item.resolve({ entries: [], months: ['2026-10'] }));
  await flushPromises();
  expect(state.status.value).toBe('success');
  previous.forEach((item) =>
    item.resolve({ entries: [{ occurredAt: '2020-01-01T00:00:00+08:00' }], months: ['2020-01'] }),
  );
  await flushPromises();
  expect(state.changes.value).toEqual([]);
  void state.reload();
  wrapper.unmount();
  expect(pending.every((item) => item.signal.aborted)).toBe(true);
});

it('北京时间跨午夜自动更新今天，跨月窗口跟随当前月', async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-31T23:59:59+08:00'));
  wrapper = mount(Host, {
    global: {
      provide: {
        [ACTIVITY_REPOSITORY]: { listByMonth: async () => ({ entries: [], months: [] }) },
      },
    },
  });
  expect(state.today.value).toBe('2026-10-31');
  await vi.advanceTimersByTimeAsync(1100);
  expect(state.today.value).toBe('2026-11-01');
  expect(state.month.value).toBe('2026-11');
  wrapper.unmount();
  expect(vi.getTimerCount()).toBe(0);
});
