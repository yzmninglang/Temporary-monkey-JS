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
// @match        http://*/*/*.md
// @match        https://*/*/*.md
// @match        http://*/*/*.markdown
// @match        https://*/*/*.markdown
// @match        http://*/*/*.mdown
// @match        https://*/*/*.mdown
// @match        http://*/*/*.mkd
// @match        https://*/*/*.mkd
// @match        http://*/*/*.mkdn
// @match        https://*/*/*.mkdn
// @grant        none
// @run-at       document-end
// @connect      *
// ==/UserScript==

(function() {
    'use strict';

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
        showMobileTocButton: false     // 移动端目录栏悬浮按钮
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

        /* 返回按钮样式 */
        .sidebar .back-button {
            display: inline-block;
            padding: 8px 12px;
            margin-bottom: 20px;
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
        }

        .sidebar .back-button:hover {
            background: var(--alt-link);
            text-decoration: none;
            color: white;
        }

        .sidebar .back-button:visited {
            color: white;
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

        /* 图片加载失败时的样式 */
        .markdownRoot img[src*="data:image/svg+xml"] {
            background: #f8f9fa;
            border: 2px dashed var(--border);
            padding: 20px;
            opacity: 0.7;
            filter: none;
        }

        /* 响应式图片 - 移动端优化 */
        @media (max-width: 900px) {
            .markdownRoot img {
                margin: 0.8em auto;
                max-width: 98%; /* 在减少的边距下，图片占用更多宽度 */
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
            }

            .markdown-tools {
                position: relative;
                top: auto;
                right: auto;
                margin: 8px;
                width: calc(100% - 16px);
                box-sizing: border-box;
            }

            /* 移动端块级数学公式特别优化 */
            .katex-display {
                max-width: 100%;
                overflow-x: auto;
                overflow-y: hidden;
                -webkit-overflow-scrolling: touch;
                padding-bottom: 3px; /* 为滚动条留出空间 */
                margin: 0.3em 0; /* 减少上下边距 */
                font-size: 0.9em; /* 减小公式字体大小 */
            }

            section eqn {
                max-width: 100%;
                overflow-x: auto;
                overflow-y: hidden;
                -webkit-overflow-scrolling: touch;
                padding-bottom: 6px;
                margin: 0.3em 0; /* 减少上下边距 */
                font-size: 0.9em; /* 减小公式字体大小 */
            }
            
            /* 移动端块级数学公式内部元素优化 */
            .katex-display .katex {
                font-size: 1.0em; /* 进一步减小KaTeX内部字体 */
            }
            
            section eqn .katex {
                font-size: 1.0em; /* 进一步减小KaTeX内部字体 */
            }
            
            /* 移动端数学公式行高优化 */
            .katex-display .katex-html {
                line-height: 1.2; /* 减小行高 */
            }
            
            section eqn .katex-html {
                line-height: 1.2; /* 减小行高 */
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

    // 获取markdown内容
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
            throw new Error('markdown-it not loaded');
        }

        const md = markdownit({
            html: true,
            linkify: true,
            typographer: true,
            highlight: highlightCode
        });

        // 添加插件
        if (window.markdownitCheckbox) {
            md.use(markdownitCheckbox);
        }

        if (window.markdownitEmoji) {
            md.use(markdownitEmoji);
        }

        if (window.markdownitFootnote) {
            md.use(markdownitFootnote);
        }

        // 添加数学公式支持（如果启用）
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
        }

        // 支持Mermaid图表（如果启用）
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

        // 优化图片处理
        const originalImageRule = md.renderer.rules.image;
        md.renderer.rules.image = function(tokens, idx, options, env, self) {
            const token = tokens[idx];
            const srcIndex = token.attrIndex('src');

            if (srcIndex >= 0) {
                const src = token.attrs[srcIndex][1];

                // 处理相对路径图片
                if (!src.startsWith('http://') && !src.startsWith('https://') && !src.startsWith('data:')) {
                    const currentUrl = window.location.href;
                    const baseUrl = currentUrl.substring(0, currentUrl.lastIndexOf('/') + 1);
                    token.attrs[srcIndex][1] = baseUrl + src;
                }

                // 添加图片加载错误处理和样式优化
                const altIndex = token.attrIndex('alt');
                const alt = altIndex >= 0 ? token.attrs[altIndex][1] : '';

                return `<img src="${token.attrs[srcIndex][1]}" alt="${alt}"
                        onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4gPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2Y4ZjlmYSIvPiA8dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNmE3Mzc5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+5Zu+5YOP5peg5rOV5Yqg6L29PC90ZXh0PiA8L3N2Zz4='; this.title='图片加载失败: ${alt}';"
                        style="display: block; margin: 1.5rem auto; max-width: 90%; border-radius: 6px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"
                        loading="lazy"
                        crossorigin="anonymous"
                        referrerpolicy="no-referrer" />`;
            }

            return originalImageRule ? originalImageRule(tokens, idx, options, env, self) : self.renderToken(tokens, idx, options);
        };

        return md;
    }

    // 生成返回按钮
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
        
        return `<a href="${parentPath}" class="back-button">返回上级目录</a>`;
    }
    
    // 设置页面标题为文件名
    function setPageTitle() {
        const currentPath = window.location.pathname;
        const pathParts = currentPath.split('/');
        const fileName = pathParts[pathParts.length - 1];
        
        if (fileName) {
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
                    const rendered = katex.renderToString(math.trim(), {
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
                    const rendered = katex.renderToString(math.trim(), {
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
                    return rendered;
                } catch (e) {
                    console.error('KaTeX inline render error:', e);
                    return match;
                }
            });

            if (hasChanges) {
                element.innerHTML = html;
            }
        });

        console.log('数学公式渲染完成');
    }

    // 初始化图片功能
    function initializeImageFeatures() {
        // 为所有图片添加点击放大功能（如果启用）
        const images = document.querySelectorAll('.markdownRoot img');
        images.forEach(img => {
            // 只对成功加载的图片添加放大功能
            if (!img.src.startsWith('data:image/svg+xml')) {
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
            }

            // 图片加载成功后移除加载失败的样式
            img.addEventListener('load', function() {
                this.style.opacity = '1';
            });
        });
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
                loadScript(RESOURCES.markdownIt),
                loadScript(RESOURCES.highlightJs),
                loadScript(RESOURCES.katex)
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
            const markdownContent = getMarkdownContent();

            if (!markdownContent || markdownContent.trim().length === 0) {
                throw new Error('未找到有效的Markdown内容');
            }

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

            // 初始化图片功能（如果启用）
            if (FEATURE_TOGGLES.enableImageZoom) {
                initializeImageFeatures();
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
