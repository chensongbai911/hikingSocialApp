#!/bin/bash

# 服务器健康检查脚本
# 可以设置为定时任务，自动检查服务状态

echo "=================================="
echo "服务器健康检查"
echo "=================================="
echo ""

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 检查 Nginx 状态
echo -n "Nginx 状态: "
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}运行中 ✓${NC}"
else
    echo -e "${RED}已停止 ✗${NC}"
fi

# 检查 MySQL 状态
echo -n "MySQL 状态: "
if systemctl is-active --quiet mysql; then
    echo -e "${GREEN}运行中 ✓${NC}"
else
    echo -e "${RED}已停止 ✗${NC}"
fi

# 检查后端服务
echo -n "后端 API 状态: "
if pm2 describe hiking-api > /dev/null 2>&1; then
    STATUS=$(pm2 describe hiking-api | grep 'status' | awk '{print $4}')
    if [ "$STATUS" = "online" ]; then
        echo -e "${GREEN}运行中 ✓${NC}"
    else
        echo -e "${RED}$STATUS ✗${NC}"
    fi
else
    echo -e "${RED}未找到 ✗${NC}"
fi

echo ""
echo "磁盘使用情况:"
df -h / | tail -n 1 | awk '{print "  使用: " $3 " / " $2 " (" $5 ")"}'

echo ""
echo "内存使用情况:"
free -h | grep Mem | awk '{print "  使用: " $3 " / " $2}'

echo ""
echo "CPU 负载:"
uptime | awk -F'load average:' '{print "  " $2}'

echo ""
echo "后端进程信息:"
pm2 list

echo ""
echo "最近的错误日志 (Nginx):"
tail -n 5 /var/log/nginx/error.log 2>/dev/null || echo "  无错误日志"

echo ""
echo "=================================="
echo "检查完成"
echo "=================================="
