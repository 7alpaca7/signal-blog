/** 应用服务公开入口：不导入 UI，避免装配 repository 时提前拉取整个文章模块。 */
export { ARTICLE_REPOSITORY, useArticleRepository } from './services/article-repository.js';
