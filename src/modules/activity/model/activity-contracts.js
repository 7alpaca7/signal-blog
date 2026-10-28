/**
 * 一条记录表示一次文档新增或修改，不等同于 Git 提交或平台刷题。
 * @typedef {object} DocumentActivity
 * @property {string} id
 * @property {string} articleId
 * @property {string} articleSlug
 * @property {string} documentTitle
 * @property {'created'|'updated'} action
 * @property {string} occurredAt 带时区的 ISO 时间，展示和聚合统一使用 Asia/Shanghai。
 * @property {string} summary 变更说明。
 */
/** @typedef {{entries:DocumentActivity[], months:string[]}} ActivityResult */
/** @typedef {{listByMonth:(month:string, options?:{signal?:AbortSignal})=>Promise<ActivityResult>}} ActivityRepository */
export {};
