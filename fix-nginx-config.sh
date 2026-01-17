#!/bin/bash

# ===================================================================
# 🔧 专门修复 Nginx 配置的脚本 v1.0
# ===================================================================

set -e

SERVER_IP="${1:-115.190.252.62}"

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   🔧 Nginx 配置修复脚本 v1.0                              ║"
echo "║   服务器: $SERVER_IP"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# SSH 连接到服务器修复 Nginx
ssh root@$SERVER_IP << 'NGINX_FIX'

echo "🎯 开始 Nginx 配置修复..."
echo ""

# 步骤1: 查找 Nginx 配置文件位置
echo "1️⃣ 查找 Nginx 配置文件..."

# 常见的配置文件位置
POSSIBLE_CONFIGS=(
    "/etc/nginx/nginx.conf"
    "/etc/nginx/conf.d/default.conf"
    "/etc/nginx/sites-available/default"
    "/etc/nginx/sites-enabled/default"
)

NGINX_MAIN_CONFIG=""
NGINX_SITE_CONFIG=""

for config in "${POSSIBLE_CONFIGS[@]}"; do
    if [ -f "$config" ]; then
        echo "   发现配置文件: $config"

        if [[ "$config" == *"nginx.conf" ]]; then
            NGINX_MAIN_CONFIG="$config"
        elif [[ "$config" == *"default"* ]]; then
            NGINX_SITE_CONFIG="$config"
        fi
    fi
done

# 如果没找到站点配置，使用主配置
if [ -z "$NGINX_SITE_CONFIG" ] && [ -n "$NGINX_MAIN_CONFIG" ]; then
    NGINX_SITE_CONFIG="$NGINX_MAIN_CONFIG"
fi

if [ -z "$NGINX_SITE_CONFIG" ]; then
    echo "   ❌ 未找到 Nginx 配置文件"
    exit 1
fi

echo "   ✅ 使用配置文件: $NGINX_SITE_CONFIG"

# 步骤2: 备份现有配置
echo ""
echo "2️⃣ 备份现有配置..."
cp "$NGINX_SITE_CONFIG" "$NGINX_SITE_CONFIG.backup.$(date +%Y%m%d_%H%M%S)"
echo "   ✅ 配置已备份"

# 步骤3: 查看当前配置结构
echo ""
echo "3️⃣ 分析当前配置..."
echo "   当前配置内容（关键部分）："
grep -E "(server|location|proxy_pass)" "$NGINX_SITE_CONFIG" | head -20

# 步骤4: 创建正确的配置
echo ""
echo "4️⃣ 创建正确的 Nginx 配置..."

# 创建一个完整的配置文件
cat > "$NGINX_SITE_CONFIG" << 'NGINX_CONFIG'
# Nginx configuration for hiking social app

# 如果是主配置文件，需要包含基本结构
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # 日志格式
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                   '$status $body_bytes_sent "$http_referer" '
                   '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;

    sendfile        on;
    tcp_nopush      on;
    tcp_nodelay     on;
    keepalive_timeout  65;
    types_hash_max_size 2048;

    server {
        listen       80;
        server_name  _;

        # 主页面 - 前端文件
        location / {
            root /var/www/hikingSocialApp/frontend/dist;
            index index.html index.htm;
            try_files $uri $uri/ /index.html;
        }

        # API routes - 关键修复！
        location /api/v1/ {
            # 去掉 /api/v1 前缀，只转发剩余路径
            proxy_pass http://localhost:3000/;

            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;

            # 超时设置
            proxy_connect_timeout       60s;
            proxy_send_timeout          60s;
            proxy_read_timeout          60s;
        }

        # Health check
        location /health {
            proxy_pass http://localhost:3000/health;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        # WebSocket support
        location /socket.io/ {
            proxy_pass http://localhost:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        # Static files from backend (uploads, etc.)
        location /uploads/ {
            alias /var/www/hikingSocialApp/backend/uploads/;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Error pages
        error_page   404  /404.html;
        error_page   500 502 503 504  /50x.html;

        location = /50x.html {
            root   /usr/share/nginx/html;
        }

        location = /404.html {
            root   /usr/share/nginx/html;
        }
    }
}
NGINX_CONFIG

echo "   ✅ 新配置已创建"

# 步骤5: 测试配置
echo ""
echo "5️⃣ 测试 Nginx 配置..."

if nginx -t; then
    echo "   ✅ Nginx 配置语法正确"
else
    echo "   ❌ Nginx 配置语法错误，恢复备份..."
    cp "$NGINX_SITE_CONFIG.backup.$(date +%Y%m%d_%H%M%S)" "$NGINX_SITE_CONFIG"
    nginx -t
    exit 1
fi

# 步骤6: 重启 Nginx
echo ""
echo "6️⃣ 重启 Nginx 服务..."

systemctl restart nginx
sleep 2

if systemctl is-active --quiet nginx; then
    echo "   ✅ Nginx 服务运行正常"
else
    echo "   ❌ Nginx 服务启动失败"
    systemctl status nginx
    exit 1
fi

# 步骤7: 验证修复
echo ""
echo "7️⃣ 验证修复结果..."

# 测试健康检查
echo "   测试健康检查..."
HEALTH_RESPONSE=$(curl -s http://localhost/health 2>/dev/null || echo "failed")
if echo "$HEALTH_RESPONSE" | grep -q '"status":"ok"'; then
    echo "   ✅ /health 代理正常"
    echo "   响应: $HEALTH_RESPONSE"
else
    echo "   ❌ /health 代理失败"
    echo "   响应: $HEALTH_RESPONSE"
fi

# 测试API接口
echo ""
echo "   测试 API 接口..."

# 消息接口
MSG_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/v1/messages/conversations 2>/dev/null)
echo "   消息接口状态: $MSG_STATUS"

if [ "$MSG_STATUS" = "401" ]; then
    echo "   ✅ 消息接口路由正常 (需要认证)"
elif [ "$MSG_STATUS" = "404" ]; then
    echo "   ❌ 消息接口仍然 404"
elif [ "$MSG_STATUS" = "500" ]; then
    echo "   ⚠️ 消息接口服务器错误"
else
    echo "   ℹ️ 消息接口返回: $MSG_STATUS"
fi

# 用户接口
USER_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/v1/users/test/detail 2>/dev/null)
echo "   用户接口状态: $USER_STATUS"

if [ "$USER_STATUS" = "401" ]; then
    echo "   ✅ 用户接口路由正常 (需要认证)"
elif [ "$USER_STATUS" = "404" ]; then
    echo "   ❌ 用户接口仍然 404"
elif [ "$USER_STATUS" = "500" ]; then
    echo "   ⚠️ 用户接口服务器错误"
else
    echo "   ℹ️ 用户接口返回: $USER_STATUS"
fi

# 步骤8: 显示最终状态
echo ""
echo "8️⃣ 最终状态报告..."

echo "   📋 服务状态:"
echo "     - Nginx: $(systemctl is-active nginx)"
echo "     - 后端服务: $(netstat -tlnp | grep :3000 | wc -l) 个进程"

echo ""
echo "   📋 接口测试:"
echo "     - /health: $(echo "$HEALTH_RESPONSE" | grep -o '"status":"[^"]*"' || echo 'failed')"
echo "     - /api/v1/messages/conversations: HTTP $MSG_STATUS"
echo "     - /api/v1/users/*/detail: HTTP $USER_STATUS"

echo ""
echo "   📝 配置文件: $NGINX_SITE_CONFIG"

# 显示关键的代理配置
echo ""
echo "   🔍 关键代理配置:"
grep -A 2 "location /api/v1/" "$NGINX_SITE_CONFIG" || echo "   配置不存在"

echo ""
echo "🎉 Nginx 配置修复完成！"
echo ""

# 如果仍有问题，显示诊断信息
if [ "$MSG_STATUS" = "404" ] || [ "$USER_STATUS" = "404" ]; then
    echo "❗ 仍有 404 问题，请检查:"
    echo "  1. 后端日志: pm2 logs hiking-app-backend"
    echo "  2. Nginx 日志: tail -f /var/log/nginx/error.log"
    echo "  3. 后端是否监听 3000: netstat -tlnp | grep 3000"
    echo "  4. 后端路由配置: USE_API_PREFIX=false"
fi

echo ""

NGINX_FIX

echo ""
echo "✅ Nginx 配置修复完成！"
echo ""
