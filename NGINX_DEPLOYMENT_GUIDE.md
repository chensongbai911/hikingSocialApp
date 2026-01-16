# Nginx 部署诊断和修复指南

## 问题描述
生产环境 (http://115.190.252.62) 的以下接口返回 404：
- /api/v1/messages/unread-count
- /api/v1/messages/conversations?page=1&limit=20
- /api/v1/users/user-009/follow-status
- /api/v1/users/user-010/detail
- /api/v1/messages/conversations?page=1&limit=20

**但是**，这些接口在本地测试 (localhost:3000) 都正常工作。

## 根本原因分析

### ✅ 已验证正常
- 后端路由定义：所有 5 个接口都在 `backend/src/routes/` 中正确定义
- 后端服务：本地 localhost:3000 能正确响应所有请求
- Nginx 配置文件：`nginx/hiking-app-single-server.conf` 配置正确

### ❌ 可能的问题
1. **Nginx 配置文件未部署**：生产服务器上 Nginx 使用的配置可能不是最新的
2. **Nginx 未重启**：部署后 Nginx 配置未被 reload/restart
3. **后端服务未运行**：生产环境的 Node.js 后端可能未启动
4. **错误的 Nginx 配置路径**：生产环境可能使用了其他位置的 Nginx 配置

## 快速诊断步骤（在生产服务器上执行）

```bash
# 1. 检查 Nginx 是否运行
sudo systemctl status nginx

# 2. 检查 Nginx 配置是否有效
sudo nginx -t

# 3. 查看 Nginx 当前使用的配置文件
sudo nginx -T | head -20

# 4. 检查后端服务是否运行
pm2 list

# 5. 检查 localhost:3000 是否响应（如果服务器有 curl）
curl -s http://localhost:3000/api/v1/messages/unread-count \
  -H "Authorization: Bearer <valid-token>"

# 6. 测试 Nginx 代理（本地测试）
curl -s http://115.190.252.62/api/v1/messages/unread-count \
  -H "Authorization: Bearer <valid-token>"
```

## 修复方案

### 方案 A：更新并部署 Nginx 配置

在生产服务器上执行：

```bash
# 1. 备份现有配置
sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup

# 2. 从本地上传最新的 Nginx 配置
scp nginx/hiking-app-single-server.conf user@115.190.252.62:/tmp/

# 3. 在服务器上（通过 SSH）
# 使用新配置替换现有配置
sudo cp /tmp/hiking-app-single-server.conf /etc/nginx/sites-available/default

# 4. 测试 Nginx 配置
sudo nginx -t

# 5. 重启 Nginx（正式部署）
sudo systemctl restart nginx

# 6. 验证状态
sudo systemctl status nginx
```

### 方案 B：更新部署脚本以自动部署 Nginx 配置

编辑 `.github/workflows/deploy.yml`，在"执行部署命令"步骤中添加：

```yaml
- name: Deploy Nginx Configuration
  uses: appleboy/ssh-action@master
  with:
    host: ${{ secrets.SERVER_HOST }}
    username: ${{ secrets.SERVER_USER }}
    key: ${{ secrets.SERVER_SSH_KEY }}
    port: 22
    script: |
      echo "🔧 更新 Nginx 配置..."

      # 从项目中复制 Nginx 配置
      NGINX_CONF="/etc/nginx/sites-available/default"
      NGINX_NEW="/var/www/hikingSocialApp/nginx/hiking-app-single-server.conf"

      # 备份现有配置
      sudo cp "$NGINX_CONF" "$NGINX_CONF.backup.$(date +%Y%m%d_%H%M%S)"

      # 复制新配置
      sudo cp "$NGINX_NEW" "$NGINX_CONF"

      # 验证配置
      echo "✓ 验证 Nginx 配置..."
      sudo nginx -t || (echo "❌ Nginx 配置错误"; exit 1)

      # 重启 Nginx
      echo "🔄 重启 Nginx..."
      sudo systemctl reload nginx || (echo "❌ Nginx 重启失败"; exit 1)

      echo "✅ Nginx 配置已更新"
```

### 方案 C：手动验证和修复

如果以上方案不可行，按以下步骤手动操作：

```bash
# 1. SSH 到服务器
ssh user@115.190.252.62

# 2. 检查后端是否运行
pm2 list

# 如果后端没有运行，重启：
cd /var/www/hikingSocialApp/backend
pm2 start ecosystem.config.cjs --env production

# 3. 验证后端响应
curl -s http://localhost:3000/health | jq .

# 4. 检查 Nginx 配置位置
sudo find / -name "nginx.conf" -o -name "default" -path "*/sites-available/*" 2>/dev/null

# 5. 查看当前 Nginx 配置的 API 部分
sudo cat /etc/nginx/sites-available/default | grep -A 20 "location /api/v1/"

# 6. 如果缺少 proxy_pass 或配置不对，编辑配置
sudo nano /etc/nginx/sites-available/default

# 添加以下内容（在 server 块中）：
# location /api/v1/ {
#     proxy_pass http://localhost:3000/api/v1/;
#     proxy_http_version 1.1;
#     proxy_set_header Host $host;
#     proxy_set_header X-Real-IP $remote_addr;
#     proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
#     proxy_set_header X-Forwarded-Proto $scheme;
#     proxy_read_timeout 60s;
# }

# 7. 验证并重启
sudo nginx -t
sudo systemctl restart nginx

# 8. 测试 API
curl -s http://115.190.252.62/api/v1/auth/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}' | jq .
```

## 验证检查清单

部署后，按以下顺序验证：

- [ ] 后端服务运行状态：`pm2 list` 显示 `hiking-app-backend` 为 online
- [ ] 本地后端响应：`curl http://localhost:3000/health` 返回 200
- [ ] Nginx 配置有效：`sudo nginx -t` 显示 "successful"
- [ ] Nginx 运行状态：`sudo systemctl status nginx` 显示 active
- [ ] 代理测试 1：`curl http://115.190.252.62/health` 返回 200
- [ ] 代理测试 2：`curl http://115.190.252.62/api/v1/auth/me` 返回用户信息
- [ ] 消息 API：`curl http://115.190.252.62/api/v1/messages/unread-count` 返回数据
- [ ] 用户 API：`curl http://115.190.252.62/api/v1/users/user-009/follow-status` 返回数据

## 常见错误排查

### 错误 1："API 端点不存在" (404)
- **原因**：Nginx 没有正确配置 proxy_pass，请求没有转发到后端
- **解决**：检查 `/etc/nginx/sites-available/default` 中是否有 `/api/v1/` location 块
- **验证**：`sudo nginx -T | grep -A 5 "location /api/v1/"`

### 错误 2："Connection refused"
- **原因**：后端服务未运行
- **解决**：`pm2 start ecosystem.config.cjs --env production`
- **验证**：`curl http://localhost:3000/health`

### 错误 3："Bad Gateway" (502)
- **原因**：Nginx 无法连接到后端，可能是防火墙或端口配置问题
- **解决**：检查后端是否在 3000 端口监听
- **验证**：`sudo netstat -tlnp | grep 3000` 或 `ss -tlnp | grep 3000`

### 错误 4："Request timeout"
- **原因**：proxy_read_timeout 设置过短或后端响应缓慢
- **解决**：在 Nginx 配置中增加超时时间
  ```nginx
  proxy_read_timeout 120s;
  proxy_connect_timeout 120s;
  proxy_send_timeout 120s;
  ```

## 自动化部署改进

为了避免此类问题，建议在 `.github/workflows/deploy.yml` 中添加以下自动化检查：

```yaml
- name: Pre-deployment check
  script: |
    echo "检查 Nginx 配置..."
    sudo nginx -t || exit 1

    echo "检查后端服务..."
    pm2 list || exit 1

    echo "检查端口 3000..."
    sudo netstat -tlnp | grep 3000 || echo "⚠️ 警告：3000 端口未监听"

- name: Post-deployment validation
  script: |
    sleep 5

    # 验证所有 5 个接口
    ENDPOINTS=(
      "/api/v1/messages/unread-count"
      "/api/v1/messages/conversations?page=1&limit=20"
      "/api/v1/users/user-009/follow-status"
      "/api/v1/users/user-010/detail"
    )

    for endpoint in "${ENDPOINTS[@]}"; do
      echo "验证 $endpoint..."
      if curl -s -f "http://115.190.252.62$endpoint" \
        -H "Authorization: Bearer $TEST_TOKEN" > /dev/null; then
        echo "✅ $endpoint OK"
      else
        echo "❌ $endpoint FAILED"
        exit 1
      fi
    done
```

## 总结

|  | 本地 (localhost) | 生产 (115.190.252.62) |
|---|---|---|
| 后端服务 | ✅ 正常 | ❓ 需验证 |
| API 路由 | ✅ 正常 | ❓ 需验证 |
| Nginx 配置文件 | ✅ 存在 | ❓ 可能未部署 |
| Nginx 代理 | N/A | ❓ 可能未配置 |

**建议立即执行方案 C（手动验证）** 确认生产环境的实际状态，然后根据结果应用方案 A 或 B。
