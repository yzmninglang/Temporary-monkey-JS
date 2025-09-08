// ==UserScript==
// @name         Markdown Viewer (with MathJax Support and Code Highlighting)
// @namespace    http://tampermonkey.net/
// @version      4.1.0
// @description  Renders Markdown files with beautiful math formula support (MathJax/SVG), code highlighting, and fixes image loading on local servers.
// @description:zh-CN  支持MathJax数学公式SVG渲染和代码高亮的Markdown查看器，并修复了本地服务器的图片防盗链问题。公式过长时可滚动。
// @author       anga83 (MathJax integration by Gemini, Code highlighting enhanced)
// @match        *://*/*.md
// @include      file://*/*.md
// @exclude      https://github.com/*
// @exclude      http://github.com/*
// @grant        GM_getResourceText
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle

// ==========================================================================================
// == [重要] 请将下面的URL替换为您服务器上文件的实际地址 ==
//
// 示例：如果您将文件放在服务器的 /assets/ 目录下，
// 并且您的服务器地址是 http://192.168.1.100 或 http://[2001:db8::1]
// 则将 "https://cdn.jsdelivr.net/npm/marked/marked.min.js"
// 替换为 "http://192.168.1.100/assets/js/marked.min.js"
// 或 "http://[2001:db8::1]/assets/js/marked.min.js"
//
// ==========================================================================================
// @require      https://share.ninglang.top:7012/web/resource/markdown/marked.min.js
// @require      https://share.ninglang.top:7012/web/resource/markdown/highlight.min.js
// @resource     css_darkdown https://share.ninglang.top:7012/web/resource/markdown/darkdown.css
// @resource     css_highlight_light https://share.ninglang.top:7012/web/resource/markdown/github.min.css
// @resource     css_highlight_dark https://share.ninglang.top:7012/web/resource/markdown/github-dark.min.css
// ==/UserScript==

(function() {
    'use strict';

    // --- 确保移动端视口正确 ---
    function addViewportMetaTag() {
        if (document.querySelector('meta[name="viewport"]')) return;
        const meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=device-width, initial-scale=1.0';
        (document.head || document.documentElement).appendChild(meta);
    }

    // --- 添加 Referrer Policy 元标签以解决图片防盗链问题 ---
    function addReferrerMetaTag() {
        if (document.querySelector('meta[name="referrer"]')) return;
        const meta = document.createElement('meta');
        meta.name = 'referrer';
        meta.content = 'no-referrer'; // 告诉浏览器不要发送Referer头
        (document.head || document.documentElement).appendChild(meta);
    }

    // --- 设置标识符 ---
    const THEME_KEY = 'markdownViewer_theme';
    const STYLE_ELEMENT_ID_THEME = 'userscript-markdown-theme-style';
    const STYLE_ELEMENT_ID_BASE = 'userscript-markdown-base-style';
    const STYLE_ELEMENT_ID_HIGHLIGHT = 'userscript-highlight-style';

    function removeExistingStyleElement(id) {
        const existingStyle = document.getElementById(id);
        if (existingStyle) existingStyle.remove();
    }

    function addStyleElement(id, css) {
        removeExistingStyleElement(id);
        const style = document.createElement('style');
        style.id = id;
        style.textContent = css;
        (document.head || document.documentElement).appendChild(style);
    }

    // --- 代码高亮主题设置 ---
    function applyHighlightTheme() {
        const chosenTheme = GM_getValue(THEME_KEY, 'system');
        const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
        let useDarkTheme = (chosenTheme === 'dark') || (chosenTheme === 'system' && prefersDarkScheme);

        removeExistingStyleElement(STYLE_ELEMENT_ID_HIGHLIGHT);

        if (useDarkTheme) {
            const darkHighlightCss = GM_getResourceText("css_highlight_dark") || '';
            addStyleElement(STYLE_ELEMENT_ID_HIGHLIGHT, darkHighlightCss);
        } else {
            const lightHighlightCss = GM_getResourceText("css_highlight_light") || '';
            addStyleElement(STYLE_ELEMENT_ID_HIGHLIGHT, lightHighlightCss);
        }
    }

    // --- 主题设置 (亮色/暗色) ---
    function applyThemeStyle() {
        const chosenTheme = GM_getValue(THEME_KEY, 'system');
        const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
        let useDarkTheme = (chosenTheme === 'dark') || (chosenTheme === 'system' && prefersDarkScheme);

        removeExistingStyleElement(STYLE_ELEMENT_ID_THEME);

        if (useDarkTheme) {
            let darkThemeCss = GM_getResourceText("css_darkdown") || '';
            darkThemeCss += `
                body { background-color: rgb(20, 21, 22) !important; }
                main.markdown-body {
                    background-color: rgb(27, 28, 29) !important;
                    color: rgb(220, 220, 220) !important;
                    border-color: #30363d !important;
                }
                main.markdown-body a { color: #79b8ff !important; }
                main.markdown-body h1, main.markdown-body h2, main.markdown-body h3, main.markdown-body h4, main.markdown-body h5, main.markdown-body h6 {
                    color: rgb(220, 220, 220) !important;
                    border-bottom-color: #30363d !important;
                }
                main.markdown-body h1 { color: #79b8ff !important; }
                main.markdown-body h2 { color: #f9a857 !important; }
                main.markdown-body hr { background-color: #30363d !important; }
                main.markdown-body blockquote { color: #a0a0a0 !important; border-left-color: #30363d !important; }
                main.markdown-body table th, main.markdown-body table td { border-color: #484f58 !important; }
                main.markdown-body code:not(pre code) {
                    background-color: rgb(50, 50, 50) !important;
                    border: 1px solid rgb(70, 70, 70) !important;
                    color: rgb(220, 220, 220) !important;
                }
                main.markdown-body pre { 
                    background-color: rgb(13, 17, 23) !important; 
                    border: 1px solid rgb(48, 54, 61) !important; 
                }
                main.markdown-body img { filter: brightness(.8) contrast(1.2); }
                .copy-btn { background-color: #444d56 !important; color: #e1e4e8 !important; border: 1px solid #586069 !important; }
                .copy-btn:hover { background-color: #586069 !important; }
            `;
            addStyleElement(STYLE_ELEMENT_ID_THEME, darkThemeCss);
        }

        // 同时应用代码高亮主题
        applyHighlightTheme();
    }

    // --- 菜单命令 ---
    GM_registerMenuCommand('主题: 跟随系统', () => { GM_setValue(THEME_KEY, 'system'); applyThemeStyle(); });
    GM_registerMenuCommand('主题: 亮色', () => { GM_setValue(THEME_KEY, 'light'); applyThemeStyle(); });
    GM_registerMenuCommand('主题: 暗色', () => { GM_setValue(THEME_KEY, 'dark'); applyThemeStyle(); });

    // --- 基础样式 ---
    function applyBaseStyles() {
        addStyleElement(STYLE_ELEMENT_ID_BASE, `
            html { font-size: 16px; }
            body { background-color: #f6f8fa; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
            main.markdown-body {
                box-sizing: border-box; width: 85%; max-width: 1440px; margin: 1.875rem auto; padding: 2.8125rem;
                background-color: #ffffff; border: 1px solid #e1e4e8; border-radius: 0.375rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                font-size: 1.125rem; font-family: "Times New Roman", "宋体", serif; color: rgb(51, 51, 51); line-height: 2;
            }
            main.markdown-body a, main.markdown-body p, main.markdown-body li { overflow-wrap: break-word; word-break: break-word; }
            @media (max-width: 900px) {
                main.markdown-body { width: 100%; margin: 0; padding: 1.25rem 0.9375rem; font-size: 1rem; border-radius: 0; border: none; box-shadow: none; }
            }
            code, pre { font-family: 'SFMono-Regular', 'Consolas', 'Liberation Mono', 'Menlo', 'Courier New', monospace; font-size: 0.875rem; border-radius: 6px; }
            code:not(pre > code) { background-color: rgba(27,31,35,.07); padding: .2em .4em; margin: 0 .2em; }
            pre { 
                position: relative; padding: 1rem; overflow: auto; 
                background-color: #f6f8fa; border: 1px solid #e1e4e8; 
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
            .copy-btn {
                position: absolute; top: 0.5rem; right: 0.5rem; background-color: #e1e4e8; border: 1px solid #d1d5da;
                border-radius: 0.375rem; padding: 0.1875rem 0.5rem; font-size: 0.75rem; cursor: pointer; opacity: 0;
                transition: opacity 0.2s ease-in-out, background-color 0.2s ease-in-out; z-index: 10;
            }
            pre:hover .copy-btn { opacity: 1; }
            .copy-btn:hover { background-color: #d1d5da; }
            h1, h2, h3, h4, h5, h6 { font-family: "Google Sans", "Helvetica Neue", "Arial", "黑体", sans-serif; font-weight: 700; margin-top: 1.5em; margin-bottom: 0.8em; }
            h1 { font-size: 2rem; line-height: 1.2; text-align: center; border-bottom: 2px solid #eee; color: #0085f9; padding-bottom: 1rem; margin-top: 0; }
            h2 { font-size: 1.5rem; line-height: 1.25; color: #f28500; border-bottom: 1px solid #eee; padding-bottom: 0.5rem; }
            h3 { font-size: 1.25rem; line-height: 1.4; color: #333; }
            h4 { font-size: 1.125rem; color: #444; }
            h5 { font-size: 1.125rem; color: #555; font-style: italic; }
            h6 { font-size: 1rem; color: #777; }
            main.markdown-body img { display: block; margin: 1.5rem auto; max-width: 90%; border-radius: 6px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
            blockquote { border-left: .25em solid #dfe2e5; padding: 0 1em; color: #6a737d; margin-left: 0; margin-right: 0; }
            table { display: block; width: max-content; max-width: 100%; overflow: auto; border-spacing: 0; border-collapse: collapse; margin: 1em auto; }
            table th, table td { padding: 6px 13px; border: 1px solid #dfe2e5; }

            /* === 新增：使 MathJax 公式容器可水平滚动 === */
            mjx-container {
                max-width: 100%;
                overflow-x: auto;
                overflow-y: hidden;
                padding-bottom: 4px; /* 为滚动条留出空间 */
                vertical-align: middle; /* 优化行内公式与文本的对齐 */
                display: inline-block; /* 保持行内公式的正确显示 */
            }
            mjx-container[display="true"] {
                display: block; /* 确保块级公式正确显示 */
                margin: 1em 0; /* 为块级公式添加适当的间距 */
                text-align: center; /* 块级公式居中显示 */
            }
            
            /* === 移动端特别优化：确保数学公式不超出屏幕 === */
            @media (max-width: 900px) {
                mjx-container {
                    max-width: 95%; /* 简化为百分比，避免calc()兼容性问题 */
                    font-size: 0.9em; /* 稍微缩小字体大小以适应移动端 */
                }
                mjx-container[display="true"] {
                    max-width: 95%;
                    margin: 0.8em 0;
                    overflow-x: auto; /* 确保长公式可以滚动 */
                    -webkit-overflow-scrolling: touch; /* iOS平滑滚动 */
                }
            }

            /* === 代码高亮增强样式 === */
            .hljs {
                background: transparent !important;
                padding: 0 !important;
            }
        `);
    }

    // --- 为代码块添加复制按钮（移除语言标签） ---
    function addCopyButtons() {
        document.querySelectorAll('main.markdown-body pre').forEach(pre => {
            if (pre.querySelector('.copy-btn')) return;
            const code = pre.querySelector('code');
            if (!code) return;

            // 添加复制按钮
            const button = document.createElement('button');
            button.className = 'copy-btn';
            button.textContent = '复制';
            pre.appendChild(button);
            
            button.addEventListener('click', () => {
                navigator.clipboard.writeText(code.innerText).then(() => {
                    button.textContent = '已复制!';
                    setTimeout(() => { button.textContent = '复制'; }, 2000);
                }).catch(err => {
                    button.textContent = '失败';
                    console.error('Failed to copy text: ', err);
                });
            });

            // 移除了语言标签相关代码，不再显示语言类型
        });
    }

    // --- 初始化代码高亮 ---
    function initializeCodeHighlighting() {
        if (typeof hljs === 'undefined') {
            console.warn('Markdown Viewer: highlight.js 未正确加载');
            return;
        }

        // 配置 highlight.js
        hljs.configure({
            ignoreUnescapedHTML: true,
            languages: ['javascript', 'python', 'java', 'cpp', 'c', 'html', 'css', 'json', 'xml', 'bash', 'shell', 'sql', 'php', 'go', 'rust', 'typescript']
        });

        // 高亮所有代码块
        document.querySelectorAll('main.markdown-body pre code').forEach((block) => {
            try {
                hljs.highlightElement(block);
            } catch (e) {
                console.warn('代码高亮失败:', e);
            }
        });
    }

    // --- 新增：加载并运行MathJax来渲染公式 ---
    function setupMathJax() {
        if (window.MathJax || document.getElementById('mathjax-script')) return;

        window.MathJax = {
            tex: {
                inlineMath: [['$', '$'], ['\\(', '\\)']],
                displayMath: [['$$', '$$'], ['\\[', '\\]']],
                processEscapes: true
            },
            svg: {
                fontCache: 'global',
            },
            options: {
                skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code']
            },
            startup: {
                pageReady: () => {
                    return MathJax.startup.defaultPageReady();
                }
            }
        };

        const script = document.createElement('script');
        script.id = 'mathjax-script';
        script.src = 'https://share.ninglang.top:7012/web/resource/markdown/tex-svg.js';
        script.async = true;
        (document.head || document.documentElement).appendChild(script);
    }

    // --- 新增：一个简单的marked扩展，以防止其破坏MathJax公式 ---
    const mathjaxExtension = {
        name: 'mathjax',
        level: 'inline',
        start(src) {
            return src.indexOf('$');
        },
        tokenizer(src) {
            const blockRule = /^\$\$\s*([\s\S]+?)\s*\$\$/;
            const inlineRule = /^\$((?:\\\$|[^$])+?)\$/;
            let match;

            if (match = blockRule.exec(src)) {
                return {
                    type: 'mathjax',
                    raw: match[0],
                    text: match[1].trim(),
                    displayMode: true,
                };
            }
            if (match = inlineRule.exec(src)) {
                return {
                    type: 'mathjax',
                    raw: match[0],
                    text: match[1].trim(),
                    displayMode: false,
                };
            }
        },
        renderer(token) {
            // 直接将原始公式文本返回，让MathJax处理
            return token.raw;
        },
    };

    // --- 脚本主执行函数 ---
    function initializeViewer() {
        // 1. 初始化页面基本设置
        addViewportMetaTag();
        addReferrerMetaTag();
        applyBaseStyles();
        applyThemeStyle();

        // 2. 监听系统主题变化
        if (GM_getValue(THEME_KEY, 'system') === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.removeEventListener('change', applyThemeStyle);
            mediaQuery.addEventListener('change', applyThemeStyle);
        }

        // 3. 创建渲染容器
        const markdownBodyMain = document.createElement('main');
        markdownBodyMain.className = 'markdown-body';

        // 4. 检查必需的库是否都已加载
        if (typeof marked === 'undefined') {
            const missing = 'Marked.js';
            markdownBodyMain.innerHTML = `<p style="color:red; font-family:sans-serif;">错误: 必需的库未能正确加载: ${missing}。请检查脚本顶部的@require链接是否正确。</p>`;
            document.body.innerHTML = '';
            document.body.appendChild(markdownBodyMain);
            return;
        }

        // 5. 新增：使用自定义的MathJax扩展配置Marked
        try {
            marked.use({ extensions: [mathjaxExtension] });
        } catch (e) {
            console.error("Markdown Viewer: Failed to initialize mathjax extension for marked.", e);
        }

        // 6. 解析和渲染
        try {
            let markdownContentToParse = "";
            if (document.contentType === 'text/markdown' || (location.protocol === 'file:' && document.body?.children.length === 1 && document.body.firstChild.tagName === 'PRE')) {
                markdownContentToParse = document.body.firstChild.innerText;
            } else if (document.body?.innerText) {
                markdownContentToParse = document.body.innerText;
            } else if (document.body?.textContent) {
                 markdownContentToParse = document.body.textContent;
            }

            const htmlContent = marked.parse(markdownContentToParse);

            document.body.innerHTML = '';
            document.body.appendChild(markdownBodyMain);
            markdownBodyMain.innerHTML = htmlContent;

            // 7. 初始化代码高亮
            initializeCodeHighlighting();

            // 8. 添加复制按钮（不再添加语言标签）
            addCopyButtons();

            // 9. 新增：加载 MathJax 并渲染公式
            setupMathJax();

        } catch (e) {
            console.error("Markdown Viewer: 解析Markdown时出错:", e);
            markdownBodyMain.innerHTML = `<p style="color:red; font-family:sans-serif;">渲染Markdown出错: ${e.message}。</p>`;
            if (!document.body.contains(markdownBodyMain)) {
                 document.body.innerHTML = ''; document.body.appendChild(markdownBodyMain);
            }
        }
    }

    if (document.readyState === "complete" || document.readyState === "interactive") {
        initializeViewer();
    } else {
        document.addEventListener("DOMContentLoaded", initializeViewer);
    }
})();