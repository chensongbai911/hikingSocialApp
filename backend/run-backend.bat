@echo off
REM 后端启动脚本 - 支持 npm 和 pm2

cd /d d:\coze\backend

REM 检查是否传入参数
if "%1"=="" (
  echo 使用方式：start-backend.bat [dev|prod]
  echo.
  echo 示例：
  echo   start-backend.bat dev     - 开发环境（使用 npm run dev）
  echo   start-backend.bat prod    - 生产环境（先编译后启动）
  echo.
  pause
  exit /b 1
)

if /i "%1"=="dev" (
  echo.
  echo 🚀 启动后端（开发环境）...
  echo.
  npm run dev
) else if /i "%1"=="prod" (
  echo.
  echo 📦 编译 TypeScript...
  npm run build
  if errorlevel 1 (
    echo ❌ 编译失败
    pause
    exit /b 1
  )

  echo.
  echo 🚀 启动生产服务...
  npm run start
) else (
  echo ❌ 无效参数：%1
  echo 请使用 dev 或 prod
  pause
  exit /b 1
)
