#!/bin/bash

SERVER_IP="${1:-115.190.252.62}"

echo "🔧 修复PM2配置和重启服务"
echo ""

ssh root@$SERVER_IP << 'FIX_CONFIG'

cd /var/www/hikingSocialApp/backend

echo "1️⃣ 停止当前服务..."
pm2 stop hiking-app-backend || true
sleep 2

echo ""
echo "2️⃣ 修复ecosystem.config.cjs - 设置USE_API_PREFIX=true..."

# 创建新的ecosystem配置，正确设置所有环境变量
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

echo "✅ 已修改 USE_API_PREFIX=true"
echo ""

echo "3️⃣ 重新构建TypeScript..."
npm run build 2>&1 | tail -20

echo ""
echo "4️⃣ 启动服务..."
pm2 start ecosystem.config.cjs

echo ""
sleep 3

echo "5️⃣ 验证服务启动..."
pm2 list | grep hiking-app-backend

echo ""
echo "6️⃣ 查看启动日志..."
pm2 logs hiking-app-backend --lines 20 --nostream

echo ""
echo "✅ 修复完成！"

FIX_CONFIG

echo ""
echo "🎉 服务已重新启动"
echo ""
echo "关键改动:"
echo "  ✓ USE_API_PREFIX 从 'false' 改为 'true'"
echo "  ✓ 路由现在会在 /api/v1 前缀下正确注册"
echo "  ✓ API端点现在应该可以访问了"
