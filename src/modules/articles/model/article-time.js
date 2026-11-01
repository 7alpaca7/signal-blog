/**
 * 完整发布时间倒序；旧演示数据只有日期时按北京时间当天零点回退。
 * 时间相同时用稳定标识打破平局，不依赖文件扫描顺序。
 * @param {import('./article-contracts.js').Article} first
 * @param {import('./article-contracts.js').Article} second
 */
export function comparePublicationTime(first, second) {
  const timestamp = (/** @type {import('./article-contracts.js').Article} */ article) => {
    const value =
      article.publishedTimestamp ||
      (article.publishedAt.includes('T')
        ? article.publishedAt
        : `${article.publishedAt}T00:00:00+08:00`);
    return Date.parse(value) || 0;
  };
  return (
    timestamp(second) - timestamp(first) ||
    (first.slug || first.id).localeCompare(second.slug || second.id)
  );
}
