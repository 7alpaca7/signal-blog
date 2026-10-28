/** 业务回归跳过可跳过的品牌开场；开场完整周期由专门的用例验证。 */
export async function finishOpening(page) {
  await page.getByRole('button', { name: '跳过开场，进入博客 ↗', exact: true }).click();
  await page.getByRole('dialog', { name: '小黄脸喝可乐开场动画' }).waitFor({ state: 'hidden' });
}

export async function openBlog(page, path) {
  await page.goto(path);
  await finishOpening(page);
}
