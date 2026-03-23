@echo off
chcp 65001 >nul
echo ========================================
echo     东西笔记 - 启动脚本
echo ========================================
echo.

echo [步骤1] 进入项目目录
cd /d "%~dp0"
echo 当前目录: %cd%
echo.

echo [步骤2] 安装后端依赖（首次较慢，请耐心等待）
call D:\npm.cmd install
echo.

echo [步骤3] 安装前端依赖
cd /d "%~dp0client"
call D:\npm.cmd install
echo.

echo [步骤4] 启动MongoDB（请保持此窗口）
echo 正在启动MongoDB...
start /b "" "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe"
timeout /t 3 /nobreak >nul

echo.
echo [步骤5] 启动后端服务
cd /d "%~dp0"
start cmd /k "call D:\npm.cmd run server"

echo.
echo [步骤6] 启动前端服务
cd /d "%~dp0client"
start cmd /k "call D:\npm.cmd run dev"

echo.
echo ========================================
echo 完成！请在浏览器打开 http://localhost:5173
echo ========================================
pause
