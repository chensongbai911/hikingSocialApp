#!/bin/bash

# Database fix and migration script
# Purpose: Apply all pending migrations and fix database schema

set -e

cd "$(dirname "$0")"

echo "🔄 开始数据库修复过程..."
echo ""

# 获取数据库连接信息
DB_HOST=${DB_HOST:-localhost}
DB_USER=${DB_USER:-root}
DB_PASSWORD=${DB_PASSWORD:-}
DB_NAME=${DB_NAME:-hiking_app}
DB_PORT=${DB_PORT:-3306}

echo "📋 使用数据库配置:"
echo "  主机: $DB_HOST"
echo "  用户: $DB_USER"
echo "  数据库: $DB_NAME"
echo "  端口: $DB_PORT"
echo ""

# 构建 mysql 命令
if [ -z "$DB_PASSWORD" ]; then
  MYSQL_CMD="mysql -h $DB_HOST -u $DB_USER -P $DB_PORT $DB_NAME"
else
  MYSQL_CMD="mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD -P $DB_PORT $DB_NAME"
fi

echo "✅ 执行迁移脚本..."
echo ""

# 执行所有 SQL 迁移文件
for sql_file in sql/patch_*.sql; do
  if [ -f "$sql_file" ]; then
    echo "▶️  执行: $sql_file"
    $MYSQL_CMD < "$sql_file" 2>&1 | head -20
    echo ""
  fi
done

echo "✅ 验证表结构..."
echo ""

# 验证 message_reports 表
echo "检查 message_reports 表..."
$MYSQL_CMD -e "SELECT COUNT(*) as 'message_reports rows' FROM information_schema.TABLES WHERE TABLE_SCHEMA='$DB_NAME' AND TABLE_NAME='message_reports';"

# 验证 messages 表中的 receiver_id 列
echo "检查 messages.receiver_id 列..."
$MYSQL_CMD -e "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='$DB_NAME' AND TABLE_NAME='messages' AND COLUMN_NAME='receiver_id';"

echo ""
echo "✅ 数据库修复完成！"
