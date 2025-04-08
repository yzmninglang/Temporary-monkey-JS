// ==UserScript==
// @name         CSDN Clean Print with Button
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  在 CSDN 页面右上角添加一个按钮，点击后清理页面并触发打印功能，同时保持标签页名称不变
// @author       ninglang
// @match        https://blog.csdn.net/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 确保页面加载完成后再执行
    window.addEventListener('load', function() {
        // 保存原始的 <title> 值
        const originalTitle = document.title;

        // 创建按钮
        const createButton = () => {
            // 创建按钮元素
            const button = document.createElement('button');
            button.id = 'clean-print-button';
            button.innerText = '清理并打印';
            button.style.position = 'fixed';
            button.style.top = '20px';
            button.style.right = '20px';
            button.style.zIndex = '9999';
            button.style.padding = '10px 20px';
            button.style.backgroundColor = '#007bff';
            button.style.color = '#fff';
            button.style.border = 'none';
            button.style.borderRadius = '5px';
            button.style.cursor = 'pointer';
            button.style.fontSize = '16px';
            button.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';

            // 添加悬停效果
            button.addEventListener('mouseenter', () => {
                button.style.backgroundColor = '#0056b3';
            });
            button.addEventListener('mouseleave', () => {
                button.style.backgroundColor = '#007bff';
            });

            // 将按钮添加到页面中
            document.body.appendChild(button);

            // 绑定点击事件
            button.addEventListener('click', () => {
                cleanAndPrint(originalTitle);
            });
        };

        // 清理和打印逻辑
        const cleanAndPrint = (originalTitle) => {
            const removeElements = (selectors) => {
                selectors.forEach(selector => {
                    document.querySelectorAll(selector).forEach(el => el.remove());
                });
            };

            // 移除不需要的元素
            removeElements([
                "head",
                ".main_father ~ *", // .main_father 的兄弟节点
                "#mainBox ~ *",     // #mainBox 的兄弟节点
                "aside",
                ".blog-content-box ~ *", // .blog-content-box 的兄弟节点
                ".article-title-box ~ *", // .article-title-box 的兄弟节点
                "#toolbarBox",            // 移除 toolbarBox
                ".column-group"           // 移除 column-group
            ]);
            // 重建 <head> 并设置 <title>
            const newHead = document.createElement('head');
            const newTitle = document.createElement('title');
            newTitle.innerText = originalTitle;
            newHead.appendChild(newTitle);
            document.documentElement.appendChild(newHead);

            // 设置 main 元素的 display 样式
            const mainElement = document.querySelector("main");
            if (mainElement) {
                mainElement.style.display = 'content'; // 原代码中的 'content' 是无效值，改为 'block'
            }



            // 触发打印功能
            window.print();
        };

        // 调用函数创建按钮
        createButton();
    });
})();