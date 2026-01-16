# 一键部署脚本使用说明

## 📋 准备工作清单

### 1. 服务器信息
- [ ] 服务器 IP 地址: `____________`
- [ ] SSH 登录用户: `____________`
- [ ] SSH 端口（默认 22）: `____________`

### 2. 域名信息（可选）
- [ ] 主域名: `____________`
- [ ] API 子域名: `api.____________`

### 3. 数据库信息
- [ ] MySQL root 密码: `____________`
- [ ] 应用数据库密码: `____________`

### 4. 应用配置
- [ ] JWT 密钥（随机字符串）: `____________`
- [ ] 高德地图 Key（可选）: `____________`

---

## 🚀 部署步骤

### 方式一：使用自动化脚本（推荐）

#### 步骤 1: 连接服务器

```bash
ssh root@your-server-ip
```

#### 步骤 2: 下载并运行一键安装脚本

```bash
# 下载脚本
wget -O setup.sh https://raw.githubusercontent.com/chensongbai911/hikingSocialApp/master/scripts/install-server.sh

# 添加执行权限
chmod +x setup.sh

# 运行安装
sudo ./setup.sh
```

#### 步骤 3: 初始化数据库

```bash
# 克隆项目
cd /var/www
git clone https://github.com/chensongbai911/hikingSocialApp.git
cd hikingSocialApp

# 初始化数据库
bash scripts/init-database.sh
```

按提示输入数据库信息。

#### 步骤 4: 配置环境变量

```bash
# 后端配置
cd backend
cp .env.production.example .env
nano .env
# 修改数据库密码、JWT密钥等

# 前端配置
cd ../frontend
nano .env.production
# 修改 API 地址
```

#### 步骤 5: 部署应用

```bash
cd /var/www/hikingSocialApp
bash scripts/deploy-app.sh
```

#### 步骤 6: 配置 Nginx（如果有域名）

```bash
# 复制配置文件
sudo cp nginx/hiking-app.conf /etc/nginx/sites-available/

# 编辑配置，替换域名
sudo nano /etc/nginx/sites-available/hiking-app.conf

# 启用配置
sudo ln -s /etc/nginx/sites-available/hiking-app.conf /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# 重启 Nginx
sudo nginx -t
sudo systemctl restart nginx

# 申请 SSL 证书
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
```

---

### 方式二：手动部署

详细步骤请参考 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

## 📊 脚本说明

### install-server.sh
**功能**: 安装服务器基础环境
- Node.js 20.x
- MySQL 8.0
- Nginx
- PM2
- Certbot

**使用**:
```bash
sudo bash scripts/install-server.sh
```

### init-database.sh
**功能**: 初始化 MySQL 数据库
- 创建数据库
- 创建用户和授权
- 导入表结构

**使用**:
```bash
bash scripts/init-database.sh
```

### deploy-app.sh
**功能**: 首次部署应用
- 安装依赖
- 构建前后端
- 启动服务

**使用**:
```bash
bash scripts/deploy-app.sh
```

### update-deploy.sh
**功能**: 更新部署（代码更新后）
- 拉取最新代码
- 重新构建
- 重启服务

**使用**:
```bash
bash scripts/update-deploy.sh
```

### backup-database.sh
**功能**: 备份数据库
- 导出 SQL
- 压缩文件
- 自动清理旧备份

**使用**:
```bash
# 先编辑脚本，填入数据库密码
nano scripts/backup-database.sh

# 运行备份
bash scripts/backup-database.sh

# 设置定时任务（每天凌晨2点）
crontab -e
# 添加: 0 2 * * * /var/www/hikingSocialApp/scripts/backup-database.sh
```

### health-check.sh
**功能**: 检查服务健康状态
- Nginx 状态
- MySQL 状态
- 后端服务状态
- 系统资源使用

**使用**:
```bash
bash scripts/health-check.sh
```

---

## 🔧 配置文件说明

### backend/.env
后端环境变量配置

**必须修改**:
- `DB_PASSWORD`: 数据库密码
- `JWT_SECRET`: JWT 密钥
- `CORS_ORIGIN`: 允许的前端域名

**可选修改**:
- `PORT`: 后端端口（默认 3000）
- `LOG_LEVEL`: 日志级别（默认 info）

### frontend/.env.production
前端生产环境配置

**必须修改**:
- `VITE_API_BASE_URL`: 后端 API 地址
- `VITE_WS_URL`: WebSocket 地址

**可选修改**:
- `VITE_AMAP_KEY`: 高德地图 Key

### nginx/hiking-app.conf
Nginx 配置文件

**必须修改**:
- `server_name`: 替换为你的域名
- `root`: 前端构建文件路径（默认正确）

---

## 📝 部署检查清单

### 环境检查
- [ ] Node.js 版本 >= 20.x
- [ ] MySQL 版本 >= 8.0
- [ ] Nginx 已安装
- [ ] PM2 已安装
- [ ] 防火墙已配置（开放 80, 443, 3000 端口）

### 数据库检查
- [ ] 数据库已创建
- [ ] 用户已创建并授权
- [ ] 表结构已导入
- [ ] 可以正常连接

### 应用检查
- [ ] 后端环境变量已配置
- [ ] 前端环境变量已配置
- [ ] 后端服务已启动（pm2 list）
- [ ] 前端已构建（dist 目录存在）

### 网络检查
- [ ] 后端 API 可访问（curl http://localhost:3000/api/v1/health）
- [ ] Nginx 配置正确（nginx -t）
- [ ] 域名解析正确（如果使用域名）
- [ ] SSL 证书已安装（如果使用 HTTPS）

### 功能检查
- [ ] 可以访问前端页面
- [ ] 可以注册新用户
- [ ] 可以登录
- [ ] 可以创建活动
- [ ] API 响应正常

---

## 🆘 常见问题

### Q1: 脚本执行权限不足
```bash
chmod +x scripts/*.sh
```

### Q2: MySQL 连接失败
检查：
1. MySQL 服务是否运行
2. 用户名密码是否正确
3. 用户是否有权限

```bash
# 检查 MySQL 状态
sudo systemctl status mysql

# 测试连接
mysql -u hiking_user -p hiking_app
```

### Q3: PM2 进程启动失败
```bash
# 查看详细错误
pm2 logs hiking-api

# 检查环境变量
cat backend/.env

# 手动启动测试
cd backend
node dist/server.js
```

### Q4: Nginx 配置错误
```bash
# 测试配置
sudo nginx -t

# 查看错误日志
sudo tail -f /var/log/nginx/error.log
```

### Q5: 前端显示空白
检查：
1. dist 目录是否存在
2. API 地址配置是否正确
3. 浏览器控制台错误

```bash
# 检查构建文件
ls -la frontend/dist

# 查看前端配置
cat frontend/.env.production
```

---

## 📚 相关文档

- [完整部署指南](./DEPLOYMENT_GUIDE.md)
- [快速开始](./QUICK_DEPLOY.md)
- [API 文档](./backend/docs/)

---

## 💡 提示

1. **安全建议**: 
   - 修改默认密码
   - 使用强密码
   - 定期备份数据库
   - 及时更新系统

2. **性能优化**:
   - 启用 Gzip 压缩
   - 配置静态文件缓存
   - 使用 CDN 加速
   - 考虑使用 Redis 缓存

3. **监控建议**:
   - 设置健康检查定时任务
   - 配置日志轮转
   - 监控磁盘空间
   - 监控内存使用

---

**祝部署顺利！🚀**
