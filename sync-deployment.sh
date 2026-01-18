#!/bin/bash

SERVER_IP="${1:-115.190.252.62}"

echo "🔄 同步最新代码到服务器..."

ssh root@$SERVER_IP << 'SYNC'

echo "1️⃣ 拉取最新代码..."
cd /var/www/hikingSocialApp

# 拉取最新代码
git pull origin master

echo ""
echo "2️⃣ 重新构建前端..."
cd frontend

# 安装依赖并构建
npm install
npm run build

echo ""
echo "3️⃣ 重启后端服务..."
cd ../backend

# 重新构建后端
npm install
npm run build

# 重启PM2服务
pm2 restart hiking-backend

echo ""
echo "4️⃣ 重新加载Nginx..."
systemctl reload nginx

echo ""
echo "✅ 部署完成!"

SYNC

echo ""
echo "🚀 检查应用状态..."

# 测试API
echo "测试API..."
if curl -s http://$SERVER_IP/api/health > /dev/null; then
    echo "✅ API正常运行"
else
    echo "❌ API无法访问"
fi

# 测试前端
echo "测试前端..."
if curl -s http://$SERVER_IP > /dev/null; then
    echo "✅ 前端正常运行"
else
    echo "❌ 前端无法访问"
fi

echo ""
echo "🎉 应用访问地址: http://$SERVER_IP"
