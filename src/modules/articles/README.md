# 文章模块

公开入口为 index.js。页面通过 useArticles / useArticle 读取服务，不直接引用演示数据。

- model/article-contracts.js：JSDoc 数据契约。
- model/archive-filters.js：纯筛选与排序规则。
- services/article-repository.js：服务标识与注入保护。
- composables/use-archive-query.js：URL 与筛选同步。
- components/ArticleList.vue：首页与归档复用的列表。

当前 repository.list 返回全部演示文章，前端过滤，无分页或缓存。接真实分页接口时须扩展查询/结果契约，而不是静默只过滤某一页数据。

当前应用从 content/posts/ Markdown 读取。ArticleBody 是唯一正文 HTML 展示入口，只接受构建时已净化的内容；sections 同时作为目录数据。写作规则见 content/README.md。
