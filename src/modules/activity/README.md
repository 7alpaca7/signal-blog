# 文档活动模块

公开组件 DocumentActivity 放在首页最近记录之后。显示博客文档新增/修改记录，不代表 GitHub 或 LeetCode 提交。

- model/activity-calendar.js：Asia/Shanghai 日期聚合、真实月份验证、周一开头的贡献格算法。每条日志算一次文档变更，同一天同一文档多次修改分别计数。
- composables/use-document-activity.js：月份请求、日期选择及统计，复用请求取消和竞态保护。
- services/activity-repository.js：注入接口，应用 providers 选择 adapter。
- components：贡献格、每日列表和区域编排；未来日期不可选，空日明确提示。

当前日志位于 src/data/fixtures/document-activity.js，明确标记为示例；未来事件不展示。正式接入通过实现 ActivityRepository，不在组件中拼假数据。
