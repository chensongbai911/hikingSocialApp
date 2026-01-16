@echo off
REM 启动后端服务
cd /d d:\coze\backend
echo 启动后端服务...
start "Hiking App Backend" npx tsx src/server.ts
echo 后端已启动
REM 保持窗口打开
pause
