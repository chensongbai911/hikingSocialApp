#!/bin/bash
# 徒步社交应用 - 快速启动脚本

echo "🚀 启动徒步社交应用 v1.1.0"
echo "================================"

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js >= 14.0"
    exit 1
fi
echo "✅ Node.js 已安装: $(node --version)"

# 检查npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装"
    exit 1
fi
echo "✅ npm 已安装: $(npm --version)"

# 检查MySQL
if ! command -v mysql &> /dev/null; then
    echo "⚠️  MySQL 命令行工具未安装，但可能已作为服务运行"
else
    echo "✅ MySQL 已安装"
fi

# 启动后端
echo ""
echo "📦 启动后端服务..."
cd backend
npm install --silent > /dev/null 2>&1
npm run dev &
BACKEND_PID=$!
echo "✅ 后端启动中 (PID: $BACKEND_PID)"

# 等待后端启动
sleep 3

# 启动前端
echo ""
echo "🎨 启动前端应用..."
cd ../frontend
npm install --silent > /dev/null 2>&1
npm run dev &
FRONTEND_PID=$!
echo "✅ 前端启动中 (PID: $FRONTEND_PID)"

# 等待前端启动
sleep 3

echo ""
echo "================================"
echo "🎉 应用已启动！"
echo ""
echo "📱 前端访问地址: http://localhost:5173"
echo "⚙️  后端API地址: http://localhost:3000/api/v1"
echo ""
echo "📝 测试账户:"
echo "   user1@test.com / TestPassword123"
echo "   user2@test.com / TestPassword456"
echo ""
echo "🛑 停止应用: 按 Ctrl+C"
echo "================================"

# 等待
wait
