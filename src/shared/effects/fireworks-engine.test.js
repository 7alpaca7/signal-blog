import { describe, expect, it } from 'vitest';

import { createFireworksEngine } from './fireworks-engine.js';

describe('烟花批次调度', () => {
  it('数量范围含 1 和 5，每 5 秒再发射，自动清理过期粒子', () => {
    const single = createFireworksEngine(() => 0);
    expect(single.launch(1024, 800)).toBe(1);
    const multiple = createFireworksEngine(() => 0.999);
    multiple.advance(0, 1024, 800);
    expect(multiple.snapshot().shells).toHaveLength(5);
    multiple.advance(4.9, 1024, 800);
    expect(multiple.snapshot().shells.every((shell) => shell.born < 1)).toBe(true);
    multiple.advance(0.1, 1024, 800);
    expect(multiple.snapshot().shells.filter((shell) => shell.born >= 5)).toHaveLength(5);
    multiple.clear();
    expect(multiple.snapshot().shells).toHaveLength(0);
  });
  it('一次发射后大小与颜色不随帧重采样', () => {
    const engine = createFireworksEngine(() => 0.4);
    engine.advance(0, 1024, 800);
    const first = engine.snapshot().shells[0];
    const hue = first.hue,
      radius = first.radius;
    engine.advance(0.05, 1024, 800);
    expect(first.hue).toBe(hue);
    expect(first.radius).toBe(radius);
  });
});
