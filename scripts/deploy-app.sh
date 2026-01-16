#!/bin/bash

# 徒步社交 App - 应用部署脚本
# 用于首次部署

set -e

echo "=================================="
echo "徒步社交 App - 应用部署"
echo "=================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 项目目录
PROJECT_DIR="/var/www/hikingSocialApp"

# 检查项目目录
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}错误: 项目目录不存在 ${PROJECT_DIR}${NC}"
    echo "请先克隆项目代码："
    echo "  cd /var/www"
    echo "  git clone https://github.com/chensongbai911/hikingSocialApp.git"
    exit 1
fi

cd $PROJECT_DIR

echo -e "${GREEN}步骤 1/6: 检查环境变量文件...${NC}"

# 检查后端环境变量
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}后端 .env 文件不存在，正在创建...${NC}"
    cp backend/.env.example backend/.env
    echo -e "${RED}请编辑 backend/.env 文件，配置数据库和其他环境变量！${NC}"
    echo "  nano backend/.env"
    read -p "配置完成后按回车继续..."
fi

# 检查前端环境变量
if [ ! -f "frontend/.env.production" ]; then
    echo -e "${YELLOW}前端 .env.production 文件不存在，正在创建...${NC}"
    if [ -f "frontend/.env.example" ]; then
        cp frontend/.env.example frontend/.env.production
    else
        cat > frontend/.env.production <<EOF
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_AMAP_KEY=your_amap_key
VITE_WS_URL=ws://localhost:3000
EOF
    fi
    echo -e "${RED}请编辑 frontend/.env.production 文件，配置 API 地址！${NC}"
    echo "  nano frontend/.env.production"
    read -p "配置完成后按回车继续..."
fi

echo -e "${GREEN}步骤 2/6: 安装后端依赖...${NC}"
cd backend
npm install --production

echo -e "${GREEN}步骤 3/6: 构建后端...${NC}"
npm run build

echo -e "${GREEN}步骤 4/6: 启动后端服务...${NC}"
pm2 delete hiking-api 2>/dev/null || true
pm2 start dist/server.js --name hiking-api
pm2 save

echo -e "${GREEN}步骤 5/6: 安装前端依赖...${NC}"
cd ../frontend
npm install

echo -e "${GREEN}步骤 6/6: 构建前端...${NC}"
npm run build

echo ""
echo "=================================="
echo -e "${GREEN}✅ 应用部署完成！${NC}"
echo "=================================="
echo ""
echo "服务状态："
pm2 list
echo ""
echo "后端 API: http://your-server-ip:3000"
echo "前端文件: $PROJECT_DIR/frontend/dist"
echo ""
echo "下一步："
echo "1. 配置 Nginx (参考 DEPLOYMENT_GUIDE.md)"
echo "2. 配置域名和 SSL 证书"
echo "3. 访问网站测试"
echo ""
