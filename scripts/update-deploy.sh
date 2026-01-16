#!/bin/bash

# 徒步社交 App - 快速更新部署脚本
# 用于代码更新后的快速部署

set -e

echo "=================================="
echo "更新部署中..."
echo "=================================="
echo ""

GREEN='\033[0;32m'
NC='\033[0m'

PROJECT_DIR="/var/www/hikingSocialApp"

cd $PROJECT_DIR

echo -e "${GREEN}1. 拉取最新代码...${NC}"
git pull origin master

echo -e "${GREEN}2. 更新后端...${NC}"
cd backend
npm install --production
npm run build
pm2 restart hiking-api

echo -e "${GREEN}3. 更新前端...${NC}"
cd ../frontend
npm install
npm run build

echo ""
echo -e "${GREEN}✅ 更新部署完成！${NC}"
echo ""
pm2 list
