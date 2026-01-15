#!/bin/bash

# ============================================
# 徒步社交应用 - 启动脚本 (Linux/Mac)
# ============================================
# 用途: 一键启动前端和后端服务
# 使用: chmod +x start_app.sh && ./start_app.sh
# ============================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 符号定义
CHECK="✅"
INFO="ℹ️"
WARN="⚠️"
ERROR="❌"

echo ""
echo "========================================"
echo "  徒步社交应用 v1.1.0 - 启动程序"
echo "========================================"
echo ""

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo -e "${ERROR} 错误: 未检测到 Node.js"
    echo ""
    echo "请先安装 Node.js (https://nodejs.org/)"
    echo ""
    exit 1
fi

echo -e "${CHECK} Node.js已检测到: $(node --version)"

# 检查npm
if ! command -v npm &> /dev/null; then
    echo -e "${ERROR} 错误: 未检测到 npm"
    exit 1
fi

echo -e "${CHECK} npm已检测到: $(npm --version)"

# 检查MySQL
if nc -z localhost 3306 2>/dev/null; then
    echo -e "${CHECK} MySQL数据库已运行"
else
    echo -e "${WARN} 警告: 未检测到MySQL运行在端口3306"
    echo "请确保MySQL服务正在运行"
    echo ""
fi

echo ""
echo -e "${BLUE}准备启动服务...${NC}"
echo ""

# 获取脚本所在目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# 清理旧的Node进程（可选）
echo -e "${BLUE}清理旧进程...${NC}"
pkill -f "npm run dev" || true
sleep 2

# 启动后端服务
echo ""
echo -e "${BLUE}启动后端服务 (Express + Socket.io)...${NC}"
echo ""
cd "$SCRIPT_DIR/backend"

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}正在安装后端依赖...${NC}"
    npm install
fi

# 在后台启动后端
npm run dev > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${CHECK} 后端服务已启动 (PID: $BACKEND_PID)"
sleep 2

# 启动前端服务
echo ""
echo -e "${BLUE}启动前端服务 (Vue + Vite)...${NC}"
echo ""
cd "$SCRIPT_DIR/frontend"

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}正在安装前端依赖...${NC}"
    npm install
fi

# 在后台启动前端
npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${CHECK} 前端服务已启动 (PID: $FRONTEND_PID)"
sleep 2

# 显示启动完成信息
echo ""
echo "========================================"
echo "  ✅ 服务已启动！"
echo "========================================"
echo ""
echo -e "${GREEN}📱 前端应用:${NC} http://localhost:5173"
echo -e "${GREEN}🔌 后端API:${NC} http://localhost:3000/api/v1"
echo -e "${GREEN}💬 WebSocket:${NC} http://localhost:3000"
echo ""
echo -e "${GREEN}📋 测试账户:${NC}"
echo "   邮箱: user1@test.com"
echo "   密码: password123"
echo ""
echo -e "${GREEN}📖 请在浏览器中访问 http://localhost:5173${NC}"
echo ""
echo -e "${YELLOW}💡 提示:${NC}"
echo "   - 后端日志: tail -f /tmp/backend.log"
echo "   - 前端日志: tail -f /tmp/frontend.log"
echo "   - 停止服务: kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo -e "${YELLOW}❌ 如需完全关闭:${NC}"
echo "   - 按 Ctrl+C 停止此脚本，或"
echo "   - 运行: kill $BACKEND_PID $FRONTEND_PID"
echo ""

# 保持脚本运行直到Ctrl+C
trap "echo ''; echo '停止服务...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT

# 监控进程
while true; do
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        echo -e "${ERROR} 后端服务已停止 (PID: $BACKEND_PID)"
        break
    fi
    if ! kill -0 $FRONTEND_PID 2>/dev/null; then
        echo -e "${ERROR} 前端服务已停止 (PID: $FRONTEND_PID)"
        break
    fi
    sleep 10
done

echo "已退出"
