/** 业务回归等待实际页面就绪；慢资源与加载层关系由专门用例验证。 */
export async function finishOpening(page) {
  await page.getByRole('dialog', { name: '小黄脸喝可乐开场动画' }).waitFor({ state: 'hidden' });
}

export async function openBlog(page, path) {
  await page.goto(path);
  await finishOpening(page);
}
