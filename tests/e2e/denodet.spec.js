import { expect, test } from '@playwright/test';

test('DenoDet 笔记公式、配图和移动端阅读可用', async ({ page, baseURL }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const base = process.env.PAGES_TEST_URL || `${baseURL}/`;
  const response = await page.goto(
    new URL('articles/denodet-attention-feature-denoising/', base).href,
  );
  expect(response.status()).toBe(200);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'DenoDet｜从软阈值去噪到动态频域注意力',
  );
  expect(await page.locator('.markdown-body .katex').count()).toBeGreaterThan(20);
  await expect(page.locator('.katex-error')).toHaveCount(0);
  const images = page.locator('.markdown-body img');
  await expect(images).toHaveCount(7);
  for (const image of await images.all()) {
    await expect(image).toHaveAttribute('width', /\d+/);
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() => image.evaluate((element) => element.complete && element.naturalWidth > 0))
      .toBe(true);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: test.info().outputPath('denodet.png') });
});
