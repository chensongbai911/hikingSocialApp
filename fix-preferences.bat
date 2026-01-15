@echo off
chcp 65001 >nul
echo ========================================
echo 修复 user_preferences 表结构
echo ========================================
echo.

REM 加载环境变量
if exist .env (
    for /f "usebackq tokens=1,2 delims==" %%a in (".env") do (
        set %%a=%%b
    )
)

REM 设置默认值
if not defined DB_HOST set DB_HOST=localhost
if not defined DB_PORT set DB_PORT=3306
if not defined DB_USER set DB_USER=root
if not defined DB_PASSWORD set DB_PASSWORD=
if not defined DB_NAME set DB_NAME=hiking_app

echo 数据库连接信息:
echo 主机: %DB_HOST%
echo 端口: %DB_PORT%
echo 用户: %DB_USER%
echo 数据库: %DB_NAME%
echo.

echo 正在执行修复脚本...
mysql -h %DB_HOST% -P %DB_PORT% -u %DB_USER% -p%DB_PASSWORD% < backend\src\database\fix_preferences.sql

if %errorlevel% equ 0 (
    echo.
    echo ✓ 修复成功！
    echo.
) else (
    echo.
    echo ✗ 修复失败，请检查错误信息
    echo.
)

pause
