# 云服务器部署 - 快速开始

## 🚀 5 步完成部署

### 前提条件

- 一台云服务器（Ubuntu 20.04+）
- 服务器 IP 地址和 SSH 登录信息
- （可选）已购买的域名

---

## 第一步：连接服务器

```bash
# 使用 SSH 连接服务器
ssh root@your-server-ip

# 如果使用密钥
ssh -i /path/to/key.pem root@your-server-ip
```

## 第二步：安装环境

```bash
# 下载安装脚本
wget https://raw.githubusercontent.com/chensongbai911/hikingSocialApp/master/scripts/install-server.sh

# 或使用 curl
curl -O https://raw.githubusercontent.com/chensongbai911/hikingSocialApp/master/scripts/install-server.sh

# 运行安装脚本
sudo bash install-server.sh
```

安装内容：

- ✅ Node.js 20.x
- ✅ MySQL 8.0
- ✅ Nginx
- ✅ PM2
- ✅ Certbot (SSL 证书)

## 第三步：初始化数据库

```bash
# 克隆项目代码
cd /var/www
sudo git clone https://github.com/chensongbai911/hikingSocialApp.git
cd hikingSocialApp

# 运行数据库初始化脚本
sudo bash scripts/init-database.sh
```

按提示输入：

- MySQL root 密码
- 数据库名称（默认：hiking_app）
- 数据库用户名（默认：hiking_user）
- 数据库密码（自定义）

**⚠️ 重要：记住这些信息，下一步会用到！**

## 第四步：配置环境变量

### 4.1 配置后端

```bash
cd /var/www/hikingSocialApp/backend
cp .env.example .env
nano .env
```

修改以下内容：

```env
# 生产环境
NODE_ENV=production
PORT=3000

# 数据库配置（使用第三步的信息）
DB_HOST=localhost
DB_PORT=3306
DB_USER=hiking_user
DB_PASSWORD=你的数据库密码
DB_NAME=hiking_app

# JWT 密钥（重要：修改为随机字符串）
JWT_SECRET=your-random-secret-key-change-this
JWT_EXPIRES_IN=7d

# CORS（如果有域名，替换为你的域名）
CORS_ORIGIN=https://yourdomain.com
```

按 `Ctrl+O` 保存，`Ctrl+X` 退出。

### 4.2 配置前端

```bash
cd /var/www/hikingSocialApp/frontend
nano .env.production
```

修改内容：

```env
# API 地址（替换为你的服务器 IP 或域名）
VITE_API_BASE_URL=http://your-server-ip:3000/api/v1

# 高德地图 Key（可选）
VITE_AMAP_KEY=your_amap_key

# WebSocket 地址
VITE_WS_URL=ws://your-server-ip:3000
```

如果有域名：

```env
VITE_API_BASE_URL=https://api.yourdomain.com/api/v1
VITE_WS_URL=wss://api.yourdomain.com
```

## 第五步：部署应用

```bash
# 运行部署脚本
cd /var/www/hikingSocialApp
sudo bash scripts/deploy-app.sh
```

部署脚本会自动：

1. 安装依赖
2. 构建后端
3. 启动后端服务（PM2）
4. 构建前端

---

## ✅ 验证部署

### 测试后端 API

```bash
# 检查后端服务状态
pm2 list

# 测试 API
curl http://localhost:3000/api/v1/health
# 应该返回: {"status":"ok"}
```

### 测试前端（如果没有域名）

```bash
# 临时启动前端服务器测试
cd /var/www/hikingSocialApp/frontend/dist
python3 -m http.server 8080

# 浏览器访问: http://your-server-ip:8080
```

---

## 🌐 配置域名和 Nginx（可选但推荐）

### 如果你有域名

#### 1. 添加 DNS 解析

在域名服务商管理后台添加 A 记录：

- `@` → 你的服务器 IP（主域名）
- `www` → 你的服务器 IP
- `api` → 你的服务器 IP

#### 2. 配置 Nginx

```bash
# 复制 Nginx 配置
sudo cp /var/www/hikingSocialApp/nginx/hiking-app.conf /etc/nginx/sites-available/

# 编辑配置，替换域名
sudo nano /etc/nginx/sites-available/hiking-app.conf
# 将 yourdomain.com 替换为你的实际域名

# 启用配置
sudo ln -s /etc/nginx/sites-available/hiking-app.conf /etc/nginx/sites-enabled/

# 删除默认配置
sudo rm /etc/nginx/sites-enabled/default

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

#### 3. 申请 SSL 证书

```bash
# 安装 SSL 证书（自动配置 HTTPS）
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com

# 按提示输入邮箱，同意条款
```

#### 4. 更新前端环境变量

```bash
nano /var/www/hikingSocialApp/frontend/.env.production
```

修改为：

```env
VITE_API_BASE_URL=https://api.yourdomain.com/api/v1
VITE_WS_URL=wss://api.yourdomain.com
```

重新构建前端：

```bash
cd /var/www/hikingSocialApp/frontend
npm run build
```

#### 5. 访问网站

- 前端: https://yourdomain.com
- API: https://api.yourdomain.com/api/v1/health

---

## 📦 如果没有域名

使用 IP 地址访问：

```bash
# 1. 直接通过端口访问后端
后端 API: http://your-server-ip:3000/api/v1

# 2. 配置简单的 Nginx 代理
sudo nano /etc/nginx/sites-available/default
```

简单配置：

```nginx
server {
    listen 80 default_server;
    server_name _;

    # 前端
    location / {
        root /var/www/hikingSocialApp/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # 后端 API
    location /api/v1/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
sudo nginx -t
sudo systemctl restart nginx
```

访问：

- 前端: http://your-server-ip
- API: http://your-server-ip/api/v1/health

---

## 🔧 常用命令

### 查看服务状态

```bash
# 查看所有服务
pm2 list

# 查看后端日志
pm2 logs hiking-api

# 查看 Nginx 状态
sudo systemctl status nginx

# 查看 MySQL 状态
sudo systemctl status mysql
```

### 重启服务

```bash
# 重启后端
pm2 restart hiking-api

# 重启 Nginx
sudo systemctl restart nginx

# 重启 MySQL
sudo systemctl restart mysql
```

### 更新应用

```bash
cd /var/www/hikingSocialApp
sudo bash scripts/update-deploy.sh
```

### 健康检查

```bash
cd /var/www/hikingSocialApp
sudo bash scripts/health-check.sh
```

---

## 🆘 常见问题

### 问题 1: 无法连接数据库

```bash
# 检查 MySQL 状态
sudo systemctl status mysql

# 查看数据库用户
mysql -u root -p
SHOW GRANTS FOR 'hiking_user'@'localhost';
```

### 问题 2: 端口被占用

```bash
# 查看端口占用
sudo netstat -tlnp | grep :3000
sudo netstat -tlnp | grep :80

# 停止占用进程
sudo kill -9 <PID>
```

### 问题 3: 前端显示空白

```bash
# 检查构建文件
ls -la /var/www/hikingSocialApp/frontend/dist

# 查看 Nginx 错误日志
sudo tail -f /var/log/nginx/error.log

# 检查 API 地址配置
cat /var/www/hikingSocialApp/frontend/.env.production
```

### 问题 4: API 返回 500 错误

```bash
# 查看后端日志
pm2 logs hiking-api

# 检查环境变量
cat /var/www/hikingSocialApp/backend/.env
```

---

## 📚 更多文档

- [完整部署指南](./DEPLOYMENT_GUIDE.md) - 详细的部署步骤
- [API 文档](./backend/docs/API_STANDARDS.md) - API 接口说明
- [故障排查](./DEPLOYMENT_GUIDE.md#八故障排查) - 常见问题解决

---

## 🎉 完成！

恭喜你完成了部署！现在可以：

1. 访问网站注册账号
2. 创建徒步活动
3. 邀请朋友加入

如有问题，请查看详细文档或提交 Issue。

**祝使用愉快！🚀**
