# 📋 生产环境 API 404 问题排查和修复方案

## 🚨 问题诊断

生产环境接口返回 404：
- `GET /api/v1/messages/conversations` → 404
- `GET /api/v1/users/user-007/detail` → 404

## 🔍 根本原因分析

### 问题 1: 环境变量配置错误
```
当前 .env 配置:
DB_HOST=115.190.252.62 (这是远程服务器 IP)
```

**问题**: 在生产服务器上运行时，不能用 `115.190.252.62` 连接数据库，应该用 `localhost` 或 `127.0.0.1`

### 问题 2: 生产环境缺少专用 .env.production
项目中没有 `.env.production` 配置，导致生产部署时使用错误的数据库配置

### 问题 3: API 路由前缀问题
- 代码定义: `/api/v1/messages`
- Nginx 代理: `/api/v1/*` → `localhost:3000/*`
- **问题**: Nginx 重新转发时会导致双重前缀！

## ✅ 修复步骤

### Step 1: 创建生产环境配置
在生产服务器上执行:
```bash
# 进入后端目录
cd /var/www/hikingSocialApp/backend

# 复制到生产环境配置
cp .env .env.production

# 编辑生产配置
nano .env.production
```

**修改以下内容**:
```env
# .env.production
PORT=3000
NODE_ENV=production
LOG_LEVEL=error

# 数据库配置 - 改为 localhost
DB_HOST=localhost
DB_PORT=3306
DB_NAME=hiking_app
DB_USER=hiking_user
DB_PASSWORD=senbochen

# JWT配置
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRES_IN=7d

# API基础URL（生产环境）
API_BASE_URL=http://115.190.252.62

# API版本
API_VERSION=v1

# CORS配置（生产环境）
CORS_ORIGIN=http://115.190.252.62,https://115.190.252.62
```

### Step 2: 检查 Nginx 反向代理配置

**问题**: Nginx 重写路径时是否正确处理前缀

查看 `/etc/nginx/sites-available/default`:
```nginx
location /api/v1/ {
    proxy_pass http://localhost:3000/api/v1/;
    # 这会导致双重前缀！
}
```

**应该改为**:
```nginx
location /api/v1/ {
    proxy_pass http://localhost:3000/;
    # 或者去掉 express 中的 /api/v1 前缀
}
```

### Step 3: 重新构建后端

```bash
cd /var/www/hikingSocialApp/backend

# 清理旧构建
rm -rf dist/

# 重新构建
npm run build

# 验证构建成功
ls -la dist/server.js
```

### Step 4: 重启服务

```bash
# 重启后端服务
pm2 restart hiking-app-backend

# 等待重启完成
sleep 3

# 检查状态
pm2 logs hiking-app-backend --lines 30 --nostream
```

### Step 5: 完整测试

```bash
# 1. 检查后端端口
netstat -tlnp | grep 3000

# 2. 测试后端直连
curl -v http://localhost:3000/health

# 3. 测试通过 Nginx 代理
curl -v http://115.190.252.62/health
curl -v http://localhost/health

# 4. 测试消息接口（需要 token）
curl -X GET "http://115.190.252.62/api/v1/messages/conversations" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 5. 测试用户接口
curl -X GET "http://115.190.252.62/api/v1/users/user-007/detail" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📊 问题排序（按优先级）

| 优先级 | 问题 | 影响范围 | 修复方式 |
|------|------|--------|--------|
| 🔴 严重 | DB_HOST 错误指向服务器 IP | 所有数据库操作 | 改为 localhost |
| 🔴 严重 | Nginx 路径前缀双重 | API 404 | 检查 proxy_pass 配置 |
| 🟡 中等 | 没有 .env.production | 环境隔离不清 | 创建生产配置 |
| 🟡 中等 | 构建文件可能过期 | 代码更新不生效 | 重新构建 |
| 🟢 低 | PM2 进程可能需要重启 | 仅在新部署时 | restart |

## 🔧 一键修复脚本

在生产服务器上运行:

```bash
#!/bin/bash

PROJECT_DIR="/var/www/hikingSocialApp"
BACKEND_DIR="$PROJECT_DIR/backend"

echo "🔧 开始生产环境修复..."

# 1. 更新环境变量
echo "1️⃣ 更新数据库配置..."
sed -i 's/DB_HOST=115.190.252.62/DB_HOST=localhost/g' "$BACKEND_DIR/.env"

# 2. 重新构建
echo "2️⃣ 重新构建后端..."
cd "$BACKEND_DIR"
rm -rf dist/
npm run build

# 3. 检查 Nginx 配置
echo "3️⃣ 检查 Nginx 配置..."
NGINX_CONF="/etc/nginx/sites-available/default"
if grep -q "proxy_pass http://localhost:3000/api/v1/" "$NGINX_CONF"; then
    echo "   ⚠️ 发现双重前缀问题，正在修复..."
    sudo sed -i 's|proxy_pass http://localhost:3000/api/v1/;|proxy_pass http://localhost:3000/;|g' "$NGINX_CONF"
    sudo nginx -t && sudo systemctl reload nginx
    echo "   ✅ Nginx 已修复并重新加载"
fi

# 4. 重启后端
echo "4️⃣ 重启后端服务..."
pm2 restart hiking-app-backend
sleep 3

# 5. 验证
echo "5️⃣ 验证服务..."
if curl -s http://localhost:3000/health | grep -q '"status":"ok"'; then
    echo "   ✅ 后端健康检查通过"
else
    echo "   ❌ 后端健康检查失败"
    pm2 logs hiking-app-backend --lines 50 --nostream
fi

echo ""
echo "✅ 修复完成！"
echo ""
echo "测试接口:"
echo "  curl http://115.190.252.62/api/v1/health"
echo "  curl http://115.190.252.62/api/v1/messages/conversations"
```

## 🧪 测试清单

- [ ] 后端进程正在运行: `pm2 list`
- [ ] 端口 3000 监听中: `netstat -tlnp | grep 3000`
- [ ] 数据库连接正常: `mysql -h localhost -u hiking_user -p`
- [ ] 健康检查通过: `curl http://localhost:3000/health`
- [ ] Nginx 代理工作: `curl http://115.190.252.62/health`
- [ ] 消息接口正常: `curl http://115.190.252.62/api/v1/messages/conversations`
- [ ] 用户接口正常: `curl http://115.190.252.62/api/v1/users/user-007/detail`

## 📝 日志检查

```bash
# 查看后端日志
pm2 logs hiking-app-backend --lines 100

# 查看 Nginx 错误
sudo tail -f /var/log/nginx/error.log

# 查看 Nginx 访问
sudo tail -f /var/log/nginx/access.log

# 查看 MySQL 错误
sudo tail -f /var/log/mysql/error.log
```

## 🎯 预期结果

修复后：
- ✅ `GET /api/v1/messages/conversations` → 200 OK (返回对话列表)
- ✅ `GET /api/v1/users/user-007/detail` → 200 OK (返回用户信息)
- ✅ WebSocket 连接正常
- ✅ 消息发送和接收正常

## 💡 常见问题

### Q: 修复后仍然 404？
A: 检查 PM2 启动日志: `pm2 logs hiking-app-backend`

### Q: 数据库连接错误？
A: 检查 .env 配置是否使用了 `localhost` 而不是 `115.190.252.62`

### Q: Nginx 502 Bad Gateway?
A: 检查后端是否运行: `netstat -tlnp | grep 3000`

### Q: CORS 错误？
A: 检查 CORS_ORIGIN 是否包含生产域名

