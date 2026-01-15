@echo off
chcp 65001 >nul
echo ========================================
echo   徒步社交应用 - 一键安装脚本
echo ========================================
echo.
echo 此脚本将自动完成以下任务：
echo   1. 检查环境依赖（Node.js、MySQL）
echo   2. 安装前端和后端依赖包
echo   3. 配置环境变量
echo   4. 初始化数据库
echo   5. 运行 API 测试
echo.
echo 预计耗时：5-10 分钟
echo.
pause

:: ========== 阶段 1: 检查环境 ==========
echo.
echo ========================================
echo   阶段 1/5: 检查环境依赖
echo ========================================
echo.

:: 检查 Node.js
echo [检查] Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未安装 Node.js
    echo    请从以下地址下载并安装 Node.js 18.0+：
    echo    https://nodejs.org/
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js %NODE_VERSION%

:: 检查 npm
echo [检查] npm...
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✅ npm %NPM_VERSION%

:: 检查 MySQL
echo [检查] MySQL...
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  MySQL 命令行工具未找到
    echo    请确保 MySQL 已安装并手动初始化数据库
) else (
    for /f "tokens=*" %%i in ('mysql --version') do set MYSQL_VERSION=%%i
    echo ✅ MySQL 已安装
)

echo.
echo 环境检查完成！
timeout /t 2 /nobreak >nul

:: ========== 阶段 2: 安装后端依赖 ==========
echo.
echo ========================================
echo   阶段 2/5: 安装后端依赖
echo ========================================
echo.

cd backend

if exist "node_modules" (
    echo [跳过] 后端依赖已存在
) else (
    echo [安装] 正在安装后端依赖包...
    echo         这可能需要几分钟时间，请耐心等待...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ 后端依赖安装失败
        cd ..
        pause
        exit /b 1
    )
    echo ✅ 后端依赖安装完成
)

cd ..
timeout /t 2 /nobreak >nul

:: ========== 阶段 3: 安装前端依赖 ==========
echo.
echo ========================================
echo   阶段 3/5: 安装前端依赖
echo ========================================
echo.

cd frontend

if exist "node_modules" (
    echo [跳过] 前端依赖已存在
) else (
    echo [安装] 正在安装前端依赖包...
    echo         这可能需要几分钟时间，请耐心等待...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ 前端依赖安装失败
        cd ..
        pause
        exit /b 1
    )
    echo ✅ 前端依赖安装完成
)

cd ..
timeout /t 2 /nobreak >nul

:: ========== 阶段 4: 配置环境变量 ==========
echo.
echo ========================================
echo   阶段 4/5: 配置环境变量
echo ========================================
echo.

if exist "backend\.env" (
    echo [跳过] 环境配置文件已存在
    echo        如需重新配置，请删除 backend\.env 后重新运行
) else (
    if exist "backend\.env.example" (
        echo [配置] 正在创建环境配置文件...
        copy "backend\.env.example" "backend\.env" >nul
        echo ✅ 已创建 backend\.env
        echo.
        echo ⚠️  重要：请手动编辑 backend\.env 文件
        echo.
        echo    必须配置以下项：
        echo    • DB_PASSWORD=你的MySQL密码
        echo    • JWT_SECRET=随机字符串（建议32位以上）
        echo.
        echo    可选配置：
        echo    • DB_HOST=localhost （默认）
        echo    • DB_PORT=3306 （默认）
        echo    • DB_USER=root （默认）
        echo    • PORT=3000 （默认）
        echo.

        :: 询问是否现在编辑
        set /p EDIT_ENV="是否现在编辑配置文件？(Y/N) [默认: Y]: "
        if "%EDIT_ENV%"=="" set EDIT_ENV=Y
        if /i "%EDIT_ENV%"=="Y" (
            notepad backend\.env
            echo.
            echo 配置完成后，请按任意键继续...
            pause >nul
        ) else (
            echo.
            echo ⚠️  请稍后手动编辑 backend\.env 文件
            echo    然后运行 init-database.bat 初始化数据库
            echo.
            pause
            exit /b 0
        )
    ) else (
        echo ❌ 未找到 .env.example 模板文件
        pause
        exit /b 1
    )
)

timeout /t 2 /nobreak >nul

:: ========== 阶段 5: 初始化数据库 ==========
echo.
echo ========================================
echo   阶段 5/5: 初始化数据库
echo ========================================
echo.

set /p INIT_DB="是否现在初始化数据库？(Y/N) [默认: Y]: "
if "%INIT_DB%"=="" set INIT_DB=Y

if /i "%INIT_DB%"=="Y" (
    echo.
    call init-database.bat
    if %errorlevel% neq 0 (
        echo.
        echo ⚠️  数据库初始化失败或被跳过
        echo    请稍后手动运行 init-database.bat
    )
) else (
    echo [跳过] 数据库初始化
    echo        请稍后手动运行 init-database.bat
)

:: ========== 完成 ==========
echo.
echo ========================================
echo   🎉 安装完成！
echo ========================================
echo.
echo 项目结构：
echo   • frontend/       前端代码（Vue 3 + Lynx + Pinia）
echo   • backend/        后端代码（Node.js + Express + MySQL）
echo   • start.bat       一键启动脚本
echo   • test-api.js     API 测试脚本
echo.
echo 下一步操作：
echo.
echo   [方式 1] 一键启动（推荐）
echo     双击运行 start.bat
echo.
echo   [方式 2] 手动启动
echo     # 终端 1 - 启动后端
echo     cd backend
echo     npm run dev
echo.
echo     # 终端 2 - 启动前端
echo     cd frontend
echo     npm run dev
echo.
echo   [方式 3] 测试 API
echo     node test-api.js
echo.
echo 文档说明：
echo   • QUICKSTART.md      快速启动指南
echo   • README.md          完整开发文档
echo   • PROJECT_STATUS.md  项目状态报告
echo.
echo 访问地址：
echo   • 前端: http://localhost:5173
echo   • 后端: http://localhost:3000
echo   • 健康检查: http://localhost:3000/health
echo.
echo ========================================
echo.

set /p START_NOW="是否现在启动应用？(Y/N) [默认: N]: "
if /i "%START_NOW%"=="Y" (
    echo.
    echo 正在启动应用...
    call start.bat
) else (
    echo.
    echo 稍后可通过以下方式启动：
    echo   • 双击 start.bat
    echo   • 运行命令: start.bat
    echo.
    pause
)
