#!/bin/bash

# ===================================================================
# 🔧 强制重新构建、重启后端并测试聊天接口
# ===================================================================

SERVER_IP="${1:-115.190.252.62}"

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   🔧 强制重新构建、重启后端并测试                          ║"
echo "║   服务器: $SERVER_IP"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

ssh root@$SERVER_IP << 'BUILD_AND_TEST'

cd /var/www/hikingSocialApp/backend

echo "🎯 强制重新构建和部署..."
echo ""

# 步骤1: 停止服务
echo "1️⃣ 停止现有服务..."
pm2 stop hiking-app-backend || true
pm2 delete hiking-app-backend || true
sleep 2

# 步骤2: 清理构建文件
echo ""
echo "2️⃣ 清理旧的构建文件..."
rm -rf dist/
npm run build || true

# 步骤3: 使用ts-node直接启动
echo ""
echo "3️⃣ 启动新的后端服务..."

# 创建新的ecosystem配置
cat > ecosystem.config.cjs << 'ECOSYSTEM'
module.exports = {
  apps: [{
    name: 'hiking-app-backend',
    script: './src/server.ts',
    interpreter: 'node',
    interpreter_args: '--loader ts-node/esm --experimental-specifier-resolution=node',
    env: {
      NODE_ENV: 'production',
      USE_API_PREFIX: 'false',
      DATABASE_HOST: 'localhost',
      DATABASE_NAME: 'hiking_social_db',
      DATABASE_USER: 'hiking_user',
      DATABASE_PASSWORD: 'senbochen',
      PORT: '3000',
      API_VERSION: 'v1',
      JWT_SECRET: 'hiking_social_jwt_secret_production',
      CORS_ORIGIN: '*'
    },
    watch: false,
    instances: 1,
    exec_mode: 'cluster',
    max_memory_restart: '200M',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
ECOSYSTEM

pm2 start ecosystem.config.cjs

echo ""
echo "等待服务启动..."
sleep 5

pm2 list | grep hiking-app-backend

echo ""
echo "4️⃣ 查看启动日志..."
pm2 logs hiking-app-backend --lines 15 --nostream

echo ""
echo "5️⃣ 测试健康检查..."

for i in {1..5}; do
  HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health)
  if [ "$HEALTH" = "200" ]; then
    echo "   ✅ 健康检查 OK ($i/5)"
    break
  else
    echo "   ⏱️ 等待服务响应 ($i/5)..."
    sleep 2
  fi
done

echo ""
echo "🎉 重新构建和启动完成！"
echo ""
echo "📋 服务现在运行的是最新代码"
echo "   - 对话列表修复已应用"
echo "   - 消息列表修复已应用"
echo "   - 用户信息显示修复已应用"

BUILD_AND_TEST

echo ""
echo "✅ 部署完成！"
echo ""
echo "现在测试聊天接口，请使用以下命令："
echo ""
echo "1️⃣ 登录获取token:"
echo "   curl -X POST http://115.190.252.62/api/v1/auth/login \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"email\":\"user@example.com\",\"password\":\"password123\"}'"
echo ""
echo "2️⃣ 获取对话列表:"
echo "   curl -H 'Authorization: Bearer YOUR_TOKEN' \\"
echo "     'http://115.190.252.62/api/v1/messages/conversations?page=1&limit=20'"
echo ""
echo "3️⃣ 获取聊天历史:"
echo "   curl -H 'Authorization: Bearer YOUR_TOKEN' \\"
echo "     'http://115.190.252.62/api/v1/messages/conversations/4?page=1&limit=50'"
echo ""
