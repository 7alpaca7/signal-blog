import { articles, activity, loaders } from 'virtual:blog-content';

import { groupActivity, isCalendarMonth } from '@/modules/activity/model/activity-calendar.js';

/** 本地 Markdown 内容仓库；正文按文章懒加载，返回副本保护共享索引。 */
export function createMarkdownArticleRepository() {
  /** @type {import('@/modules/articles/model/article-contracts.js').ArticleRepository} */
  const repository = {
    async list({ signal } = {}) {
      signal?.throwIfAborted();
      return structuredClone(articles).sort(
        (a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.slug.localeCompare(b.slug),
      );
    },
    async getBySlug(slug, { signal } = {}) {
      signal?.throwIfAborted();
      const load = Object.hasOwn(loaders, slug) ? loaders[slug] : null;
      if (!load) return null;
      const module = await load();
      signal?.throwIfAborted();
      return structuredClone(module.default);
    },
  };
  return repository;
}

/** 活动以 frontmatter 的显式发布/修订日志为准，不猜测文件 mtime 或虚构历史。 */
export function createMarkdownActivityRepository() {
  /** @type {import('@/modules/activity/model/activity-contracts.js').ActivityRepository} */
  const repository = {
    async listByMonth(month, { signal } = {}) {
      signal?.throwIfAborted();
      if (!isCalendarMonth(month)) throw new Error('请选择有效月份。');
      const groups = groupActivity(
        activity.filter((entry) => Date.parse(entry.occurredAt) <= Date.now()),
      );
      const months = [...new Set(Object.keys(groups).map((day) => day.slice(0, 7)))]
        .sort()
        .reverse();
      const entries = Object.entries(groups)
        .filter(([day]) => day.startsWith(month))
        .flatMap(([, items]) => items);
      return structuredClone({ entries, months });
    },
  };
  return repository;
}
