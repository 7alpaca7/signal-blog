import { MOTION } from '@/shared/motion/tokens.js';

/** @typedef {'auto'|'idle'|'cola'|'sprite'} MascotMode */
/** 基础动作与反馈拥有独立计时；affection 不允许更改 drinkTime。 */
export function createMascotState(random = Math.random) {
  return {
    time: 0,
    drinkTime: -1,
    nextDrink: MOTION.mascot.firstDrink,
    blush: 0,
    peace: 0,
    random,
  };
}

/** 推进单个角色的局部时钟。页面离开可见区域时调用方停止推进。 */
export function advanceMascot(
  /** @type {ReturnType<typeof createMascotState>} */ state,
  /** @type {number} */ delta,
  /** @type {MascotMode} */ mode,
) {
  const config = MOTION.mascot;
  state.time += delta;
  state.blush = Math.max(0, state.blush - delta);
  state.peace = Math.max(0, state.peace - delta);
  if (mode === 'idle') {
    state.drinkTime = -1;
    return;
  }
  if (mode === 'auto' && state.drinkTime < 0 && state.time >= state.nextDrink) {
    state.drinkTime = 0;
    return;
  }
  if (mode === 'cola' || mode === 'sprite') {
    state.drinkTime = state.time % config.drink;
    return;
  }
  if (state.drinkTime >= 0) state.drinkTime += delta;
  if (state.drinkTime >= config.drink) {
    state.drinkTime = -1;
    state.nextDrink =
      state.time + config.waitMin + state.random() * (config.waitMax - config.waitMin);
  }
}

/** 点击只影响腮红轨道，喝饮料与眨眼时钟不被重置。 */
export function showAffection(/** @type {ReturnType<typeof createMascotState>} */ state) {
  state.blush = MOTION.mascot.blush;
}

/** 首页点击反馈：独立的比耶轨道，不重置基础喝饮料动作。 */
export function showPeace(/** @type {ReturnType<typeof createMascotState>} */ state) {
  state.peace = MOTION.mascot.peace;
  state.blush = MOTION.mascot.peace;
}
