# 文档活动模块

公开组件 DocumentActivity 放在首页最近记录之后。显示博客文档新增/修改记录，不代表 GitHub 或 LeetCode 提交。

- model/activity-calendar.js：Asia/Shanghai 日期聚合、真实月份验证、周一开头的贡献格算法。每条日志算一次文档变更，同一天同一文档多次修改分别计数。
- composables/use-document-activity.js：默认三个月完整月历查询、月份请求、日期选择及统计，复用请求取消和竞态保护。
- services/activity-repository.js：注入接口，应用 providers 选择 adapter。
- components：贡献格、每日列表和区域编排；未来日期不可选，空日明确提示。

当前日志来自 content/posts/*.md 的 publishedAt/revisions，由 Markdown adapter 装配；未来事件不展示。fixtures 仅保留为测试素材。默认展示本月和前两个月完整公历，每月以周一为第一列，补空格到六周，仅真实日期可点击。窗口统计、无记录月份、未来禁用、今天与选中态、方向键跨月导航、回到今天均由 activity 模块负责。午夜按北京时间刷新，后台恢复时校正；请求取消、竞态和失败重试复用 useAsyncResource。
