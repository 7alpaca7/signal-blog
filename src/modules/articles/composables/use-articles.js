import { useAsyncResource } from '@/shared/composables/use-async-resource.js';

import { useArticleRepository } from '../services/article-repository.js';

/** 首页与归档通过同一服务入口读取文章。 */
export function useArticles() {
  const repository = useArticleRepository();
  return useAsyncResource(
    () => 'articles',
    (_, signal) => repository.list({ signal }),
  );
}

/** 根据 slug 读取文章；不存在返回 null，由页面决定 404 展示。 */
export function useArticle(/** @type {() => string} */ slug) {
  const repository = useArticleRepository();
  return useAsyncResource(slug, (value, signal) => repository.getBySlug(value, { signal }));
}
