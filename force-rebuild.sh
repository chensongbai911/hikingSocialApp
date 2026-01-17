#!/bin/bash

SERVER_IP="${1:-115.190.252.62}"

ssh root@$SERVER_IP << 'FORCE_REBUILD'

cd /var/www/hikingSocialApp/backend

echo "🔧 强制完全重新构建..."
echo ""

# 删除所有已有的进程
echo "1️⃣ 完全停止和删除PM2进程..."
pm2 delete hiking-app-backend 2>/dev/null || true
sleep 2

# 清理所有构建文件
echo "2️⃣ 清理所有旧文件..."
rm -rf dist node_modules .eslintcache
npm cache clean --force

# 重新安装依赖
echo "3️⃣ 重新安装依赖..."
npm install

# 构建
echo ""
echo "4️⃣ 重新构建TypeScript..."
npm run build

echo ""
echo "构建完成状态：$?"

echo ""
echo "5️⃣ 检查构建输出..."
ls -la dist/ 2>/dev/null | head -20

echo ""
echo "6️⃣ 启动新服务（查看详细输出）..."

# 使用node直接启动，查看所有输出
NODE_ENV=production \
USE_API_PREFIX=true \
DATABASE_HOST=localhost \
DATABASE_NAME=hiking_social_db \
DATABASE_USER=hiking_user \
DATABASE_PASSWORD=senbochen \
PORT=3000 \
API_VERSION=v1 \
JWT_SECRET=hiking_social_jwt_secret_production \
CORS_ORIGIN='*' \
timeout 10 node dist/server.js 2>&1 &

sleep 5

# 重新用PM2启动
echo ""
echo "7️⃣ 用PM2启动..."

cat > ecosystem.config.cjs << 'ECOSYSTEM'
module.exports = {
  apps: [{
    name: 'hiking-app-backend',
    script: 'dist/server.js',
    env: {
      NODE_ENV: 'production',
      USE_API_PREFIX: 'true',
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
    exec_mode: 'fork',
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
echo "8️⃣ 等待服务启动..."
sleep 3

echo ""
echo "9️⃣ 测试API..."
curl -s http://localhost:3000/api/v1/auth/login -X POST \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@test.com","password":"test"}' | jq '.code'

echo ""
echo "✅ 启动完成！"

FORCE_REBUILD

echo ""
echo "现在再次测试接口..."
