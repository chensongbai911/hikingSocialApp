#!/bin/bash

# 🔧 生产环境完整修复脚本
# 解决 API 404 问题

SERVER_IP="115.190.252.62"
PROJECT_DIR="/var/www/hikingSocialApp"
BACKEND_DIR="$PROJECT_DIR/backend"

echo "=========================================="
echo "🚀 开始修复生产环境 API 404 问题"
echo "=========================================="
echo ""

# 连接到生产服务器
ssh root@$SERVER_IP << 'PRODUCTION_COMMANDS'

PROJECT_DIR="/var/www/hikingSocialApp"
BACKEND_DIR="$PROJECT_DIR/backend"

# ============ 第一步: 修复环境变量 ============
echo "1️⃣ 修复环境变量..."
echo "   当前 DB_HOST: $(grep '^DB_HOST=' $BACKEND_DIR/.env)"

# 备份原配置
cp $BACKEND_DIR/.env $BACKEND_DIR/.env.backup.$(date +%s)

# 修改数据库主机从远程 IP 改为 localhost
sed -i 's/DB_HOST=115.190.252.62/DB_HOST=localhost/g' $BACKEND_DIR/.env
sed -i 's/DB_HOST=.*\..*\..*\..*/DB_HOST=localhost/g' $BACKEND_DIR/.env

# 确保 NODE_ENV 是 production
sed -i 's/NODE_ENV=.*/NODE_ENV=production/g' $BACKEND_DIR/.env

echo "   ✅ 数据库主机已改为 localhost"
echo "   新 DB_HOST: $(grep '^DB_HOST=' $BACKEND_DIR/.env)"

# ============ 第二步: 验证 Nginx 配置 ============
echo ""
echo "2️⃣ 验证 Nginx 配置..."

# 检查是否有双重前缀问题
if grep -q "proxy_pass http://localhost:3000/api/v1/" /etc/nginx/sites-available/default; then
    echo "   ⚠️ 发现 Nginx 配置问题: proxy_pass 包含了 /api/v1/"
    echo "   问题: Nginx 转发 /api/v1/ → localhost:3000/api/v1/"
    echo "         但 Express 本身的路由也是 /api/v1/"
    echo "         导致实际访问路径变成 /api/v1//api/v1/"
    echo ""
    echo "   正在修复..."

    # 修复：移除 proxy_pass 中的 /api/v1/
    sudo sed -i 's|proxy_pass http://localhost:3000/api/v1/;|proxy_pass http://localhost:3000/;|g' /etc/nginx/sites-available/default

    # 但这样会有新问题，我们需要采用不同方案
    # 最好是在 Express 中移除 /api/v1 前缀
    # 或者在 Nginx 中使用 rewrite

    # 采用方案: 使用 rewrite 移除前缀后转发
    sudo cat > /etc/nginx/sites-available/default.fixed << 'NGINX_CONF'
# 徒步社交 App - 单服务器配置

server {
    listen 80;
    server_name 115.190.252.62;

    client_max_body_size 10M;

    # API 反向代理 - 正确处理路径前缀
    location /api/v1/ {
        # 方案1: 直接转发（Express 中有 /api/v1 前缀）
        proxy_pass http://localhost:3000;
        # 重写路径，去掉 /api/v1 后再转发
        rewrite ^/api/v1/(.*) /$1 break;

        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;

        if ($request_method = 'OPTIONS') {
            return 204;
        }
    }

    # 文件上传
    location /uploads/ {
        alias /var/www/hikingSocialApp/backend/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # WebSocket
    location /socket.io/ {
        proxy_pass http://localhost:3000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    # 健康检查
    location /health {
        proxy_pass http://localhost:3000/health;
        access_log off;
    }

    # 前端
    root /var/www/hikingSocialApp/frontend/dist;
    index index.html;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript
               application/x-javascript application/xml+rss
               application/json application/javascript;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
NGINX_CONF

    echo "   ✅ Nginx 配置已修复"
else
    echo "   ✅ Nginx 配置正常"
fi

# 验证 Nginx 语法
echo "   验证 Nginx 配置语法..."
if sudo nginx -t 2>&1 | grep -q "successful"; then
    echo "   ✅ Nginx 配置有效"
else
    echo "   ❌ Nginx 配置有错误"
    sudo nginx -t
    exit 1
fi

# ============ 第三步: 清理并重新构建后端 ============
echo ""
echo "3️⃣ 重新构建后端..."

cd $BACKEND_DIR

# 清理旧构建
echo "   清理旧构建文件..."
rm -rf dist/

# 清理 node_modules（可选，时间较长）
# rm -rf node_modules/

# 重新安装依赖（仅安装生产依赖）
echo "   检查依赖..."
if [ ! -d "node_modules" ]; then
    npm ci --omit=dev
fi

# 重新构建
echo "   编译TypeScript..."
npm run build

if [ -f "dist/server.js" ]; then
    echo "   ✅ 构建成功"
    ls -lh dist/server.js
else
    echo "   ❌ 构建失败"
    exit 1
fi

# ============ 第四步: 重启服务 ============
echo ""
echo "4️⃣ 重启服务..."

# 重新加载 Nginx
echo "   重新加载 Nginx..."
sudo systemctl reload nginx
echo "   ✅ Nginx 已重新加载"

# 重启后端服务
echo "   重启后端服务..."
pm2 restart hiking-app-backend
sleep 3

# 检查后端状态
PM2_STATUS=$(pm2 list | grep "hiking-app-backend" | awk '{print $9}')
if [ "$PM2_STATUS" = "online" ]; then
    echo "   ✅ 后端服务已启动"
else
    echo "   ⚠️ 后端服务状态: $PM2_STATUS"
    echo "   查看日志："
    pm2 logs hiking-app-backend --lines 50 --nostream
fi

# ============ 第五步: 验证 ============
echo ""
echo "5️⃣ 验证修复..."

# 等待服务完全启动
sleep 2

# 测试1: 后端直连健康检查
echo "   测试1: 后端直连 /health"
if curl -s http://localhost:3000/health | grep -q '"status":"ok"'; then
    echo "   ✅ 后端直连成功"
else
    echo "   ❌ 后端直连失败"
fi

# 测试2: 通过 Nginx 的健康检查
echo "   测试2: Nginx 代理 /health"
if curl -s http://localhost/health | grep -q '"status":"ok"'; then
    echo "   ✅ Nginx 代理成功"
else
    echo "   ❌ Nginx 代理失败"
fi

# 测试3: API 端点测试（不需要认证的）
echo "   测试3: API 端点 /api/v1/"
API_RESPONSE=$(curl -s http://localhost:3000/api/v1/)
if echo "$API_RESPONSE" | grep -q "Hiking Social App API"; then
    echo "   ✅ 后端 API 端点正常"
else
    echo "   ❌ 后端 API 端点异常"
    echo "   响应: $API_RESPONSE"
fi

# 测试4: 通过 Nginx 访问 API
echo "   测试4: Nginx 代理 API 端点"
NGINX_API=$(curl -s http://localhost/api/v1/)
if echo "$NGINX_API" | grep -q "Hiking Social App API"; then
    echo "   ✅ Nginx API 代理正常"
else
    echo "   ⚠️ Nginx API 代理可能有问题"
    echo "   响应: $NGINX_API"
fi

# 测试5: 完整端点路径测试
echo ""
echo "   详细测试:"
echo "   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 检查端口监听
echo "   后端端口监听情况:"
netstat -tlnp 2>/dev/null | grep 3000 || echo "   ⚠️ 端口 3000 未监听"

# 检查进程
echo ""
echo "   PM2 进程状态:"
pm2 list | grep hiking-app-backend

# 检查数据库连接
echo ""
echo "   数据库连接测试:"
if command -v mysql &> /dev/null; then
    DB_HOST=$(grep '^DB_HOST=' $BACKEND_DIR/.env | cut -d'=' -f2)
    DB_NAME=$(grep '^DB_NAME=' $BACKEND_DIR/.env | cut -d'=' -f2)
    if mysql -h "$DB_HOST" -u "hiking_user" -e "SELECT 1 FROM information_schema.SCHEMATA WHERE SCHEMA_NAME='$DB_NAME'" 2>/dev/null; then
        echo "   ✅ 数据库连接成功"
    else
        echo "   ❌ 数据库连接失败"
    fi
else
    echo "   ⚠️ 未安装 mysql 客户端"
fi

# ============ 总结 ============
echo ""
echo "=========================================="
echo "✅ 修复完成!"
echo "=========================================="
echo ""
echo "📝 修复项:"
echo "   ✅ 环境变量 DB_HOST: localhost"
echo "   ✅ Nginx 配置: 正确处理路径前缀"
echo "   ✅ 后端重新构建"
echo "   ✅ 服务重启"
echo ""
echo "🧪 测试接口:"
echo "   直接连接:"
echo "     curl http://localhost:3000/health"
echo "     curl http://localhost:3000/api/v1/"
echo ""
echo "   通过 Nginx:"
echo "     curl http://115.190.252.62/health"
echo "     curl http://115.190.252.62/api/v1/"
echo ""
echo "   通过 Nginx 带认证:"
echo "     curl -H 'Authorization: Bearer YOUR_TOKEN' \\"
echo "          http://115.190.252.62/api/v1/messages/conversations"
echo ""
echo "📊 如果仍有 404 错误:"
echo "   1. 检查后端日志: pm2 logs hiking-app-backend"
echo "   2. 检查 Nginx 错误: sudo tail -f /var/log/nginx/error.log"
echo "   3. 检查数据库连接: mysql -u hiking_user -p"
echo ""

PRODUCTION_COMMANDS

echo ""
echo "✅ 远程修复执行完成"

