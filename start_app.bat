@echo off
REM ============================================
REM 徒步社交应用 - 启动脚本 (已修复)
REM ============================================
REM 用途: 一键启动前端和后端服务
REM 使用: 双击运行此文件或在CMD中运行 start_app.bat
REM ============================================

setlocal enabledelayedexpansion
chcp 65001 >nul 2>&1

echo.
echo ========================================
echo  徒步社交应用 v1.1.0 - 启动程序
echo ========================================
echo.

REM 检查Node.js是否安装
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 错误: 未检测到 Node.js
    echo.
    echo 请先安装 Node.js (https://nodejs.org/)
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js已检测到

REM 检查npm是否安装
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 错误: 未检测到 npm
    echo.
    pause
    exit /b 1
)

echo ✅ npm已检测到

REM 检查MySQL是否运行
netstat -an | findstr ":3306" >nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ MySQL数据库已运行
) else (
    echo ⚠️  警告: 未检测到MySQL运行在端口3306
    echo 请确保MySQL服务正在运行
    echo.
)

REM 定义颜色和符号（仅用于显示）
set "GREEN=[OK]"
set "BLUE=[*]"
set "RED=[X]"

echo.
echo %BLUE% 准备启动服务...
echo.

REM 关闭旧的Node进程
echo %BLUE% 清理旧进程...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

REM 启动后端服务
echo.
echo %BLUE% 启动后端服务 (Express + Socket.io)...
echo.
cd /d "%~dp0backend"

REM 检查dependencies
if not exist "node_modules" (
    echo %BLUE% 正在安装后端依赖...
    call npm install
    if !ERRORLEVEL! NEQ 0 (
        echo %RED% 后端依赖安装失败
        pause
        exit /b 1
    )
)

REM 在新窗口启动后端
start "后端服务 - Node.js (Express)" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul

REM 启动前端服务
echo.
echo 启动前端服务 (Vue + Vite)...
echo 这将打开一个新的CMD窗口，请保持打开状态
echo.
cd /d "%~dp0frontend"

REM 检查dependencies
if not exist "node_modules" (
    echo %BLUE% 正在安装前端依赖...
    call npm install
    if !ERRORLEVEL! NEQ 0 (
        echo %RED% 前端依赖安装失败
        pause
        exit /b 1
    )
)

REM 在新窗口启动前端
start "前端应用 - Node.js (Vite)" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo  ✅ 服务已启动！
echo ========================================
echo.
echo 📱 前端应用: http://localhost:5173
echo 🔌 后端API: http://localhost:3000/api/v1
echo 💬 WebSocket: http://localhost:3000
echo.
echo 📋 测试账户:
echo   邮箱: user1@test.com
echo   密码: password123
echo.
echo 📖 请在浏览器中访问 http://localhost:5173
echo.
echo 💡 提示:
echo   - 后端和前端在两个新的CMD窗口中运行
echo   - 关闭窗口将停止相应服务
echo   - 按 Ctrl+C 可以在CMD窗口中停止服务
echo.
echo ❌ 如需完全关闭:
echo   - 关闭两个CMD窗口，或
echo   - 按 Ctrl+C 停止两个服务
echo.

pause
