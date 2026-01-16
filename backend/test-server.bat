@echo off
cd /d d:\coze\backend
start npx tsx src/server.ts
timeout /t 5
node test-destinations.mjs
pause
