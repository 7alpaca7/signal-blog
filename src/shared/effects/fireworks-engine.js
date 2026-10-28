import { FIREWORKS_CONFIG as CONFIG } from './fireworks-config.js';

/** @typedef {{angle:number,speed:number,digit:number|null}} Spark */
/** @typedef {{born:number,x:number,targetX:number,targetY:number,launch:number,burst:number,hue:number,radius:number,sparks:Spark[]}} Shell */
const DIGITS = [
  '111101101101111',
  '010110010010111',
  '111001111100111',
  '111001111001111',
  '101101111001001',
  '111100111001111',
  '111100111101111',
  '111001010010010',
  '111101111101111',
  '111101111001111',
];

/** 随机只在发射时采样；同一枚烟花飞行中不会换颜色或跳变大小。 */
export function createFireworksEngine(random = Math.random) {
  let time = 0,
    nextLaunch = 0;
  /** @type {Shell[]} */
  let shells = [];
  const range = (/** @type {number} */ min, /** @type {number} */ max) =>
    min + random() * (max - min);
  function launch(/** @type {number} */ width, /** @type {number} */ height, quiet = false) {
    const count = Math.min(
      CONFIG.maxBatch,
      Math.floor(range(CONFIG.minBatch, CONFIG.maxBatch + 1)),
    );
    for (let index = 0; index < count && shells.length < CONFIG.maxShells; index++) {
      let targetX = width * range(0.1, 0.9);
      if (quiet) targetX = width * (random() < 0.5 ? range(0.04, 0.14) : range(0.86, 0.96));
      const radius = range(CONFIG.minRadius, CONFIG.maxRadius) * Math.min(1, width / 680);
      const particles = width < 600 ? 32 : Math.round(32 + radius * 0.18);
      shells.push({
        born: time + index * CONFIG.stagger,
        x: targetX + range(-60, 60),
        targetX,
        targetY: height * range(0.16, 0.43),
        radius,
        hue: range(0, 360),
        launch: range(CONFIG.launchMin, CONFIG.launchMax),
        burst: range(CONFIG.burstMin, CONFIG.burstMax),
        sparks: Array.from({ length: particles }, (_, i) => ({
          angle: (i / particles) * Math.PI * 2 + range(-0.06, 0.06),
          speed: range(0.6, 1.3),
          digit: i % 4 === 0 ? Math.floor(range(0, 10)) % 10 : null,
        })),
      });
    }
    return count;
  }
  return {
    launch,
    /** 使用活跃秒数推进，不根据系统墙钟补发后台期间的批次。 */
    advance(
      /** @type {number} */ delta,
      /** @type {number} */ width,
      /** @type {number} */ height,
      quiet = false,
    ) {
      time += delta;
      if (time >= nextLaunch) {
        launch(width, height, quiet);
        nextLaunch = time + CONFIG.interval;
      }
      shells = shells.filter((shell) => time - shell.born < shell.launch + shell.burst);
    },
    /** 只返回绘图所需的快照，不通过 Vue 响应式追踪粒子。 */
    snapshot() {
      return { time, shells };
    },
    clear() {
      shells = [];
    },
  };
}

/** @param {CanvasRenderingContext2D} ctx @param {ReturnType<typeof createFireworksEngine>} engine @param {number} height @param {number} width @param {boolean} quiet */
export function drawFireworks(ctx, engine, height, width, quiet) {
  const { time, shells } = engine.snapshot();
  function dot(
    /** @type {number} */ x,
    /** @type {number} */ y,
    /** @type {number} */ size,
    /** @type {number} */ alpha,
  ) {
    const inText = quiet
      ? x > width * 0.15 && x < width * 0.85
      : x > width * 0.08 && x < width * 0.58;
    ctx.globalAlpha = alpha * (inText ? 0.24 : 0.85);
    ctx.fillRect(Math.round(x / 2) * 2, Math.round(y / 2) * 2, size, size);
  }
  for (const shell of shells) {
    const age = time - shell.born;
    if (age < 0) continue;
    ctx.fillStyle = `hsl(${shell.hue} 90% 74%)`;
    if (age < shell.launch) {
      const p = age / shell.launch;
      for (let j = 0; j < 17; j++) {
        const progress = Math.max(0, p - j * 0.012),
          eased = 1 - (1 - progress) ** 1.65;
        dot(
          shell.x + (shell.targetX - shell.x) * eased,
          height + (shell.targetY - height) * eased,
          j < 3 ? 4 : 2,
          (1 - j / 17) * 0.9,
        );
      }
      continue;
    }
    const t = age - shell.launch,
      fade = Math.max(0, 1 - t / shell.burst) ** 1.15;
    const distance = (1 - Math.exp(-CONFIG.drag * t)) / CONFIG.drag;
    shell.sparks.forEach((spark, index) => {
      const speed = spark.speed * shell.radius;
      const x = shell.targetX + Math.cos(spark.angle) * speed * distance;
      const y =
        shell.targetY + Math.sin(spark.angle) * speed * distance + (CONFIG.gravity * t * t) / 2;
      const alpha = fade * (0.75 + 0.25 * Math.sin(t * 8 + index));
      if (spark.digit !== null) {
        for (let j = 0; j < 15; j++)
          if (DIGITS[spark.digit][j] === '1')
            dot(x + (j % 3) * 2, y + Math.floor(j / 3) * 2, 2, alpha);
      } else {
        dot(x, y, index % 3 === 0 ? 4 : 2, alpha);
        dot(x - Math.cos(spark.angle) * 7, y - Math.sin(spark.angle) * 7, 2, alpha * 0.3);
      }
    });
  }
  ctx.globalAlpha = 1;
}
