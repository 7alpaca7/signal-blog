/**
 * @typedef {object} ArticleSection
 * @property {string} id 稳定的章节锚点。
 * @property {string} title 章节标题。
 * @property {string[]} paragraphs 纯文本段落，避免演示内容注入 HTML。
 */
/**
 * @typedef {object} Article
 * @property {string} id
 * @property {string} slug
 * @property {string} title
 * @property {string} excerpt
 * @property {string} category
 * @property {string[]} tags
 * @property {string} publishedAt ISO 日历日期，按博客时区解释。
 * @property {number} readingMinutes
 * @property {string} [html] 构建时经过白名单净化的 Markdown HTML。
 * @property {ArticleSection[]} sections
 */
/** @typedef {{ keyword: string, category: string, tag: string, year: string, sort: 'new'|'old' }} ArticleQuery */
/**
 * @typedef {object} ArticleRepository
 * @property {(options?: {signal?: AbortSignal}) => Promise<Article[]>} list
 * @property {(slug: string, options?: {signal?: AbortSignal}) => Promise<Article|null>} getBySlug
 */
export {};
