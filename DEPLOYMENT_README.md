# 徒步社交 App - 云服务器部署

## 📦 部署文件说明

本项目包含完整的云服务器部署方案，可以快速将前端、后端、数据库部署到云服务器。

## 📂 部署文件结构

```
├── DEPLOYMENT_GUIDE.md        # 完整部署指南（详细步骤）
├── QUICK_DEPLOY.md            # 快速部署指南（5步完成）
├── SCRIPTS_GUIDE.md           # 脚本使用说明
├── scripts/                   # 自动化部署脚本
│   ├── install-server.sh      # 服务器环境安装
│   ├── init-database.sh       # 数据库初始化
│   ├── deploy-app.sh          # 应用部署
│   ├── update-deploy.sh       # 更新部署
│   ├── backup-database.sh     # 数据库备份
│   └── health-check.sh        # 健康检查
├── nginx/                     # Nginx 配置文件
│   └── hiking-app.conf        # 应用 Nginx 配置
└── .github/workflows/         # GitHub Actions（CI/CD）
    └── deploy.yml             # 自动部署配置
```

## 🚀 快速开始

### 前提条件

- 一台云服务器（Ubuntu 20.04+，2 核 4G 起）
- 服务器 IP 地址和 SSH 登录信息
- （可选）已购买的域名

### 一、连接服务器

```bash
ssh root@your-server-ip
```

### 二、安装环境

```bash
# 下载安装脚本
wget https://raw.githubusercontent.com/chensongbai911/hikingSocialApp/master/scripts/install-server.sh

# 运行安装
sudo bash install-server.sh
```

### 三、初始化数据库

```bash
# 克隆项目
cd /var/www
git clone https://github.com/chensongbai911/hikingSocialApp.git
cd hikingSocialApp

# 初始化数据库
bash scripts/init-database.sh
```

### 四、配置环境变量

```bash
# 后端配置
cd backend
cp .env.production.example .env
nano .env  # 修改数据库密码、JWT密钥等

# 前端配置
cd ../frontend
nano .env.production  # 修改 API 地址
```

### 五、部署应用

```bash
cd /var/www/hikingSocialApp
bash scripts/deploy-app.sh
```

## 🌐 域名配置（可选）

如果你有域名，可以配置 Nginx 和 SSL 证书：

```bash
# 1. 配置 DNS 解析（在域名服务商后台）
#    A记录: yourdomain.com → 服务器IP
#    A记录: api.yourdomain.com → 服务器IP

# 2. 配置 Nginx
sudo cp nginx/hiking-app.conf /etc/nginx/sites-available/
sudo nano /etc/nginx/sites-available/hiking-app.conf  # 修改域名
sudo ln -s /etc/nginx/sites-available/hiking-app.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 3. 申请 SSL 证书
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
```

## 📖 详细文档

- **[完整部署指南](./DEPLOYMENT_GUIDE.md)** - 包含所有细节和最佳实践
- **[快速部署指南](./QUICK_DEPLOY.md)** - 5 步完成部署
- **[脚本使用说明](./SCRIPTS_GUIDE.md)** - 自动化脚本详解

## 🔧 常用命令

### 查看服务状态

```bash
pm2 list                    # 查看所有进程
pm2 logs hiking-api         # 查看后端日志
sudo systemctl status nginx # 查看 Nginx 状态
sudo systemctl status mysql # 查看 MySQL 状态
```

### 更新应用

```bash
cd /var/www/hikingSocialApp
bash scripts/update-deploy.sh
```

### 健康检查

```bash
bash scripts/health-check.sh
```

### 数据库备份

```bash
bash scripts/backup-database.sh
```

## 📊 服务器配置要求

### 最低配置

- CPU: 2 核
- 内存: 4GB
- 存储: 40GB
- 带宽: 3Mbps+

### 推荐配置

- CPU: 4 核
- 内存: 8GB
- 存储: 80GB
- 带宽: 5Mbps+

## 🔒 安全建议

1. **修改默认密码** - 包括 MySQL root 密码、应用数据库密码
2. **使用 HTTPS** - 通过 Let's Encrypt 免费申请 SSL 证书
3. **配置防火墙** - 只开放必要的端口（22, 80, 443）
4. **定期备份** - 设置数据库自动备份
5. **及时更新** - 定期更新系统和依赖包

## 📈 性能优化

1. **启用 Gzip 压缩** - Nginx 配置已包含
2. **静态资源缓存** - 配置文件已优化
3. **使用 PM2 集群** - `pm2 start -i max`
4. **启用 Redis** - 可选，用于缓存
5. **CDN 加速** - 静态资源使用 CDN

## 🐛 故障排查

### 后端无法启动

```bash
pm2 logs hiking-api  # 查看日志
cat backend/.env     # 检查配置
```

### 数据库连接失败

```bash
sudo systemctl status mysql          # 检查 MySQL 状态
mysql -u hiking_user -p hiking_app   # 测试连接
```

### Nginx 报错

```bash
sudo nginx -t                         # 测试配置
sudo tail -f /var/log/nginx/error.log # 查看错误日志
```

### 前端显示空白

```bash
ls -la frontend/dist                  # 检查构建文件
cat frontend/.env.production          # 检查 API 地址
```

## 🌟 功能特性

部署后你将拥有：

- ✅ **完整的前端应用** - Vue 3 + TypeScript
- ✅ **RESTful API 后端** - Node.js + Express
- ✅ **MySQL 数据库** - 数据持久化
- ✅ **Nginx 反向代理** - 高性能 Web 服务器
- ✅ **PM2 进程管理** - 自动重启和负载均衡
- ✅ **HTTPS 支持** - Let's Encrypt 免费证书
- ✅ **自动化脚本** - 一键部署和更新
- ✅ **健康检查** - 监控服务状态

## 📞 获取帮助

如遇到问题：

1. 查看 [完整部署指南](./DEPLOYMENT_GUIDE.md) 的故障排查章节
2. 查看服务器日志定位问题
3. 在 GitHub 提交 Issue

## 📝 更新日志

查看 [CHANGELOG.md](./CHANGELOG.md) 了解版本更新。

## 📄 许可证

本项目采用 MIT 许可证。

---

**祝部署顺利！🎉**

如有问题欢迎提 Issue 或 PR。
