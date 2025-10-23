# 这是一些有趣的油猴脚本

## [Browser_Video_Recorder.js](./Browser_Video_Recorder.js)

使用 MediaStream Recording API 录制浏览器标签页内容。点击固定在右上角的按钮开始/停止录制，录制完成后自动下载为 WebM 格式的视频文件。

**使用方法：**
- 在任意网页上安装并启用脚本
- 页面右上角会出现"开始录制"按钮
- 点击开始录制，选择要录制的屏幕区域
- 录制完成后点击"停止录制"按钮
- 视频将自动下载到本地

## [chatgpt-copy.js](./chatgpt-copy.js)

ChatGPT 增强 Markdown 复制工具，支持代码块、表格、数学公式等格式。使用 Alt + Shift + C 快捷键复制 ChatGPT 响应为 Markdown 格式。

**功能特性：**
- 支持代码块语法高亮
- 表格转换为 Markdown 表格
- KaTeX 数学公式（行内和块级）转换为 LaTeX 语法
- 自动处理链接和文本格式

**使用方法：**
- 在 ChatGPT 页面安装脚本
- 选中要复制的内容
- 按 Alt + Shift + C 快捷键
- Markdown 内容将复制到剪贴板

## [CSDN_Print.js](./CSDN_Print.js)

在 CSDN 博客页面右上角添加"清理并打印"按钮，点击后自动清理页面广告和无关元素，保留文章内容并触发打印功能。

**功能特性：**
- 自动移除 CSDN 页面广告
- 清理工具栏和侧边栏
- 保持文章标题和内容完整
- 优化打印布局

**使用方法：**
- 在 CSDN 博客页面安装脚本
- 页面右上角会出现"清理并打印"按钮
- 点击按钮自动清理页面
- 浏览器将打开打印预览

## [csdn2md](./csdn2md)

批量下载 CSDN 文章为 Markdown 格式，支持专栏批量下载。支持 KaTeX 数学公式、图片、代码块等多种格式。

**功能特性：**
- 支持单篇文章下载
- 批量下载专栏文章
- 批量下载用户全部文章
- 数学公式渲染（KaTeX）
- 代码语法高亮
- 图片本地保存
- 表格支持
- 目录生成
- YAML 元信息添加

**使用方法：**
- 在 CSDN 文章、专栏或用户主页安装脚本
- 页面右上角会出现下载按钮
- 点击下载，支持多种配置选项
- 文章将以 Markdown 格式下载

## [MarkdownView.js](./MarkdownView.js)

这是一个 Java 代码文件，不是油猴脚本。包含一个两数之和的算法实现。

## [readmedium.js](./readmedium.js)

Medium 解锁工具，自动检测 Medium 文章并替换 URL 为 readmedium.com 来解锁付费内容。

**功能特性：**
- 自动检测 Medium 文章
- 支持子域名和自定义域名
- 拖拽式浮动按钮
- 自动重定向到解锁页面

**使用方法：**
- 在 Medium 文章页面安装脚本
- 页面会自动检测并显示浮动按钮
- 点击按钮跳转到解锁版本

## [Universal_Markdown_Viewer.js](./Universal_Markdown_Viewer.js)

通用 Markdown 查看器，支持在浏览器中直接查看 Markdown 文件。具有语法高亮、数学公式、Mermaid 图表等功能。

**功能特性：**
- 语法高亮（Highlight.js）
- 数学公式渲染（KaTeX）
- Mermaid 图表支持
- 视频播放器集成（Video.js）
- 图片点击放大
- 代码块复制按钮
- 响应式设计（支持移动端）
- 目录自动生成
- 深色主题支持

**使用方法：**
- 将 .md 文件放在支持的服务器上
- 访问文件 URL，脚本会自动渲染
- 支持本地文件（file:// 协议）

## [Zhihu2Markdown.js](./Zhihu2Markdown.js)

知乎内容下载工具，支持下载知乎文章、回答、视频、专栏为 Markdown 格式。

**支持的平台：**
- 知乎专栏文章
- 知乎问答回答
- 知乎视频
- 知乎专栏
- CSDN 博客文章
- CSDN 专栏
- 微信公众号文章
- 掘金文章

**功能特性：**
- HTML 转 Markdown 转换
- 数学公式支持
- 表格转换
- 代码块处理
- 图片处理

**使用方法：**
- 在支持的页面安装脚本
- 页面右上角会出现下载按钮
- 点击下载为 Markdown 格式

## [zotero-gpt.js](./zotero-gpt.js)

Zotero GPT 连接器，支持与多种 AI 聊天工具集成，实现文献管理和 AI 问答的联动。

**支持的 AI 平台：**
- ChatGPT
- Gemini
- Poe
- Kimi
- Coze
- ChatGLM
- 百度文心一言
- 通义千问
- Claude
- MyTan
- ChandlerAI
- DeepSeek
- Doubao
- AI Studio
- Zaiwen
- Yuanbao
- Monica
- Copilot
- Qwen
- Tencent DeepSeek
- AskManyAI
- Wenxiaobai
- Grok
- Xiaoyi
- Baidu
- Perplexity
- Sider
- Google NotebookLM
- MinMax

**功能特性：**
- 自动检测 AI 平台
- 实时响应拦截
- 文件上传支持
- 多标签页支持
- 优先级控制

**使用方法：**
- 在 Zotero 中安装插件
- 在支持的 AI 页面安装脚本
- 脚本会自动连接 Zotero 和 AI 工具
## [youtubedownload.js](./youtubedownload.js)

YouTube 工具多合一本地下载 MP4、MP3 高质量视频和音频，支持返回不喜欢数和更多功能。

**功能特性：**
- 本地下载 MP4 和 MP3 高质量视频
- 返回不喜欢数
- 翻译评论
- 隐藏评论、侧边栏
- 禁用自动播放和字幕
- 自定义主题
- 统计观看时间
- 波形可视化器
- 视频质量选择
- 电影模式
- 同步 YouTube 环境模式
- 背景图像自定义
- 导入/导出设置

**使用方法：**
- 在 YouTube 页面安装脚本
- 页面右上角会出现设置按钮
- 点击设置按钮配置选项
- 使用下载按钮下载视频或音频

## [媒体资源嗅探及下载(支持下载m3u8和mp4视频和音频).user.js](./媒体资源嗅探及下载(支持下载m3u8和mp4视频和音频).user.js)

媒体资源嗅探及下载工具，支持下载 m3u8 和 mp4 视频和音频，解除页面复制限制。

**功能特性：**
- 自动嗅探页面上的视频、音频资源
- 支持播放、复制和下载功能
- 提供 mp3、mp4 和 m3u8 资源下载
- 录屏功能
- 解除页面复制限制
- 支持多种网站（Bilibili、Douyin 等）

**使用方法：**
- 在任意网页安装脚本
- 脚本会自动嗅探媒体资源
- 页面右下角会出现下载按钮
- 点击下载或播放资源