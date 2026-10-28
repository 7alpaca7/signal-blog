# 仓库开发约定

本文件适用于整个仓库。后续实现、修复与重构必须先阅读并遵循：

- docs/architecture/frontend.md
- docs/engineering/code-quality.md
- docs/engineering/standards.md
- docs/engineering/maintenance-guide.md

## 必须保持的原则

1. 使用 Vue 3 + JavaScript，组件采用 Composition API 与 script setup；不擅自迁移 TypeScript 业务源码。
2. 保持 app → pages → modules → shared 依赖方向；数据 adapter 由应用服务装配，不让页面直接依赖 mock 或 HTTP 实现。
3. 统一代码风格与中文说明性注释。公共 API 使用 JSDoc，复杂业务规则和资源生命周期必须说明原因。
4. 基础角色动作与点击反馈独立，不能为实现害羞反馈覆盖喝芬达的表情或重置动作时钟。
5. 动效参数集中管理，高频绘制数据不进入 Vue 深响应式状态；所有 RAF、timer、observer、listener 都有清理路径。
6. 优先局部、清楚的实现；不预建未使用的抽象，不生成大量空文件，不把代码压缩为难读的长行。
7. 功能或目录变化同步更新维护指南；尚未实现、未测试、未接入的能力如实标明。
8. 工具链建立后运行与修改相符的检查。检查命令见 README；只有实际执行成功后才能报告通过，不能把配置存在当成验证完成。

未决业务采用 docs/implementation-plan.md 中明确的暂定规则；需要真实后端身份、权限或生产部署决策时，再确认对应事项。
