# Nginx 配置部署指南

## 问题分析

当前线上环境访问 `http://115.190.252.62/api/v1/users/...` 返回404，是因为：
1. Nginx 没有正确配置 API 反向代理
2. 或者 Nginx 配置文件没有生效

## 解决方案

### 步骤1：部署新的 Nginx 配置

SSH 连接到服务器后执行：

```bash
# 1. 备份旧配置（如果存在）
sudo cp /etc/nginx/sites-available/hiking-app /etc/nginx/sites-available/hiking-app.backup || true

# 2. 从项目复制新配置
sudo cp /var/www/hikingSocialApp/nginx/hiking-app-single-server.conf /etc/nginx/sites-available/hiking-app

# 3. 创建软链接（如果不存在）
sudo ln -sf /etc/nginx/sites-available/hiking-app /etc/nginx/sites-enabled/hiking-app

# 4. 删除默认配置（避免冲突）
sudo rm -f /etc/nginx/sites-enabled/default

# 5. 测试配置
sudo nginx -t

# 6. 重启 Nginx
sudo systemctl reload nginx

# 7. 检查 Nginx 状态
sudo systemctl status nginx
```

### 步骤2：验证配置

```bash
# 测试 API 是否可访问
curl http://115.190.252.62/api/v1/health

# 测试具体接口
curl http://115.190.252.62/api/v1/users/user-006/follow-status

# 查看 Nginx 错误日志
sudo tail -f /var/log/nginx/error.log

# 查看 Nginx 访问日志
sudo tail -f /var/log/nginx/access.log
```

### 步骤3：如果还有问题

检查后端服务是否运行：

```bash
# 检查 PM2 状态
pm2 status

# 检查后端日志
pm2 logs hiking-app-backend

# 重启后端服务
pm2 restart hiking-app-backend

# 测试后端直接访问（绕过 Nginx）
curl http://localhost:3000/api/v1/health
```

## 配置说明

新的 `hiking-app-single-server.conf` 配置特点：

1. **单服务器部署** - 前后端在同一台服务器
2. **API 反向代理** - `/api/v1/` 转发到 `localhost:3000`
3. **静态文件服务** - 前端 dist 目录
4. **文件上传支持** - `/uploads/` 目录映射
5. **SPA 路由支持** - 所有路径最终回到 index.html
6. **Gzip 压缩** - 提升传输速度
7. **安全头** - 基础安全配置

## 常见问题

### 404 错误
- 检查 proxy_pass 地址是否正确
- 确认后端服务在 3000 端口运行
- 查看 Nginx 错误日志

### 502 Bad Gateway
- 后端服务未启动
- 端口号配置错误
- 检查防火墙设置

### 静态文件无法加载
- 检查 root 路径是否正确
- 确认文件权限：`chmod -R 755 /var/www/hikingSocialApp/frontend/dist`
- 检查文件所有者：`chown -R www-data:www-data /var/www/hikingSocialApp`

### CORS 跨域问题
- 检查后端是否已配置 CORS
- Nginx 配置中已添加 CORS 头（作为备用）

## 自动化部署

在 `.github/workflows/deploy.yml` 中添加 Nginx 重新加载：

```yaml
- name: 重启 Nginx
  run: |
    sudo cp /var/www/hikingSocialApp/nginx/hiking-app-single-server.conf /etc/nginx/sites-available/hiking-app
    sudo nginx -t && sudo systemctl reload nginx
```
