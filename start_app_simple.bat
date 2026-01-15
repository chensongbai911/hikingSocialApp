@echo off
REM ============================================
REM 徒步社交应用 - 简化启动脚本
REM ============================================

setlocal enabledelayedexpansion

echo.
echo ========================================
echo  徒步社交应用 v1.1.0 - 启动程序
echo ========================================
echo.

REM 检查Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 错误: 未检测到 Node.js
    echo 请先安装 Node.js (https://nodejs.org/)
    pause
    exit /b 1
)

echo ✅ Node.js已检测到

REM 检查npm
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 错误: 未检测到 npm
    pause
    exit /b 1
)

echo ✅ npm已检测到

REM 检查MySQL
netstat -an | findstr ":3306" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ MySQL数据库已运行
) else (
    echo ⚠️  警告: MySQL未运行在端口3306
    echo 请确保MySQL服务正在运行
    echo.
)

echo.
echo 清理旧进程...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo.
echo 启动后端服务...
start "后端服务" cmd /k "cd /d D:\coze\backend && npm install && npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo 启动前端服务...
start "前端应用" cmd /k "cd /d D:\coze\frontend && npm install && npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo ✅ 服务已启动！
echo ========================================
echo.
echo 📱 前端应用: http://localhost:5173
echo 🔌 后端API: http://localhost:3000/api/v1
echo.
echo 📋 测试账户:
echo   邮箱: user1@test.com
echo   密码: password123
echo.
echo 💡 请在浏览器中访问 http://localhost:5173
echo.

pause
