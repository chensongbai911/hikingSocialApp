# 生产环境 API 404 问题 - 快速诊断和修复

## 📋 问题描述

生产环境 (http://115.190.252.62) 的以下 5 个接口返回 404：

```
1. GET /api/v1/messages/unread-count
2. GET /api/v1/messages/conversations?page=1&limit=20
3. GET /api/v1/users/user-009/follow-status
4. GET /api/v1/users/user-010/detail
5. GET /api/v1/messages/conversations?page=1&limit=20
```

## ✅ 已验证

- ✅ **后端代码**：所有 5 个接口都在后端代码中正确定义
- ✅ **本地测试**：localhost:3000 上所有接口都正常工作
- ✅ **Nginx 配置**：Nginx 配置文件 (`nginx/hiking-app-single-server.conf`) 配置正确
- ✅ **部署脚本**：GitHub Actions 部署脚本已更新

## 🔍 根本原因

**Nginx 配置可能未正确部署到生产环境**

生产环境需要以下条件同时满足：

1. ✅ 后端服务在 localhost:3000 运行
2. ❓ Nginx 配置正确配置了 `/api/v1/` 的代理
3. ❓ Nginx 已重启以加载新配置

## 🚀 快速修复（选择一个）

### 方案 A：一键修复脚本（推荐）

在生产服务器上执行：

```bash
cd /var/www/hikingSocialApp
bash fix-nginx-deployment.sh
```

这个脚本会：
1. 诊断问题
2. 备份现有 Nginx 配置
3. 部署新的 Nginx 配置
4. 验证所有接口
5. 显示修复结果

### 方案 B：手动修复

**步骤 1：检查后端服务**

```bash
# 检查后端是否运行
pm2 list

# 如果未运行，启动它
cd /var/www/hikingSocialApp/backend
pm2 start ecosystem.config.cjs --env production
```

**步骤 2：部署 Nginx 配置**

```bash
# 备份现有配置
sudo cp /etc/nginx/sites-available/default \
  /etc/nginx/sites-available/default.backup

# 复制新配置
sudo cp /var/www/hikingSocialApp/nginx/hiking-app-single-server.conf \
  /etc/nginx/sites-available/default

# 验证配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

**步骤 3：验证**

```bash
# 测试代理
curl http://115.190.252.62/api/v1/messages/unread-count \
  -H "Authorization: Bearer <your-token>"
```

## 📋 验证检查清单

执行修复后，按以下顺序验证：

```bash
# 1. 检查后端运行状态
pm2 list
# 预期：hiking-app-backend 显示 "online"

# 2. 检查 Nginx 配置有效性
sudo nginx -t
# 预期：显示 "successful"

# 3. 检查 Nginx 运行状态
sudo systemctl status nginx
# 预期：显示 "active (running)"

# 4. 测试后端直接访问
curl http://localhost:3000/health
# 预期：返回 JSON

# 5. 测试 Nginx 代理
curl http://115.190.252.62/health
# 预期：返回 JSON

# 6. 测试 API 接口（带 token）
curl http://115.190.252.62/api/v1/messages/unread-count \
  -H "Authorization: Bearer <your-token>"
# 预期：返回 { "code": 0, "data": { "count": "..." } }
```

## 🔧 GitHub Actions 自动部署更新

已更新 `.github/workflows/deploy.yml`，现在会：

1. ✅ 在部署包中包含 Nginx 配置
2. ✅ 部署 Nginx 配置到生产环境
3. ✅ 验证 Nginx 配置有效性
4. ✅ 重启 Nginx 加载新配置
5. ✅ 进行全面的健康检查

## 📝 测试已验证的接口

### 本地环境测试结果 ✅

```bash
# 1. 未读消息计数
$ curl http://localhost:3000/api/v1/messages/unread-count \
  -H "Authorization: Bearer <token>"
Response:
{
  "code": 0,
  "message": "获取未读消息数成功",
  "data": { "count": "0" }
}

# 2. 对话列表
$ curl "http://localhost:3000/api/v1/messages/conversations?page=1&limit=20" \
  -H "Authorization: Bearer <token>"
Response:
{
  "code": 0,
  "message": "获取对话列表成功",
  "data": { "conversations": [...], "total": 1, "totalPages": 1 }
}

# 3. 用户关注状态
$ curl http://localhost:3000/api/v1/users/user-009/follow-status \
  -H "Authorization: Bearer <token>"
Response:
{
  "code": 200,
  "message": "获取关注状态成功",
  "data": { "is_following": false }
}

# 4. 用户详情
$ curl http://localhost:3000/api/v1/users/user-010/detail \
  -H "Authorization: Bearer <token>"
Response:
{
  "code": 200,
  "message": "获取用户详情成功",
  "data": { "id": "user-010", ... }
}
```

## 🆘 故障排除

### 症状 1：仍然返回 404

```bash
# 检查 Nginx 是否包含代理配置
sudo grep -A 5 "location /api/v1/" /etc/nginx/sites-available/default

# 应该看到：
# location /api/v1/ {
#     proxy_pass http://localhost:3000/api/v1/;
#     ...
# }

# 如果没有，重新执行修复步骤
```

### 症状 2：502 Bad Gateway

```bash
# 检查后端是否运行
pm2 list | grep hiking-app-backend

# 检查 3000 端口是否监听
sudo netstat -tlnp | grep 3000
# 或
ss -tlnp | grep 3000

# 如果没有运行，启动后端
cd /var/www/hikingSocialApp/backend
pm2 start ecosystem.config.cjs --env production
```

### 症状 3：Connection refused

```bash
# 查看 Nginx 错误日志
sudo tail -f /var/log/nginx/error.log

# 查看 Nginx 访问日志
sudo tail -f /var/log/nginx/access.log

# 常见原因：
# 1. 后端未运行
# 2. 防火墙阻止了本地连接
# 3. Nginx 配置中的 proxy_pass 指向错误的地址
```

## 📞 获取更多帮助

完整的诊断和修复指南请参考：[NGINX_DEPLOYMENT_GUIDE.md](NGINX_DEPLOYMENT_GUIDE.md)

## ✨ 改进清单

- [x] 创建自动化修复脚本 (`fix-nginx-deployment.sh`)
- [x] 更新 GitHub Actions 部署流程，自动部署 Nginx 配置
- [x] 增强部署脚本的健康检查
- [x] 添加 5 个关键接口的验证测试
- [x] 提供详细的故障排除指南
