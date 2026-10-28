import { inject } from 'vue';

/** @type {import('vue').InjectionKey<import('../model/article-contracts.js').ArticleRepository>} */
export const ARTICLE_REPOSITORY = Symbol('article-repository');

/** 只暴露契约，不让业务依赖应用选择的具体 adapter。 */
export function useArticleRepository() {
  const repository = inject(ARTICLE_REPOSITORY);
  if (!repository) throw new Error('文章服务未装配，请检查 app/providers。');
  return repository;
}
