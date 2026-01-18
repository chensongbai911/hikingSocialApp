#!/bin/bash

# 远程服务器迁移脚本
# Purpose: 在远程服务器上执行数据库迁移和后端部署

set -e

SERVER_IP="115.190.252.62"
SERVER_USER="root"
SERVER_PATH="/var/www/hikingSocialApp"

echo "🚀 开始远程部署..."
echo ""

# 1. 上传迁移脚本
echo "📤 上传迁移脚本..."
scp backend/sql/patch_20260118_fix_message_reports.sql $SERVER_USER@$SERVER_IP:$SERVER_PATH/backend/sql/

# 2. 执行迁移
echo "⚙️  执行数据库迁移..."
ssh $SERVER_USER@$SERVER_IP << 'EOF'
  cd /var/www/hikingSocialApp/backend

  # 从 .env.production 读取数据库配置
  source .env.production

  echo "📋 执行迁移脚本..."
  mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD -P $DB_PORT $DB_NAME < sql/patch_20260118_fix_message_reports.sql 2>&1 | head -50

  echo ""
  echo "✅ 迁移完成！"
EOF

# 3. 重新启动后端服务
echo ""
echo "🔄 重新启动后端服务..."
ssh $SERVER_USER@$SERVER_IP << 'EOF'
  cd /var/www/hikingSocialApp/backend

  # 使用最新的编译代码
  pm2 delete hiking-backend || true
  sleep 1
  pm2 start dist/server.js --name hiking-backend
  sleep 2
  pm2 logs hiking-backend --lines 20
EOF

echo ""
echo "✅ 远程部署完成！"
