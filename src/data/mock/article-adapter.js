import { demoArticles } from '../fixtures/articles.js';

/** 创建演示仓库；每次返回副本，防止展示层修改数据源。 */
export function createMockArticleRepository() {
  /** @type {import('@/modules/articles/model/article-contracts.js').ArticleRepository} */
  const repository = {
    async list({ signal } = {}) {
      signal?.throwIfAborted();
      return structuredClone(demoArticles);
    },
    async getBySlug(slug, { signal } = {}) {
      signal?.throwIfAborted();
      return structuredClone(demoArticles.find((article) => article.slug === slug) ?? null);
    },
  };
  return repository;
}
