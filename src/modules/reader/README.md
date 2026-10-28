# 阅读模块

useReadingPosition 测量拥有的 article 元素，公开进度、当前章节与 seek。
ReadingScrollbar 是原生键盘可操作的 range，仅发出 seek，不直接读取其他模块状态。

页面滚动仍由浏览器管理；所有滚动、尺寸观察监听在作用域退出时释放。字号/主题目前在详情页会话内保存，尚未持久化。
