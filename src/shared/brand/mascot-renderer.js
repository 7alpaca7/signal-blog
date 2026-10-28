import { MOTION } from '@/shared/motion/tokens.js';

import { drawTrioDrinks } from './trio-drinks.js';

const COLORS = {
  face: '#d9ff61',
  ink: '#101211',
  orange: '#ff8a48',
  rim: '#efffc0',
  shade: '#aacb46',
};
const GRIN = [
  [6, 18],
  [7, 20],
  [8, 21],
  [10, 22],
  [12, 23],
  [14, 23],
  [16, 23],
  [18, 22],
  [20, 21],
  [22, 20],
  [23, 18],
];
const smooth = (/** @type {number} */ value) => {
  const x = Math.min(1, Math.max(0, value));
  return x * x * (3 - 2 * x);
};

/** @type {HTMLCanvasElement|null} */
let faceSprite = null;
function drawBody(/** @type {CanvasRenderingContext2D} */ target) {
  if (!faceSprite) {
    faceSprite = document.createElement('canvas');
    faceSprite.width = 34;
    faceSprite.height = 34;
    const context = faceSprite.getContext('2d');
    if (!context) return;
    const p = COLORS;
    const dot = (/** @type {number} */ x, /** @type {number} */ y, /** @type {string} */ color) => {
      context.fillStyle = color;
      context.fillRect(Math.round(x), Math.round(y), 1, 1);
    };
    for (let y = 0; y < 32; y++)
      for (let x = 0; x < 32; x++) {
        const dx = x - 15.5,
          dy = y - 15.5,
          r = Math.hypot(dx, dy);
        if (r >= 14.7) continue;
        dot(x + 1, y + 1.5, p.orange);
        let color = p.face;
        if (r > 13.6 && dx + dy > 8) color = p.shade;
        if (r > 13.8 && dx + dy < -8) color = p.rim;
        dot(x, y, color);
      }
  }
  target.imageSmoothingEnabled = false;
  target.drawImage(faceSprite, 0, 0);
}

/**
 * 绘制 50×40 的像素世界（三杯模式向下增加 10 像素）（左侧额外留 8 像素给比耶手），饮料置于脸的右下方，保持身体大小不随动作变化。
 * @param {CanvasRenderingContext2D} ctx
 * @param {ReturnType<import('./mascot-state.js').createMascotState>} state
 * @param {import('./mascot-state.js').MascotMode} mode
 * @param {'fanta'|'sprite'|'trio'} beverage auto 模式的饮料；循环点赞动作仍固定雪碧。
 */
export function renderMascot(ctx, state, mode, beverage = 'fanta') {
  const p = COLORS;
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.save();
  ctx.scale(ctx.canvas.width / 50, ctx.canvas.height / (beverage === 'trio' ? 50 : 40));
  ctx.translate(10, 2);
  const dot = (
    /** @type {number} */ x,
    /** @type {number} */ y,
    /** @type {string} */ color,
    width = 1,
    height = 1,
  ) => {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), width, height);
  };
  drawBody(ctx);
  const timing = MOTION.mascot;
  const t = state.drinkTime,
    sipping = t >= timing.liftEnd && t < timing.sipEnd,
    pleased = t >= timing.sipEnd && t < timing.smileEnd;
  const eyesClosed =
    sipping ||
    pleased ||
    state.time % MOTION.mascot.blink > MOTION.mascot.blink - timing.blinkLength;
  if (state.peace > 0 && !sipping) {
    dot(8, 10, p.ink, 4, 1);
    dot(10, 11, p.ink, 3, 1);
    dot(8, 12, p.ink, 4, 1);
    dot(21, 9, p.ink, 3, 5);
    dot(23, 14, p.rim, 1, 1);
  } else [9, 21].forEach((x) => dot(x, eyesClosed ? 12 : 9, p.ink, 3, eyesClosed ? 1 : 5));
  if (sipping) {
    dot(21, 19, p.ink, 3, 1);
    dot(20, 20, p.ink, 1, 2);
    dot(24, 20, p.ink, 1, 2);
    dot(21, 22, p.ink, 3, 1);
  } else GRIN.forEach(([x, y]) => dot(x, y, p.ink, 2, 2));
  // 腮红不替换眼睛/嘴型；杯子最后绘制，避免反馈遮住吸管与手臂。
  if (state.blush > 0) {
    ctx.globalAlpha = Math.min(1, state.blush / timing.blushFade) * 0.85;
    dot(5, 16, '#ff7792', 4, 2);
    dot(24, 16, '#ff7792', 4, 2);
    ctx.globalAlpha = 1;
  }
  if (state.peace > 0) {
    // 镜像到脸的左侧；饮料仍在右下方，两个手部轨道互不遮挡。
    const hand = (
      /** @type {number} */ x,
      /** @type {number} */ y,
      /** @type {string} */ color,
      /** @type {number} */ width,
      /** @type {number} */ height,
    ) => dot(31 - x - width, y, color, width, height);
    hand(31, 6, p.ink, 3, 7);
    hand(32, 12, p.ink, 3, 8);
    hand(37, 5, p.ink, 3, 8);
    hand(35, 12, p.ink, 4, 8);
    hand(32, 7, p.face, 1, 6);
    hand(38, 6, p.face, 1, 7);
    hand(33, 13, p.face, 4, 5);
    hand(31, 17, p.ink, 3, 4);
    hand(32, 18, p.face, 1, 2);
  }
  if (t >= 0) {
    let lift = smooth((t - timing.liftStart) / (timing.liftEnd - timing.liftStart));
    if (t >= timing.smileEnd)
      lift = 1 - smooth((t - timing.smileEnd) / (timing.lowerEnd - timing.smileEnd));
    if (mode === 'auto' && beverage === 'trio') {
      drawTrioDrinks(ctx, lift, t, sipping);
    } else {
      const cupY = 37 - lift * 13,
        cupX = 32 - lift * 4;
      const colors = {
        auto: beverage === 'sprite' ? '#2b9755' : '#ff8a20',
        cola: '#bd4140',
        sprite: '#2b9755',
        idle: '#ff8a20',
      };
      dot(30, 22, p.ink, 3, 6);
      dot(31, 23, p.face, 1, 5);
      dot(cupX, cupY, p.ink, 8, 10);
      dot(cupX + 1, cupY + 1, colors[mode], 6, 8);
      dot(cupX - 1, cupY - 1, '#f0f0e8', 10, 1);
      dot(cupX + 4, cupY - 6, '#f0f0e8', 1, 5);
      dot(cupX + 1, cupY - 6, '#f0f0e8', 4, 1);
      dot(cupX + 2, cupY + 3, '#f0f0e8', 4, 2);
      if (mode === 'auto' && beverage === 'fanta') dot(cupX + 3, cupY + 3, '#409348', 2, 1);
    }
  }
  ctx.restore();
}
