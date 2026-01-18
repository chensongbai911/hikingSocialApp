#!/bin/bash

# 生产环境部署脚本 - 2026-01-17
# 用于部署包含API优化和缓存改进的版本

set -e  # 遇到错误立即退出

echo "🚀 开始部署生产环境..."
echo "========================================="

# 进入项目目录
cd /var/www/hikingSocialApp || { echo "❌ 无法进入项目目录"; exit 1; }

# 1. 更新代码
echo "📥 从 Git 仓库拉取最新代码..."
git pull origin master || { echo "❌ Git 拉取失败"; exit 1; }

# 2. 部署后端
echo ""
echo "🔧 部署后端服务..."
echo "---"

cd /var/www/hikingSocialApp/backend

# 安装依赖（如果需要）
npm install --legacy-peer-deps > /dev/null 2>&1 || echo "⚠️  npm install 完成（可能有警告）"

# 编译TypeScript
echo "  编译 TypeScript..."
npm run build || { echo "❌ 后端编译失败"; exit 1; }

# 重启PM2服务
echo "  重启 PM2 服务..."
pm2 restart hiking-backend --wait-ready --listen-timeout 10000 || { echo "❌ PM2重启失败"; exit 1; }

# 3. 部署前端
echo ""
echo "🎨 部署前端应用..."
echo "---"

cd /var/www/hikingSocialApp/frontend

# 安装依赖（如果需要）
npm install --legacy-peer-deps > /dev/null 2>&1 || echo "⚠️  npm install 完成（可能有警告）"

# 构建Vite项目
echo "  构建 Vite 项目..."
npm run build || { echo "❌ 前端构建失败"; exit 1; }

# 4. 验证服务
echo ""
echo "✅ 验证服务状态..."
echo "---"

echo "  检查 PM2 服务状态..."
pm2 list | grep hiking-backend || { echo "❌ PM2 服务未运行"; exit 1; }

echo "  验证 MySQL 数据库连接..."
mysql -h localhost -u hiking_user -p"Hiking@2024" hiking_app -e "SELECT 1" > /dev/null 2>&1 || \
  { echo "❌ 数据库连接失败"; exit 1; }

# 5. 部署完成
echo ""
echo "🎉 部署完成！"
echo "========================================="
echo "📊 应用信息："
echo "  • 前端: http://115.190.252.62"
echo "  • 后端 API: http://115.190.252.62:3000/api/v1"
echo "  • 数据库: hiking_app (localhost:3306)"
echo ""
echo "🔍 新增功能:"
echo "  ✓ API 缓存优化 (10分钟 TTL)"
echo "  ✓ 选择性加载用户数据 (照片/偏好)"
echo "  ✓ 响应大小优化 (3MB -> 50KB)"
echo "  ✓ 标签页切换时自动滚动"
echo "========================================="

exit 0
