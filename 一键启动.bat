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
start "后端服务" cmd /k "cd /d d:\dongxinote && D:\npm.cmd run server"
echo      后端启动中，请等待5秒...
timeout /t 5 /nobreak >nul

echo [3/4] 启动前端服务...
start "前端服务" cmd /k "cd /d d:\dongxinote\client && D:\npm.cmd run dev"
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
