# SIGNAL · 创意开发者个人博客

Vue 3 + JavaScript 前端。视觉基线为已确认的街机像素博客：首页、文章归档、统一文章详情，以及全站小黄脸和动效。

## 本阶段交付

工程基础版本，包含首页、归档组合筛选、文章详情与 404。文章通过注入的本地 Markdown repository 读取；归档筛选写入 URL，支持刷新恢复。已接回统一动效：背景轨迹、5 秒随机烟花、角色饮料动作/爱心叠加、惯性跟随、方向 hover、首屏退场与路由转场；详情包含进度、目录跟随、阅读滚动条、字号/配色及会话内演示点赞。首页文档活动表已接入（月份切换、贡献格、当天变更与文章跳转），评论和正式后端仍未接入；首次进入默认播放确认稿的 5.6 秒可乐开场，内容就绪后可随时跳过；减少动态效果时直接进入，不伪造加载进度。

## 启动

开发环境固定 Node 24.17.0、npm 11.13.0；可接受的版本范围见 package.json。

类型检查工具固定 TypeScript 5.9.3 以兼容当前 vue-tsc；仅用于检查 JavaScript/JSDoc，不引入 TypeScript 业务文件。升级时需联合验证这两项依赖。

```sh
npm ci
npm run dev
```

打开 http://127.0.0.1:5173。开发模式读取 content/posts/ 下的 Markdown，不需要密钥或环境文件。写作格式见 [本地内容说明](content/README.md)。当前内容已替换为 SIGNAL 自身的开发日志。

## 常用检查

```sh
npm run check
npm run test:unit:watch
```

check 包含 ESLint、Prettier、JavaScript/JSDoc 与 Vue SFC 检查、单元测试以及显式的演示构建。

```sh
npx playwright install chromium
npm run test:e2e
```

浏览器回归覆盖桌面与窄屏；首次安装浏览器需要网络。CI 在独立环境安装浏览器及系统依赖。

## 构建预览

```sh
npm run build -- --mode demo
npm run preview
```

构建产物位于 dist，预览地址 http://127.0.0.1:4173。直接执行 npm run build 默认拒绝演示数据，防止把示例误作正式发布。正式适配器接入前不支持生产发布；所有页面暂设置 noindex，robots.txt 禁止索引。

## 维护入口

- [完整架构规划](docs/architecture/frontend.md)
- [代码质量与注释规范](docs/engineering/code-quality.md)
- [工程验收标准](docs/engineering/standards.md)
- [常见修改入口及当前实现状态](docs/engineering/maintenance-guide.md)
- [实施进度](docs/implementation-plan.md)

src/app 负责装配，pages 负责编排，modules 持有业务，shared 提供公共能力，data 实现具体服务。工程不会把旧概念稿的单文件脚本整体搬进 Vue。

## GitHub Pages 发布

线上地址：https://7alpaca7.github.io/signal-blog/ 。向 main 推送后，Deploy GitHub Pages 工作流检查并自动构建发布；也可在 Actions 手动触发。

`npm run build:pages` 使用 `/signal-blog/` 基础路径，为归档及每篇已发布文章生成静态入口，支持直接打开和刷新。它们是 Vue 应用入口，尚不是正文预渲染。新增 Markdown 后需要推送并等待部署成功。当前会话点赞、评论未接入及禁止索引的展示阶段边界保持明确。
