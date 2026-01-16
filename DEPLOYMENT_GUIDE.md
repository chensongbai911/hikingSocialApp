# 徒步社交 App 云服务器部署指南

## 一、服务器环境要求

### 最低配置

- CPU: 2 核
- 内存: 4GB
- 存储: 40GB
- 操作系统: Ubuntu 20.04 LTS / CentOS 7+
- 带宽: 3Mbps+

### 推荐配置

- CPU: 4 核
- 内存: 8GB
- 存储: 80GB
- 操作系统: Ubuntu 22.04 LTS
- 带宽: 5Mbps+

## 二、需要安装的软件

1. **Node.js 20.x** - 运行前端和后端
2. **MySQL 8.0** - 数据库
3. **Nginx** - Web 服务器和反向代理
4. **PM2** - Node.js 进程管理
5. **Git** - 代码拉取

## 三、部署步骤

### 3.1 连接服务器

```bash
# 使用 SSH 连接（替换为你的服务器 IP）
ssh root@your-server-ip

# 或使用密钥
ssh -i /path/to/your-key.pem root@your-server-ip
```

### 3.2 安装基础软件

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装基础工具
sudo apt install -y curl wget git vim ufw

# 配置防火墙
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw allow 3000  # 后端API（临时，后面通过 Nginx 代理）
sudo ufw enable
```

### 3.3 安装 Node.js 20.x

```bash
# 添加 NodeSource 仓库
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# 安装 Node.js
sudo apt install -y nodejs

# 验证安装
node --version  # 应该显示 v20.x.x
npm --version
```

### 3.4 安装 MySQL 8.0

```bash
# 安装 MySQL
sudo apt install -y mysql-server

# 启动 MySQL 服务
sudo systemctl start mysql
sudo systemctl enable mysql

# 安全配置
sudo mysql_secure_installation
# 按提示设置 root 密码（建议使用强密码）
# 其他选项建议都选 Y

# 登录 MySQL
sudo mysql -u root -p

# 创建数据库和用户
CREATE DATABASE hiking_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'hiking_user'@'localhost' IDENTIFIED BY 'your_strong_password';
GRANT ALL PRIVILEGES ON hiking_app.* TO 'hiking_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3.5 安装 PM2

```bash
# 全局安装 PM2
sudo npm install -g pm2

# 设置 PM2 开机自启
pm2 startup
# 按照提示执行命令
```

### 3.6 安装 Nginx

```bash
# 安装 Nginx
sudo apt install -y nginx

# 启动 Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# 验证安装
sudo systemctl status nginx
```

### 3.7 克隆项目代码

```bash
# 创建项目目录
sudo mkdir -p /var/www
cd /var/www

# 克隆代码
sudo git clone https://github.com/chensongbai911/hikingSocialApp.git
cd hikingSocialApp

# 设置权限
sudo chown -R $USER:$USER /var/www/hikingSocialApp
```

### 3.8 配置后端

```bash
cd /var/www/hikingSocialApp/backend

# 安装依赖
npm install

# 创建环境变量文件
cp .env.example .env

# 编辑环境变量（重要！）
nano .env
```

**后端 .env 配置示例**:

```env
# 服务器配置
NODE_ENV=production
PORT=3000

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=hiking_user
DB_PASSWORD=your_strong_password
DB_NAME=hiking_app

# JWT 配置（请更改为随机字符串）
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS 配置（替换为你的域名）
CORS_ORIGIN=https://yourdomain.com

# 日志配置
LOG_LEVEL=info
```

```bash
# 初始化数据库
mysql -u hiking_user -p hiking_app < src/database/init.sql

# 构建项目
npm run build

# 使用 PM2 启动后端
pm2 start dist/server.js --name hiking-api
pm2 save
```

### 3.9 配置前端

```bash
cd /var/www/hikingSocialApp/frontend

# 安装依赖
npm install

# 创建环境变量文件
cp .env.example .env.production

# 编辑生产环境变量
nano .env.production
```

**前端 .env.production 配置**:

```env
# API 地址（使用你的域名或服务器 IP）
VITE_API_BASE_URL=https://api.yourdomain.com/api/v1

# 高德地图 Key
VITE_AMAP_KEY=your_amap_key

# WebSocket 地址
VITE_WS_URL=wss://api.yourdomain.com
```

```bash
# 构建前端
npm run build

# 前端构建产物在 dist/ 目录
```

### 3.10 配置 Nginx

创建 Nginx 配置文件：

```bash
sudo nano /etc/nginx/sites-available/hiking-app
```

**Nginx 配置内容**:

```nginx
# 后端 API 服务器配置
server {
    listen 80;
    server_name api.yourdomain.com;  # 替换为你的 API 域名

    # 请求体大小限制（支持大文件上传）
    client_max_body_size 10M;

    # API 反向代理
    location /api/v1/ {
        proxy_pass http://localhost:3000;
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
    }

    # WebSocket 支持
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

# 前端静态文件服务器配置
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;  # 替换为你的域名

    root /var/www/hikingSocialApp/frontend/dist;
    index index.html;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    # 前端路由处理
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

```bash
# 启用配置
sudo ln -s /etc/nginx/sites-available/hiking-app /etc/nginx/sites-enabled/

# 删除默认配置（可选）
sudo rm /etc/nginx/sites-enabled/default

# 测试 Nginx 配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

### 3.11 配置 HTTPS (使用 Let's Encrypt)

```bash
# 安装 Certbot
sudo apt install -y certbot python3-certbot-nginx

# 为你的域名申请 SSL 证书
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com

# 测试自动续期
sudo certbot renew --dry-run
```

## 四、域名配置

### 4.1 添加 DNS 记录

在你的域名服务商管理后台添加以下记录：

| 类型 | 主机记录 | 记录值        | 说明       |
| ---- | -------- | ------------- | ---------- |
| A    | @        | 你的服务器 IP | 主域名     |
| A    | www      | 你的服务器 IP | www 子域名 |
| A    | api      | 你的服务器 IP | API 子域名 |

### 4.2 等待 DNS 生效

DNS 解析通常需要 10 分钟到 24 小时生效。可以使用以下命令检查：

```bash
# 检查域名解析
nslookup yourdomain.com
nslookup api.yourdomain.com
```

## 五、监控和维护

### 5.1 PM2 常用命令

```bash
# 查看所有进程
pm2 list

# 查看日志
pm2 logs hiking-api

# 重启服务
pm2 restart hiking-api

# 停止服务
pm2 stop hiking-api

# 查看详细信息
pm2 show hiking-api

# 监控
pm2 monit
```

### 5.2 查看日志

```bash
# 后端日志
pm2 logs hiking-api

# Nginx 访问日志
sudo tail -f /var/log/nginx/access.log

# Nginx 错误日志
sudo tail -f /var/log/nginx/error.log

# MySQL 日志
sudo tail -f /var/log/mysql/error.log
```

### 5.3 备份数据库

创建备份脚本：

```bash
sudo nano /usr/local/bin/backup-db.sh
```

```bash
#!/bin/bash
# MySQL 备份脚本

BACKUP_DIR="/var/backups/mysql"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="hiking_app_${DATE}.sql"

mkdir -p $BACKUP_DIR

mysqldump -u hiking_user -p'your_password' hiking_app > $BACKUP_DIR/$FILENAME

# 压缩备份
gzip $BACKUP_DIR/$FILENAME

# 删除 7 天前的备份
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete

echo "Backup completed: ${FILENAME}.gz"
```

```bash
# 设置执行权限
sudo chmod +x /usr/local/bin/backup-db.sh

# 添加到定时任务（每天凌晨 2 点备份）
sudo crontab -e
# 添加这一行：
0 2 * * * /usr/local/bin/backup-db.sh >> /var/log/mysql-backup.log 2>&1
```

## 六、更新部署

### 6.1 更新代码

```bash
cd /var/www/hikingSocialApp

# 拉取最新代码
git pull origin master

# 更新后端
cd backend
npm install
npm run build
pm2 restart hiking-api

# 更新前端
cd ../frontend
npm install
npm run build
# Nginx 会自动使用新的构建文件
```

### 6.2 快速更新脚本

创建更新脚本：

```bash
nano /var/www/hikingSocialApp/deploy.sh
```

```bash
#!/bin/bash
# 快速部署脚本

echo "开始更新部署..."

cd /var/www/hikingSocialApp

# 拉取最新代码
echo "拉取代码..."
git pull origin master

# 更新后端
echo "更新后端..."
cd backend
npm install --production
npm run build
pm2 restart hiking-api

# 更新前端
echo "更新前端..."
cd ../frontend
npm install
npm run build

echo "部署完成！"
```

```bash
chmod +x /var/www/hikingSocialApp/deploy.sh
```

使用：

```bash
cd /var/www/hikingSocialApp
./deploy.sh
```

## 七、性能优化建议

### 7.1 MySQL 优化

编辑 MySQL 配置：

```bash
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
```

添加：

```ini
[mysqld]
# 连接数
max_connections = 200

# 缓存大小
innodb_buffer_pool_size = 1G
query_cache_size = 64M
query_cache_type = 1

# 日志配置
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 2
```

重启 MySQL：

```bash
sudo systemctl restart mysql
```

### 7.2 Node.js 优化

使用集群模式运行：

```bash
pm2 start dist/server.js --name hiking-api -i max
```

### 7.3 启用 Redis 缓存（可选）

```bash
# 安装 Redis
sudo apt install -y redis-server

# 启动 Redis
sudo systemctl start redis
sudo systemctl enable redis
```

## 八、故障排查

### 8.1 常见问题

**问题 1: 无法访问网站**

```bash
# 检查 Nginx 状态
sudo systemctl status nginx

# 检查端口占用
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :3000

# 检查防火墙
sudo ufw status
```

**问题 2: 后端 API 报错**

```bash
# 查看后端日志
pm2 logs hiking-api

# 检查数据库连接
mysql -u hiking_user -p hiking_app
```

**问题 3: 数据库连接失败**

```bash
# 检查 MySQL 状态
sudo systemctl status mysql

# 检查用户权限
mysql -u root -p
SHOW GRANTS FOR 'hiking_user'@'localhost';
```

## 九、安全加固

### 9.1 禁用 root SSH 登录

```bash
sudo nano /etc/ssh/sshd_config
```

修改：

```
PermitRootLogin no
PasswordAuthentication no  # 强制使用密钥
```

```bash
sudo systemctl restart sshd
```

### 9.2 配置 fail2ban

```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 9.3 定期更新系统

```bash
# 设置自动更新
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure unattended-upgrades
```

## 十、验证部署

访问以下地址验证：

1. **前端**: https://yourdomain.com
2. **API 健康检查**: https://api.yourdomain.com/api/v1/health
3. **注册/登录**: 测试用户注册和登录功能
4. **创建活动**: 测试创建和查看活动

## 十一、联系方式

如遇到问题，可以：

1. 查看项目 GitHub Issues
2. 检查服务器日志
3. 参考本文档故障排查章节

---

**祝部署顺利！🎉**
