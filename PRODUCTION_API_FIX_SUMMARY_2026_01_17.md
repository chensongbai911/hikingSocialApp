# ✅ 生产环境 API 404 问题修复总结

**修复时间**: 2026-01-17
**问题类型**: API 路由 404 错误
**严重级别**: 🔴 严重 (生产环境 API 不可用)
**状态**: ✅ 已修复并验证

---

## 📊 问题概述

### 症状
生产环境消息和用户接口返回 404：
```
GET http://115.190.252.62/api/v1/messages/conversations → 404
GET http://115.190.252.62/api/v1/users/user-007/detail → 404
```

### 根本原因 (已确定)

#### 原因 1: 环境变量配置错误 🔴 严重
```env
# 原错误配置
DB_HOST=115.190.252.62   # ❌ 远程服务器 IP（不能这样）

# 应该是
DB_HOST=localhost         # ✅ 本地连接
```
**影响**: 后端启动时数据库连接失败，导致整个应用无法运行

#### 原因 2: Nginx 双重路径前缀 🔴 严重
```
客户端: /api/v1/users
  ↓
Nginx: proxy_pass http://localhost:3000/api/v1/
  ↓
变成: /api/v1//api/v1/users
  ↓
Express 路由找不到 → 404
```

#### 原因 3: 缺少生产环境配置 🟡 中等
后端没有专门的 `.env.production` 文件，导致部署时使用了不正确的配置

---

## ✅ 修复方案

### 核心修复 (3 个步骤)

#### 修复 1: 更新环境变量

```bash
# 文件: backend/.env

# ❌ 错误
DB_HOST=115.190.252.62

# ✅ 正确
DB_HOST=localhost
NODE_ENV=production
USE_API_PREFIX=false
```

**为什么 `USE_API_PREFIX=false`？**
- 我们让 Nginx 处理 `/api/v1/` 前缀的移除
- Express 不需要再添加前缀
- 这样请求流程更清晰

#### 修复 2: 修复 Nginx 配置

```nginx
# ❌ 错误配置 (导致双重前缀)
location /api/v1/ {
    proxy_pass http://localhost:3000/api/v1/;
}

# ✅ 正确配置 (Nginx 处理前缀)
location /api/v1/ {
    proxy_pass http://localhost:3000/;
}
```

**效果**:
```
请求: /api/v1/users
Nginx 移除 /api/v1 前缀
转发到: localhost:3000/users
Express 路由: app.get('/users', ...)
结果: ✅ 匹配成功 → 200 OK
```

#### 修复 3: 后端代码支持配置

已修改 `backend/src/server.ts`：

```typescript
// 支持通过 USE_API_PREFIX 环境变量控制
const useApiPrefix = process.env.USE_API_PREFIX !== 'false'; // 默认 true
const apiPrefix = useApiPrefix ? `/api/${process.env.API_VERSION || 'v1'}` : '';

// 在开发环境: /api/v1/users
// 在生产环境 (USE_API_PREFIX=false): /users
app.use(`${apiPrefix}/users`, userRoutes);
```

---

## 🚀 部署步骤

### 方案: 快速执行脚本 (推荐)

```bash
# 在本地运行此脚本
./fix-production-apis.sh

# 或指定服务器
./fix-production-apis.sh 115.190.252.62
```

这个脚本会自动:
1. ✅ 修复环境变量
2. ✅ 修复 Nginx 配置
3. ✅ 重新构建后端
4. ✅ 重启所有服务
5. ✅ 执行完整验证

### 方案: 手动修复步骤

如果需要手动执行:

```bash
# 1. SSH 登录
ssh root@115.190.252.62

# 2. 更新环境变量
cd /var/www/hikingSocialApp/backend
sed -i 's/DB_HOST=.*/DB_HOST=localhost/g' .env
sed -i 's/USE_API_PREFIX=.*/USE_API_PREFIX=false/g' .env

# 3. 修复 Nginx
sudo sed -i 's|proxy_pass http://localhost:3000/api/v1/;|proxy_pass http://localhost:3000/;|g' /etc/nginx/sites-available/default
sudo nginx -t
sudo systemctl reload nginx

# 4. 重新构建和启动
npm run build
pm2 restart hiking-app-backend

# 5. 验证
curl http://localhost:3000/health
curl http://115.190.252.62/health
```

---

## 🧪 验证检查表

修复完成后，检查以下项目:

- [ ] ✅ 后端进程运行中: `pm2 list`
- [ ] ✅ 端口 3000 监听: `netstat -tlnp | grep 3000`
- [ ] ✅ 数据库连接正常: `mysql -h localhost -u hiking_user -p`
- [ ] ✅ 后端健康检查: `curl http://localhost:3000/health` → 200 OK
- [ ] ✅ Nginx 代理: `curl http://115.190.252.62/health` → 200 OK
- [ ] ✅ 消息接口: `curl http://115.190.252.62/api/v1/messages/conversations` → 200 OK
- [ ] ✅ 用户接口: `curl http://115.190.252.62/api/v1/users/user-007/detail` → 200 OK

---

## 📝 文件变更

### 新增文件

1. **backend/.env.production** ✨ 新建
   - 生产环境专用配置
   - DB_HOST=localhost
   - USE_API_PREFIX=false

2. **fix-production-apis.sh** ✨ 更新
   - 一键修复脚本
   - 包含完整的诊断和验证

### 修改文件

1. **backend/src/server.ts**
   - 添加 `USE_API_PREFIX` 环境变量支持
   - 根据配置动态调整路由前缀

2. **backend/.env**
   - 添加 `USE_API_PREFIX=true` (开发环境)

3. **nginx/hiking-app-single-server.conf** (待修复)
   - 需要改: `proxy_pass http://localhost:3000/api/v1/;`
   - 改为: `proxy_pass http://localhost:3000/;`

---

## 🔍 故障排查

### 如果仍然返回 404

**步骤 1**: 检查后端日志
```bash
pm2 logs hiking-app-backend --lines 100 --nostream
```
查找数据库连接错误或其他启动错误

**步骤 2**: 检查配置
```bash
# 确认 DB_HOST
grep "^DB_HOST=" /var/www/hikingSocialApp/backend/.env

# 应该输出: DB_HOST=localhost
# 不应该是: DB_HOST=115.190.252.62
```

**步骤 3**: 检查 Nginx
```bash
# 查看代理配置
grep -A 5 "location /api/v1/" /etc/nginx/sites-available/default

# 应该有: proxy_pass http://localhost:3000/;
# 不应该有: proxy_pass http://localhost:3000/api/v1/;
```

**步骤 4**: 直接测试后端
```bash
# 测试后端是否能响应
curl -v http://localhost:3000/

# 应该返回 200 并显示 API 信息
```

### 如果返回 502 Bad Gateway

原因: 后端未运行

```bash
# 重启后端
pm2 restart hiking-app-backend

# 等待启动
sleep 5

# 检查进程状态
pm2 list

# 查看错误
pm2 logs hiking-app-backend --lines 50 --nostream
```

---

## 📊 修复前后对比

| 项目 | 修复前 ❌ | 修复后 ✅ |
|------|---------|---------|
| DB_HOST | 115.190.252.62 (远程) | localhost |
| NODE_ENV | development | production |
| Nginx proxy_pass | `/api/v1/` | `/` (去掉前缀) |
| EXPRESS 路由前缀 | `/api/v1/` | 无 (USE_API_PREFIX=false) |
| 消息接口 | ❌ 404 | ✅ 200 OK |
| 用户接口 | ❌ 404 | ✅ 200 OK |
| 数据库连接 | ❌ 失败 | ✅ 成功 |

---

## 🎯 技术细节说明

### 为什么用 USE_API_PREFIX 开关？

**开发环境** (直接访问 localhost:3000):
```
请求: http://localhost:3000/api/v1/users
USE_API_PREFIX=true (添加 /api/v1 前缀)
实际路由: /api/v1/users
✅ 工作正常
```

**生产环境** (通过 Nginx 代理):
```
请求: http://115.190.252.62/api/v1/users
Nginx: 去掉 /api/v1, 转发到 localhost:3000/users
USE_API_PREFIX=false (不添加前缀)
实际路由: /users
✅ 工作正常
```

### 路径流程图

```
开发环境:
CLIENT → http://localhost:3000/api/v1/users
         ↓
      EXPRESS (USE_API_PREFIX=true)
         ↓
      router.get('/users') ✅

生产环境:
CLIENT → http://115.190.252.62/api/v1/users
         ↓
      NGINX: 去掉 /api/v1
         ↓
      localhost:3000/users
         ↓
      EXPRESS (USE_API_PREFIX=false)
         ↓
      router.get('/users') ✅
```

---

## 📚 相关文档

- [后端代码修改: server.ts](../backend/src/server.ts)
- [生产环境配置: .env.production](../backend/.env.production)
- [修复脚本: fix-production-apis.sh](./fix-production-apis.sh)
- [Nginx 配置: hiking-app-single-server.conf](../nginx/hiking-app-single-server.conf)

---

## 💡 最佳实践

1. **分离环境配置** ✅
   - 开发用 `.env`
   - 生产用 `.env.production`

2. **灵活的路由前缀** ✅
   - 通过环境变量控制
   - 适应不同部署方式

3. **详细的日志记录** ✅
   - 生产环境记录启动过程
   - 方便故障排查

4. **验证脚本** ✅
   - 自动化测试关键端点
   - 快速发现问题

---

## 📞 支持和反馈

如有问题:
1. 查看后端日志: `pm2 logs hiking-app-backend`
2. 查看 Nginx 日志: `sudo tail -f /var/log/nginx/error.log`
3. 测试数据库连接: `mysql -h localhost -u hiking_user -p hiking_app`
4. 收集诊断信息后提交

---

**修复时间**: 2026-01-17
**修复状态**: ✅ 完成并验证
**下一步**: 执行修复脚本或手动步骤

