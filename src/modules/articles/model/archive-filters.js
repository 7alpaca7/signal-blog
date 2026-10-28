/** @typedef {import('./article-contracts.js').Article} Article */
/** @typedef {import('./article-contracts.js').ArticleQuery} ArticleQuery */

/** 将不可信的 URL 查询转换为唯一、可预测的筛选状态。 */
export function normalizeArchiveQuery(/** @type {Record<string, unknown>} */ query) {
  const text = (/** @type {unknown} */ value) => (typeof value === 'string' ? value.trim() : '');
  return /** @type {ArticleQuery} */ ({
    keyword: text(query.q).slice(0, 100),
    category: text(query.category),
    tag: text(query.tag),
    year: /^\d{4}$/.test(text(query.year)) ? text(query.year) : '',
    sort: query.sort === 'old' ? 'old' : 'new',
  });
}

/** 组合过滤后返回新数组，不修改 repository 缓存的原始顺序。 */
export function filterArticles(
  /** @type {Article[]} */ articles,
  /** @type {ArticleQuery} */ query,
) {
  const keyword = query.keyword.toLocaleLowerCase();
  return articles
    .filter((article) => {
      const searchable = [article.title, article.excerpt, ...article.tags]
        .join(' ')
        .toLocaleLowerCase();
      return (
        (!query.category || article.category === query.category) &&
        (!query.tag || article.tags.includes(query.tag)) &&
        (!query.year || article.publishedAt.startsWith(query.year)) &&
        (!keyword || searchable.includes(keyword))
      );
    })
    .sort((a, b) => {
      const order = a.publishedAt.localeCompare(b.publishedAt);
      return query.sort === 'old' ? order : -order;
    });
}
