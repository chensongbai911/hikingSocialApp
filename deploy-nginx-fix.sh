#!/bin/bash

# 直接修复脚本 - 可直接在服务器粘贴执行

echo "============================================"
echo "🔧 Nginx 配置部署修复"
echo "============================================"
echo ""

PROJECT_DIR="/var/www/hikingSocialApp"
NGINX_CONF="/etc/nginx/sites-available/default"
NGINX_BACKUP="/etc/nginx/sites-available/default.backup.$(date +%Y%m%d_%H%M%S)"

# 检查项目目录
if [ ! -d "$PROJECT_DIR" ]; then
  echo "❌ 项目目录不存在: $PROJECT_DIR"
  exit 1
fi

# 检查 Nginx 配置
if [ ! -f "$PROJECT_DIR/nginx/hiking-app-single-server.conf" ]; then
  echo "❌ Nginx 配置文件不存在"
  exit 1
fi

echo "1️⃣  备份现有 Nginx 配置..."
sudo cp "$NGINX_CONF" "$NGINX_BACKUP"
echo "✅ 备份完成: $NGINX_BACKUP"

echo ""
echo "2️⃣  部署新的 Nginx 配置..."
sudo cp "$PROJECT_DIR/nginx/hiking-app-single-server.conf" "$NGINX_CONF"
echo "✅ 配置已部署"

echo ""
echo "3️⃣  验证 Nginx 配置..."
if sudo nginx -t > /dev/null 2>&1; then
  echo "✅ Nginx 配置验证成功"
else
  echo "❌ Nginx 配置有错误，恢复备份"
  sudo cp "$NGINX_BACKUP" "$NGINX_CONF"
  exit 1
fi

echo ""
echo "4️⃣  重启 Nginx..."
sudo systemctl restart nginx
echo "✅ Nginx 已重启"

echo ""
echo "5️⃣  确保后端运行..."
if pm2 list 2>/dev/null | grep -q "hiking-app-backend"; then
  echo "✅ 后端服务已运行"
else
  echo "⚠️  启动后端服务..."
  cd "$PROJECT_DIR/backend"
  pm2 start ecosystem.config.cjs --env production || true
fi

echo ""
echo "============================================"
echo "✅ 修复完成"
echo "============================================"
echo ""
echo "验证修复："
echo "1. 检查后端：curl http://localhost:3000/health"
echo "2. 检查代理：curl http://115.190.252.62/health"
echo "3. 测试 API：curl http://115.190.252.62/api/v1/messages/unread-count -H 'Authorization: Bearer <token>'"
