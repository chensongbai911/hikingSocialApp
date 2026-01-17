# API 接口完整诊断指南 (2026-01-17)

## 当前问题

生产环境（http://115.190.252.62）许多接口返回 404

## 排查清单

### 1️⃣ 后端启动状态检查

```bash
# SSH 连接到服务器
ssh root@115.190.252.62

# 检查 PM2 进程状态
pm2 list
pm2 logs hiking-app-backend --lines 50

# 检查后端是否监听端口 3000
netstat -tlnp | grep 3000
# 或
lsof -i :3000

# 检查 Node.js 进程
ps aux | grep node
```

**预期结果**：应该看到 `hiking-app-backend online`

### 2️⃣ 直接连接后端测试

```bash
# 从服务器本地测试后端
curl http://localhost:3000/health
curl http://localhost:3000/api/v1/auth/login -X POST -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"test123"}'

# 外部测试（通过 IP）
curl http://115.190.252.62:3000/health
```

**预期结果**：后端应该返回 `{"status": "ok", "timestamp": "...", "version": "v1"}`

### 3️⃣ Nginx 配置验证

```bash
# 验证 Nginx 配置
sudo nginx -t

# 检查 Nginx 状态
sudo systemctl status nginx

# 查看 Nginx 进程
ps aux | grep nginx

# 查看 Nginx 日志
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

**预期结果**：`nginx: configuration file test is successful`

### 4️⃣ 代理测试

```bash
# 测试通过 Nginx 反向代理访问 API
curl http://115.190.252.62/api/v1/health

# 通过 Nginx 测试登录接口
curl http://115.190.252.62/api/v1/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# 查看详细请求头
curl -v http://115.190.252.62/api/v1/health
```

**预期结果**：应该获得与直接访问后端相同的响应

### 5️⃣ 环境变量检查

```bash
# 检查后端 .env 文件
cat /var/www/hikingSocialApp/backend/.env

# 检查数据库连接
echo "SELECT 1" | mysql -u user -p -h 127.0.0.1 -D database_name
```

**预期结果**：`.env` 文件包含所有必要配置，数据库可连接

### 6️⃣ 路由注册检查

后端应该已注册所有路由：

- ✅ `/api/v1/auth/*` - 认证路由
- ✅ `/api/v1/users/*` - 用户路由
- ✅ `/api/v1/messages/*` - 消息路由
- ✅ `/api/v1/activities/*` - 活动路由
- ✅ `/api/v1/discovery/*` - 发现路由
- ✅ `/api/v1/destinations/*` - 目的地路由
- ✅ `/api/v1/upload/*` - 文件上传路由

### 7️⃣ 具体接口测试

#### 获取对话列表 - `http://115.190.252.62/api/v1/messages/conversations`

```bash
# 首先注册并登录获取 token
TOKEN=$(curl -s http://115.190.252.62/api/v1/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# 测试获取对话列表
curl -v http://115.190.252.62/api/v1/messages/conversations \
  -H "Authorization: Bearer $TOKEN"

# 显示详细错误
curl http://115.190.252.62/api/v1/messages/conversations \
  -H "Authorization: Bearer $TOKEN" | jq .
```

**预期结果**：返回 200，包含对话列表数据

#### 获取用户详情 - `http://115.190.252.62/api/v1/users/user-007/detail`

```bash
curl -v http://115.190.252.62/api/v1/users/user-007/detail \
  -H "Authorization: Bearer $TOKEN"

# 显示 HTTP 状态码
curl -s -o /dev/null -w "%{http_code}" \
  http://115.190.252.62/api/v1/users/user-007/detail \
  -H "Authorization: Bearer $TOKEN"
```

**预期结果**：返回 200，用户详情数据

## 常见问题与解决方案

### ❌ 问题1: 返回 404 Not Found

**原因**：
1. 后端未启动或崩溃
2. 路由未正确注册
3. Nginx 配置未应用

**解决**：

```bash
# 1. 检查后端是否运行
pm2 list

# 2. 如果未运行，重启后端
cd /var/www/hikingSocialApp/backend
pm2 restart hiking-app-backend

# 3. 查看后端日志
pm2 logs hiking-app-backend

# 4. 重新加载 Nginx
sudo systemctl reload nginx
```

### ❌ 问题2: 返回 502 Bad Gateway

**原因**：
1. 后端端口 3000 未监听
2. 后端进程崩溃
3. Nginx 无法连接到后端

**解决**：

```bash
# 1. 确认后端在运行
pm2 logs hiking-app-backend

# 2. 检查后端监听的端口
netstat -tlnp | grep 3000

# 3. 直接测试后端
curl http://localhost:3000/health

# 4. 查看 Nginx 错误日志
sudo tail -f /var/log/nginx/error.log
```

### ❌ 问题3: 401 Unauthorized

**原因**：
1. 未提供 token
2. token 过期
3. token 格式错误

**解决**：

```bash
# 1. 确认已登录获得 token
TOKEN=$(curl -s http://115.190.252.62/api/v1/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}' | jq -r '.data.token')

# 2. 验证 token 格式
echo "Token: $TOKEN"

# 3. 使用正确的 Authorization header
curl http://115.190.252.62/api/v1/users/profile \
  -H "Authorization: Bearer $TOKEN"
```

## 完整测试脚本

创建文件 `/tmp/test-apis.sh`：

```bash
#!/bin/bash

BASE_URL="http://115.190.252.62"
TIMEOUT="--connect-timeout 5 --max-time 10"

echo "🔍 开始 API 接口测试..."
echo "========================================"

# 1. 测试后端健康检查
echo "1️⃣ 测试健康检查..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $TIMEOUT "$BASE_URL/health")
echo "   POST $BASE_URL/health -> HTTP $HTTP_CODE"

# 2. 测试登录
echo ""
echo "2️⃣ 测试登录..."
LOGIN_RESPONSE=$(curl -s $TIMEOUT -X POST "$BASE_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}')
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
if [ -n "$TOKEN" ]; then
  echo "   ✅ 获得 token: ${TOKEN:0:20}..."
else
  echo "   ❌ 登录失败"
  echo "$LOGIN_RESPONSE"
fi

# 3. 测试关键 API
echo ""
echo "3️⃣ 测试关键 API..."
ENDPOINTS=(
  "/api/v1/messages/conversations"
  "/api/v1/users/profile"
  "/api/v1/activities"
)

for endpoint in "${ENDPOINTS[@]}"; do
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $TIMEOUT \
    "$BASE_URL$endpoint" \
    -H "Authorization: Bearer $TOKEN")

  if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ GET $endpoint -> HTTP $HTTP_CODE"
  else
    echo "   ❌ GET $endpoint -> HTTP $HTTP_CODE"
  fi
done

echo ""
echo "========================================"
echo "✅ 测试完成"
```

运行测试：

```bash
chmod +x /tmp/test-apis.sh
/tmp/test-apis.sh
```

## 应急响应步骤

如果所有接口都返回 404：

1. **立即检查后端**：
   ```bash
   ssh root@115.190.252.62
   pm2 list
   pm2 logs hiking-app-backend
   ```

2. **如果后端未运行，重启**：
   ```bash
   cd /var/www/hikingSocialApp/backend
   npm ci
   npm run build
   pm2 restart hiking-app-backend
   ```

3. **重启 Nginx**：
   ```bash
   sudo systemctl restart nginx
   ```

4. **查看完整错误**：
   ```bash
   pm2 logs hiking-app-backend --lines 100
   sudo tail -f /var/log/nginx/error.log
   ```

## 监控命令

持续监控（每10秒刷新一次）：

```bash
# 监控后端进程
watch -n 10 'pm2 list; echo "---"; netstat -tlnp | grep 3000'

# 实时查看日志
pm2 logs hiking-app-backend --watch

# 查看 Nginx 请求
sudo tail -f /var/log/nginx/access.log | grep "GET /api"
```

## 验收标准

✅ 所有以下接口应返回 200 或对应的成功状态：

- `GET /health` → 200
- `POST /api/v1/auth/login` → 200
- `GET /api/v1/messages/conversations` → 200（需要 token）
- `GET /api/v1/users/user-007/detail` → 200（需要 token）
- `GET /api/v1/users/profile` → 200（需要 token）
- `GET /api/v1/activities` → 200（需要 token）

如果有任何接口返回 404 或 502，请按照上面的诊断步骤排查。
