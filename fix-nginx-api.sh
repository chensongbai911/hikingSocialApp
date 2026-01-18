#!/bin/bash

SERVER_IP="${1:-115.190.252.62}"

echo "🔧 修复Nginx API代理配置..."

ssh root@$SERVER_IP << 'FIX_NGINX'

# 修复nginx配置中的API路径
cat > /etc/nginx/conf.d/hiking-app.conf << 'EOF'
# 徒步社交 App - 单服务器配置（IP直接访问）
# 适用于：前后端部署在同一台服务器，通过 IP 地址访问

server {
    listen 80;
    server_name 115.190.252.62;  # 你的服务器 IP

    # 请求体大小限制（支持大文件上传）
    client_max_body_size 10M;

    # API 反向代理 - 转发到后端 Node.js 服务
    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # CORS 支持（如果后端已配置可删除）
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
        add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range' always;

        if ($request_method = 'OPTIONS') {
            return 204;
        }
    }

    # 文件上传目录 - 直接访问上传的图片
    location /uploads/ {
        alias /var/www/hikingSocialApp/backend/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";

        # 安全设置：只允许图片文件
        location ~* \.(jpg|jpeg|png|gif|webp|svg)$ {
            # 允许跨域访问图片
            add_header 'Access-Control-Allow-Origin' '*' always;
        }
    }

    # WebSocket 支持（如果需要）
    location /socket.io/ {
        proxy_pass http://localhost:3000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 健康检查
    location /health {
        proxy_pass http://localhost:3000/health;
        access_log off;
    }

    # 前端静态文件
    root /var/www/hikingSocialApp/frontend/dist;
    index index.html;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript
               application/x-javascript application/xml+rss
               application/json application/javascript
               application/vnd.ms-fontobject application/x-font-ttf
               font/opentype image/svg+xml image/x-icon;

    # 前端路由处理（SPA）- 必须放在最后
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # HTML 不缓存
    location ~* \.html$ {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # 禁止访问隐藏文件
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
EOF

echo "✅ 已修复API路径从 /api/v1/ 到 /api/"

# 测试配置
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx配置测试通过"
    # 重载配置
    systemctl reload nginx
    echo "✅ Nginx配置已重载"
else
    echo "❌ Nginx配置测试失败，恢复备份"
    cp /etc/nginx/conf.d/hiking-app.conf.backup /etc/nginx/conf.d/hiking-app.conf
    exit 1
fi

FIX_NGINX

echo ""
echo "🧪 测试修复后的API..."

sleep 2

# 测试API
echo "测试健康检查..."
curl -s http://$SERVER_IP/api/health && echo " ✅ 健康检查通过"

echo "测试目的地API..."
curl -s http://$SERVER_IP/api/destinations | head -c 50 && echo " ✅ 目的地API返回数据"

echo ""
echo "🎉 API代理修复完成！"
