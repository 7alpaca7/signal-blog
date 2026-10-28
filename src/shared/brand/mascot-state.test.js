import { describe, expect, it } from 'vitest';

import { advanceMascot, createMascotState, showAffection, showPeace } from './mascot-state.js';

describe('角色的独立动作轨道', () => {
  it('首页比耶轨道独立，归档实例不接收首页状态', () => {
    const home = createMascotState(() => 0),
      archive = createMascotState(() => 0);
    advanceMascot(home, 8, 'auto');
    advanceMascot(home, 1.6, 'auto');
    const drinkTime = home.drinkTime;
    showPeace(home);
    expect(home.peace).toBeGreaterThan(0);
    expect(home.drinkTime).toBe(drinkTime);
    expect(archive.peace).toBe(0);
    advanceMascot(home, 2.4, 'auto');
    expect(home.peace).toBe(0);
  });
  it('点击反馈不改变正在播放的饮料时钟', () => {
    const state = createMascotState(() => 0);
    advanceMascot(state, 8, 'auto');
    advanceMascot(state, 1.5, 'auto');
    const drinkTime = state.drinkTime;
    showAffection(state);
    expect(state.drinkTime).toBe(drinkTime);
    expect(state.blush).toBeGreaterThan(0);
    advanceMascot(state, 0.1, 'auto');
    expect(state.drinkTime).toBeCloseTo(drinkTime + 0.1);
  });
  it('一次芬达播放结束后恢复 idle，并等待下一次', () => {
    const state = createMascotState(() => 0);
    advanceMascot(state, 8, 'auto');
    advanceMascot(state, 5.6, 'auto');
    expect(state.drinkTime).toBe(-1);
    expect(state.nextDrink).toBeGreaterThan(state.time);
  });
});
