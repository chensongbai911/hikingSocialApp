#!/bin/bash

# ===================================================================
# 🔧 检查和修复路由注册问题
# ===================================================================

SERVER_IP="${1:-115.190.252.62}"

echo ""
echo "🔍 检查服务器上的路由配置..."
echo ""

ssh root@$SERVER_IP << 'ROUTE_CHECK'

cd /var/www/hikingSocialApp/backend

echo "1️⃣ 查看当前运行的server.ts内容..."
echo "=== server.ts API前缀相关代码 ==="
grep -n -A 5 -B 5 "USE_API_PREFIX\|apiPrefix\|app.use" src/server.ts || echo "未找到相关代码"

echo ""
echo "2️⃣ 查看当前环境变量..."
echo "=== 环境变量 ==="
grep "USE_API_PREFIX" .env || echo "USE_API_PREFIX not found"

echo ""
echo "3️⃣ 检查实际运行时的日志输出..."
echo "=== 重启服务并查看启动日志 ==="
pm2 restart hiking-app-backend --update-env
sleep 3
pm2 logs hiking-app-backend --lines 30 --nostream

echo ""
echo "4️⃣ 测试不同路径..."
echo "=== 直接测试各种路径 ==="

# 测试各种可能的路径
paths=(
  "/messages"
  "/messages/conversations"
  "/api/v1/messages/conversations"
  "/users"
  "/users/test"
  "/users/test/detail"
  "/api/v1/users/test/detail"
)

for path in "${paths[@]}"; do
  echo "Testing $path:"
  response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000$path" 2>/dev/null || echo "failed")
  echo "  Status: $response"
done

echo ""
echo "5️⃣ 查看所有注册的路由（如果可能）..."
# 如果服务器有调试端点，查看路由
curl -s http://localhost:3000/debug/routes 2>/dev/null || echo "No debug routes endpoint"

ROUTE_CHECK

echo ""
echo "✅ 路由检查完成"
echo ""
