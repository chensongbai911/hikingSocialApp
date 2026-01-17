#!/bin/bash

# ===================================================================
# 🔧 生产环境 API 404 问题 - 精确修复脚本 v3.1
# ===================================================================

set -e

SERVER_IP="${1:-115.190.252.62}"
PROJECT_DIR="/var/www/hikingSocialApp"
BACKEND_DIR="$PROJECT_DIR/backend"

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   🔧 生产环境 API 404 问题 - 精确修复脚本 v3.1            ║"
echo "║   服务器: $SERVER_IP"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# SSH 连接到服务器执行精确修复
ssh root@$SERVER_IP << 'PRODUCTION_FIX'

PROJECT_DIR="/var/www/hikingSocialApp"
BACKEND_DIR="$PROJECT_DIR/backend"

echo "🎯 开始执行精确修复..."
echo ""

# 步骤1: 修复 .env 文件
echo "1️⃣ 修复 .env 文件配置..."
cd "$BACKEND_DIR"

# 备份原有配置
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)

# 检查并添加缺失的数据库配置
if ! grep -q "^DATABASE_HOST=" .env; then
    echo "DATABASE_HOST=localhost" >> .env
    echo "   ✅ 添加 DATABASE_HOST=localhost"
else
    sed -i 's/^DATABASE_HOST=.*/DATABASE_HOST=localhost/' .env
    echo "   ✅ 更新 DATABASE_HOST=localhost"
fi

if ! grep -q "^DATABASE_NAME=" .env; then
    echo "DATABASE_NAME=hiking_social_db" >> .env
    echo "   ✅ 添加 DATABASE_NAME=hiking_social_db"
fi

if ! grep -q "^DATABASE_USER=" .env; then
    echo "DATABASE_USER=hiking_user" >> .env
    echo "   ✅ 添加 DATABASE_USER=hiking_user"
fi

if ! grep -q "^DATABASE_PASSWORD=" .env; then
    echo "DATABASE_PASSWORD=senbochen" >> .env
    echo "   ✅ 添加 DATABASE_PASSWORD=senbochen"
fi

if ! grep -q "^USE_API_PREFIX=" .env; then
    echo "USE_API_PREFIX=false" >> .env
    echo "   ✅ 添加 USE_API_PREFIX=false"
else
    sed -i 's/^USE_API_PREFIX=.*/USE_API_PREFIX=false/' .env
    echo "   ✅ 更新 USE_API_PREFIX=false"
fi

# 确保 NODE_ENV
sed -i 's/^NODE_ENV=.*/NODE_ENV=production/' .env

echo "   📝 更新后的 .env 配置："
grep -E "^(DATABASE_|NODE_ENV|USE_API_PREFIX|PORT)" .env

# 步骤2: 创建生产环境配置文件
echo ""
echo "2️⃣ 创建 .env.production..."

cat > .env.production << EOF
NODE_ENV=production
PORT=3000
DATABASE_HOST=localhost
DATABASE_NAME=hiking_social_db
DATABASE_USER=hiking_user
DATABASE_PASSWORD=senbochen
USE_API_PREFIX=false
API_VERSION=v1
EOF

echo "   ✅ .env.production 创建完成"

# 步骤3: 检查数据库连接
echo ""
echo "3️⃣ 检查数据库连接..."

# 测试MySQL连接
if mysql -h localhost -u hiking_user -psenbochen -e "SELECT 1;" 2>/dev/null; then
    echo "   ✅ MySQL 连接正常"

    # 检查数据库是否存在
    if mysql -h localhost -u hiking_user -psenbochen -e "USE hiking_social_db; SELECT 1;" 2>/dev/null; then
        echo "   ✅ 数据库 hiking_social_db 存在"
    else
        echo "   ⚠️ 数据库 hiking_social_db 不存在，创建..."
        mysql -h localhost -u hiking_user -psenbochen -e "CREATE DATABASE IF NOT EXISTS hiking_social_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
        echo "   ✅ 数据库创建完成"
    fi
else
    echo "   ❌ MySQL 连接失败，检查服务状态..."
    systemctl status mysql
fi

# 步骤4: 重新构建后端
echo ""
echo "4️⃣ 重新构建后端..."

npm run build
if [ $? -eq 0 ]; then
    echo "   ✅ 后端构建成功"
else
    echo "   ❌ 后端构建失败"
    exit 1
fi

# 步骤5: 重启 PM2 服务
echo ""
echo "5️⃣ 重启 PM2 服务..."

pm2 stop hiking-app-backend || true
pm2 delete hiking-app-backend || true

# 使用 .env.production 启动
NODE_ENV=production pm2 start dist/server.js --name hiking-app-backend

sleep 5
pm2 list

# 步骤6: 检查后端状态
echo ""
echo "6️⃣ 检查后端状态..."

if netstat -tlnp | grep -q ":3000 "; then
    echo "   ✅ 后端监听 3000 端口"
else
    echo "   ❌ 后端未监听 3000 端口"
    echo "   查看日志："
    pm2 logs hiking-app-backend --lines 10 --nostream
fi

# 测试后端直连
echo "   测试后端 /health 接口..."
HEALTH_RESPONSE=$(curl -s http://localhost:3000/health)
if echo "$HEALTH_RESPONSE" | grep -q '"status":"ok"'; then
    echo "   ✅ 后端 /health 正常"
else
    echo "   ❌ 后端 /health 异常"
    echo "   响应: $HEALTH_RESPONSE"
fi

# 步骤7: 检查和修复 Nginx 配置
echo ""
echo "7️⃣ 检查 Nginx 配置..."

# 检查当前 Nginx 配置
NGINX_CONFIG="/etc/nginx/sites-available/default"

# 查找 API 相关的 location 块
if grep -A 10 "location /api/v1/" "$NGINX_CONFIG" | grep -q "proxy_pass.*api/v1"; then
    echo "   ⚠️ 发现双重前缀问题，修复中..."

    # 备份配置
    cp "$NGINX_CONFIG" "$NGINX_CONFIG.backup.$(date +%Y%m%d_%H%M%S)"

    # 修复 proxy_pass 路径
    sed -i 's|proxy_pass http://localhost:3000/api/v1/|proxy_pass http://localhost:3000/|g' "$NGINX_CONFIG"

    echo "   ✅ Nginx 配置已修复"

    # 重启 Nginx
    nginx -t && systemctl reload nginx
    echo "   ✅ Nginx 已重载"
else
    echo "   ✅ Nginx 配置正常"
fi

# 步骤8: 测试完整流程
echo ""
echo "8️⃣ 测试完整流程..."

# 测试 Nginx 到后端的代理
echo "   测试 Nginx 代理 /health..."
NGINX_HEALTH=$(curl -s http://localhost/health)
if echo "$NGINX_HEALTH" | grep -q '"status":"ok"'; then
    echo "   ✅ Nginx 代理 /health 正常"
else
    echo "   ❌ Nginx 代理 /health 异常"
    echo "   响应: $NGINX_HEALTH"
fi

# 测试 API 接口
echo "   测试 API 接口..."

# 测试消息接口（不需要认证的版本）
MSG_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/v1/messages/conversations)
echo "   消息接口状态码: $MSG_RESPONSE"

# 如果是 401 (未授权) 而不是 404，说明路由正常
if [ "$MSG_RESPONSE" = "401" ] || [ "$MSG_RESPONSE" = "200" ]; then
    echo "   ✅ 消息接口路由正常"
elif [ "$MSG_RESPONSE" = "404" ]; then
    echo "   ❌ 消息接口仍然 404"
else
    echo "   ⚠️ 消息接口返回: $MSG_RESPONSE"
fi

echo ""
echo "🎉 修复完成！"
echo ""
echo "📊 修复总结："
echo "   - ✅ 修复 .env 数据库配置"
echo "   - ✅ 添加 USE_API_PREFIX=false"
echo "   - ✅ 创建 .env.production"
echo "   - ✅ 重新构建后端"
echo "   - ✅ 重启 PM2 服务"
echo "   - ✅ 检查 Nginx 配置"
echo ""
echo "🔍 如需检查状态："
echo "   - 后端日志: pm2 logs hiking-app-backend"
echo "   - Nginx 日志: tail -f /var/log/nginx/error.log"
echo "   - 测试接口: curl http://localhost/api/v1/messages/conversations"
echo ""

PRODUCTION_FIX

echo ""
echo "✅ 远程修复完成！"
echo ""
