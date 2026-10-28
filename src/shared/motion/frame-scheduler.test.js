import { describe, expect, it, vi } from 'vitest';

import { createFrameScheduler } from './frame-scheduler.js';

describe('共享帧调度器', () => {
  it('多个效果仅使用一个 RAF，暂停/释放取消帧，恢复不补发大步长', () => {
    let tick;
    const request = vi.fn((callback) => {
      tick = callback;
      return 1;
    });
    const cancel = vi.fn();
    const scheduler = createFrameScheduler(request, cancel);
    const first = vi.fn(),
      second = vi.fn();
    const stopFirst = scheduler.subscribe(first);
    const stopSecond = scheduler.subscribe(second);
    scheduler.setActive(true);
    expect(request).toHaveBeenCalledTimes(1);
    tick(1000);
    tick(3000);
    expect(first).toHaveBeenLastCalledWith(0.05);
    scheduler.setActive(false);
    expect(cancel).toHaveBeenCalled();
    scheduler.setActive(true);
    tick(9000);
    expect(first).toHaveBeenLastCalledWith(0);
    stopFirst();
    stopSecond();
    scheduler.dispose();
    expect(cancel).toHaveBeenCalledTimes(2);
  });
});
