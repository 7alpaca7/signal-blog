# 常见修改入口

工程基础版本已建立。下表区分已存在文件与尚待实现的能力；路径以仓库根目录为基准。

| 修改事项                          | 入口                                                  | 当前状态与边界                                                      |
| --------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------- |
| 首页介绍与栏目文案                | src/pages/home/HomePage.vue                           | 已实现，不在动效引擎修改文案                                        |
| 开发日志标题、正文与标签          | content/posts/*.md                                    | 已实现，正文由构建插件解析并净化，支持标准 Markdown                 |
| 分类、标签、搜索与排序规则        | src/modules/articles/model/archive-filters.js         | 已实现；分类和标签由文章数据推导                                    |
| 归档筛选与 URL 同步               | src/modules/articles/composables/use-archive-query.js | 已实现，输入防抖位于 ArchivePage                                    |
| 列表样式                          | src/modules/articles/components/ArticleList.vue       | 已实现，首页和归档复用                                              |
| 颜色、间距与字体                  | src/shared/styles/tokens.css                          | 已实现；像素展示字体仍待正式素材接入                                |
| 角色渲染与动作                    | src/shared/brand/PixelMascot.vue                      | 已实现；auto 芬达、cola 可乐、sprite 雪碧，爱心与腮红为独立反馈轨道 |
| 文章数据服务接口                  | src/modules/articles/model/article-contracts.js       | 已实现最小契约，尚无分页、缓存与真实 adapter                        |
| 选择数据来源                      | src/app/providers/create-services.js                  | 已装配本地 Markdown；旧 mock 保留为独立测试素材                     |
| 路由与原生历史滚动                | src/app/router/index.js                               | 已实现基础行为；异步正文位置校正和来源返回待完善                    |
| 通用异步请求状态                  | src/shared/composables/use-async-resource.js          | 已实现取消、竞态保护、失败重试与卸载清理                            |
| 依赖边界规则                      | scripts/eslint-architecture.js                        | 已实现分层和跨模块导入限制                                          |
| 工程检查命令                      | package.json                                          | 已配置，执行 npm run check                                          |
| 评论与正式互动接口                | 见架构规划中的对应模块                                | 评论尚未实现；点赞为会话内演示，不代表远端写入                      |
| Motion Tokens、烟花与角色双轨状态 | 见架构规划中的 shared/motion、effects、brand          | 已实现，具体参数见下方                                              |

## 推荐修改步骤

1. 阅读对应模块 README，确定接口和状态来源。
2. 在负责该能力的文件修改，避免复制组件或跨模块读取内部状态。
3. 同步更新 JSDoc、业务注释和相关测试。
4. 执行 npm run check；影响导航和响应式时执行 npm run test:e2e。
5. 新能力首次实现后更新本表，把规划路径替换为真实入口。

## 动效与阅读的实际修改位置

- `src/shared/motion/tokens.js`：唯一时间/物理参数入口；烟花每 5 秒随机 1–5 枚。
- `src/shared/motion/frame-scheduler.js`：全应用 RAF 调度与暂停恢复。
- `src/shared/motion/use-motion-scope.js`：可见性订阅与作用域释放。
- `src/shared/motion/use-motion-preference.js`：全站开关、系统减少动态效果与存储。
- `src/shared/brand/mascot-state.js`：基础动作/反馈双轨状态，不允许点击重置饮料时钟。
- `src/shared/brand/cola-renderer.js`：原确认稿的可乐杯、吸管和闭眼动作；加载器专用原始像素坐标。
- `src/shared/brand/mascot-renderer.js`：缓存的像素身体、嘴型、腮红和三种饮料。
- `src/shared/effects/fireworks-engine.js`：确定性可测试的烟花生成与消散。
- `src/shared/effects/AmbientBackground.vue`：背景波面、指针牵引、点击扩散与烟花绘制。
- `src/shared/navigation/`：初始加载退场、紫灰可乐转场。首次默认播放原版 5.6 秒可乐开场，可随时跳过；后续页面跳转复用同一 cola-renderer，压缩为 1.8 秒，正反方向只改变遮罩方向，不倒放喝可乐。共享 RAF 完成后释放遮罩，关闭动效直接取消；同页筛选和目录 hash 不重播。
- `src/modules/reader/`：原生滚动进度、当前章节与右侧滚动条。
- `src/modules/engagement/`：演示点赞及雪碧动作，状态按 articleId 隔离。

字号与阅读主题目前为详情页会话状态，尚未写入持久化偏好。

## 页面角色差异

- 首页 `HomePage.vue` 显式配置 `beverage="trio" reaction="peace"`：间歇同时喝可乐/雪碧/芬达、点击比耶眨眼，爱心和彩虹同时出现。
- 归档 `ArchivePage.vue` 配置 `beverage="fanta" reaction="affection"`：间歇芬达、点击害羞爱心。
- 两者共用绘制能力但状态实例独立；饮料颜色不决定循环策略，auto 为间歇，文章点赞 sprite 为持续动作。
- 彩虹位于 `src/shared/effects/MascotRainbow.vue`，比耶时长在 Motion Tokens 的 mascot.peace，手势在 mascot-renderer.js 中。喝下阶段保留原有眼睛嘴型，仅叠加手势与外部效果。

首页入场只遮罩角色画布，不遮罩角色容器；结束后释放（animation-fill-mode: backwards），避免裁掉外部彩虹或干扰角色可见性检测；角色绘制世界为 50×40，左侧 8 像素为比耶手预留，CSS 反向偏移保持脸与饮料原位。

## 首页文档打卡

入口 `src/modules/activity/components/DocumentActivity.vue`，放在首页最近记录之后。贡献格为 `ActivityCalendar.vue`，每日变更列表为 `ActivityDayDetails.vue`；修改日志在 `content/posts/*.md` 的 frontmatter revisions，内容通过 ActivityRepository 读取。统计按北京时间，每条新增/修改日志各算一次，非 GitHub/LeetCode 数据。

## 本地 Markdown 内容

写作入口与字段规范见 `content/README.md`。`scripts/content/parse-post.js` 校验 frontmatter、生成目录并净化正文；`scripts/content/content-plugin.js` 生成虚拟索引和按文章拆包的详情，并监听开发时的文件增删改。`src/data/markdown/content-adapter.js` 实现两个 repository，应用 providers 统一注入。页面不读取文件系统。

正文展示集中在 `src/modules/articles/components/ArticleBody.vue`；reader 同时识别 Markdown h2/h3 锚点。打卡来自显式发布/修订日志，不读取 mtime。草稿不打包，部署后的文件变化需要重新构建。当前仍保留示例内容与演示构建保护。

## 分类与话题切换

归档页使用 `src/shared/ui/ChoiceGroup.vue`：分类底色滑动、话题填色跟随，原生按钮保留 aria-pressed 与键盘操作。ResizeObserver 维护换行后的选中位置并在卸载断开；不注册额外 RAF。时长与曲线位于 Motion Tokens 的 control/choice/choiceEase；文章列表离场不再直接 display:none，使用 resultExit 淡出。关闭动效和减少动态效果沿用全站禁用规则。

归档筛选滚动由 `src/app/router/index.js` 管理：同路径、同 hash 的 query 更新不改变滚动位置；历史导航优先恢复 savedPosition，新文章或新 hash 按原规则定位。

## 动效性能维护

静态 small 角色不订阅持续绘制，普通角色浮动仍逐帧更新 transform，面孔仅在眨眼/反馈变化时重绘，饮料绘制限制 30 FPS；画布使用原生像素整数倍率，避免小尺寸角色持有 300×240 缓冲区。可乐固定身体缓存在 cola-renderer，表情与杯子仍动态绘制。背景固定 CSS 像素分辨率、预计算网格、按透明度分桶复用颜色，并保留计时余量；桌面目标 60 FPS，小屏目标 30 FPS，frameTolerance 处理 RAF 时间戳舍入导致的误跳帧；烟花规则不变。全屏开场或转场遮住页面时暂停背景订阅，退场后恢复，不补发遮挡期间的烟花。

阅读滚动只读取 scrollY，章节绝对位置由 ResizeObserver/resize/文章切换时更新；滚动事件合并为单次按需 RAF，卸载取消。useMotionScope 在节点消失时立即退订，静态元素可通过 enabled 禁用。`tests/e2e/performance.spec.js` 统计实际 Canvas 绘制次数，仅验证无效重绘，不代表远程传输延迟或已满足设备 FPS/LCP 指标。

## 资源加载与预览

应用装配改用 articles/activity 的 `services.js` 公开入口，只导入服务，避免开发时提前拉取业务 UI。`src/app/router/use-route-prefetch.js` 在链接悬停、聚焦和触摸按下时并行预取目标路由与单篇正文，复用 pageLoaders 与浏览器模块缓存；省流量/2G 跳过，预取失败不阻止真实导航，卸载取消正文请求。不全量预载文章。可乐转场在 beforeEach 开始，不再等懒加载结束才响应点击；失败导航取消遮罩。

开发模式包含 Vite/HMR 与未打包模块，远程查看时用 `npm run build -- --mode demo` 后 `npm run preview` 的 4173 端口对比，不能把开发服务器的请求图等同于部署产物。生产性能仍需用户实际设备实测。

加载诊断：先运行开发服务，再执行 `PROFILE_DEV_URL=http://127.0.0.1:5173 npm run test:e2e -- tests/e2e/loading-profile.spec.js --project desktop --workers 1`，对比开发/构建请求量、资源解码体积、longtask 与 RAF 采样。该样本不等于用户设备的帧率保证。

首页三杯动作绘制在 `src/shared/brand/trio-drinks.js`：三杯共用同一个举杯进度和时钟，吸管汇流到右侧嘴边；左侧比耶、腮红和外部爱心/彩虹继续独立。归档仍为单杯芬达，开场/转场仍为原版可乐，详情点赞仍为雪碧。杯身 C/S/F 字样与颜色区分三种饮料。三杯模式在底部增加 10 个逻辑像素，脸的倍率与位置保持不变，完整容纳举杯起始帧。

## 当前博客内容

content/posts/ 已移除原五篇设计测试文章，替换为工程搭建、角色动效、Markdown 内容管理和性能加载四篇开发日志。发布时间为本次日志整理入库的时间；没有伪造旧修订，所以贡献表只显示明确发布记录。旧文章 URL 显示不存在，浏览器回归使用新的日志路径。src/data/fixtures 仍为隔离的演示/测试素材，不作为当前内容源。

## GitHub Pages

`.github/workflows/pages.yml` 在 main 推送或手动触发时检查、构建并部署 dist。`.env.pages` 设置仓库基础路径；仓库改名需要同步这里的 VITE_BASE_PATH。`scripts/content/static-entries.js` 为归档与发布文章生成真实入口，解决 Pages 不支持 history rewrite 的直达/刷新问题；404.html 用于不存在页面。未实现正文预渲染，noindex 和互动边界仍在。

## 文献笔记与公式图片

DenoDet 笔记在 content/posts/denodet-attention-feature-denoising.md，7 张配图位于 public/images/denodet/，原笔记和原图来源说明保留。scripts/content/markdown-renderer.js 在构建时生成 KaTeX 片段，正文净化后恢复可信输出（trust:false），不向客户端打包公式执行库。parse-post 接受部署 base 和图片尺寸读取函数，image-assets.js 读取本地 PNG 元信息；图片懒加载并预留比例。ArticleBody 引入自托管公式样式，宽公式在自身范围横向滚动。

站内导航资源失效由 `src/app/router/recover-navigation.js` 处理：真实导航的动态模块/CSS 加载失败时，重新打开目标地址以取得最新构建；预取失败不刷新。同一目标 30 秒内最多恢复一次，sessionStorage 不可用时不自动重载，避免循环。App 的 onError 同时释放转场状态。回归用例覆盖 DenoDet 返回首页、归档、历史导航，以及模拟旧路由资源失效。

RF-DETR 笔记位于 content/posts/rf-detr-weight-sharing-nas.md，10 张配图位于 public/images/rfdetr/。导入时将原始 HTML 锚点转换为 Markdown 显式标题锚点，并替换相对图片路径；论文 PDF 链接指向所读 arXiv 版本。ArticlePage 的正文网格子项 min-width:0，避免手机端宽公式或表格撑大整页。

详情页的 ReadingScrollbar 出现时，base.css 通过 html:has(.reading-rail) 隐藏根原生滚动条外观，不设置 overflow:hidden。原生滚轮、触摸、键盘与历史位置恢复保持有效；离开详情或未加载出阅读条时自动恢复原生条。正文公式、表格的局部横向滚动条不受影响。

创作足迹色阶在 ActivityCalendar.vue：无记录为带细边框的深灰，1–4+ 次为明亮绿至酸黄；最低非零档采用深色数字以维持文字辨识度，图例从“无”到“多”，与日期格共用 level 样式。

资源仓库入口为 /resources，详情为 /resources/:id；资源元数据位于 content/resources/，由 data/resources/catalog.js 显式装配并经 RESOURCE_CATALOG 注入。当前仅收录真实 SIGNAL 源码包，未上传的软件或镜像分类显示空态。articles 字段控制文章尾部关联；新增资源同时更新 static-entries.js 的 Pages 入口。TreasureChest 使用 SVG 与共享 RAF 弹簧，参数在 Motion Tokens chest，独立于小黄脸；关闭动效时点击静态开合。

资源仓库现使用独立 ExplorerMascot：探险帽、挥手与招呼星光，不复用饮料动作。宝箱待机分批摇晃与顶盖，只有点击开启光束；两者计时独立，参数位于 MOTION.explorer/chest，共享可见性帧调度与减少动效设置。

宝箱视觉为原创 SVG 三分之四透视、分层木纹与金属包边。开箱光使用渐变光晕、摆动光束、箱口亮边和预建的 12 个上升星粒；逐帧只修改 SVG 属性，不创建节点。参数统一在 MOTION.chest，关闭动效显示静态光效。
