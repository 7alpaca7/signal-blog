import { expect, test } from '@playwright/test';

import { openBlog } from './helpers/navigation.js';

test('静态小角色不重复绘制，动效仍持续运行', async ({ page }) => {
  await page.addInitScript(() => {
    window.canvasPaints = new Map();
    const original = CanvasRenderingContext2D.prototype.clearRect;
    CanvasRenderingContext2D.prototype.clearRect = function (...args) {
      window.canvasPaints.set(this.canvas, (window.canvasPaints.get(this.canvas) ?? 0) + 1);
      return original.apply(this, args);
    };
  });
  await openBlog(page, '/articles/performance-and-loading');
  await page.evaluate(() => window.canvasPaints.clear());
  // 固定观察窗口用于统计实际绘制次数，不以远程截图流推断本机 FPS。
  await page.waitForTimeout(1000);
  const paints = await page.evaluate(() =>
    [...window.canvasPaints]
      .filter(([canvas]) => canvas.isConnected)
      .map(([canvas, count]) => ({
        type: canvas.classList.contains('ambient-background')
          ? 'background'
          : canvas.closest('.small')
            ? 'small-mascot'
            : 'mascot',
        count,
      })),
  );
  console.log('一秒绘制次数', JSON.stringify(paints));
  expect(paints.find((item) => item.type === 'background')?.count).toBeGreaterThan(0);
  expect(
    paints
      .filter((item) => item.type === 'small-mascot')
      .reduce((total, item) => total + item.count, 0),
  ).toBeLessThanOrEqual(2);
});
