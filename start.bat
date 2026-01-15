@echo off
chcp 65001 >nul
echo ========================================
echo   徒步社交应用 - 自动启动脚本
echo ========================================
echo.

:: 检查 Node.js
echo [1/5] 检查 Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未检测到 Node.js，请先安装 Node.js 18.0 或更高版本
    echo    下载地址: https://nodejs.org/
    pause
    exit /b 1
)
node --version
echo ✅ Node.js 已安装
echo.

:: 检查 MySQL
echo [2/5] 检查 MySQL...
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  未检测到 MySQL 命令行工具
    echo    请确保 MySQL 已安装并添加到 PATH
    echo    或手动启动 MySQL 服务
) else (
    mysql --version
    echo ✅ MySQL 已安装
)
echo.

:: 检查后端依赖
echo [3/5] 检查后端依赖...
if not exist "backend\node_modules" (
    echo ⚠️  后端依赖未安装，正在安装...
    cd backend
    call npm install
    cd ..
    if %errorlevel% neq 0 (
        echo ❌ 后端依赖安装失败
        pause
        exit /b 1
    )
    echo ✅ 后端依赖安装完成
) else (
    echo ✅ 后端依赖已安装
)
echo.

:: 检查前端依赖
echo [4/5] 检查前端依赖...
if not exist "frontend\node_modules" (
    echo ⚠️  前端依赖未安装，正在安装...
    cd frontend
    call npm install
    cd ..
    if %errorlevel% neq 0 (
        echo ❌ 前端依赖安装失败
        pause
        exit /b 1
    )
    echo ✅ 前端依赖安装完成
) else (
    echo ✅ 前端依赖已安装
)
echo.

:: 检查环境配置
echo [5/5] 检查环境配置...
if not exist "backend\.env" (
    echo ⚠️  未找到后端环境配置文件
    if exist "backend\.env.example" (
        echo    正在从模板创建 .env 文件...
        copy "backend\.env.example" "backend\.env" >nul
        echo ✅ 已创建 backend\.env
        echo.
        echo ⚠️  请编辑 backend\.env 文件，配置数据库连接信息：
        echo    - DB_HOST=localhost
        echo    - DB_PORT=3306
        echo    - DB_USER=root
        echo    - DB_PASSWORD=你的密码
        echo    - DB_NAME=hiking_social
        echo.
        echo    配置完成后重新运行此脚本
        pause
        exit /b 0
    ) else (
        echo ❌ 未找到 .env.example 模板文件
        pause
        exit /b 1
    )
) else (
    echo ✅ 环境配置文件已存在
)
echo.

:: 启动提示
echo ========================================
echo   准备就绪！
echo ========================================
echo.
echo 即将启动以下服务：
echo   • 后端服务: http://localhost:3000
echo   • 前端服务: http://localhost:5173
echo.
echo 注意事项：
echo   1. 确保 MySQL 服务已启动
echo   2. 确保已创建数据库并导入表结构
echo   3. 两个终端窗口将同时打开
echo.
echo 按任意键开始启动服务...
pause >nul

:: 启动后端（新窗口）
echo.
echo [启动] 正在启动后端服务...
start "徒步社交 - 后端" cmd /k "cd /d %~dp0backend && echo ========================================&& echo   后端服务启动中...&& echo ========================================&& echo.&& npm run dev"

:: 等待后端启动
timeout /t 5 /nobreak >nul

:: 启动前端（新窗口）
echo [启动] 正在启动前端服务...
start "徒步社交 - 前端" cmd /k "cd /d %~dp0frontend && echo ========================================&& echo   前端服务启动中...&& echo ========================================&& echo.&& npm run dev"

:: 等待前端启动
timeout /t 3 /nobreak >nul

:: 打开浏览器
echo [启动] 正在打开浏览器...
timeout /t 5 /nobreak >nul
start http://localhost:5173

:: 完成
echo.
echo ========================================
echo   启动完成！
echo ========================================
echo.
echo 服务地址：
echo   • 前端: http://localhost:5173
echo   • 后端: http://localhost:3000
echo   • 健康检查: http://localhost:3000/health
echo.
echo 查看日志：
echo   • 后端窗口: 查看 API 请求日志
echo   • 前端窗口: 查看编译和热重载信息
echo.
echo 停止服务：
echo   • 在对应的终端窗口按 Ctrl+C
echo.
echo 按任意键关闭此窗口...
pause >nul
