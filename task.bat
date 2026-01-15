@echo off
if "%1"=="" goto :help

if /i "%1"=="install" goto :install
if /i "%1"=="dev" goto :dev
if /i "%1"=="start" goto :start
if /i "%1"=="test" goto :test
if /i "%1"=="build" goto :build
if /i "%1"=="clean" goto :clean
if /i "%1"=="db-init" goto :db-init
if /i "%1"=="db-reset" goto :db-reset
if /i "%1"=="lint" goto :lint
if /i "%1"=="format" goto :format
if /i "%1"=="help" goto :help

echo 未知命令: %1
goto :help

:install
echo [任务] 安装依赖...
call install.bat
goto :end

:dev
echo [任务] 启动开发服务器...
call start.bat
goto :end

:start
echo [任务] 启动开发服务器...
call start.bat
goto :end

:test
echo [任务] 运行 API 测试...
node test-api.js
goto :end

:build
echo [任务] 构建生产版本...
echo [构建] 前端...
cd frontend
call npm run build
cd ..
echo [构建] 后端...
cd backend
call npm run build
cd ..
echo ✅ 构建完成
echo    • 前端输出: frontend/dist/
echo    • 后端输出: backend/dist/
goto :end

:clean
echo [任务] 清理项目...
set /p CONFIRM="确认删除所有 node_modules 和构建文件？(Y/N): "
if /i not "%CONFIRM%"=="Y" (
    echo 已取消
    goto :end
)
echo [清理] 前端...
if exist "frontend\node_modules" rd /s /q "frontend\node_modules"
if exist "frontend\dist" rd /s /q "frontend\dist"
echo [清理] 后端...
if exist "backend\node_modules" rd /s /q "backend\node_modules"
if exist "backend\dist" rd /s /q "backend\dist"
if exist "backend\logs" rd /s /q "backend\logs"
echo ✅ 清理完成
goto :end

:db-init
echo [任务] 初始化数据库...
call init-database.bat
goto :end

:db-reset
echo [任务] 重置数据库...
echo ⚠️  警告：此操作将删除所有数据！
set /p CONFIRM="确认重置数据库？(Y/N): "
if /i not "%CONFIRM%"=="Y" (
    echo 已取消
    goto :end
)
call init-database.bat
echo ✅ 数据库已重置
goto :end

:lint
echo [任务] 运行代码检查...
echo [检查] 后端...
cd backend
call npm run lint
cd ..
echo [检查] 前端...
cd frontend
call npm run lint
cd ..
echo ✅ 检查完成
goto :end

:format
echo [任务] 格式化代码...
echo [格式化] 后端...
cd backend
call npm run format
cd ..
echo [格式化] 前端...
cd frontend
call npm run format
cd ..
echo ✅ 格式化完成
goto :end

:help
chcp 65001 >nul
echo.
echo ========================================
echo   徒步社交应用 - 任务管理器
echo ========================================
echo.
echo 用法: task [命令]
echo.
echo 可用命令：
echo.
echo   install       安装所有依赖（首次运行）
echo   dev           启动开发服务器（前端+后端）
echo   start         启动开发服务器（同 dev）
echo   test          运行 API 测试
echo   build         构建生产版本
echo   clean         清理 node_modules 和构建文件
echo   db-init       初始化数据库
echo   db-reset      重置数据库（删除所有数据）
echo   lint          运行代码检查（ESLint）
echo   format        格式化代码（Prettier）
echo   help          显示此帮助信息
echo.
echo 示例：
echo   task install   # 首次安装
echo   task dev       # 启动开发服务器
echo   task test      # 测试 API
echo   task build     # 构建生产版本
echo.
echo ========================================
goto :end

:end
