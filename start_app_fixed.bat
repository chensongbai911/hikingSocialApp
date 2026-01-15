@echo off
REM ============================================
REM 徒步社交应用 - 启动脚本 (修复版)
REM ============================================
REM 用途: 一键启动前端和后端服务
REM 使用: 双击运行此文件或在CMD中运行
REM ============================================

setlocal enabledelayedexpansion
chcp 65001 >nul 2>&1

echo.
echo ========================================
echo  徒步社交应用 v1.1.0 - 启动程序
echo ========================================
echo.

REM 检查Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo 错误: 未检测到 Node.js
    echo 请先安装 Node.js: https://nodejs.org/
    pause
    exit /b 1
)
echo 检查: Node.js 已安装

REM 检查npm
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo 错误: 未检测到 npm
    pause
    exit /b 1
)
echo 检查: npm 已安装

REM 检查MySQL
netstat -an | findstr ":3306" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo 检查: MySQL 已运行
) else (
    echo 警告: MySQL 未运行 (需要运行才能使用数据库)
    echo.
)

echo.
echo 准备启动服务...
echo.

REM 清理旧进程
echo 正在清理旧的Node进程...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

REM 启动后端
echo.
echo 启动后端服务 (http://localhost:3000)...
cd /d "%~dp0backend"

if not exist "node_modules" (
    echo 正在安装后端依赖...
    call npm install >nul 2>&1
)

start "后端服务" cmd /k "npm run dev"
timeout /t 4 /nobreak >nul

REM 启动前端
echo 启动前端应用 (http://localhost:5173)...
cd /d "%~dp0frontend"

if not exist "node_modules" (
    echo 正在安装前端依赖...
    call npm install >nul 2>&1
)

start "前端应用" cmd /k "npm run dev"
timeout /t 4 /nobreak >nul

echo.
echo ========================================
echo  成功启动服务！
echo ========================================
echo.
echo 前端应用:   http://localhost:5173
echo 后端API:    http://localhost:3000/api/v1
echo WebSocket:  http://localhost:3000
echo.
echo 测试账户:
echo   邮箱:  user1@test.com
echo   密码:  password123
echo.
echo 下一步:
echo   1. 打开浏览器访问 http://localhost:5173
echo   2. 使用上述账户登录
echo   3. 探索应用功能
echo.
echo 注意:
echo   - 后端和前端在两个新的CMD窗口中运行
echo   - 需要保持两个窗口打开
echo   - 关闭窗口将停止服务
echo.

pause
