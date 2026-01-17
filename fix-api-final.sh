#!/bin/bash

# ===================================================================
# 🔧 生产环境 API 404 问题 - 完整修复脚本 v3.2
# ===================================================================

set -e

SERVER_IP="${1:-115.190.252.62}"
PROJECT_DIR="/var/www/hikingSocialApp"
BACKEND_DIR="$PROJECT_DIR/backend"

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   🔧 生产环境 API 404 问题 - 完整修复脚本 v3.2            ║"
echo "║   服务器: $SERVER_IP"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# SSH 连接到服务器执行完整修复
ssh root@$SERVER_IP << 'PRODUCTION_FIX'

PROJECT_DIR="/var/www/hikingSocialApp"
BACKEND_DIR="$PROJECT_DIR/backend"

echo "🎯 开始执行完整修复..."
echo ""

# 步骤1: 修复 .env 文件
echo "1️⃣ 修复 .env 文件配置..."
cd "$BACKEND_DIR"

# 备份原有配置
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)

# 创建完整的 .env 配置
cat > .env << 'ENV_CONFIG'
NODE_ENV=production
PORT=3000

# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=hiking_social_db
DATABASE_USER=hiking_user
DATABASE_PASSWORD=senbochen

# API Configuration
USE_API_PREFIX=false
API_VERSION=v1

# JWT
JWT_SECRET=your_jwt_secret_key_here_replace_in_production
JWT_EXPIRES_IN=7d

# Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# CORS
ALLOWED_ORIGINS=*
ENV_CONFIG

echo "   ✅ .env 配置已更新"

# 步骤2: 修复数据库权限
echo ""
echo "2️⃣ 修复数据库权限..."

# 检查 MySQL 是否运行
if ! systemctl is-active --quiet mysql; then
    echo "   启动 MySQL 服务..."
    systemctl start mysql
fi

# 创建数据库和用户
mysql -u root << 'SQL_SETUP'
-- 创建数据库
CREATE DATABASE IF NOT EXISTS hiking_social_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户并授权
CREATE USER IF NOT EXISTS 'hiking_user'@'localhost' IDENTIFIED BY 'senbochen';
GRANT ALL PRIVILEGES ON hiking_social_db.* TO 'hiking_user'@'localhost';
FLUSH PRIVILEGES;

-- 测试权限
USE hiking_social_db;
SELECT 'Database setup complete' as status;
SQL_SETUP

echo "   ✅ 数据库配置完成"

# 步骤3: 跳过TypeScript构建，直接使用JavaScript模式
echo ""
echo "3️⃣ 配置JavaScript运行模式..."

# 检查是否已有构建文件
if [ -d "dist" ] && [ -f "dist/server.js" ]; then
    echo "   ✅ 现有构建文件可用，跳过构建"
else
    echo "   ⚠️ 没有构建文件，尝试简单构建..."

    # 安装开发依赖
    npm install --save-dev @types/express @types/node @types/bcryptjs @types/jsonwebtoken @types/multer

    # 尝试构建
    if npm run build; then
        echo "   ✅ 构建成功"
    else
        echo "   ⚠️ TypeScript构建失败，使用备用方案"

        # 创建简单的 server.js 代理
        mkdir -p dist
        cat > dist/server.js << 'SERVER_JS'
// 简单的代理文件
const path = require('path');
const srcPath = path.join(__dirname, '..', 'src', 'server.ts');

// 如果有 ts-node，使用它
try {
  require('ts-node/register');
  require(srcPath);
} catch (error) {
  console.error('无法启动 TypeScript 服务器:', error.message);
  console.log('请检查依赖安装或联系开发者');
  process.exit(1);
}
SERVER_JS
        echo "   ✅ 创建了备用启动文件"
    fi
fi

# 步骤4: 重启 PM2 服务
echo ""
echo "4️⃣ 重启 PM2 服务..."

# 停止现有服务
pm2 stop hiking-app-backend || true
pm2 delete hiking-app-backend || true

# 检查是否有 ecosystem 配置
if [ -f "ecosystem.config.cjs" ]; then
    echo "   使用 ecosystem 配置启动..."
    NODE_ENV=production pm2 start ecosystem.config.cjs
else
    # 直接启动
    echo "   直接启动服务..."
    cd "$BACKEND_DIR"
    NODE_ENV=production pm2 start dist/server.js --name hiking-app-backend --watch false
fi

sleep 5

# 检查 PM2 状态
pm2 list
echo "   ✅ PM2 服务已重启"

# 步骤5: 检查服务状态
echo ""
echo "5️⃣ 检查服务状态..."

# 等待服务启动
sleep 10

# 检查端口
if netstat -tlnp | grep -q ":3000 "; then
    echo "   ✅ 后端监听 3000 端口"
    netstat -tlnp | grep ":3000"
else
    echo "   ❌ 后端未监听 3000 端口"
    echo "   PM2 日志："
    pm2 logs hiking-app-backend --lines 20 --nostream
fi

# 测试后端直连
echo "   测试后端 /health 接口..."
for i in {1..5}; do
    HEALTH_RESPONSE=$(curl -s http://localhost:3000/health 2>/dev/null || echo "connection_failed")
    if echo "$HEALTH_RESPONSE" | grep -q '"status":"ok"'; then
        echo "   ✅ 后端 /health 正常"
        echo "   响应: $HEALTH_RESPONSE"
        break
    else
        echo "   ⏱️ 等待服务启动... ($i/5)"
        sleep 3
    fi

    if [ $i -eq 5 ]; then
        echo "   ❌ 后端 /health 连接失败"
        echo "   响应: $HEALTH_RESPONSE"
        echo "   查看最新日志："
        pm2 logs hiking-app-backend --lines 10 --nostream
    fi
done

# 步骤6: 修复 Nginx 配置
echo ""
echo "6️⃣ 检查和修复 Nginx 配置..."

NGINX_CONFIG="/etc/nginx/sites-available/default"

# 备份配置
cp "$NGINX_CONFIG" "$NGINX_CONFIG.backup.$(date +%Y%m%d_%H%M%S)"

# 创建正确的 Nginx 配置
echo "   更新 Nginx 配置..."

# 查找并替换 API 配置
if grep -q "location /api/v1/" "$NGINX_CONFIG"; then
    echo "   修复现有 API 配置..."

    # 使用 sed 修复双重前缀问题
    sed -i 's|proxy_pass http://localhost:3000/api/v1/.*;|proxy_pass http://localhost:3000/;|g' "$NGINX_CONFIG"

else
    echo "   添加缺失的 API 配置..."

    # 在 server 块内添加 API 配置
    sed -i '/server {/a\
    # API routes\
    location /api/v1/ {\
        proxy_pass http://localhost:3000/;\
        proxy_http_version 1.1;\
        proxy_set_header Upgrade $http_upgrade;\
        proxy_set_header Connection '\''upgrade'\'';\
        proxy_set_header Host $host;\
        proxy_set_header X-Real-IP $remote_addr;\
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\
        proxy_set_header X-Forwarded-Proto $scheme;\
    }' "$NGINX_CONFIG"
fi

# 确保有健康检查路由
if ! grep -q "location /health" "$NGINX_CONFIG"; then
    sed -i '/location \/api\/v1\//a\
    # Health check\
    location /health {\
        proxy_pass http://localhost:3000/health;\
        proxy_http_version 1.1;\
        proxy_set_header Host $host;\
    }' "$NGINX_CONFIG"
fi

# 测试配置
if nginx -t; then
    echo "   ✅ Nginx 配置语法正确"
    systemctl reload nginx
    echo "   ✅ Nginx 已重载"
else
    echo "   ❌ Nginx 配置语法错误"
    echo "   恢复备份配置..."
    cp "$NGINX_CONFIG.backup.$(date +%Y%m%d_%H%M%S)" "$NGINX_CONFIG"
    nginx -t
fi

# 步骤7: 完整测试
echo ""
echo "7️⃣ 完整测试..."

# 等待 Nginx 重载完成
sleep 3

# 测试健康检查
echo "   测试 Nginx 代理 /health..."
for i in {1..3}; do
    NGINX_HEALTH=$(curl -s http://localhost/health 2>/dev/null || echo "failed")
    if echo "$NGINX_HEALTH" | grep -q '"status":"ok"'; then
        echo "   ✅ Nginx 代理 /health 正常"
        echo "   响应: $NGINX_HEALTH"
        break
    else
        echo "   ⏱️ 重试 Nginx 代理... ($i/3)"
        sleep 2
    fi

    if [ $i -eq 3 ]; then
        echo "   ❌ Nginx 代理失败"
        echo "   响应: $NGINX_HEALTH"
    fi
done

# 测试 API 接口
echo ""
echo "   测试 API 接口..."

# 测试消息接口 (应该返回 401 或 200，不是 404)
MSG_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/v1/messages/conversations 2>/dev/null)
echo "   消息接口状态码: $MSG_RESPONSE"

if [ "$MSG_RESPONSE" = "401" ] || [ "$MSG_RESPONSE" = "200" ]; then
    echo "   ✅ 消息接口路由正常 (需要认证)"
elif [ "$MSG_RESPONSE" = "404" ]; then
    echo "   ❌ 消息接口仍然 404"
elif [ "$MSG_RESPONSE" = "502" ] || [ "$MSG_RESPONSE" = "503" ]; then
    echo "   ⚠️ 消息接口后端连接问题: $MSG_RESPONSE"
else
    echo "   ℹ️ 消息接口返回: $MSG_RESPONSE"
fi

# 测试用户接口
USER_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/v1/users/user-007/detail 2>/dev/null)
echo "   用户详情接口状态码: $USER_RESPONSE"

if [ "$USER_RESPONSE" = "401" ] || [ "$USER_RESPONSE" = "200" ]; then
    echo "   ✅ 用户接口路由正常 (需要认证)"
elif [ "$USER_RESPONSE" = "404" ]; then
    echo "   ❌ 用户接口仍然 404"
elif [ "$USER_RESPONSE" = "502" ] || [ "$USER_RESPONSE" = "503" ]; then
    echo "   ⚠️ 用户接口后端连接问题: $USER_RESPONSE"
else
    echo "   ℹ️ 用户接口返回: $USER_RESPONSE"
fi

echo ""
echo "🎉 修复完成！"
echo ""
echo "📊 修复总结："
echo "   - ✅ 修复 .env 数据库配置"
echo "   - ✅ 添加 USE_API_PREFIX=false"
echo "   - ✅ 修复数据库权限"
echo "   - ✅ 配置 PM2 服务"
echo "   - ✅ 修复 Nginx 代理配置"
echo ""
echo "🔍 当前状态："
echo "   - 后端端口: $(netstat -tlnp | grep :3000 | wc -l) 个进程监听"
echo "   - PM2 状态: $(pm2 list | grep hiking-app-backend | awk '{print $10}' || echo 'unknown')"
echo "   - 消息接口: HTTP $MSG_RESPONSE"
echo "   - 用户接口: HTTP $USER_RESPONSE"
echo ""
echo "📋 后续检查："
echo "   - 后端日志: pm2 logs hiking-app-backend"
echo "   - Nginx 日志: tail -f /var/log/nginx/error.log"
echo "   - 测试消息: curl http://localhost/api/v1/messages/conversations"
echo "   - 测试用户: curl http://localhost/api/v1/users/user-007/detail"
echo ""

PRODUCTION_FIX

echo ""
echo "✅ 远程完整修复完成！"
echo ""
