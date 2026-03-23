@echo off
chcp 65001 >nul
title 东西笔记启动器

echo ========================================
echo     东西笔记 - 一键启动
echo ========================================
echo.

echo [1/4] 关闭之前的进程...
taskkill /F /IM node.exe 2>nul
echo      等待2秒...
timeout /t 2 /nobreak >nul

echo [2/4] 启动后端服务...
start cmd /k "cd /d d:\dongxinote && node node_modules\ts-node-dev\bin\ts-node-dev --respawn --transpile-only src/server.ts"
echo      后端启动中，请等待5秒...
timeout /t 5 /nobreak >nul

echo [3/4] 启动前端服务...
start cmd /k "cd /d d:\dongxinote\client && node node_modules\vite\bin\vite.js"
echo      前端启动中，请等待8秒...
timeout /t 8 /nobreak >nul

echo.
echo ========================================
echo 启动完成！
echo.
echo 请在浏览器输入: http://localhost:5173
echo.
echo 如果页面无法打开，请检查终端是否有错误
echo ========================================
echo.
pause
