import { test } from '@playwright/test';

import { finishOpening } from './helpers/navigation.js';

for (const [label, url] of [
  ['dev', process.env.PROFILE_DEV_URL || 'http://127.0.0.1:5173'],
  ['build', 'http://127.0.0.1:4173'],
]) {
  test(`加载与主线程采样 ${label}`, async ({ page }) => {
    test.skip(
      label === 'dev' && !process.env.PROFILE_DEV_URL,
      '仅显式指定开发服务时比较开发资源。',
    );
    await page.addInitScript(() => {
      window.profile = { longTasks: [], gaps: [], previous: 0 };
      new PerformanceObserver((list) => {
        window.profile.longTasks.push(...list.getEntries().map((entry) => entry.duration));
      }).observe({ type: 'longtask', buffered: true });
      function sample(now) {
        if (window.profile.previous) window.profile.gaps.push(now - window.profile.previous);
        window.profile.previous = now;
        requestAnimationFrame(sample);
      }
      requestAnimationFrame(sample);
    });
    await page.goto(`${url}/articles/architecture-and-project-setup`);
    await finishOpening(page);
    await page.evaluate(() => {
      window.profile.gaps = [];
    });
    await page.waitForTimeout(3000);
    const result = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource');
      const gaps = window.profile.gaps.sort((a, b) => a - b);
      return {
        requests: resources.length,
        decodedKiB: Math.round(
          resources.reduce((sum, entry) => sum + entry.decodedBodySize, 0) / 1024,
        ),
        scripts: resources.filter((entry) => entry.initiatorType === 'script').length,
        longTasks: window.profile.longTasks.map((value) => Math.round(value)),
        frameP95: Math.round(gaps[Math.floor(gaps.length * 0.95)] ?? 0),
        frameMax: Math.round(Math.max(...gaps)),
      };
    });
    console.log(label, JSON.stringify(result));
  });
}
