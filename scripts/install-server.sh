#!/bin/bash

# 徒步社交 App - 服务器环境安装脚本
# 适用于 Ubuntu 20.04/22.04

set -e  # 遇到错误立即退出

echo "=================================="
echo "徒步社交 App - 服务器环境安装"
echo "=================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}请使用 root 权限运行此脚本${NC}"
    echo "使用: sudo bash install-server.sh"
    exit 1
fi

echo -e "${GREEN}步骤 1/8: 更新系统...${NC}"
apt update && apt upgrade -y

echo -e "${GREEN}步骤 2/8: 安装基础工具...${NC}"
apt install -y curl wget git vim ufw build-essential

echo -e "${GREEN}步骤 3/8: 配置防火墙...${NC}"
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3000/tcp
echo "y" | ufw enable

echo -e "${GREEN}步骤 4/8: 安装 Node.js 20.x...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
echo "Node.js 版本: $(node --version)"
echo "npm 版本: $(npm --version)"

echo -e "${GREEN}步骤 5/8: 安装 MySQL 8.0...${NC}"
apt install -y mysql-server

# 启动 MySQL
systemctl start mysql
systemctl enable mysql

echo -e "${YELLOW}请记住你设置的 MySQL root 密码！${NC}"
mysql_secure_installation

echo -e "${GREEN}步骤 6/8: 安装 PM2...${NC}"
npm install -g pm2
pm2 startup systemd -u $SUDO_USER --hp /home/$SUDO_USER

echo -e "${GREEN}步骤 7/8: 安装 Nginx...${NC}"
apt install -y nginx
systemctl start nginx
systemctl enable nginx

echo -e "${GREEN}步骤 8/8: 安装 Certbot (SSL证书)...${NC}"
apt install -y certbot python3-certbot-nginx

echo ""
echo "=================================="
echo -e "${GREEN}✅ 环境安装完成！${NC}"
echo "=================================="
echo ""
echo "下一步操作："
echo "1. 创建 MySQL 数据库和用户"
echo "2. 克隆项目代码"
echo "3. 配置环境变量"
echo "4. 部署应用"
echo ""
echo "详细步骤请查看 DEPLOYMENT_GUIDE.md"
echo ""
