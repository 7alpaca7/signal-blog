import { demoArticles } from './articles.js';

/**
 * 明确标记的设计演示变更日志，不从文章日期随机伪造贡献记录。
 * 每个元组依次为文章 id、变更类型、带时区时间和说明。
 * @type {[string, 'created'|'updated', string, string][]}
 */
const changes = [
  ['weight', 'created', '2026-10-28T09:20:00+08:00', '发布阻尼与弹簧的交互实践'],
  ['weight', 'updated', '2026-10-28T16:10:00+08:00', '补充弹簧参数与回弹说明'],
  ['smiley', 'created', '2026-10-24T11:30:00+08:00', '记录像素角色的设计过程'],
  ['smiley', 'updated', '2026-10-25T14:20:00+08:00', '完善饮料动作与反馈细节'],
  ['smiley', 'updated', '2026-10-26T10:15:00+08:00', '补充爱心与角色状态说明'],
  ['smiley', 'updated', '2026-10-26T15:40:00+08:00', '调整文章插图注释'],
  ['tokens', 'created', '2026-10-18T10:00:00+08:00', '发布 Motion Tokens 笔记'],
  ['tokens', 'updated', '2026-10-19T19:20:00+08:00', '整理时间与位移的单位'],
  ['tokens', 'updated', '2026-10-20T13:10:00+08:00', '补充动效开关说明'],
  ['tokens', 'updated', '2026-10-20T18:00:00+08:00', '增加减少动态效果的约定'],
  ['noise', 'created', '2026-09-05T14:30:00+08:00', '记录噪声场实验'],
  ['noise', 'updated', '2026-09-07T17:10:00+08:00', '补充轨迹参数'],
  ['noise', 'updated', '2026-09-17T09:40:00+08:00', '整理实验观察'],
  ['garden', 'created', '2025-12-21T16:30:00+08:00', '写下数字花园的第一篇记录'],
  ['garden', 'updated', '2025-12-22T11:10:00+08:00', '完善记录的分类思路'],
];

/** @type {import('@/modules/activity/model/activity-contracts.js').DocumentActivity[]} */
export const demoDocumentActivity = changes.map(
  ([articleId, action, occurredAt, summary], index) => {
    const article = demoArticles.find((item) => item.id === articleId);
    if (!article) throw new Error(`演示活动引用了不存在的文章：${articleId}`);
    return {
      id: `demo-change-${index}`,
      articleId,
      articleSlug: article.slug,
      documentTitle: article.title,
      action,
      occurredAt,
      summary,
    };
  },
);
