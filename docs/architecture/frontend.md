# 前端架构设计

## 1. 目标与范围

目标是一个可维护、可测试、可接入真实内容服务的创意博客前端。采用单应用、按业务模块组织的模块化架构，不引入微前端、依赖注入容器或通用插件平台。

首期业务：网站加载、首页、文档活动记录、文章归档、文章详情、阅读设置、点赞、评论与回复、返回位置恢复，以及统一转场和品牌动效。登录、后台管理、独立项目页和关于页不纳入本期。

首期使用 Vite SPA。公网博客的搜索收录与分享预览是发布前的架构检查项：CSR 不能保证所有爬虫获取正文和动态元信息；若需要完整 SEO，发布前增加构建时预渲染，并验证输出的每篇文章 HTML，不将客户端修改 meta 视为 SEO 完成。若内容更新频率或部署方式不适合预渲染，再单独评估 SSR，避免默默扩大首期框架范围。

## 2. 目标目录

以下是规划目录；`*.test.js` 与组件在实际实现对应功能时创建。

```text
boke/
├── docs/
│   ├── architecture/frontend.md
│   ├── engineering/standards.md
│   └── implementation-plan.md
├── public/
│   ├── favicon.svg
│   └── robots.txt                   # 发布环境生成/配置，演示环境禁止索引
├── src/
│   ├── main.js                      # 创建应用与挂载
│   ├── app/
│   │   ├── App.vue                  # 应用外壳、路由出口、全局覆盖层
│   │   ├── router/
│   │   │   ├── index.js             # 路由实例与滚动恢复
│   │   │   ├── routes.js            # 懒加载路由与静态 meta
│   │   │   └── navigation-context.js # 来源与返回目标校验
│   │   ├── layouts/BlogLayout.vue   # 页头、页脚、主内容容器
│   │   └── providers/
│   │       ├── create-services.js   # 选择内容 adapter
│   │       └── service-keys.js      # Vue provide/inject 的服务标识
│   ├── pages/
│   │   ├── home/HomePage.vue
│   │   ├── archive/ArchivePage.vue
│   │   ├── article/ArticlePage.vue
│   │   └── not-found/NotFoundPage.vue
│   ├── modules/
│   │   ├── articles/
│   │   │   ├── components/
│   │   │   │   ├── ArticleList.vue
│   │   │   │   ├── ArticleListItem.vue
│   │   │   │   ├── ArchiveFilters.vue
│   │   │   │   ├── ArchiveSummary.vue
│   │   │   │   ├── ArticleHeader.vue
│   │   │   │   ├── ArticleBody.vue
│   │   │   │   └── ArticleNeighbors.vue
│   │   │   ├── composables/use-archive-query.js
│   │   │   ├── composables/use-article.js
│   │   │   ├── services/article-repository.js
│   │   │   ├── model/article-contracts.js
│   │   │   ├── model/article-mappers.js
│   │   │   ├── model/archive-filters.js
│   │   │   ├── model/archive-filters.test.js
│   │   │   └── index.js
│   │   ├── activity/
│   │   │   ├── components/ActivityCalendar.vue
│   │   │   ├── components/ActivityDayDetails.vue
│   │   │   ├── composables/use-document-activity.js
│   │   │   ├── services/activity-repository.js
│   │   │   ├── model/activity-contracts.js
│   │   │   └── index.js
│   │   ├── reader/
│   │   │   ├── components/ArticleToc.vue
│   │   │   ├── components/ReadingProgress.vue
│   │   │   ├── components/ReadingScrollbar.vue
│   │   │   ├── components/ReadingSettings.vue
│   │   │   ├── composables/use-reading-position.js
│   │   │   ├── composables/use-active-heading.js
│   │   │   ├── stores/reading-preferences.js
│   │   │   └── index.js
│   │   └── engagement/
│   │       ├── components/ArticleLike.vue
│   │       ├── components/CommentForm.vue
│   │       ├── components/CommentList.vue
│   │       ├── components/CommentItem.vue
│   │       ├── composables/use-article-like.js
│   │       ├── composables/use-comments.js
│   │       ├── services/engagement-repository.js
│   │       ├── model/engagement-contracts.js
│   │       ├── model/comment-validation.js
│   │       └── index.js
│   ├── shared/
│   │   ├── ui/                     # 无业务语义的按钮、输入、空/错/加载状态
│   │   ├── brand/
│   │   │   ├── PixelMascot.vue
│   │   │   ├── mascot-renderer.js
│   │   │   ├── mascot-state.js
│   │   │   └── mascot-state.test.js
│   │   ├── motion/
│   │   │   ├── tokens.js
│   │   │   ├── frame-scheduler.js
│   │   │   ├── use-motion-scope.js
│   │   │   ├── use-spring.js
│   │   │   └── use-motion-preference.js
│   │   ├── effects/
│   │   │   ├── AmbientBackground.vue
│   │   │   ├── DigitalFireworks.vue
│   │   │   ├── MascotHearts.vue
│   │   │   ├── fireworks-engine.js
│   │   │   ├── fireworks-config.js
│   │   │   └── use-effect-quality.js
│   │   ├── navigation/
│   │   │   ├── InitialLoader.vue
│   │   │   └── RouteTransition.vue
│   │   ├── services/
│   │   │   ├── http-client.js
│   │   │   ├── app-error.js
│   │   │   └── storage.js
│   │   ├── composables/            # 真正跨业务复用的组合逻辑
│   │   ├── lib/                    # 时间、文本等无状态纯函数
│   │   └── styles/
│   │       ├── tokens.css
│   │       ├── reset.css
│   │       ├── base.css
│   │       └── typography.css
│   ├── data/
│   │   ├── mock/                   # 各 repository 的演示 adapter
│   │   ├── http/                   # 接口确定后实现的真实 adapter
│   │   └── fixtures/               # 演示文章、活动与评论；与生产内容隔离
│   └── assets/
│       ├── fonts/
│       ├── sprites/
│       └── images/
├── tests/
│   ├── setup.js
│   └── e2e/                        # 访问、筛选、返回、阅读、互动主流程
├── .github/workflows/ci.yml
├── .editorconfig
├── .env.example
├── .gitignore
├── .npmrc
├── .node-version
├── eslint.config.js
├── prettier.config.js
├── jsconfig.json
├── vite.config.js
├── vitest.config.js
├── playwright.config.js
├── index.html
├── package.json
└── package-lock.json
```

测试框架的 Playwright 与开发阶段的浏览器检查工具是不同事项；后者不能代替提交到仓库的可重复回归用例。

## 3. 依赖方向

`app → pages → modules → shared`。`app/providers` 可以读取 `data` 并装配 repository；modules 不直接导入 data、环境变量或具体 HTTP 客户端。

- 页面负责组合模块和路由参数，不包含粒子算法、请求细节或复杂数据转换。
- 模块通过自己的 `index.js` 暴露组件、composable；应用服务通过不包含 UI 的 `services.js` 公开入口装配；模块之间不深层导入内部文件。
- 跨模块组合优先放到页面：ArticlePage 组合文章、阅读与互动模块，避免三个模块互相调用。
- shared 不导入 pages、modules、app、data。公共代码不能依赖某篇文章或具体分类。
- `data` adapter 实现业务契约，可引用契约类型和公共基础设施，不能反向引入页面或模块组件。
- ESLint 限制反向依赖和跨模块深层引用；工具配置与测试文件按明确规则豁免。
- 不建立通用 event bus；父子组件用 props/emits，跨页面客户端状态用 Pinia，应用服务用 provide/inject。

## 4. 路由与状态归属

| URL               | 责任                             | 状态归属                                       |
| ----------------- | -------------------------------- | ---------------------------------------------- |
| `/`               | 首页、最近记录、文档活动         | 月份可用 query 表示；日选中为页面状态          |
| `/articles`       | 全部记录、分类、话题、搜索、排序 | `q/category/tag/year/sort/page` 写入 URL query |
| `/articles/:slug` | 同一套文章详情                   | slug 定位正文；hash 定位章节                   |
| 未匹配路由        | 404 与返回入口                   | 页面本地状态                                   |

- 输入框即时输入为本地状态；防抖后更新 query，普通打字用 replace，明确导航用 push，避免历史记录被每个字符占满。
- 筛选变更清零页码；未知分类、无效年份、越界页码统一规范化；默认值不冗余写入 URL。
- URL 是筛选的唯一事实来源，Pinia 不再复制一份筛选条件。
- 服务器数据由 composable 管理加载与缓存，不把全部正文、评论塞入全局 store。先实现简单按参数键控缓存，不预设复杂查询框架。
- 阅读偏好与动效偏好跨页使用 Pinia；只有允许持久化的偏好落地浏览器存储，携带版本并提供失效回退。
- 像素轨迹、帧时间、指针位置、烟花粒子等高频数据放在引擎内部，不进入 Vue 深响应式树。

返回规则采用“回到来源”的暂定实现：归档进入详情后返回原 query 与原滚动位置；首页进入详情后返回首页原位置；直接访问详情默认返回归档。记录内部来源时只接受本网站命名路由，不接受任意外链。

正式项目优先使用页面原生滚动，以浏览器历史恢复为基础。详情目录与页头使用 sticky；像素滚动条基于同一个滚动源绘制，并保留键盘和原生滚动能力。概念稿为内嵌预览使用的固定高度滚动容器，不直接沿用到正式网站。

滚动恢复等待文章数据和布局可测量后执行；图片提供尺寸，字体加载导致位置变化时进行有限校正；有 hash 时优先定位章节，避免恢复旧位置覆盖深链接。

## 5. 数据服务契约

通过 JSDoc typedef 明确领域模型，adapter 在边界做字段转换和必要运行时校验。UI 不接触后端响应 envelope。

- `ArticleSummary`：id、slug、title、excerpt、category、tags、publishedAt、updatedAt、readingMinutes。
- `ArticleDetail`：summary 字段 + body、toc、previous、next；正文格式与渲染器固定约定，标题 id 唯一且稳定。
- `ArticleQuery`：keyword、category、tag、year、sort、page、pageSize。
- `ArticleListResult`：items、total、page、pageSize、facets；明确分类计数是全局总量还是当前结果，不能混用。
- `DocumentActivity`：id、articleId、articleSlug、documentTitle、action（created/updated）、occurredAt；按 Asia/Shanghai 日历日聚合，明确同一天多次修改的计数口径。
- `ArticleReaction`：articleId、likedByMe、likeCount；正式环境以服务端确认为准。
- `Comment`：id、articleId、parentId、nickname、content、createdAt、status。回复按 parentId 关联，不依靠昵称判断关系。
- `AppError`：code、message、retryable、requestId；取消请求不显示成失败。

Repository 对外提供：

```js
articles.list(query, { signal });
articles.getBySlug(slug, { signal });
activity.listByMonth(month, { signal });
engagement.getReaction(articleId, { signal });
engagement.setLike(articleId, liked, { signal, requestKey });
engagement.listComments(articleId, pagination, { signal });
engagement.createComment(articleId, input, { signal, requestKey });
```

这是前端契约，不是已确定的后端 URL。`signal` 支持取消旧请求；写操作的 requestKey 是否映射为服务端幂等键，在接口协商时确定。快速切换文章或筛选时只接受最新请求结果。

所有页面覆盖 loading、success、empty、error；互动额外覆盖 submitting、success、error。点赞可乐观更新但失败回滚，提交中禁用重复操作；评论不静默丢失输入、不虚报发布成功，回复目标随文章切换清空。

## 6. 小黄脸与动效系统

品牌角色使用一套 renderer，饮料类型参数化，不复制三份笑脸。

**基础动作轨道**：idle、cola（首次加载）、auto（首页间歇雪碧、归档间歇芬达，饮料通过 beverage 独立配置）、sprite（文章点赞反馈）。不同实例拥有独立状态和时钟，业务通过 props/emits 控制，不相互污染。

**叠加反馈轨道**：blush、hearts、press，以及首页专用 peace 与 rainbow。点击只触发叠加层，不重置基础动作计时、不替换喝饮料时的眼睛嘴型；芬达结束后恢复 idle，腮红独立淡出。渲染顺序：身体 → 基础表情 → 腮红 → 手臂与饮料 → 外部爱心，保证杯子和吸管前景正确。

芬达暂沿概念稿：首次约 8 秒后播放，每次约 5.6 秒，后续随机等待 13–19 秒。参数集中管理。

数字烟花：自动批次间隔 5 秒，每批随机 1–5 枚；爆炸大小、颜色、位置和升空时长随机；一批内部小幅错峰。随机抽样发生在创建粒子时，不每帧重新采样。引擎允许注入时钟和随机源用于确定性验证。移动端通过减少单枚粒子数、DPR 和帧率降级，保持已确认的批次数量规则。

帧调度器由应用级作用域持有，各效果订阅同一时间源；路由卸载取消订阅。不可见、后台标签页、关闭动效或减少动态效果偏好时停止连续更新，不隐藏关键业务内容。恢复时限制步长，避免粒子跳跃或烟花补发。禁止每个组件创建永久独立 RAF 和无清理定时器。

Motion Tokens 是动态数值的唯一配置入口，效果配置引用它；CSS 时长通过统一桥接输出变量，避免 CSS 与 JS 两套互不一致的参数。主题、尺寸与间距属于视觉 tokens，保持与 motion tokens 的职责分离。

首次加载不伪造百分比、不无限等待字体或装饰资源；加载失败提供重试。根据已确认的可乐开场要求，首次进入默认播放原稿完整 5.6 秒动作，内容就绪后提供跳过入口；减少动态效果时直接进入。站内跳转复用同一可乐角色，播放 1.8 秒的压缩举杯/喝下/微笑转场，不重复完整 5.6 秒开场。同页筛选和 hash 不触发转场。路由取消或失败必须释放遮罩、恢复焦点和交互，不能等待所有装饰动画结束才导航。

## 7. 内容与上线边界

- mock 和 HTTP 模式必须明确标识；正式构建检查禁止意外使用演示 adapter。
- Markdown 默认关闭原始 HTML，渲染结果经过安全处理；评论按纯文本显示。外链属性与资源来源统一处理。
- 不在前端环境变量保存服务端密钥；所有 `VITE_` 配置都视为可公开数据。
- 点赞和评论的身份校验、审核、限流与权限必须由服务端执行，前端禁用按钮不能替代。
- 生产历史路由需要托管服务回退 index.html；真实不存在的文章和预渲染 404 策略需与部署协商。
- 字体自托管且确认授权；正文图片显式尺寸、按需加载，装饰不阻塞关键内容。

## 8. 待确定的业务决策

未决项不得以已实现能力对外呈现：评论是否登录/审核、点赞身份与去重规则、文档活动计数口径、活动记录跳转规则、上线 SEO 与托管方式。

这些不阻塞 mock 骨架和前端视觉实施。首次接真实写接口和生产发布前必须确认对应决策。

## 当前内容来源（展示阶段）

内容确定采用仓库 `content/posts/` Markdown。Vite 构建插件生成摘要索引与独立正文 chunk；页面通过既有 repository 访问，前端不扫描运行环境目录。发布/修订日志写在 frontmatter，按北京时间聚合；草稿过滤。具体格式见 `content/README.md`。生产 SEO、评论身份与部署仍未决定。
