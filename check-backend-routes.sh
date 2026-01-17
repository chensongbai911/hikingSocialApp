#!/bin/bash

# ===================================================================
# 🔧 检查后端路由配置和日志
# ===================================================================

SERVER_IP="${1:-115.190.252.62}"

echo ""
echo "🔍 检查后端路由配置和日志..."
echo ""

ssh root@$SERVER_IP << 'BACKEND_CHECK'

echo "1️⃣ 检查PM2日志..."
pm2 logs hiking-app-backend --lines 20 --nostream

echo ""
echo "2️⃣ 检查后端进程..."
pm2 list | grep hiking-app-backend

echo ""
echo "3️⃣ 检查环境变量..."
cd /var/www/hikingSocialApp/backend
grep -E "USE_API_PREFIX|NODE_ENV" .env || echo "环境变量未找到"

echo ""
echo "4️⃣ 直接测试后端路由..."
echo "测试 /messages/conversations (无前缀):"
curl -s -o /dev/null -w "Status: %{http_code}" http://localhost:3000/messages/conversations
echo ""

echo "测试 /users/test/detail (无前缀):"
curl -s -o /dev/null -w "Status: %{http_code}" http://localhost:3000/users/test/detail
echo ""

echo "测试 /api/v1/messages/conversations (有前缀):"
curl -s -o /dev/null -w "Status: %{http_code}" http://localhost:3000/api/v1/messages/conversations
echo ""

echo ""
echo "5️⃣ 检查后端监听状态..."
netstat -tlnp | grep 3000

echo ""
echo "6️⃣ 重启后端服务并查看启动日志..."
pm2 restart hiking-app-backend
sleep 3
pm2 logs hiking-app-backend --lines 10 --nostream

BACKEND_CHECK

echo ""
echo "✅ 后端检查完成"
echo ""
