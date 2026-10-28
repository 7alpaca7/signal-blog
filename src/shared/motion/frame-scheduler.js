import { MOTION } from './tokens.js';

/** @typedef {(delta: number) => void} FrameListener */
/**
 * 单一 RAF 时间源。暂停后不补发丢失帧；最后订阅释放后立即停止。
 * request/cancel 允许测试注入，调度器本身不访问 Vue 或 DOM。
 */
export function createFrameScheduler(
  request = requestAnimationFrame,
  cancel = cancelAnimationFrame,
) {
  const listeners = new Set(/** @type {FrameListener[]} */ ([]));
  let frame = 0;
  let previous = 0;
  let active = false;
  function tick(/** @type {number} */ now) {
    frame = 0;
    if (!active) return;
    const delta = previous ? Math.min((now - previous) / 1000, MOTION.maxDelta) : 0;
    previous = now;
    listeners.forEach((listener) => listener(delta));
    if (active && listeners.size) frame = request(tick);
  }
  function update() {
    if (frame && (!active || !listeners.size)) {
      cancel(frame);
      frame = 0;
      previous = 0;
    }
    if (!frame && active && listeners.size) frame = request(tick);
  }
  return {
    subscribe(/** @type {FrameListener} */ listener) {
      listeners.add(listener);
      update();
      return () => {
        listeners.delete(listener);
        update();
      };
    },
    setActive(/** @type {boolean} */ value) {
      active = value;
      previous = 0;
      update();
    },
    dispose() {
      active = false;
      listeners.clear();
      update();
    },
  };
}
