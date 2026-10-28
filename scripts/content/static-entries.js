import fs from 'node:fs';
import path from 'node:path';

/**
 * GitHub Pages 没有 SPA rewrite：为已发布路由写入真实入口，直达/刷新返回 200。
 * 这些入口仍由 Vue 渲染，不是正文预渲染或 SEO 完成；未知路由使用 404 壳。
 * @param {string} outputDirectory
 * @param {string[]} slugs 已通过内容校验的文章 slug。
 */
export function writeStaticEntries(outputDirectory, slugs) {
  const html = fs.readFileSync(path.join(outputDirectory, 'index.html'), 'utf8');
  for (const route of ['articles', ...slugs.map((slug) => `articles/${slug}`)]) {
    const directory = path.join(outputDirectory, route);
    fs.mkdirSync(directory, { recursive: true });
    fs.writeFileSync(path.join(directory, 'index.html'), html);
  }
  fs.writeFileSync(path.join(outputDirectory, '404.html'), html);
  fs.writeFileSync(path.join(outputDirectory, '.nojekyll'), '');
}
