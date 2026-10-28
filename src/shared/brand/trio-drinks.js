import { MOTION } from '@/shared/motion/tokens.js';

const DRINKS = [
  { x: 12, color: '#bd4140', letter: ['111', '100', '100', '100', '111'] },
  { x: 22, color: '#2b9755', letter: ['111', '100', '111', '001', '111'] },
  { x: 32, color: '#ff8a20', letter: ['111', '100', '110', '100', '100'] },
];

/**
 * 首页三杯同步动作：在角色已有坐标系内绘制托盘与三路吸管，左侧留给比耶手。
 * 三杯共用 lift 与基础动作时钟；不额外创建动画、计时器或角色实例。
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} lift 0–1 的举杯进度。
 * @param {number} time 当前饮料动作时间，秒。
 * @param {boolean} sipping 是否正在喝下。
 */
export function drawTrioDrinks(ctx, lift, time, sipping) {
  const dot = (
    /** @type {number} */ x,
    /** @type {number} */ y,
    /** @type {number} */ width,
    /** @type {number} */ height,
    /** @type {string} */ color,
  ) => {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), width, height);
  };
  const cupY = Math.round(36 - lift * 10);
  const joinY = cupY - 2;
  // 先画吸管，再画杯与手掌，杯盖遮住管根；三条管在右侧汇流，末端对齐噘嘴。
  DRINKS.forEach((drink, index) => {
    const strawX = drink.x + 3;
    const elbowY = joinY - index;
    dot(strawX, elbowY, 1, cupY - elbowY, '#f0f0e8');
    dot(Math.min(strawX, 27), elbowY, Math.abs(strawX - 27) + 1, 1, '#f0f0e8');
    dot(27, elbowY, 1, joinY - elbowY + 1, '#f0f0e8');
    if (sipping) {
      const bubble = Math.floor(time * MOTION.mascot.sipBubbleRate + index) % 3;
      dot(strawX, cupY - 1 - bubble, 1, 1, drink.color);
    }
  });
  dot(27, joinY - 3, 1, 4, '#f0f0e8');
  dot(23, joinY - 3, 5, 1, '#f0f0e8');
  // 三杯使用向下扩展的 50×50 坐标，身体倍率不变，举杯前也完整显示。
  dot(11, cupY + 9, 28, 2, '#101211');
  dot(12, cupY + 9, 26, 1, '#ff8a48');
  DRINKS.forEach((drink) => {
    dot(drink.x, cupY, 7, 9, '#101211');
    dot(drink.x + 1, cupY + 1, 5, 7, drink.color);
    dot(drink.x, cupY - 1, 7, 1, '#f0f0e8');
    drink.letter.forEach((row, y) => {
      [...row].forEach((pixel, x) => {
        if (pixel === '1') dot(drink.x + 2 + x, cupY + 2 + y, 1, 1, '#f0f0e8');
      });
    });
  });
  dot(30, cupY + 7, 4, 4, '#101211');
  dot(30, cupY + 7, 3, 3, '#d9ff61');
}
