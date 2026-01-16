#!/bin/bash

# MySQL 数据库备份脚本

# 配置
BACKUP_DIR="/var/backups/mysql"
DB_NAME="hiking_app"
DB_USER="hiking_user"
DB_PASSWORD="your_password"  # 请修改为实际密码
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="${DB_NAME}_${DATE}.sql"
KEEP_DAYS=7  # 保留最近7天的备份

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库
echo "开始备份数据库: $DB_NAME"
mysqldump -u $DB_USER -p"$DB_PASSWORD" \
    --single-transaction \
    --quick \
    --lock-tables=false \
    $DB_NAME > $BACKUP_DIR/$FILENAME

# 压缩备份文件
gzip $BACKUP_DIR/$FILENAME
echo "备份完成: ${FILENAME}.gz"

# 删除旧备份
find $BACKUP_DIR -name "${DB_NAME}_*.sql.gz" -mtime +$KEEP_DAYS -delete
echo "已删除 ${KEEP_DAYS} 天前的备份"

# 显示备份大小
BACKUP_SIZE=$(du -h $BACKUP_DIR/${FILENAME}.gz | cut -f1)
echo "备份大小: $BACKUP_SIZE"

# 显示磁盘使用情况
echo "备份目录磁盘使用:"
du -sh $BACKUP_DIR
