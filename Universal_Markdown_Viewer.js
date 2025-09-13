===================================================================
--- 当前版本
+++ 新版本
@@ -22,9 +22,12 @@
 (function() {
     'use strict';
 
     // ==================== 用户配置区域 ====================
-    
+
+    // 复制链接格式配置（用户可修改切换模式）
+    const COPY_LINK_FORMAT = 'markdown'; // 'markdown' 或 'html'
+
     // 桌面端数学公式字体大小配置（用户可根据需要调整）
     const DESKTOP_FORMULA_CONFIG = {
         fontSize: '1.1em'  // 桌面端行间公式字体大小，可调整为 1.2em, 1.4em, 1.5em 等
     };
@@ -416,13 +419,19 @@
             padding: 0;
             margin: 0;
         }
 
+        /* 返回按钮和复制链接按钮容器样式 */
+        .sidebar .button-container {
+            display: flex;
+            gap: 8px;
+            margin-bottom: 20px;
+        }
+
         /* 返回按钮样式 */
         .sidebar .back-button {
             display: inline-block;
             padding: 8px 12px;
-            margin-bottom: 20px;
             background: var(--link);
             color: white;
             text-decoration: none;
             border-radius: 4px;
@@ -431,8 +440,9 @@
             transition: background-color 0.2s ease;
             border: none;
             cursor: pointer;
             font-family: -apple-system, BlinkMacSystemFont, sans-serif;
+            flex: 1;
         }
 
         .sidebar .back-button:hover {
             background: var(--alt-link);
@@ -443,8 +453,36 @@
         .sidebar .back-button:visited {
             color: white;
         }
 
+        /* 复制链接按钮样式 */
+        .sidebar .copy-link-button {
+            display: inline-block;
+            padding: 8px 12px;
+            background: var(--alt-link);
+            color: white;
+            text-decoration: none;
+            border-radius: 4px;
+            font-size: 0.85em;
+            font-weight: 500;
+            transition: background-color 0.2s ease;
+            border: none;
+            cursor: pointer;
+            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
+            min-width: 60px;
+            text-align: center;
+        }
+
+        .sidebar .copy-link-button:hover {
+            background: var(--link);
+            text-decoration: none;
+            color: white;
+        }
+
+        .sidebar .copy-link-button.copied {
+            background: #28a745;
+        }
+
         /* 返回按钮中的图标 */
         .sidebar .back-button::before {
             content: '← ';
             margin-right: 6px;
@@ -1425,9 +1463,68 @@
 
         return md;
     }
 
-    // 生成返回按钮
+    // 生成复制链接按钮功能
+    function generateCopyLinkButton() {
+        const currentUrl = window.location.href;
+        const currentPath = window.location.pathname;
+
+        // 提取文件名（去除扩展名）
+        const pathParts = currentPath.split('/');
+        let fileName = pathParts[pathParts.length - 1];
+
+        if (fileName) {
+            // 解码URL编码的中文字符
+            try {
+                fileName = decodeURIComponent(fileName);
+            } catch (e) {
+                console.warn('无法解码文件名:', fileName);
+            }
+
+            // 移除文件扩展名
+            const nameWithoutExt = fileName.replace(/\.(md|markdown|mdown|mkd|mkdn)$/i, '');
+
+            return `<button class="copy-link-button" onclick="copyCurrentLink('${currentUrl}', '${nameWithoutExt}')">复制</button>`;
+        }
+
+        return '';
+    }
+
+    // 复制当前链接功能
+    window.copyCurrentLink = function(url, fileName) {
+        const button = document.querySelector('.copy-link-button');
+        if (!button) return;
+
+        let linkText = '';
+
+        if (COPY_LINK_FORMAT === 'markdown') {
+            linkText = `[${fileName}](${url})`;
+        } else if (COPY_LINK_FORMAT === 'html') {
+            linkText = `<a href="${url}">${fileName}</a>`;
+        }
+
+        // 复制到剪贴板
+        navigator.clipboard.writeText(linkText).then(() => {
+            // 显示已复制状态
+            button.textContent = '已复制';
+            button.classList.add('copied');
+
+            // 2秒后恢复原状
+            setTimeout(() => {
+                button.textContent = '复制';
+                button.classList.remove('copied');
+            }, 2000);
+        }).catch(err => {
+            console.error('复制失败:', err);
+            button.textContent = '失败';
+            setTimeout(() => {
+                button.textContent = '复制';
+            }, 2000);
+        });
+    };
+
+    // 生成返回按钮和复制链接按钮
     function generateBackButton() {
         const currentUrl = window.location.href;
         const currentPath = window.location.pathname;
 
@@ -1455,9 +1552,17 @@
             const origin = window.location.origin;
             parentPath = origin + pathParts.join('/') + '/';
         }
 
-        return `<a href="${parentPath}" class="back-button">返回上级目录</a>`;
+        // 生成复制链接按钮
+        const copyLinkButton = generateCopyLinkButton();
+
+        return `
+            <div class="button-container">
+                <a href="${parentPath}" class="back-button">返回上级目录</a>
+                ${copyLinkButton}
+            </div>
+        `;
     }
 
     // 设置页面标题为文件名
     function setPageTitle() {
