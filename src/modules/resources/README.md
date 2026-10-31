# 资源仓库

`index.js` 公开 UI，`services.js` 提供资源目录注入。ResourcesPage 编排列表、搜索、分类与下载说明；RelatedResources 按文章 slug 匹配目录的 articles 字段。没有后台上传或下载统计，不伪造文件大小与校验值。

TreasureChest 为 SVG 与闭包弹簧状态，小黄脸使用专属 ExplorerMascot 的探险帽与挥手，不复用饮料动作；useMotionScope 管理共享帧订阅。减少动态效果时点击切换静态开合，不依赖定时器。宝箱待机只摇晃，点击才开盖发光；招呼反馈不重置宝箱动作。

新增条目：在 content/resources 新建 JSON，补齐 Resource 契约字段，在 data/resources/catalog.js 装配，同时添加 Pages 静态入口。下载 URL 指向实际存储；固定版本文件可扩展契约增加大小与校验值，目前仅收录动态源码包。
