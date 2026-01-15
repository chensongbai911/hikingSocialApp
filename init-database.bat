@echo off
chcp 65001 >nul
echo ========================================
echo   数据库初始化脚本
echo ========================================
echo.

:: 检查 MySQL
echo [1/3] 检查 MySQL...
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未检测到 MySQL 命令行工具
    echo    请确保 MySQL 已安装并添加到 PATH
    echo    或使用 MySQL Workbench 手动执行以下步骤：
    echo.
    echo    1. CREATE DATABASE hiking_social CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    echo    2. USE hiking_social;
    echo    3. SOURCE backend/src/database/init.sql;
    echo.
    pause
    exit /b 1
)
echo ✅ MySQL 已安装
echo.

:: 获取数据库配置
echo [2/3] 配置数据库连接...
echo.
set /p DB_USER="请输入 MySQL 用户名 [默认: root]: "
if "%DB_USER%"=="" set DB_USER=root

set /p DB_HOST="请输入 MySQL 主机地址 [默认: localhost]: "
if "%DB_HOST%"=="" set DB_HOST=localhost

set /p DB_PORT="请输入 MySQL 端口 [默认: 3306]: "
if "%DB_PORT%"=="" set DB_PORT=3306

echo.
echo 配置信息：
echo   用户名: %DB_USER%
echo   主机: %DB_HOST%
echo   端口: %DB_PORT%
echo   数据库: hiking_social
echo.

:: 创建数据库和导入表结构
echo [3/3] 初始化数据库...
echo.
echo 提示：接下来将要求输入 MySQL 密码
echo.

:: 创建临时 SQL 文件
echo CREATE DATABASE IF NOT EXISTS hiking_social CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; > temp_init.sql
echo USE hiking_social; >> temp_init.sql
type "backend\src\database\init.sql" >> temp_init.sql

:: 执行 SQL 文件
mysql -h %DB_HOST% -P %DB_PORT% -u %DB_USER% -p < temp_init.sql

if %errorlevel% neq 0 (
    echo.
    echo ❌ 数据库初始化失败
    echo    请检查：
    echo    1. MySQL 服务是否已启动
    echo    2. 用户名和密码是否正确
    echo    3. 用户是否有创建数据库的权限
    del temp_init.sql
    pause
    exit /b 1
)

:: 删除临时文件
del temp_init.sql

:: 验证表结构
echo.
echo 正在验证表结构...
echo SHOW TABLES; > temp_check.sql
mysql -h %DB_HOST% -P %DB_PORT% -u %DB_USER% -p hiking_social < temp_check.sql
del temp_check.sql

echo.
echo ========================================
echo   数据库初始化完成！
echo ========================================
echo.
echo 已创建以下数据表：
echo   • users - 用户表
echo   • activities - 活动表
echo   • participations - 参与记录表
echo   • user_preferences - 用户偏好表
echo   • user_photos - 用户照片表
echo.
echo 下一步：
echo   1. 确保 backend\.env 文件中的数据库配置正确
echo   2. 运行 start.bat 启动应用
echo.
pause
