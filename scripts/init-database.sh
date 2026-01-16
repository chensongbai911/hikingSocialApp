#!/bin/bash

# 徒步社交 App - 初始化数据库脚本

set -e

echo "=================================="
echo "初始化 MySQL 数据库"
echo "=================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 获取用户输入
read -p "请输入 MySQL root 密码: " -s MYSQL_ROOT_PASSWORD
echo ""

read -p "请输入数据库名称 [hiking_app]: " DB_NAME
DB_NAME=${DB_NAME:-hiking_app}

read -p "请输入数据库用户名 [hiking_user]: " DB_USER
DB_USER=${DB_USER:-hiking_user}

read -p "请输入数据库用户密码: " -s DB_PASSWORD
echo ""

if [ -z "$DB_PASSWORD" ]; then
    echo -e "${RED}错误: 数据库密码不能为空${NC}"
    exit 1
fi

echo -e "${GREEN}开始创建数据库...${NC}"

# 创建数据库和用户
mysql -u root -p"$MYSQL_ROOT_PASSWORD" <<EOF
-- 创建数据库
CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';

-- 授权
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;

-- 显示数据库
SHOW DATABASES;
EOF

echo -e "${GREEN}数据库创建成功！${NC}"
echo ""
echo "数据库配置信息："
echo "  数据库名: ${DB_NAME}"
echo "  用户名: ${DB_USER}"
echo "  密码: ******"
echo ""
echo "请将以下信息保存到 backend/.env 文件中："
echo ""
echo "DB_HOST=localhost"
echo "DB_PORT=3306"
echo "DB_USER=${DB_USER}"
echo "DB_PASSWORD=${DB_PASSWORD}"
echo "DB_NAME=${DB_NAME}"
echo ""

# 初始化数据库表
if [ -f "./backend/src/database/init.sql" ]; then
    read -p "是否立即导入数据库表结构? (y/n): " IMPORT_SQL
    if [ "$IMPORT_SQL" = "y" ] || [ "$IMPORT_SQL" = "Y" ]; then
        echo -e "${GREEN}导入数据库表...${NC}"
        mysql -u ${DB_USER} -p"${DB_PASSWORD}" ${DB_NAME} < ./backend/src/database/init.sql
        echo -e "${GREEN}表结构导入成功！${NC}"
    fi
fi

echo ""
echo -e "${GREEN}✅ 数据库初始化完成！${NC}"
