# 本地 Markdown 写作

文章放在 `content/posts/`，允许子目录。新建 `.md` 即加入网站，删除即移除，`draft: true` 不输出到索引或详情。文件名默认是文章 slug（小写英文、数字、短横线）；发布后不要改 slug，以免旧链接失效。当前目录存放 SIGNAL 自身的开发日志与文献笔记；原五篇设计示例已移除。日志在整理入库时发布，不为历史开发步骤补造修订时间。

```md
---
title: 我的第一篇记录
excerpt: 用一句话介绍这篇文章。
category: 开发实践
tags: [Vue, JavaScript]
publishedAt: '2026-10-28T10:00:00+08:00'
draft: false
revisions:
  - at: '2026-10-28T14:00:00+08:00'
    summary: 补充代码示例
---

## 开始 {#start}

这里写正文，支持 **加粗**、列表、引用、表格、图片和围栏代码块。
```

- 必填：title、excerpt、category、tags、publishedAt。tags 可以是空数组。
- 可选：slug（默认文件名）、readingMinutes（正整数，省略按正文长度估算）、draft（默认 false）、revisions（默认空数组）。
- 时间使用带时区的 ISO 字符串并加引号。文章发布日期及打卡按北京时间展示。发布文章自动产生一条新增记录；每条 revisions 产生一次修改，修订不能早于发布，不能重复时间。未来的活动不会提前打卡。
- 保存文件不会自动追加 revisions：文件 mtime 无法恢复历史，避免每次保存、复制或拉取文件就虚增贡献。需要记录的修订由作者写入。
- 二级、三级标题进入目录，可用 `{#stable-anchor}` 固定锚点，重复标题自动加后缀。建议正文从二级标题开始，页面已展示文章主标题。
- 图片放在 `public/images/`，正文使用 `/images/文件名.webp`；不要使用相对 Markdown 文件路径。图片可用 Markdown 标准语法；代码块支持语言类名，暂未接语法着色。
- 不支持原始 HTML、Vue 组件、脚本或 MDX。正文统一净化，不允许执行 HTML。
- 开发时增删改文章会整页刷新，重新播放开场；部署后需要重新执行构建并发布，浏览器不能扫描服务器或用户电脑的任意目录。

前端页面仍通过 ArticleRepository / ActivityRepository 读取；本地内容处理位于 `scripts/content/`，浏览器适配器位于 `src/data/markdown/`。构建时生成轻量索引，详情正文独立拆包。元信息错误和重复 slug 会阻止构建并指出文件。

当前继续使用演示构建命令 `npm run build -- --mode demo`：会话点赞、禁止索引等展示阶段边界仍在，不能把 Markdown 接入视为生产发布完成。

公式支持 `$...$`、`$$...$$` 和 LaTeX 括号语法，KaTeX 在构建时渲染，浏览器只加载样式及所需字体。原始 HTML 仍关闭，公式 trust:false。`/images/` 本地路径会自动添加部署基础路径，PNG 尺寸在构建时写入，避免加载后正文跳动。
