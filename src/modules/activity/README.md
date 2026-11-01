# 文档活动模块

公开组件 DocumentActivity 放在首页最近记录之后。显示博客文档新增/修改记录，不代表 GitHub 或 LeetCode 提交。

- model/activity-calendar.js：Asia/Shanghai 日期聚合、真实月份验证、周一开头的贡献格算法。每条日志算一次文档变更，同一天同一文档多次修改分别计数。
- composables/use-document-activity.js：默认最近 26 周跨月查询、月份请求、日期选择及统计，复用请求取消和竞态保护。
- services/activity-repository.js：注入接口，应用 providers 选择 adapter。
- components：贡献格、每日列表和区域编排；未来日期不可选，空日明确提示。

当前日志来自 content/posts/*.md 的 publishedAt/revisions，由 Markdown adapter 装配；未来事件不展示。fixtures 仅保留为测试素材。默认热力图连续覆盖最近 26 周，月初仍能看到上月；月度模式继续支持历史月份选择。统计对应所选范围，移动端在日历内部横向滚动，默认展示最近一周。
