// ==UserScript==
// @name         Universal Markdown Viewer
// @namespace    http://tampermonkey.net/
// @version      2.0.0
// @description  Universal markdown viewer for any website with syntax highlighting and math support
// @author       You
// @match        file://*/*.md
// @match        file://*/*.markdown
// @match        file://*/*.mdown
// @match        file://*/*.mkd
// @match        file://*/*.mkdn
// @match        http://192.168.*/*.md
// @match        https://192.168.*/*.md
// @match        https://*.ninglang.top*/*.md
// @match        http://*.ninglang.top*/*.md

// @grant        none
// @run-at       document-end
// @connect      *
// ==/UserScript==

(function() {
    'use strict';

    // ==================== 用户配置区域 ====================

    // 复制链接格式配置（用户可修改切换模式）
    const COPY_LINK_FORMAT = 'markdown'; // 'markdown' 或 'html'

    // 桌面端数学公式字体大小配置（用户可根据需要调整）
    const DESKTOP_FORMULA_CONFIG = {
        fontSize: '1.1em'  // 桌面端行间公式字体大小，可调整为 1.2em, 1.4em, 1.5em 等
    };
    
    // ==================== 功能开关配置 ====================
    const FEATURE_TOGGLES = {
        // 是否显示右上角的Markdown工具悬浮窗
        // 设置为 false 可以隐藏工具栏，提供更干净的阅读体验
        showFloatingTools: false,

        // 其他功能开关（可根据需要启用/禁用）
        enableImageZoom: true,        // 图片点击放大功能
        enableCodeCopy: true,         // 代码块复制按钮
        enableMathFormula: true,      // 数学公式渲染（KaTeX）
        enableMermaidDiagram: true,   // Mermaid图表渲染
        enableVideoPlayback: true,    // 视频播放支持（桌面端和移动端）
        showMobileTocButton: false,   // 移动端目录栏悬浮按钮
        enableMobileFormulaConversion: true  // 移动端行内公式自动转换为行间公式
    };

    // ==================== 移动端数学公式大小配置 ====================
    const MOBILE_FORMULA_CONFIG = {
        // 行间公式配置
        display: {
            // 基础移动端 (≤ 900px)
            base: {
                fontSize: '1.1em',  // 增大行间公式字体
                lineHeight: '1.5',
                minHeight: '2em',
                padding: '0.5em 0',
                margin: '0.5em 0'
            },
            // 小屏设备 (≤ 600px)
            small: {
                fontSize: '1.15em'  // 保持合理大小
            },
            // 超小屏设备 (≤ 400px)
            xsmall: {
                fontSize: '1.0em',  // 从0.8em增大到1.0em
                margin: '0.3em 0'
            }
        },
        // 行内公式配置
        inline: {
            fontSize: '1.16em',
            lineHeight: '1.8'
        }
    };

    // ==================== 资源链接配置 ====================
    // 以下是所需的CDN资源链接，可以下载到本地后修改这些路径
const RESOURCES = {
    // Markdown解析器
    markdownIt: 'https://share.ninglang.top:7012/web/resource/markdown-desktop/markdown-it.min.js',

    // 插件
    markdownItCheckbox: 'https://share.ninglang.top:7012/web/resource/markdown-desktop/markdown-it-checkbox.min.js',
    markdownItEmoji: 'https://share.ninglang.top:7012/web/resource/markdown-desktop/markdown-it-emoji.min.js',
    markdownItFootnote: 'https://share.ninglang.top:7012/web/resource/markdown-desktop/markdown-it-footnote.min.js',

    // 代码高亮
    highlightJs: 'https://share.ninglang.top:7012/web/resource/markdown-desktop/highlight.min.js',
    highlightCss: 'https://share.ninglang.top:7012/web/resource/markdown-desktop/default.min.css',

    // 数学公式
    katex: 'https://share.ninglang.top:7012/web/resource/markdown-desktop/katex.min.js',
    katexCss: 'https://share.ninglang.top:7012/web/resource/markdown-desktop/katex.min.css',
    markdownItTexmath: 'https://share.ninglang.top:7012/web/resource/markdown-desktop/texmath.min.js',

    // Mermaid图表
    mermaid: 'https://share.ninglang.top:7012/web/resource/markdown-desktop/mermaid.min.js',

    // 视频播放器 (Video.js)
    videoJs: 'https://share.ninglang.top:7012/web/resource/markdown-desktop/video.min.js',
    videoJsCss: 'https://share.ninglang.top:7012/web/resource/markdown-desktop/video-js.css',

    // KaTeX字体资源
    fonts: {
        katexMain: 'https://share.ninglang.top:7012/web/resource/markdown-desktop/fonts/KaTeX_Main-Regular.woff2',
        katexMainWoff: 'https://share.ninglang.top:7012/web/resource/markdown-desktop/fonts/KaTeX_Main-Regular.woff',
        katexMath: 'https://share.ninglang.top:7012/web/resource/markdown-desktop/fonts/KaTeX_Math-Italic.woff2',
        katexMathWoff: 'https://share.ninglang.top:7012/web/resource/markdown-desktop/fonts/KaTeX_Math-Italic.woff'
    }
};

    // ==================== 样式配置 ====================
    function generateCSS() {
        return `
        /* 基础样式 */
        :root {
            --back: #f6f8fa;
            --text: rgb(51, 51, 51);
            --link: #0085f9;
            --alt-link: #f28500;
            --alt-back: #ffffff;
            --border: #e1e4e8;
            --code-bg: rgba(27,31,35,.07);
            --pre-bg: #f6f8fa;
        }

        @media (prefers-color-scheme: dark) {
            :root {
                --back: rgb(20, 21, 22);
                --text: rgb(220, 220, 220);
                --link: #79b8ff;
                --alt-link: #f9a857;
                --alt-back: rgb(27, 28, 29);
                --border: #30363d;
                --code-bg: rgb(50, 50, 50);
                --pre-bg: rgb(13, 17, 23);
            }
        }

        body {
            background: var(--back);
            color: var(--text);
            font-family: "Times New Roman", "宋体", serif;
            line-height: 2;
            margin: 0;
            padding: 0;
            transition: all 0.3s ease;
            display: flex;
            min-height: 100vh;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }

        /* 左侧边栏 */
        .sidebar {
            width: 280px;
            background: var(--alt-back);
            border-right: 1px solid var(--border);
            padding: 20px;
            box-sizing: border-box;
            position: fixed;
            height: 100vh;
            overflow-y: auto;
            z-index: 100;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        /* 主内容区域 */
        .main-content {
            flex: 1;
            margin-left: 280px;
            padding: 30px 20px 30px 10px;
            max-width: none;
        }

        .markdownRoot {
            max-width: 1440px;
            margin: 0;
            padding: 45px;
            background-color: var(--alt-back);
            border: 1px solid var(--border);
            border-radius: 6px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            font-size: 20px;
            line-height: 2;
        }

        /* 标题样式 */
        h1, h2, h3, h4, h5, h6 {
            font-family: "Google Sans", "Helvetica Neue", "Arial", "黑体", sans-serif;
            font-weight: 700;
            margin-top: 1.5em;
            margin-bottom: 0.8em;
            line-height: 1.25;
        }

        h1 {
            font-size: 2rem;
            line-height: 1.2;
            text-align: center;
            border-bottom: 2px solid var(--border);
            color: var(--link);
            padding-bottom: 1rem;
            margin-top: 0;
        }
        h2 {
            font-size: 1.5rem;
            line-height: 1.25;
            color: var(--alt-link);
            border-bottom: 1px solid var(--border);
            padding-bottom: 0.5rem;
        }
        h3 {
            font-size: 1.25rem;
            line-height: 1.4;
            color: var(--text);
        }
        h4 {
            font-size: 1.125rem;
            color: var(--text);
            opacity: 0.9;
        }
        h5 {
            font-size: 1.125rem;
            color: var(--text);
            opacity: 0.8;
            font-style: italic;
        }
        h6 {
            font-size: 1rem;
            color: var(--text);
            opacity: 0.7;
        }

        /* 链接样式 */
        a {
            color: var(--link);
            text-decoration: none;
        }

        a:hover {
            text-decoration: underline;
        }

        a:visited {
            color: var(--alt-link);
        }

        /* 代码块样式 */
        code, pre {
            font-family: 'SFMono-Regular', 'Consolas', 'Liberation Mono', 'Menlo', 'Courier New', monospace;
            font-size: 0.875rem;
            border-radius: 6px;
        }

        code:not(pre > code) {
            background-color: var(--code-bg);
            padding: .2em .4em;
            margin: 0 .2em;
            border: 1px solid var(--border);
        }

        pre {
            position: relative;
            background-color: var(--pre-bg);
            border: 1px solid var(--border);
            border-radius: 6px;
            padding: 1rem;
            overflow: auto;
            line-height: 1.45;
            margin: 1em 0;
        }

        pre code {
            background: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            border-radius: 0 !important;
            font-size: inherit !important;
        }

        /* 复制按钮样式 */
        .copy-btn {
            position: absolute;
            top: 0.5rem;
            right: 0.5rem;
            background-color: var(--border);
            border: 1px solid var(--border);
            border-radius: 6px;
            padding: 0.1875rem 0.5rem;
            font-size: 0.75rem;
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.2s ease-in-out, background-color 0.2s ease-in-out;
            z-index: 10;
            color: var(--text);
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            display: ${FEATURE_TOGGLES.enableCodeCopy ? 'block' : 'none'};
        }

        pre:hover .copy-btn {
            opacity: 1;
        }

        .copy-btn:hover {
            background-color: var(--code-bg);
        }

        /* hljs 样式重置 */
        .hljs {
            background: transparent !important;
            padding: 0 !important;
        }

        /* 表格样式 */
        table {
            border-collapse: collapse;
            margin: 1em auto;
            width: 100%;
            display: block;
            width: max-content;
            max-width: 100%;
            overflow: auto;
            border-spacing: 0;
        }

        table th,
        table td {
            border: 1px solid var(--border);
            padding: 6px 13px;
            text-align: left;
        }

        table th {
            background-color: var(--alt-back);
            font-weight: bold;
        }

        /* 引用样式 */
        blockquote {
            border-left: 0.25em solid var(--border);
            margin: 1em 0;
            padding: 0 1em;
            color: var(--text);
            opacity: 0.8;
            margin-left: 0;
            margin-right: 0;
        }

        /* 列表样式 */
        ul, ol {
            margin: 1em 0;
            padding-left: 2em;
        }

        li {
            margin: 0.5em 0;
            overflow-wrap: break-word;
            word-break: break-word;
        }

        /* 段落和链接样式优化 */
        .markdownRoot a,
        .markdownRoot p,
        .markdownRoot li {
            overflow-wrap: break-word;
            word-break: break-word;
        }

        /* 工具栏样式 - 移到右上角 */
        .markdown-tools {
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--alt-back);
            border: 1px solid var(--border);
            border-radius: 6px;
            padding: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 1000;
            min-width: 200px;
            display: ${FEATURE_TOGGLES.showFloatingTools ? 'block' : 'none'};
        }

        .markdown-tools select {
            width: 100%;
            margin: 5px 0;
            padding: 5px;
            border: 1px solid var(--border);
            border-radius: 3px;
            background: var(--back);
            color: var(--text);
        }

        .markdown-tools button {
            width: 100%;
            margin: 5px 0;
            padding: 8px;
            border: 1px solid var(--link);
            border-radius: 3px;
            background: var(--link);
            color: white;
            cursor: pointer;
        }

        .markdown-tools button:hover {
            opacity: 0.8;
        }

        /* 侧边栏目录样式 */
        .sidebar .toc {
            background: transparent;
            border: none;
            padding: 0;
            margin: 0;
        }

        /* 返回按钮和复制链接按钮容器样式 */
        .sidebar .button-container {
            display: flex;
            gap: 8px;
            margin-bottom: 20px;
        }

        /* 返回按钮样式 */
        .sidebar .back-button {
            display: inline-block;
            padding: 8px 12px;
            background: var(--link);
            color: white;
            text-decoration: none;
            border-radius: 4px;
            font-size: 0.85em;
            font-weight: 500;
            transition: background-color 0.2s ease;
            border: none;
            cursor: pointer;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            flex: 1;
        }

        .sidebar .back-button:hover {
            background: var(--alt-link);
            text-decoration: none;
            color: white;
        }

        .sidebar .back-button:visited {
            color: white;
        }

        /* 复制链接按钮样式 */
        .sidebar .copy-link-button {
            display: inline-block;
            padding: 8px 12px;
            background: var(--alt-link);
            color: white;
            text-decoration: none;
            border-radius: 4px;
            font-size: 0.85em;
            font-weight: 500;
            transition: background-color 0.2s ease;
            border: none;
            cursor: pointer;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            min-width: 60px;
            text-align: center;
        }

        .sidebar .copy-link-button:hover {
            background: var(--link);
            text-decoration: none;
            color: white;
        }

        .sidebar .copy-link-button.copied {
            background: #28a745;
        }

        /* 返回按钮中的图标 */
        .sidebar .back-button::before {
            content: '← ';
            margin-right: 6px;
            font-weight: bold;
        }

        .sidebar .toc h3 {
            margin-top: 0;
            margin-bottom: 1em;
            font-size: 1.2em;
            color: var(--text);
            border-bottom: 1px solid var(--border);
            padding-bottom: 0.5em;
        }

        .sidebar .toc ul {
            list-style: none;
            padding-left: 0;
        }

        .sidebar .toc ul ul {
            padding-left: 15px;
        }

        .sidebar .toc li {
            margin: 8px 0;
        }

        .sidebar .toc a {
            text-decoration: none;
            color: var(--text);
            display: block;
            padding: 4px 8px;
            border-radius: 4px;
            transition: background-color 0.2s ease;
            font-size: 1.2em;
        }

        .sidebar .toc a:hover {
            background-color: var(--back);
            color: var(--link);
        }

        /* 隐藏主内容区域中的目录 */
        .markdownRoot .toc {
            display: none;
        }

        /* 加载动画 */
        .loading {
            text-align: center;
            padding: 50px;
            font-size: 18px;
            color: var(--link);
        }

        .loading::after {
            content: '⏳';
            animation: spin 1s linear infinite;
            margin-left: 10px;
        }

        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }

        /* Mermaid图表容器 */
        .mermaid {
            text-align: center;
            margin: 1em 0;
            display: ${FEATURE_TOGGLES.enableMermaidDiagram ? 'block' : 'none'};
        }

        /* 数学公式样式 */
        .katex {
            font-size: 1.1em;
            font-family: KaTeX_Main, "Times New Roman", serif !important;
        }

        .katex-display {
            margin: 1.5em 0 !important;
            text-align: center;
        }

        /* 改进数学公式渲染质量 */
        .katex .katex-html {
            font-feature-settings: "kern" 1, "liga" 1;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            text-rendering: optimizeLegibility;
        }

        /* 数学公式在段落中的间距 */
        p .katex {
            margin: 0 0.2em;
        }

        /* 块级数学公式容器 */
        section eqn {
            display: ${FEATURE_TOGGLES.enableMathFormula ? 'block' : 'none'};
            margin: 1.5em 0;
            text-align: center;
        }

        /* 行内数学公式容器 */
        eq {
            display: ${FEATURE_TOGGLES.enableMathFormula ? 'inline' : 'none'};
        }

        /* 确保KaTeX字体加载 */
        @font-face {
            font-family: 'KaTeX_Main';
            src: url('https://share.ninglang.top:7012/web/resource/markdown-desktop/fonts/KaTeX_Main-Regular.woff2') format('woff2'),
                 url('https://share.ninglang.top:7012/web/resource/markdown-desktop/fonts/KaTeX_Main-Regular.woff') format('woff');
            font-weight: normal;
            font-style: normal;
            font-display: swap;
        }

        @font-face {
            font-family: 'KaTeX_Math';
            src: url('https://share.ninglang.top:7012/web/resource/markdown-desktop/fonts/KaTeX_Math-Italic.woff2') format('woff2'),
                 url('https://share.ninglang.top:7012/web/resource/markdown-desktop/fonts/KaTeX_Math-Italic.woff') format('woff');
            font-weight: normal;
            font-style: italic;
            font-display: swap;
        }

        /* 高质量数学公式渲染 */
        .katex-display > .katex > .katex-html {
            font-size: 1.2em;
            line-height: 1.4;
        }

        /* 桌面端行间公式字体大小确保 */
        @media (min-width: 901px) {
            .katex-display {
                font-size: ${DESKTOP_FORMULA_CONFIG.fontSize} !important; /* 桌面端行间公式更大一些 */
            }
            
            .katex-display .katex {
                font-size: ${DESKTOP_FORMULA_CONFIG.fontSize} !important;
            }
        }

        /* 行内数学公式对齐 */
        .katex {
            vertical-align: baseline;
        }

        /* 图片样式优化 - 参考markdownview.js */
        .markdownRoot img {
            display: block;
            margin: 1.5rem auto;
            max-width: 90%;
            border-radius: 6px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            background: var(--back);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        /* 暗色主题下的图片滤镜 */
        @media (prefers-color-scheme: dark) {
            .markdownRoot img {
                filter: brightness(.8) contrast(1.2);
            }
        }

        .markdownRoot img:hover {
            transform: scale(1.02);
            box-shadow: 0 6px 12px rgba(0,0,0,0.15);
            cursor: ${FEATURE_TOGGLES.enableImageZoom ? 'zoom-in' : 'default'};
        }

        /* 图片容器 */
        .markdownRoot p img {
            display: block;
            margin: 1.5rem auto;
        }

        /* 图片标题样式 */
        .markdownRoot p:has(img) {
            text-align: center;
        }

        /* 响应式图片 - 移动端优化 */
        @media (max-width: 900px) {
            .markdownRoot img {
                margin: 0.8em auto;
                max-width: 98%; /* 在减少的边距下，图片占用更多宽度 */
            }
        }

        /* Video.js播放器样式优化 - 桌面端和移动端通用 */
        .markdownRoot .video-js {
            display: ${FEATURE_TOGGLES.enableVideoPlayback ? 'block' : 'none'};
            margin: 1.5rem auto;
            max-width: 100%;
            width: 100%;
            height: auto;
            border-radius: 6px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            background: var(--back);
            transition: box-shadow 0.2s ease;
        }

        .markdownRoot .video-js:hover {
            box-shadow: 0 6px 12px rgba(0,0,0,0.15);
        }

        /* Video.js播放器容器 */
        .markdownRoot .video-container {
            position: relative;
            display: ${FEATURE_TOGGLES.enableVideoPlayback ? 'block' : 'none'};
            margin: 1.5rem auto;
            max-width: 100%;
        }

        /* 原生video标签样式保留（作为后备） */
        .markdownRoot video:not(.video-js) {
            display: ${FEATURE_TOGGLES.enableVideoPlayback ? 'block' : 'none'};
            margin: 1.5rem auto;
            max-width: 100%;
            height: auto;
            border-radius: 6px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            background: var(--back);
            transition: box-shadow 0.2s ease;
        }

        .markdownRoot video:not(.video-js):hover {
            box-shadow: 0 6px 12px rgba(0,0,0,0.15);
        }

        /* Video.js播放器容器 */
        .markdownRoot p .video-js,
        .markdownRoot p .video-container {
            display: ${FEATURE_TOGGLES.enableVideoPlayback ? 'block' : 'none'};
            margin: 1.5rem auto;
        }

        /* 视频容器 - 原生video */
        .markdownRoot p video:not(.video-js) {
            display: ${FEATURE_TOGGLES.enableVideoPlayback ? 'block' : 'none'};
            margin: 1.5rem auto;
        }

        /* 暗色主题下的视频样式 */
        @media (prefers-color-scheme: dark) {
            .markdownRoot .video-js,
            .markdownRoot video:not(.video-js) {
                filter: brightness(.9) contrast(1.1);
            }
        }

        /* 响应式设计 - 移动端优化 */
        @media (max-width: 900px) {
            body {
                display: block;
                padding: 0; /* 移除body的padding */
            }

            .sidebar {
                position: relative;
                width: 100%;
                height: auto;
                border-right: none;
                border-bottom: 1px solid var(--border);
                box-shadow: none;
                padding: 15px; /* 稍微减少侧边栏内边距 */
            }

            .main-content {
                margin-left: 0;
                padding: 0; /* 移除主内容区域的padding */
            }

            .markdownRoot {
                padding: 15px 8px; /* 大幅减少左右边距：从0.9375rem(15px)减至8px */
                font-size: 1rem;
                border-radius: 0;
                border: none;
                box-shadow: none;
                margin: 0;
                max-width: 100%;
                box-sizing: border-box;
                line-height: 1.8; /* 增加整体行高，为行内公式预留空间 */
            }

            /* 包含公式的段落特殊处理 */
            .markdownRoot p:has(.katex),
            .markdownRoot li:has(.katex) {
                line-height: 2.0 !important; /* 包含行内公式的段落增加行高 */
                margin: 0.8em 0; /* 增加段落间距 */
            }

            /* 移动端Video.js播放器响应式优化 */
            .markdownRoot .video-js {
                display: ${FEATURE_TOGGLES.enableVideoPlayback ? 'block' : 'none'};
                margin: 0.8em auto;
                max-width: 98%;
                width: 98%; /* 强制使用98%宽度以适应移动端 */
                height: auto; /* 保持宽高比 */
                border-radius: 4px; /* 减小圆角 */
            }

            .markdownRoot .video-container {
                margin: 0.8em auto;
                max-width: 98%;
                width: 98%;
            }

            /* 移动端原生video响应式优化 */
            .markdownRoot video:not(.video-js) {
                display: ${FEATURE_TOGGLES.enableVideoPlayback ? 'block' : 'none'};
                margin: 0.8em auto;
                max-width: 98%;
                width: 98%; /* 强制使用98%宽度以适应移动端 */
                height: auto; /* 保持宽高比 */
                border-radius: 4px; /* 减小圆角 */
            }

            .markdown-tools {
                position: relative;
                top: auto;
                right: auto;
                margin: 8px;
                width: calc(100% - 16px);
                box-sizing: border-box;
            }

            /* 移动端自动转换的行间公式样式 */
            .mobile-converted.katex-display {
                background: transparent !important;
                border: none !important;
                border-radius: 0 !important;
                padding: 0.5em 0 !important;
                margin: 1em 0 !important;
                text-align: center !important;
                overflow-x: auto !important;
                overflow-y: hidden !important;
                -webkit-overflow-scrolling: touch !important;
                white-space: nowrap !important;
                /* 确保字体大小合适 */
                font-size: 1em !important;
                /* 确保容器宽度 */
                width: 100% !important;
                max-width: 100% !important;
                box-sizing: border-box !important;
                position: relative !important;
            }

            /* 移动端转换公式内的KaTeX元素 */
            .mobile-converted.katex-display .katex {
                font-size: 1.1em !important;
                margin: 0 !important;
                display: inline-block !important;
                /* 确保不会自动换行 */
                white-space: nowrap !important;
            }

            /* 移动端转换公式内的KaTeX HTML部分 */
            .mobile-converted.katex-display .katex .katex-html {
                font-size: inherit !important;
                /* 确保最小宽度，让水平滚动正常工作 */
                min-width: max-content !important;
            }

            /* 确保移动端下所有转换的公式容器都支持滚动 */
            @media (max-width: 900px) {
                .mobile-converted.katex-display {
                    /* 添加滚动指示器 */
                    scrollbar-width: thin;
                    scrollbar-color: var(--border) transparent;
                }
                
                .mobile-converted.katex-display::-webkit-scrollbar {
                    height: 4px;
                }
                
                .mobile-converted.katex-display::-webkit-scrollbar-track {
                    background: transparent;
                }
                
                .mobile-converted.katex-display::-webkit-scrollbar-thumb {
                    background: var(--border);
                    border-radius: 2px;
                }
            }

            /* 移动端块级数学公式 - 使用配置对象 */
            .katex-display {
                max-width: 100%;
                overflow-x: auto;
                overflow-y: hidden;
                -webkit-overflow-scrolling: touch;
                padding-bottom: 3px;
                margin: ${MOBILE_FORMULA_CONFIG.display.base.margin};
                font-size: ${MOBILE_FORMULA_CONFIG.display.base.fontSize};
                line-height: ${MOBILE_FORMULA_CONFIG.display.base.lineHeight} !important;
                min-height: ${MOBILE_FORMULA_CONFIG.display.base.minHeight};
                padding: ${MOBILE_FORMULA_CONFIG.display.base.padding};
                position: relative;
            }

            /* 修复tag标签在长公式中的显示问题 */
            .katex-display .katex {
                position: relative;
                display: inline-block;
                min-width: max-content;
            }

            section eqn {
                max-width: 100%;
                overflow-x: auto;
                overflow-y: hidden;
                -webkit-overflow-scrolling: touch;
                padding-bottom: 6px;
                margin: ${MOBILE_FORMULA_CONFIG.display.base.margin};
                font-size: ${MOBILE_FORMULA_CONFIG.display.base.fontSize};
                line-height: ${MOBILE_FORMULA_CONFIG.display.base.lineHeight} !important;
                min-height: ${MOBILE_FORMULA_CONFIG.display.base.minHeight};
                padding: ${MOBILE_FORMULA_CONFIG.display.base.padding};
            }

            /* 移动端块级数学公式内部元素 */
            .katex-display .katex {
                font-size: ${MOBILE_FORMULA_CONFIG.display.base.fontSize};
            }

            section eqn .katex {
                font-size: ${MOBILE_FORMULA_CONFIG.display.base.fontSize};
            }

            /* 行内公式移动端优化 - 使用配置对象，但不影响行间公式 */
            .katex:not(.katex-display .katex) {
                font-size: ${MOBILE_FORMULA_CONFIG.inline.fontSize} !important;
                line-height: ${MOBILE_FORMULA_CONFIG.inline.lineHeight} !important;
                vertical-align: baseline;
            }

        }

        /* 小屏设备 - 使用配置对象 */
        @media (max-width: 600px) {
            .katex-display {
                font-size: ${MOBILE_FORMULA_CONFIG.display.small.fontSize};
            }

            section eqn {
                font-size: ${MOBILE_FORMULA_CONFIG.display.small.fontSize};
            }
        }

        /* 超小屏设备 - 使用配置对象 */
        @media (max-width: 400px) {
            .katex-display {
                font-size: ${MOBILE_FORMULA_CONFIG.display.xsmall.fontSize};
                margin: ${MOBILE_FORMULA_CONFIG.display.xsmall.margin};
            }

            section eqn {
                font-size: ${MOBILE_FORMULA_CONFIG.display.xsmall.fontSize};
                margin: ${MOBILE_FORMULA_CONFIG.display.xsmall.margin};
            }
        }

        /* 移动设备基本处理 */
        @media (max-width: 900px) {
            /* 超长公式横向滚动 */
            .katex-display[style*="width"],
            section eqn[style*="width"] {
                overflow-x: auto;
                -webkit-overflow-scrolling: touch;
            }

            /* 确保公式在小屏幕上的基本可见性 */
            .katex .frac-line,
            .katex .sqrt-line {
                min-height: 0.04em;
            }

            /* 矩阵紧凑显示 */
            .katex .arraycolsep {
                width: 0.3em;
            }
        }

        /* 隐藏/显示侧边栏的按钮 */
        .sidebar-toggle {
            display: ${FEATURE_TOGGLES.showMobileTocButton ? 'none' : 'none'};
            position: fixed;
            top: 20px;
            left: 20px;
            background: var(--link);
            color: white;
            border: none;
            padding: 10px;
            border-radius: 4px;
            cursor: pointer;
            z-index: 1001;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        }

        @media (max-width: 900px) {
            .sidebar-toggle {
                display: ${FEATURE_TOGGLES.showMobileTocButton ? 'block' : 'none'};
                margin: 5px; /* 减少按钮边距 */
            }

            .sidebar {
                transform: translateX(-100%);
                transition: transform 0.3s ease;
                position: fixed;
                width: 280px;
                height: 100vh;
                border-right: 1px solid var(--border);
                border-bottom: none;
                padding: 15px; /* 与上面统一的内边距 */
                z-index: 1002; /* 确保在遮罩层之上 */
            }

            .sidebar.visible {
                transform: translateX(0);
            }

            /* 移动端遮罩层 */
            .mobile-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                z-index: 1001;
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.3s ease, visibility 0.3s ease;
            }

            .mobile-overlay.visible {
                opacity: 1;
                visibility: visible;
            }
        }
    `;
    }

    // ==================== 核心功能 ====================

    // 处理公式中的tag标签，将其移到公式末尾
    function processTagInFormula(latex) {
        // 匹配 \tag{...} 模式
        const tagMatch = latex.match(/\\tag\{([^}]+)\}/);
        if (tagMatch) {
            const tagContent = tagMatch[1];
            // 移除原来的 \tag{...}
            const formulaWithoutTag = latex.replace(/\\tag\{[^}]+\}/, '').trim();
            // 在公式末尾添加编号，格式为 ", (编号)"
            return `${formulaWithoutTag}, (${tagContent})`;
        }
        return latex;
    }

    // 后处理已渲染的公式，处理其中的tag标签（作为后备方案）
    function postProcessMathTags() {
        // 仅在移动端处理
        if (window.innerWidth > 900) return;

        // 查找所有包含tag的公式
        const formulas = document.querySelectorAll('.katex-display, .mobile-converted.katex-display');
        let processedCount = 0;
        
        formulas.forEach(formula => {
            // 避免重复处理
            if (formula.hasAttribute('data-tag-processed')) return;
            
            // 查找tag元素
            const tagElements = formula.querySelectorAll('.tag, .eqn-num, [class*="tag"], .ams-numbering');
            
            if (tagElements.length > 0) {
                tagElements.forEach(tagElement => {
                    const tagText = tagElement.textContent.trim();
                    if (tagText && tagText !== '') {
                        // 获取公式主体内容
                        const katexElement = formula.querySelector('.katex .katex-html');
                        if (katexElement) {
                            // 在公式末尾添加编号
                            const numberSpan = document.createElement('span');
                            numberSpan.textContent = `, (${tagText})`;
                            numberSpan.style.cssText = `
                                margin-left: 0.5em;
                                color: var(--text);
                                font-size: 0.9em;
                            `;
                            
                            katexElement.appendChild(numberSpan);
                            processedCount++;
                        }
                        
                        // 隐藏原始tag元素
                        tagElement.style.display = 'none';
                    }
                });
                
                // 标记为已处理
                formula.setAttribute('data-tag-processed', 'true');
            }
        });
        
        if (processedCount > 0) {
            console.log(`已处理 ${processedCount} 个公式的tag标签，移到公式末尾`);
        }
    }

    // 添加 Referrer Policy 元标签以解决图片防盗链问题
    function addReferrerMetaTag() {
        if (document.querySelector('meta[name="referrer"]')) return;
        const meta = document.createElement('meta');
        meta.name = 'referrer';
        meta.content = 'no-referrer'; // 告诉浏览器不要发送Referer头
        (document.head || document.documentElement).appendChild(meta);
    }

    // 确保移动端视口正确
    function addViewportMetaTag() {
        if (document.querySelector('meta[name="viewport"]')) return;
        const meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=device-width, initial-scale=1.0';
        (document.head || document.documentElement).appendChild(meta);
    }

    // 检查是否为markdown文件
    function isMarkdownFile() {
        const url = window.location.href;
        const path = window.location.pathname;

        // 检查文件扩展名
        if (/\.(md|markdown|mdown|mkd|mkdn)$/i.test(path)) {
            return true;
        }

        // 检查URL参数或片段中是否包含markdown扩展名
        if (/\.(md|markdown|mdown|mkd|mkdn)($|\?|#)/i.test(url)) {
            return true;
        }

        // 检查Content-Type（如果可用）
        const contentType = document.contentType || '';
        if (contentType.includes('text/markdown') || contentType.includes('text/x-markdown')) {
            return true;
        }

        return false;
    }

    // 动态加载脚本
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // 动态加载CSS
    function loadCSS(href) {
        return new Promise((resolve) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.onload = resolve;
            document.head.appendChild(link);
        });
    }

    // 添加自定义样式
    function addCustomStyles() {
        const style = document.createElement('style');
        style.textContent = generateCSS();
        document.head.appendChild(style);
    }

    // 预处理markdown内容，处理Windows路径分隔符
    function preprocessMarkdown(content) {
        // 处理markdown链接中的Windows反斜杠路径
        // 匹配 [链接文本](路径) 格式，并将路径中的反斜杠替换为正斜杠
        return content.replace(/\[([^\]]*)\]\(([^)]*)\)/g, function(match, linkText, linkUrl) {
            // 只处理相对路径（不以http、https、mailto、#、data:开头的）
            if (!linkUrl.startsWith('http://') &&
                !linkUrl.startsWith('https://') &&
                !linkUrl.startsWith('mailto:') &&
                !linkUrl.startsWith('#') &&
                !linkUrl.startsWith('data:')) {
                // 将反斜杠替换为正斜杠
                linkUrl = linkUrl.replace(/\\/g, '/');
            }
            return `[${linkText}](${linkUrl})`;
        });
    }
    function getMarkdownContent() {
        // 尝试多种方式获取markdown内容

        // 1. 检查是否有pre元素（通常用于显示纯文本）
        const preElements = document.querySelectorAll('pre');
        if (preElements.length === 1 && preElements[0].textContent.trim().length > 0) {
            return preElements[0].textContent;
        }

        // 2. 检查是否有code元素
        const codeElements = document.querySelectorAll('body > code');
        if (codeElements.length === 1) {
            return codeElements[0].textContent;
        }

        // 3. 检查是否有包含markdown内容的div或article
        const contentSelectors = [
            'article',
            '.markdown-content',
            '.content',
            '[data-testid="file-content"]', // GitHub
            '.blob-wrapper', // GitHub
            '.file-content', // GitLab
            '.wiki-content' // 各种wiki系统
        ];

        for (const selector of contentSelectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent.trim().length > 0) {
                // 如果是已经渲染的HTML，尝试获取原始markdown
                const textarea = element.querySelector('textarea');
                if (textarea) {
                    return textarea.value;
                }
                return element.textContent;
            }
        }

        // 4. 检查textarea（编辑模式）
        const textareas = document.querySelectorAll('textarea');
        for (const textarea of textareas) {
            if (textarea.value && textarea.value.trim().length > 100) { // 假设markdown内容应该有一定长度
                return textarea.value;
            }
        }

        // 5. 如果页面只有纯文本内容，且看起来像markdown
        const bodyText = document.body.textContent.trim();
        if (bodyText && (
            bodyText.includes('#') ||
            bodyText.includes('```') ||
            bodyText.includes('**') ||
            bodyText.includes('- ') ||
            bodyText.includes('1. ')
        )) {
            return bodyText;
        }

        // 6. 最后尝试获取整个body的文本内容
        return document.body.textContent || '';
    }

    // 代码高亮
    function highlightCode(str, lang) {
        if (window.hljs && lang && hljs.getLanguage(lang)) {
            try {
                return hljs.highlight(str, {language: lang}).value;
            } catch (e) {
                console.error('Highlight error:', e);
            }
        }

        if (window.hljs) {
            try {
                return hljs.highlightAuto(str).value;
            } catch (e) {
                console.error('Auto highlight error:', e);
            }
        }

        return '';
    }

    // 创建markdown渲染器
    function createMarkdownRenderer() {
        if (!window.markdownit) {
            throw new Error('markdown-it 未加载成功');
        }

        const md = markdownit({
            html: true,
            linkify: true,
            typographer: true,
            highlight: highlightCode
        });

        // 安全地添加插件
        try {
            if (window.markdownitCheckbox) {
                md.use(markdownitCheckbox);
            }
        } catch (e) {
            console.warn('markdownitCheckbox plugin failed to load:', e);
        }

        try {
            if (window.markdownitEmoji) {
                md.use(markdownitEmoji);
            }
        } catch (e) {
            console.warn('markdownitEmoji plugin failed to load:', e);
        }

        try {
            if (window.markdownitFootnote) {
                md.use(markdownitFootnote);
            }
        } catch (e) {
            console.warn('markdownitFootnote plugin failed to load:', e);
        }

        // 添加数学公式支持（如果启用）
        try {
            if (window.texmath && window.katex && FEATURE_TOGGLES.enableMathFormula) {
                md.use(texmath, {
                    engine: katex,
                    delimiters: ['dollars', 'brackets'], // 支持 $$...$$ 和 $...$ 语法
                    katexOptions: {
                        displayMode: false,
                        throwOnError: false,
                        output: 'html',
                        trust: true,
                        strict: false,
                        macros: {
                            "\\RR": "\\mathbb{R}",
                            "\\CC": "\\mathbb{C}",
                            "\\ZZ": "\\mathbb{Z}",
                            "\\QQ": "\\mathbb{Q}",
                            "\\NN": "\\mathbb{N}"
                        }
                    }
                });

                // 自定义渲染器以添加原始LaTeX保存功能和移动端tag处理
                const originalInlineRenderer = md.renderer.rules.math_inline;
                if (originalInlineRenderer) {
                    md.renderer.rules.math_inline = function(tokens, idx, options, env, self) {
                        const token = tokens[idx];
                        let latex = token.content || '';
                        
                        // 在移动端处理tag标签 - 将tag内容移到公式末尾
                        if (window.innerWidth <= 900) {
                            latex = processTagInFormula(latex);
                        }
                        
                        const rendered = katex.renderToString(latex, {
                            displayMode: false,
                            throwOnError: false,
                            output: 'html',
                            trust: true,
                            strict: false
                        });
                        // 在渲染结果中添加data-latex属性
                        return rendered.replace('<span class="katex">', `<span class="katex" data-latex="${token.content.replace(/"/g, '&quot;')}">`);
                    };
                }

                // 自定义行间公式渲染器
                const originalDisplayRenderer = md.renderer.rules.math_block;
                if (originalDisplayRenderer) {
                    md.renderer.rules.math_block = function(tokens, idx, options, env, self) {
                        const token = tokens[idx];
                        let latex = token.content || '';
                        
                        // 在移动端处理tag标签 - 将tag内容移到公式末尾
                        if (window.innerWidth <= 900) {
                            latex = processTagInFormula(latex);
                        }
                        
                        return katex.renderToString(latex, {
                            displayMode: true,
                            throwOnError: false,
                            output: 'html',
                            trust: true,
                            strict: false
                        });
                    };
                }
            }
        } catch (e) {
            console.warn('KaTeX math support failed to initialize:', e);
        }

        // 支持Mermaid图表（如果启用）
        try {
            if (window.mermaid && FEATURE_TOGGLES.enableMermaidDiagram) {
                const originalFence = md.renderer.rules.fence;
                md.renderer.rules.fence = function(tokens, idx, options, env, self) {
                    const token = tokens[idx];
                    if (token.info === 'mermaid') {
                        return `<div class="mermaid">${token.content.trim()}</div>`;
                    }
                    return originalFence ? originalFence(tokens, idx, options, env, self) : self.renderToken(tokens, idx, options);
                };
            }
        } catch (e) {
            console.warn('Mermaid support failed to initialize:', e);
        }

        // 优化图片处理 - 参考markdownview.js的正确方式
        try {
            const originalImageRule = md.renderer.rules.image;
            md.renderer.rules.image = function(tokens, idx, options, env, self) {
                const token = tokens[idx];
                const srcIndex = token.attrIndex('src');

                if (srcIndex >= 0) {
                    let src = token.attrs[srcIndex][1];

                    // 处理相对路径图片
                    if (!src.startsWith('http://') && !src.startsWith('https://') && !src.startsWith('data:')) {
                        // 将Windows反斜杠路径转换为正斜杠
                        src = src.replace(/\\/g, '/');

                        const currentUrl = window.location.href;
                        const baseUrl = currentUrl.substring(0, currentUrl.lastIndexOf('/') + 1);
                        token.attrs[srcIndex][1] = baseUrl + src;
                    }

                    // 简化图片标签，避免CORS问题
                    const altIndex = token.attrIndex('alt');
                    const alt = altIndex >= 0 ? token.attrs[altIndex][1] : '';

                    return `<img src="${token.attrs[srcIndex][1]}" alt="${alt}" />`;
                }

                return originalImageRule ? originalImageRule(tokens, idx, options, env, self) : self.renderToken(tokens, idx, options);
            };
        } catch (e) {
            console.warn('Image renderer failed to initialize:', e);
        }

        // 视频处理现在在DOM层面进行，不需要修改HTML渲染器
        // Video.js 会在 initializeVideoFeatures() 中处理原生video标签

        // 优化链接处理 - 处理Windows反斜杠路径
        try {
            const originalLinkOpenRule = md.renderer.rules.link_open;
            md.renderer.rules.link_open = function(tokens, idx, options, env, self) {
                const token = tokens[idx];
                const hrefIndex = token.attrIndex('href');

                if (hrefIndex >= 0) {
                    let href = token.attrs[hrefIndex][1];

                    // 处理相对路径链接，将Windows反斜杠转换为正斜杠
                    if (!href.startsWith('http://') && !href.startsWith('https://') && !href.startsWith('mailto:') && !href.startsWith('#') && !href.startsWith('data:')) {
                        // 将Windows反斜杠路径转换为正斜杠
                        href = href.replace(/\\/g, '/');
                        token.attrs[hrefIndex][1] = href;
                    }
                }

                // 使用默认渲染器或自定义渲染器
                if (originalLinkOpenRule) {
                    return originalLinkOpenRule(tokens, idx, options, env, self);
                } else {
                    return self.renderToken(tokens, idx, options);
                }
            };
        } catch (e) {
            console.warn('Link renderer failed to initialize:', e);
        }

        return md;
    }

    // 生成复制链接按钮功能
    function generateCopyLinkButton() {
        const currentUrl = window.location.href;
        const currentPath = window.location.pathname;

        // 提取文件名（去除扩展名）
        const pathParts = currentPath.split('/');
        let fileName = pathParts[pathParts.length - 1];

        if (fileName) {
            // 解码URL编码的中文字符
            try {
                fileName = decodeURIComponent(fileName);
            } catch (e) {
                console.warn('无法解码文件名:', fileName);
            }

            // 移除文件扩展名
            const nameWithoutExt = fileName.replace(/\.(md|markdown|mdown|mkd|mkdn)$/i, '');

            return `<button class="copy-link-button" onclick="copyCurrentLink('${currentUrl}', '${nameWithoutExt}')">复制</button>`;
        }

        return '';
    }

    // 复制当前链接功能
    window.copyCurrentLink = function(url, fileName) {
        const button = document.querySelector('.copy-link-button');
        if (!button) return;

        let linkText = '';

        if (COPY_LINK_FORMAT === 'markdown') {
            linkText = `[${fileName}](${url})`;
        } else if (COPY_LINK_FORMAT === 'html') {
            linkText = `<a href="${url}">${fileName}</a>`;
        }

        // 复制到剪贴板
        navigator.clipboard.writeText(linkText).then(() => {
            // 显示已复制状态
            button.textContent = '已复制';
            button.classList.add('copied');

            // 2秒后恢复原状
            setTimeout(() => {
                button.textContent = '复制';
                button.classList.remove('copied');
            }, 2000);
        }).catch(err => {
            console.error('复制失败:', err);
            button.textContent = '失败';
            setTimeout(() => {
                button.textContent = '复制';
            }, 2000);
        });
    };

    // 生成返回按钮和复制链接按钮
    function generateBackButton() {
        const currentUrl = window.location.href;
        const currentPath = window.location.pathname;

        // 提取当前目录路径
        const pathParts = currentPath.split('/');
        const fileName = pathParts.pop(); // 移除文件名

        // 如果已经在根目录，不显示返回按钮
        if (pathParts.length <= 1 || pathParts[pathParts.length - 1] === '') {
            return '';
        }

        // 构建上级目录的URL
        let parentPath;
        if (window.location.protocol === 'file:') {
            // 本地文件协议
            parentPath = pathParts.join('/') + '/';
            if (parentPath.startsWith('//')) {
                parentPath = 'file:' + parentPath;
            } else {
                parentPath = 'file://' + parentPath;
            }
        } else {
            // HTTP/HTTPS协议
            const origin = window.location.origin;
            parentPath = origin + pathParts.join('/') + '/';
        }

        // 生成复制链接按钮
        const copyLinkButton = generateCopyLinkButton();

        return `
            <div class="button-container">
                <a href="${parentPath}" class="back-button">返回上级目录</a>
                ${copyLinkButton}
            </div>
        `;
    }

    // 设置页面标题为文件名
    function setPageTitle() {
        const currentPath = window.location.pathname;
        const pathParts = currentPath.split('/');
        let fileName = pathParts[pathParts.length - 1];

        if (fileName) {
            // 解码URL编码的中文字符
            try {
                fileName = decodeURIComponent(fileName);
            } catch (e) {
                // 如果解码失败，使用原始文件名
                console.warn('无法解码文件名:', fileName);
            }
            
            // 移除文件扩展名
            const nameWithoutExt = fileName.replace(/\.(md|markdown|mdown|mkd|mkdn)$/i, '');
            document.title = nameWithoutExt + ' - Markdown';
        } else {
            document.title = 'Markdown文档';
        }
    }

    // 生成目录
    function generateTOC() {
        const headers = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        if (headers.length === 0) return '';

        let tocHTML = '<div class="toc"><h3>目录</h3><ul>';
        let currentLevel = 0;

        headers.forEach((header, index) => {
            const level = parseInt(header.tagName.charAt(1));
            const anchor = `header-${index}`;
            header.id = anchor;

            if (level > currentLevel) {
                tocHTML += '<ul>'.repeat(level - currentLevel);
            } else if (level < currentLevel) {
                tocHTML += '</ul>'.repeat(currentLevel - level);
            }

            tocHTML += `<li><a href="#${anchor}">${header.textContent}</a></li>`;
            currentLevel = level;
        });

        tocHTML += '</ul>'.repeat(currentLevel) + '</ul></div>';
        return tocHTML;
    }

    // 创建工具栏
    function createToolbar() {
        const toolbar = document.createElement('div');
        toolbar.className = 'markdown-tools';
        toolbar.innerHTML = `
            <h4>Markdown工具</h4>
            <button onclick="window.print()">打印</button>
            <select id="theme-selector">
                <option value="auto">自动主题</option>
                <option value="light">浅色主题</option>
                <option value="dark">深色主题</option>
            </select>
            <select id="highlight-theme">
                <option value="default">Default</option>
                <option value="github">GitHub</option>
                <option value="atom-one-dark">Atom One Dark</option>
                <option value="vs">Visual Studio</option>
                <option value="nord">Nord</option>
            </select>
        `;

        // 主题切换
        const themeSelector = toolbar.querySelector('#theme-selector');
        themeSelector.addEventListener('change', (e) => {
            const theme = e.target.value;
            if (theme === 'auto') {
                document.documentElement.style.colorScheme = 'light dark';
            } else {
                document.documentElement.style.colorScheme = theme;
            }
        });

        // 代码高亮主题切换
        const highlightSelector = toolbar.querySelector('#highlight-theme');
        highlightSelector.addEventListener('change', (e) => {
            const theme = e.target.value;
            const existingLink = document.querySelector('#highlight-theme-css');
            if (existingLink) {
                existingLink.remove();
            }

            const link = document.createElement('link');
            link.id = 'highlight-theme-css';
            link.rel = 'stylesheet';
            link.href = `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/${theme}.min.css`;
            document.head.appendChild(link);
        });

        return toolbar;
    }

    // 切换侧边栏显示（移动端）
    window.toggleSidebar = function() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.mobile-overlay');

        if (sidebar) {
            const isVisible = sidebar.classList.contains('visible');

            if (isVisible) {
                // 关闭侧边栏
                sidebar.classList.remove('visible');
                if (overlay) overlay.classList.remove('visible');
            } else {
                // 打开侧边栏
                sidebar.classList.add('visible');
                if (overlay) overlay.classList.add('visible');
            }
        }
    };

    // 移动端自动收起侧边栏的逻辑
    window.setupMobileNavigation = function() {
        // 只在移动端执行
        if (window.innerWidth <= 900) {
            const sidebar = document.querySelector('.sidebar');
            const mainContent = document.querySelector('.main-content');
            let overlay = document.querySelector('.mobile-overlay');

            // 如果遮罩层不存在，创建它
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.className = 'mobile-overlay';
                document.body.appendChild(overlay);
            }

            if (sidebar && mainContent) {
                // 点击遮罩层时收起侧边栏
                overlay.addEventListener('click', function() {
                    sidebar.classList.remove('visible');
                    overlay.classList.remove('visible');
                });

                // 点击主内容区域时收起侧边栏
                mainContent.addEventListener('click', function(e) {
                    // 确保点击的不是链接或其他交互元素
                    if (!e.target.closest('a, button, input, select, textarea')) {
                        sidebar.classList.remove('visible');
                        overlay.classList.remove('visible');
                    }
                });

                // 阻止侧边栏内部点击事件冒泡（防止误关闭）
                sidebar.addEventListener('click', function(e) {
                    e.stopPropagation();
                });

                // ESC键关闭侧边栏
                document.addEventListener('keydown', function(e) {
                    if (e.key === 'Escape' && sidebar.classList.contains('visible')) {
                        sidebar.classList.remove('visible');
                        overlay.classList.remove('visible');
                    }
                });
            }
        } else {
            // 桌面端时移除遮罩层
            const overlay = document.querySelector('.mobile-overlay');
            if (overlay) {
                overlay.remove();
            }
        }
    };

    // 监听窗口大小变化，动态应用移动端逻辑
    window.handleResize = function() {
        // 移除之前的事件监听器（避免重复绑定）
        const existingHandlers = document.querySelectorAll('[data-mobile-nav]');
        existingHandlers.forEach(el => el.removeAttribute('data-mobile-nav'));

        // 重新设置移动端导航逻辑
        setupMobileNavigation();

        // 在移动端检查并转换行内公式，同时修复tag位置
        if (window.innerWidth <= 900 && window.katex && FEATURE_TOGGLES.enableMathFormula && FEATURE_TOGGLES.enableMobileFormulaConversion) {
            // 添加延迟确保样式重新计算完成
            setTimeout(() => {
                checkAndConvertInlineFormulas();
            }, 200);
        } else if (window.innerWidth <= 900 && window.katex && FEATURE_TOGGLES.enableMathFormula) {
            // 即使不转换行内公式，也要修复已有行间公式的tag位置
            setTimeout(() => {
                fixMathTagsPosition();
            }, 200);
        }
    };

    // 保留原有的toggleTOC函数以防兼容性问题
    window.toggleTOC = function() {
        // 在新布局中不需要这个功能，但保留以防外部调用
        console.log('目录现在固定显示在左侧边栏中');
    };

    // 手动渲染数学公式（后备方案）
    function renderMathExpressions() {
        if (!window.katex) return;

        const mathElements = document.querySelectorAll('.markdownRoot p, .markdownRoot div, .markdownRoot li, .markdownRoot td, .markdownRoot th');

        mathElements.forEach(element => {
            // 避免重复处理已经包含katex元素的内容
            if (element.querySelector('.katex')) return;

            let html = element.innerHTML;
            let hasChanges = false;

            // 处理块级数学公式 $$...$$
            html = html.replace(/\$\$([\s\S]*?)\$\$/g, (match, math) => {
                try {
                    let mathContent = math.trim();
                    
                    // 在移动端处理tag标签
                    if (window.innerWidth <= 900) {
                        mathContent = processTagInFormula(mathContent);
                    }
                    
                    const rendered = katex.renderToString(mathContent, {
                        displayMode: true,
                        throwOnError: false,
                        output: 'html',
                        trust: true,
                        strict: false,
                        fleqn: false,
                        macros: {
                            "\\RR": "\\mathbb{R}",
                            "\\CC": "\\mathbb{C}",
                            "\\ZZ": "\\mathbb{Z}",
                            "\\QQ": "\\mathbb{Q}",
                            "\\NN": "\\mathbb{N}"
                        }
                    });
                    hasChanges = true;
                    return rendered;
                } catch (e) {
                    console.error('KaTeX block render error:', e);
                    return match;
                }
            });

            // 处理行内数学公式 $...$
            html = html.replace(/\$([^$\n]+?)\$/g, (match, math) => {
                try {
                    let mathContent = math.trim();
                    
                    // 在移动端处理tag标签
                    if (window.innerWidth <= 900) {
                        mathContent = processTagInFormula(mathContent);
                    }
                    
                    const rendered = katex.renderToString(mathContent, {
                        displayMode: false,
                        throwOnError: false,
                        output: 'html',
                        trust: true,
                        strict: false,
                        macros: {
                            "\\RR": "\\mathbb{R}",
                            "\\CC": "\\mathbb{C}",
                            "\\ZZ": "\\mathbb{Z}",
                            "\\QQ": "\\mathbb{Q}",
                            "\\NN": "\\mathbb{N}"
                        }
                    });
                    hasChanges = true;
                    // 在渲染的HTML中添加原始LaTeX表达式作为data属性
                    return rendered.replace('<span class="katex">', `<span class="katex" data-latex="${math.trim().replace(/"/g, '&quot;')}">`);
                } catch (e) {
                    console.error('KaTeX inline render error:', e);
                    return match;
                }
            });

            if (hasChanges) {
                element.innerHTML = html;
            }
        });

        // 在移动端检查并转换行内公式为行间公式
        checkAndConvertInlineFormulas();
        
        // 后处理tag标签（作为后备方案）
        if (window.innerWidth <= 900) {
            setTimeout(() => {
                postProcessMathTags();
            }, 100);
        }

        console.log('数学公式渲染完成');
    }

    // 移动端行内公式溢出检测和转换功能
    function checkAndConvertInlineFormulas() {
        // 仅在移动端且功能启用时执行
        if (window.innerWidth > 900 || !FEATURE_TOGGLES.enableMobileFormulaConversion) return;

        // 只选择未被转换过的行内公式，排除已转换的和已标记的
        const inlineFormulas = document.querySelectorAll('.markdownRoot .katex:not(.katex-display):not(.mobile-converted):not([data-mobile-checked])');
        console.log(`移动端公式检查: 找到 ${inlineFormulas.length} 个待检查的行内公式`);
        
        let convertedCount = 0;
        
        inlineFormulas.forEach(formula => {
            // 标记为已检查，防止重复处理
            formula.setAttribute('data-mobile-checked', 'true');
            
            // 获取包含公式的段落元素
            const paragraph = formula.closest('p, li, td, th, div');
            if (!paragraph) return;

            // 获取段落和公式的宽度
            const paragraphWidth = paragraph.offsetWidth;
            const formulaWidth = formula.offsetWidth;
            
            // 计算公式相对于段落的宽度比例
            const widthRatio = formulaWidth / paragraphWidth;
            
            console.log(`公式宽度检查: ${formulaWidth}px / ${paragraphWidth}px = ${(widthRatio * 100).toFixed(1)}%`);
            
            // 如果公式宽度超过段落宽度的70%，或者绝对宽度超过容器宽度
            const shouldConvert = widthRatio > 0.7 || formulaWidth > paragraphWidth - 20;
            
            if (shouldConvert) {
                console.log(`公式溢出检测: 转换行内公式（宽度比例: ${(widthRatio * 100).toFixed(1)}%）`);
                convertInlineToDisplayFormula(formula, paragraph);
                convertedCount++;
            }
        });
        
        if (convertedCount > 0) {
            console.log(`移动端公式转换完成: 共转换了 ${convertedCount} 个行内公式为行间公式`);
        }

        // 对所有公式进行tag后处理
        setTimeout(() => {
            postProcessMathTags();
        }, 50);
    }

    // 简化的tag位置修复函数 - 现在主要依赖CSS
    function fixMathTagsPosition() {
        // 仅在移动端处理
        if (window.innerWidth > 900) return;

        // 确保所有公式容器都有正确的定位上下文
        const displayFormulas = document.querySelectorAll('.katex-display');
        displayFormulas.forEach(container => {
            // 确保容器有relative定位，让子元素的absolute定位生效
            if (getComputedStyle(container).position === 'static') {
                container.style.position = 'relative';
            }
        });

        console.log(`已确保 ${displayFormulas.length} 个公式容器的定位上下文正确`);
    }

    // 将行内公式转换为行间公式
    function convertInlineToDisplayFormula(inlineFormula, container) {
        try {
            // 获取原始数学表达式（从KaTeX渲染的元素中提取）
            let mathExpression = extractMathFromKaTeX(inlineFormula);
            if (!mathExpression) return;

            // 在移动端处理tag标签
            if (window.innerWidth <= 900) {
                mathExpression = processTagInFormula(mathExpression);
            }

            // 创建新的行间公式元素
            const displayFormula = document.createElement('div');
            displayFormula.className = 'katex-display mobile-converted';
            // 移除内联样式，完全依赖CSS类
            displayFormula.setAttribute('data-mobile-converted', 'true');

            // 使用KaTeX重新渲染为行间公式
            const rendered = katex.renderToString(mathExpression, {
                displayMode: true,
                throwOnError: false,
                output: 'html',
                trust: true,
                strict: false,
                macros: {
                    "\\RR": "\\mathbb{R}",
                    "\\CC": "\\mathbb{C}",
                    "\\ZZ": "\\mathbb{Z}",
                    "\\QQ": "\\mathbb{Q}",
                    "\\NN": "\\mathbb{N}"
                }
            });

            displayFormula.innerHTML = rendered;

            // 调试信息
            console.log('转换公式:', mathExpression);
            console.log('转换后的HTML长度:', rendered.length);

            // 检查公式是否在段落中间，如果是则需要分割段落
            const formulaParent = inlineFormula.parentNode;
            if (formulaParent === container && hasTextAroundFormula(inlineFormula, container)) {
                // 分割段落：在公式位置插入新的行间公式，并将后续内容移到新段落
                splitParagraphAtFormula(inlineFormula, displayFormula, container);
                console.log('分割段落并插入转换的公式');
            } else {
                // 简单替换：公式独占一行或在独立容器中
                formulaParent.replaceChild(displayFormula, inlineFormula);
                console.log('直接替换公式');
            }

            console.log('已转换一个行内公式为行间公式（移动端溢出处理）');
        } catch (error) {
            console.error('转换行内公式失败:', error);
        }
    }

    // 从KaTeX渲染的DOM元素中提取原始数学表达式
    function extractMathFromKaTeX(katexElement) {
        // 方法1：从data-latex属性获取（我们自己添加的）
        if (katexElement.dataset && katexElement.dataset.latex) {
            return katexElement.dataset.latex;
        }

        // 方法2：尝试从annotation元素获取原始LaTeX
        const annotation = katexElement.querySelector('annotation[encoding="application/x-tex"]');
        if (annotation) {
            return annotation.textContent;
        }

        // 方法3：从texmath插件生成的属性获取
        if (katexElement.getAttribute('data-formula')) {
            return katexElement.getAttribute('data-formula');
        }

        // 方法4：查找父元素的data属性（某些情况下可能在父元素上）
        const parent = katexElement.parentElement;
        if (parent && parent.dataset && parent.dataset.latex) {
            return parent.dataset.latex;
        }

        // 方法5：尝试从KaTeX的title属性获取（某些版本会设置）
        if (katexElement.title) {
            return katexElement.title;
        }

        // 方法6：基于DOM结构的简化重构（最后的备选方案）
        const textContent = katexElement.textContent || '';
        
        // 如果文本内容看起来像简单的数学表达式，尝试返回
        if (textContent && /^[a-zA-Z0-9+\-*/=()^_{}\s\\,.<>|\[\]{}]+$/.test(textContent.trim())) {
            // 对于简单的表达式，直接返回文本内容
            const trimmed = textContent.trim();
            if (trimmed.length > 0 && trimmed.length < 100) { // 避免过长的文本
                console.log('使用文本内容作为LaTeX表达式:', trimmed);
                return trimmed;
            }
        }

        console.warn('无法提取数学表达式，katex元素:', katexElement);
        return null;
    }

    // 检查公式周围是否有文本内容
    function hasTextAroundFormula(formula, container) {
        const childNodes = Array.from(container.childNodes);
        const formulaIndex = childNodes.indexOf(formula);
        
        // 检查公式前面是否有文本
        for (let i = 0; i < formulaIndex; i++) {
            const node = childNodes[i];
            if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
                return true;
            }
            if (node.nodeType === Node.ELEMENT_NODE && node.textContent.trim()) {
                return true;
            }
        }
        
        // 检查公式后面是否有文本
        for (let i = formulaIndex + 1; i < childNodes.length; i++) {
            const node = childNodes[i];
            if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
                return true;
            }
            if (node.nodeType === Node.ELEMENT_NODE && node.textContent.trim()) {
                return true;
            }
        }
        
        return false;
    }

    // 在公式位置分割段落
    function splitParagraphAtFormula(formula, displayFormula, container) {
        const childNodes = Array.from(container.childNodes);
        const formulaIndex = childNodes.indexOf(formula);
        
        // 创建两个新段落
        const beforePara = document.createElement(container.tagName.toLowerCase());
        const afterPara = document.createElement(container.tagName.toLowerCase());
        
        // 复制原段落的类名和样式
        beforePara.className = container.className;
        afterPara.className = container.className;
        
        // 将公式前的内容移到第一个段落
        for (let i = 0; i < formulaIndex; i++) {
            beforePara.appendChild(childNodes[i].cloneNode(true));
        }
        
        // 将公式后的内容移到第二个段落
        for (let i = formulaIndex + 1; i < childNodes.length; i++) {
            afterPara.appendChild(childNodes[i].cloneNode(true));
        }
        
        // 替换原段落
        const parent = container.parentNode;
        if (beforePara.childNodes.length > 0 && beforePara.textContent.trim()) {
            parent.insertBefore(beforePara, container);
        }
        parent.insertBefore(displayFormula, container);
        if (afterPara.childNodes.length > 0 && afterPara.textContent.trim()) {
            parent.insertBefore(afterPara, container);
        }
        parent.removeChild(container);
    }

    // 初始化图片功能 - 简化版本
    function initializeImageFeatures() {
        // 为所有图片添加点击放大功能（如果启用）
        const images = document.querySelectorAll('.markdownRoot img');
        images.forEach(img => {
            if (FEATURE_TOGGLES.enableImageZoom) {
                img.addEventListener('click', function() {
                    showImageModal(this.src, this.alt);
                });
                // 添加缩放光标样式
                img.style.cursor = 'zoom-in';
            } else {
                // 如果禁用了缩放，移除缩放光标
                img.style.cursor = 'default';
            }

            // 图片加载成功后确保样式正确
            img.addEventListener('load', function() {
                this.style.opacity = '1';
            });
        });
    }

    // 初始化视频功能 - 使用Video.js播放器
    function initializeVideoFeatures() {
        if (!window.videojs) {
            console.warn('Video.js 未加载，尝试使用原生video标签');
            initializeFallbackVideo();
            return;
        }

        // 查找所有原生video标签并转换为Video.js播放器
        const nativeVideos = document.querySelectorAll('.markdownRoot video:not(.video-js)');
        let convertCount = 0;

        nativeVideos.forEach(nativeVideo => {
            try {
                // 将原生video转换为Video.js格式
                const videoJSElement = convertNativeToVideoJS(nativeVideo);

                // 替换原生video标签
                nativeVideo.parentNode.replaceChild(videoJSElement, nativeVideo);

                // 初始化Video.js播放器
                const videoElement = videoJSElement.querySelector('.video-js');
                const player = videojs(videoElement, {
                    responsive: true,
                    fluid: true,
                    playbackRates: [0.5, 1, 1.5, 2], // 播放速度选项
                    controls: true,
                    preload: 'metadata',
                    // 移动端优化
                    mobileUi: true,
                    touchOverlay: 'auto',
                    // 启用画中画
                    enableDocumentPictureInPicture: true,
                    // 错误处理
                    errorDisplay: true
                });

                // 播放器就绪后的配置
                player.ready(() => {
                    console.log(`Video.js 播放器 ${videoElement.id} 初始化成功`);
                    convertCount++;

                    // 移动端特殊处理
                    if ('ontouchstart' in window) {
                        player.fluid(true); // 移动端流式布局
                        player.aspectRatio('16:9'); // 保持宽高比
                    }
                });

                // 错误处理
                player.on('error', function(error) {
                    console.error('Video.js 播放器错误:', error);
                    const errorData = player.error();
                    if (errorData) {
                        console.error('错误详情:', errorData);
                        showVideoError(videoElement, errorData);
                    }
                });

                // 播放器加载完成
                player.on('loadedmetadata', function() {
                    console.log('视频元数据加载完成:', videoElement.id);
                });

            } catch (error) {
                console.error('转换Video.js播放器失败:', error);
                // 保持原生video但添加基础功能
                enhanceNativeVideo(nativeVideo);
            }
        });

        console.log(`已转换 ${convertCount} 个原生video为 Video.js 播放器`);
    }

    // 将原生video标签转换为Video.js格式的DOM元素
    function convertNativeToVideoJS(nativeVideo) {
        // 生成唯一ID
        const playerId = 'video-player-' + Math.random().toString(36).substr(2, 9);

        // 获取原生video的属性
        const src = nativeVideo.src || nativeVideo.querySelector('source')?.src;
        const width = nativeVideo.width || nativeVideo.getAttribute('width') || '800';
        const height = nativeVideo.height || nativeVideo.getAttribute('height') || '450';
        const poster = nativeVideo.poster || nativeVideo.getAttribute('poster') || '';
        const autoplay = nativeVideo.removeAttribute('autoplay');
        const muted = nativeVideo.hasAttribute('muted');
        const loop = nativeVideo.hasAttribute('loop');

        // 获取fallback内容
        const fallbackContent = nativeVideo.innerHTML || `<a href="${src}" target="_blank">点击直接观看视频</a>`;

        // 创建Video.js容器
        const container = document.createElement('div');
        container.className = 'video-container';

        // 创建Video.js播放器HTML
        container.innerHTML = `
            <video
                id="${playerId}"
                class="video-js vjs-default-skin"
                controls
                preload="auto"
                data-setup='{"responsive": true, "fluid": true}'
                width="${width}"
                height="${height}"
                ${poster ? `poster="${poster}"` : ''}
                ${autoplay ? 'autoplay' : ''}
                ${muted ? 'muted' : ''}
                ${loop ? 'loop' : ''}
                playsinline>
                ${src ? `<source src="${src}" type="video/mp4">` : ''}
                <p class="vjs-no-js">
                    要查看此视频，请启用 JavaScript，并考虑升级到
                    <a href="https://videojs.com/html5-video-support/" target="_blank">
                        支持HTML5视频的网络浏览器
                    </a>。
                    ${fallbackContent}
                </p>
            </video>
        `;

        return container;
    }

    // 增强原生video标签（降级方案）
    function enhanceNativeVideo(video) {
        // 确保视频有必要的属性
        if (!video.hasAttribute('controls')) {
            video.setAttribute('controls', 'controls');
        }

        // 添加响应式属性
        video.style.maxWidth = '100%';
        video.style.height = 'auto';

        // 移动端优化：预加载元数据
        video.setAttribute('preload', 'metadata');

        // 移动端触摸优化
        if ('ontouchstart' in window) {
            video.setAttribute('playsinline', 'playsinline'); // iOS内联播放
            video.style.webkitPlaysinline = 'true'; // iOS兼容
        }

        // 添加播放失败处理
        video.addEventListener('error', function(e) {
            console.error('视频加载失败:', e);
            showVideoError(video, e);
        });
    }

    // 后备方案：初始化原生video标签
    function initializeFallbackVideo() {
        const videos = document.querySelectorAll('.markdownRoot video:not(.video-js)');
        videos.forEach(video => {
            enhanceNativeVideo(video);
        });

        console.log(`已初始化 ${videos.length} 个原生video元素`);
    }

    // 显示视频错误信息
    function showVideoError(videoElement, error) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            background: var(--code-bg);
            border: 1px solid var(--border);
            border-radius: 6px;
            padding: 20px;
            text-align: center;
            color: var(--text);
            margin: 1.5rem auto;
            max-width: 100%;
        `;

        const videoSrc = videoElement.querySelector('source')?.src ||
                        videoElement.src ||
                        videoElement.getAttribute('data-src') ||
                        '#';

        errorDiv.innerHTML = `
            <p>⚠️ 视频播放器加载失败</p>
            <p>错误信息: ${error.message || '未知错误'}</p>
            <p><a href="${videoSrc}" target="_blank" style="color: var(--link);">点击这里直接访问视频</a></p>
        `;

        videoElement.parentNode.replaceChild(errorDiv, videoElement);
    }

    // 将Video.js播放器转换为原生video（降级处理）
    function convertToNativeVideo(videoElement) {
        const nativeVideo = document.createElement('video');
        nativeVideo.controls = true;
        nativeVideo.preload = 'metadata';
        nativeVideo.style.maxWidth = '100%';
        nativeVideo.style.height = 'auto';

        // 复制源
        const sources = videoElement.querySelectorAll('source');
        sources.forEach(source => {
            nativeVideo.appendChild(source.cloneNode(true));
        });

        // 复制属性
        ['width', 'height', 'poster', 'autoplay', 'muted', 'loop'].forEach(attr => {
            if (videoElement.hasAttribute(attr)) {
                nativeVideo.setAttribute(attr, videoElement.getAttribute(attr));
            }
        });

        videoElement.parentNode.replaceChild(nativeVideo, videoElement);
        console.log('已降级为原生video标签');
    }

    // 显示图片放大模态框
    function showImageModal(src, alt) {
        // 创建模态框
        const modal = document.createElement('div');
        modal.className = 'image-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            cursor: zoom-out;
        `;

        const img = document.createElement('img');
        img.src = src;
        img.alt = alt;
        img.style.cssText = `
            max-width: 95%;
            max-height: 95%;
            object-fit: contain;
            border-radius: 4px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        `;

        const closeButton = document.createElement('button');
        closeButton.innerHTML = '✕';
        closeButton.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(255,255,255,0.8);
            border: none;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            font-size: 20px;
            cursor: pointer;
            color: #333;
            z-index: 10001;
        `;

        // 添加关闭功能
        const closeModal = () => {
            document.body.removeChild(modal);
        };

        modal.addEventListener('click', closeModal);
        closeButton.addEventListener('click', closeModal);

        // ESC键关闭
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);

        modal.appendChild(img);
        modal.appendChild(closeButton);
        document.body.appendChild(modal);
    }

    // 添加代码复制按钮
    function addCopyButtons() {
        document.querySelectorAll('.markdownRoot pre').forEach(pre => {
            if (pre.querySelector('.copy-btn')) return;
            const code = pre.querySelector('code');
            if (!code) return;

            // 添加复制按钮
            const button = document.createElement('button');
            button.className = 'copy-btn';
            button.textContent = '复制';
            pre.appendChild(button);

            button.addEventListener('click', async () => {
                try {
                    await navigator.clipboard.writeText(code.innerText);
                    button.textContent = '已复制!';
                    setTimeout(() => {
                        button.textContent = '复制';
                    }, 2000);
                } catch (err) {
                    button.textContent = '失败';
                    console.error('Failed to copy text: ', err);
                    setTimeout(() => {
                        button.textContent = '复制';
                    }, 2000);
                }
            });
        });
    }

    // 渲染markdown
    async function renderMarkdown() {
        if (!isMarkdownFile()) {
            return;
        }

        // 初始化页面基本设置
        addViewportMetaTag();
        addReferrerMetaTag();

        // 显示加载状态
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading';
        loadingDiv.textContent = '正在加载Universal Markdown渲染器...';
        document.body.insertBefore(loadingDiv, document.body.firstChild);

        try {
            // 添加样式
            addCustomStyles();

            // 并行加载所有资源
            await Promise.all([
                loadCSS(RESOURCES.highlightCss),
                loadCSS(RESOURCES.katexCss),
                loadCSS(RESOURCES.videoJsCss), // Video.js CSS
                loadScript(RESOURCES.markdownIt),
                loadScript(RESOURCES.highlightJs),
                loadScript(RESOURCES.katex),
                loadScript(RESOURCES.videoJs) // Video.js
            ]);

            // 加载插件（可选）
            await Promise.allSettled([
                loadScript(RESOURCES.markdownItCheckbox),
                loadScript(RESOURCES.markdownItEmoji),
                loadScript(RESOURCES.markdownItFootnote),
                loadScript(RESOURCES.markdownItTexmath),
                loadScript(RESOURCES.mermaid)
            ]);

            // 获取原始markdown内容
            const rawMarkdownContent = getMarkdownContent();

            if (!rawMarkdownContent || rawMarkdownContent.trim().length === 0) {
                throw new Error('未找到有效的Markdown内容');
            }

            // 预处理markdown内容，处理Windows路径分隔符
            const markdownContent = preprocessMarkdown(rawMarkdownContent);

            // 移除加载状态
            const loadingDiv = document.querySelector('.loading');
            if (loadingDiv) {
                loadingDiv.remove();
            }

            // 设置页面标题
            setPageTitle();

            // 创建渲染器并渲染
            const md = createMarkdownRenderer();
            const html = md.render(markdownContent);

            // 生成返回按钮
            const backButtonHTML = generateBackButton();

            // 更新页面内容
            document.body.innerHTML = `
                ${FEATURE_TOGGLES.showMobileTocButton ? '<button class="sidebar-toggle" onclick="toggleSidebar()">☰</button>' : ''}
                <div class="sidebar">
                    <div id="sidebar-content">
                        ${backButtonHTML}
                        <div id="sidebar-toc"></div>
                    </div>
                </div>
                <div class="main-content">
                    <div class="markdownRoot">
                        ${html}
                    </div>
                </div>
            `;

            // 生成并添加目录到侧边栏（页面内容渲染后）
            const tocHTML = generateTOC();
            if (tocHTML) {
                document.getElementById('sidebar-toc').innerHTML = tocHTML;
            }

            // 添加工具栏（如果启用）
            if (FEATURE_TOGGLES.showFloatingTools) {
                document.body.appendChild(createToolbar());
            }

            // 初始化Mermaid（如果启用）
            if (window.mermaid && FEATURE_TOGGLES.enableMermaidDiagram) {
                mermaid.initialize({
                    startOnLoad: true,
                    theme: 'default',
                    securityLevel: 'loose'
                });
            }

            // 手动渲染数学公式（后备方案，如果启用）
            if (window.katex && FEATURE_TOGGLES.enableMathFormula) {
                renderMathExpressions();
            }

            // 延迟执行移动端公式转换检查，确保DOM完全渲染和样式应用
            setTimeout(() => {
                if (window.innerWidth <= 900 && window.katex && FEATURE_TOGGLES.enableMathFormula && FEATURE_TOGGLES.enableMobileFormulaConversion) {
                    checkAndConvertInlineFormulas();
                } else if (window.innerWidth <= 900 && window.katex && FEATURE_TOGGLES.enableMathFormula) {
                    // 即使不转换行内公式，也要修复已有行间公式的tag位置
                    fixMathTagsPosition();
                }
            }, 100);

            // 初始化图片功能（如果启用）
            if (FEATURE_TOGGLES.enableImageZoom) {
                initializeImageFeatures();
            }

            // 初始化视频功能（支持桌面端和移动端，如果启用）
            if (FEATURE_TOGGLES.enableVideoPlayback) {
                initializeVideoFeatures();
            }

            // 添加代码复制按钮（如果启用）
            if (FEATURE_TOGGLES.enableCodeCopy) {
                addCopyButtons();
            }

            // 初始化移动端导航逻辑
            setupMobileNavigation();

            // 监听窗口大小变化
            window.addEventListener('resize', handleResize);

            console.log('Markdown渲染完成');

        } catch (error) {
            console.error('渲染失败:', error);
            document.body.innerHTML = `
                <div style="color: red; text-align: center; padding: 50px;">
                    <h2>渲染失败</h2>
                    <p>错误信息: ${error.message}</p>
                    <p>请检查网络连接或资源链接是否正确</p>
                </div>
            `;
        }
    }

    // 页面加载完成后执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderMarkdown);
    } else {
        renderMarkdown();
    }

})();
