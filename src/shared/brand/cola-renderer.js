import { MOTION } from '@/shared/motion/tokens.js';

const COLA_MOTION = MOTION.cola;
const COLA_COLORS = {
  acid: '#d9ff61',
  light: '#efffc0',
  ink: '#101211',
  shade: '#a5c747',
  deep: '#6e8831',
  orange: '#ff8a48',
  red: '#eb654a',
  redDark: '#b34636',
  paper: '#f0f0e8',
  muted: '#68725b',
};

/** @type {HTMLCanvasElement|null} */
let bodySprite = null;
/** 固定的像素身体只栅格化一次；逐帧只重绘饮料、表情和手臂。 */
function drawCachedBody(
  /** @type {CanvasRenderingContext2D} */ target,
  /** @type {number} */ faceX,
  /** @type {number} */ faceY,
) {
  if (!bodySprite) {
    bodySprite = document.createElement('canvas');
    bodySprite.width = 70;
    bodySprite.height = 70;
    const ctx = bodySprite.getContext('2d');
    if (!ctx) return;
    const p = COLA_COLORS;
    const dot = (
      /** @type {number} */ x,
      /** @type {number} */ y,
      /** @type {string} */ color,
      width = 1,
      height = 1,
    ) => {
      ctx.fillStyle = color;
      ctx.fillRect(Math.round(x * 2), Math.round(y * 2), width * 2, height * 2);
    };
    const silhouette = [];
    for (let y = 0; y < 32; y++)
      for (let x = 0; x < 32; x++) {
        const dx = x - 15.5,
          dy = y - 15.5;
        if (dx * dx + dy * dy < 14.7 * 14.7) silhouette.push({ x, y, dx, dy });
      }
    for (const q of silhouette) dot(q.x + 1, q.y + 1.5, p.ink);
    for (const q of silhouette) if (q.x > 11) dot(q.x + 0.7, q.y + 1, p.orange);
    for (const q of silhouette) {
      const r = Math.hypot(q.dx, q.dy);
      let c = p.acid;
      if (r > 13.6 && q.dx + q.dy > 8) c = p.shade;
      if (r > 13.8 && q.dx + q.dy < -8) c = p.light;
      if (r > 12.4 && q.dx + q.dy > 13 && (q.x + q.y) % 3 === 0) c = p.deep;
      dot(q.x, q.y, c);
    }
    [
      [7, 5],
      [8, 4],
      [9, 4],
      [10, 3],
      [11, 3],
    ].forEach(([x, y]) => dot(x, y, p.light));
  }
  target.drawImage(bodySprite, faceX, faceY);
}

/**
 * 原确认稿的 128×128 像素可乐动作，保留杯子、手臂、闭眼与吸管的相对坐标。
 * 只绘制本次时间，不创建 RAF 或定时器；由应用共享调度器推进。
 * @param {CanvasRenderingContext2D} target
 * @param {number} time 活跃时间，单位秒。
 * @param {{reduced?: boolean, complete?: boolean}} options
 */
export function drawColaFriend(target, time, options = {}) {
  const k = COLA_MOTION,
    clamp = (/** @type {number} */ x) => Math.max(0, Math.min(1, x)),
    smooth = (/** @type {number} */ x) => {
      x = clamp(x);
      return x * x * (3 - 2 * x);
    };
  const t = options.reduced ? 0 : ((time % k.cycle) + k.cycle) % k.cycle;
  const raise =
    t < k.raiseStart
      ? 0
      : t < k.raiseEnd
        ? smooth((t - k.raiseStart) / (k.raiseEnd - k.raiseStart))
        : t < k.sipEnd
          ? 1
          : t < k.afterEnd
            ? 1 - 0.18 * smooth((t - k.sipEnd) / (k.afterEnd - k.sipEnd))
            : t < k.lowerEnd
              ? 0.82 * (1 - smooth((t - k.afterEnd) / (k.lowerEnd - k.afterEnd)))
              : 0;
  const sip = t >= k.raiseEnd && t < k.sipEnd;
  const pleased = t >= k.sipEnd && t < k.afterEnd;
  const phase =
    t < k.raiseStart
      ? '等一小会儿'
      : t < k.raiseEnd
        ? '举起可乐'
        : sip
          ? '喝一口可乐'
          : pleased
            ? '快乐补充完毕'
            : t < k.lowerEnd
              ? '轻轻放下'
              : '等一小会儿';
  const p = COLA_COLORS;
  target.save();
  target.setTransform(1, 0, 0, 1, 0, 0);
  target.clearRect(0, 0, target.canvas.width, target.canvas.height);
  target.imageSmoothingEnabled = false;
  target.scale(target.canvas.width / 128, target.canvas.height / 128);
  const rect = (
    /** @type {number} */ x,
    /** @type {number} */ y,
    /** @type {number} */ w,
    /** @type {number} */ h,
    /** @type {string} */ c,
  ) => {
    target.fillStyle = c;
    target.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  };
  const bob = options.reduced ? 0 : Math.sin(time * 1.1) * 0.65;
  // 稳定的地面投影，不显示虚假进度。
  rect(40, 115, 48, 2, '#252d20');
  rect(47, 117, 34, 1, '#1b2117');
  target.save();
  target.translate(0, Math.round(bob));
  const faceX = 27 + (sip ? 1 : 0),
    faceY = 19 + (sip ? Math.round(Math.sin((t - k.raiseEnd) * 9) * 0.5) : 0),
    size = 2;
  const dot = (
    /** @type {number} */ x,
    /** @type {number} */ y,
    /** @type {string} */ c,
    w = 1,
    h = 1,
  ) => rect(faceX + x * size, faceY + y * size, w * size, h * size, c);
  // 后侧手臂、阶梯轮廓与确认稿保持一致。
  const cupX = Math.round(89 - 8 * raise),
    cupY = Math.round(91 - 16 * raise);
  rect(83, 69, 5, 10, p.ink);
  rect(84, 70, 3, 8, p.shade);
  rect(85, 76, 4, Math.max(3, cupY - 72), p.ink);
  rect(86, 77, 2, Math.max(2, cupY - 73), p.acid);
  drawCachedBody(target, faceX, faceY);
  const blink = !options.reduced && (time + 2.1) % 4.8 < 0.17;
  for (const x of [8.2, 20.2]) {
    if (sip || pleased || blink || options.complete) {
      dot(x - 1, 10.6, p.ink);
      dot(x, 9.6, p.ink, 3, 1);
      dot(x + 3, 10.6, p.ink);
    } else {
      dot(x, 8.8, p.ink, 3, 5);
      dot(x + 1, 8, p.ink);
      dot(x + 1, 13.8, p.ink);
    }
  }
  if (sip) {
    dot(20.5, 19, p.ink, 3, 1);
    dot(19.5, 20, p.ink, 1, 2);
    dot(23.5, 20, p.ink, 1, 2);
    dot(20.5, 22, p.ink, 3, 1);
  } else {
    const smile = [
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
    smile.forEach(([x, y]) => dot(x, y, p.ink, x === 14 ? 4 : 2, 2));
  }
  if (pleased || options.complete) {
    dot(5.5, 16.5, p.orange, 3, 1);
    dot(23.5, 16.5, p.orange, 3, 1);
  }
  // 红色 COLA 杯；吸管在喝下阶段对齐噘嘴。
  rect(cupX, cupY, 18, 21, p.ink);
  rect(cupX + 2, cupY + 1, 14, 21, p.red);
  rect(cupX + 4, cupY + 21, 10, 3, p.redDark);
  rect(cupX + 14, cupY + 2, 2, 18, p.redDark);
  rect(cupX - 1, cupY - 3, 20, 2, p.paper);
  rect(cupX + 1, cupY - 1, 16, 2, '#bac1ae');
  const sx = cupX + 9,
    strawTop = cupY - 14,
    tipX = Math.round(82 - 12 * raise);
  rect(sx - 1, strawTop, 2, 12, p.paper);
  rect(tipX, strawTop, sx - tipX, 2, p.paper);
  // COLA 字样使用 3×5 像素，避免字体回退改变杯身。
  const letters = /** @type {Record<string,string[]>} */ ({
    C: ['111', '100', '100', '100', '111'],
    O: ['111', '101', '101', '101', '111'],
    L: ['100', '100', '100', '100', '111'],
    A: ['010', '101', '111', '101', '101'],
  });
  Array.from('COLA').forEach((ch, i) =>
    letters[ch].forEach((row, y) =>
      Array.from(row).forEach((v, x) => {
        if (v === '1') rect(cupX + 2 + i * 4 + x, cupY + 7 + y, 1, 1, p.paper);
      }),
    ),
  );
  // 前景手掌跟随杯子连续移动。
  rect(cupX - 3, cupY + 8, 5, 7, p.ink);
  rect(cupX - 3, cupY + 8, 4, 5, p.acid);
  rect(cupX - 2, cupY + 8, 2, 1, p.light);
  if (pleased || options.complete) {
    const sparkle = (/** @type {number} */ x, /** @type {number} */ y) => {
      rect(x, y - 2, 1, 5, p.paper);
      rect(x - 2, y, 5, 1, p.paper);
    };
    sparkle(105, 27);
    sparkle(113, 37);
    rect(100, 38, 2, 2, p.orange);
  }
  if (sip) {
    const n = Math.floor((t - k.raiseEnd) * 7) % 3;
    rect(tipX + 3 + n * 4, strawTop, 2, 2, p.orange);
  }
  target.restore();
  target.restore();
  return { phase, raise, sip, pleased };
}
