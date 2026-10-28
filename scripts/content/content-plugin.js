import fs from 'node:fs';
import path from 'node:path';

import { parsePost } from './parse-post.js';

const manifestId = 'virtual:blog-content';
const detailPrefix = 'virtual:blog-post/';

/**
 * 构建时读取本地内容；索引不含正文，详情独立拆包。浏览器不访问本地文件系统。
 * 开发时增删改 Markdown 都刷新索引；监听由 Vite server 持有并随服务关闭释放。
 * @returns {import('vite').Plugin}
 */
export function contentPlugin() {
  let directory = '';
  function readPosts() {
    const files = fs
      .readdirSync(directory, { recursive: true })
      .filter((file) => typeof file === 'string' && file.endsWith('.md'));
    const posts = files.map((file) => {
      try {
        return parsePost(fs.readFileSync(path.join(directory, file), 'utf8'), path.basename(file));
      } catch (error) {
        throw new Error(`Markdown 文章 ${file}：${error.message}`, { cause: error });
      }
    });
    const slugs = new Set();
    for (const post of posts) {
      if (slugs.has(post.article.slug)) throw new Error(`文章 slug 重复：${post.article.slug}`);
      slugs.add(post.article.slug);
    }
    return posts.filter((post) => !post.draft);
  }
  return {
    name: 'local-markdown-content',
    configResolved(config) {
      directory = path.join(config.root, 'content/posts');
    },
    buildStart() {
      readPosts();
    },
    resolveId(id) {
      if (id === manifestId || id.startsWith(detailPrefix)) return `\0${id}`;
    },
    load(id) {
      if (id === `\0${manifestId}`) {
        const posts = readPosts();
        const summaries = posts.map(({ article }) => ({
          ...article,
          html: undefined,
          sections: [],
        }));
        const activity = posts.flatMap((post) => post.activity);
        const loaders = posts
          .map(
            ({ article }) =>
              `${JSON.stringify(article.slug)}: () => import(${JSON.stringify(detailPrefix + article.slug)})`,
          )
          .join(',');
        return `export const articles = ${JSON.stringify(summaries)}; export const activity = ${JSON.stringify(activity)}; export const loaders = {${loaders}};`;
      }
      if (id.startsWith(`\0${detailPrefix}`)) {
        const slug = id.slice(detailPrefix.length + 1);
        const post = readPosts().find((item) => item.article.slug === slug);
        if (!post) throw new Error(`文章不存在：${slug}`);
        return `export default ${JSON.stringify(post.article)};`;
      }
    },
    configureServer(server) {
      server.watcher.add(directory);
      server.watcher.on('all', (event, file) => {
        if (
          !['add', 'change', 'unlink'].includes(event) ||
          !file.startsWith(`${directory}${path.sep}`) ||
          !file.endsWith('.md')
        )
          return;
        for (const module of server.moduleGraph.idToModuleMap.values()) {
          if (module.id?.startsWith('\0virtual:blog-')) server.moduleGraph.invalidateModule(module);
        }
        server.ws.send({ type: 'full-reload' });
      });
    },
  };
}
