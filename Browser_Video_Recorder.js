// ==UserScript==
// @name         浏览器内容录制工具
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  使用 MediaStream Recording API 录制浏览器标签页内容
// @author       YourName
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // 创建录制按钮
    const createRecordButton = () => {
        const button = document.createElement('button');
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
        button.innerText = '开始录制';

        // 添加按钮到页面
        document.body.appendChild(button);

        return button;
    };

    // 初始化录制功能
    const initRecording = () => {
        let mediaRecorder;
        let recordedChunks = [];
        let isRecording = false;

        const button = createRecordButton();

        // 点击按钮时触发录制逻辑
        button.addEventListener('click', async () => {
            if (isRecording) {
                // 停止录制
                mediaRecorder.stop();
                button.innerText = '开始录制';
                isRecording = false;
            } else {
                try {
                    // 请求屏幕捕获权限
                    const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });

                    // 初始化 MediaRecorder
                    mediaRecorder = new MediaRecorder(stream);
                    recordedChunks = [];

                    // 监听数据可用事件
                    mediaRecorder.ondataavailable = (event) => {
                        if (event.data.size > 0) {
                            recordedChunks.push(event.data);
                        }
                    };

                    // 监听录制停止事件
                    mediaRecorder.onstop = () => {
                        const blob = new Blob(recordedChunks, { type: 'video/webm' });
                        const url = URL.createObjectURL(blob);

                        // 创建下载链接
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'recorded-video.webm';
                        a.click();

                        // 释放资源
                        stream.getTracks().forEach(track => track.stop());
                    };

                    // 开始录制
                    mediaRecorder.start();
                    button.innerText = '停止录制';
                    isRecording = true;
                } catch (error) {
                    console.error('无法启动录制:', error);
                    alert('录制失败，请检查权限或浏览器设置！');
                }
            }
        });
    };

    // 初始化脚本
    initRecording();
})();