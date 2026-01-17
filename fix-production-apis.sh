#!/bin/bash

# ===================================================================
# 🔧 生产环境 API 404 问题 - 一键修复脚本 v3.0
# ===================================================================

set -e

SERVER_IP="${1:-115.190.252.62}"
PROJECT_DIR="/var/www/hikingSocialApp"
BACKEND_DIR="$PROJECT_DIR/backend"

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   🔧 生产环境 API 404 问题 - 一键修复脚本 v3.0            ║"
echo "║   服务器: $SERVER_IP"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# SSH 连接到服务器执行修复
ssh root@$SERVER_IP << 'PRODUCTION_REPAIR'

PROJECT_DIR="/var/www/hikingSocialApp"
BACKEND_DIR="$PROJECT_DIR/backend"

echo "📍 当前目录: $(pwd)"
echo "📍 项目目录: $PROJECT_DIR"

# 1. 检查项目结构
echo ""
echo "1️⃣ 检查项目结构..."
if [ -d "$PROJECT_DIR/.git" ]; then
  echo "   ✅ Git 仓库存在"
else
  echo "   ⚠️ Git 仓库不存在"
fi

if [ -d "$BACKEND_DIR/dist" ]; then
  echo "   ✅ 后端构建文件存在"
  ls -la "$BACKEND_DIR/dist/" | head -5
else
  echo "   ❌ 后端构建文件不存在，需要重新构建"
fi

if [ -d "$PROJECT_DIR/frontend/dist" ]; then
  echo "   ✅ 前端构建文件存在"
else
  echo "   ⚠️ 前端构建文件不存在"
fi

# 2. 检查环境变量
echo ""
echo "2️⃣ 检查环境变量..."
if [ -f "$BACKEND_DIR/.env" ]; then
  echo "   ✅ .env 文件存在"
  echo "   内容预览："
  grep -E "^(DATABASE_|NODE_ENV|PORT|API_VERSION)" "$BACKEND_DIR/.env" | head -10
else
  echo "   ❌ .env 文件不存在！"
  echo "   📝 从 .env.example 创建..."
  if [ -f "$BACKEND_DIR/.env.example" ]; then
    cp "$BACKEND_DIR/.env.example" "$BACKEND_DIR/.env"
    echo "   ✅ 已创建 .env，请手动配置数据库信息"
  fi
fi

# 3. 检查后端依赖
echo ""
echo "3️⃣ 检查后端依赖..."
if [ -d "$BACKEND_DIR/node_modules" ]; then
  echo "   ✅ node_modules 存在"
else
  echo "   ⚠️ node_modules 不存在，需要安装"
  cd "$BACKEND_DIR"
  npm ci --omit=dev
  echo "   ✅ 依赖安装完成"
fi

# 4. 检查数据库连接
echo ""
echo "4️⃣ 检查数据库连接..."
DB_HOST=$(grep "^DATABASE_HOST=" "$BACKEND_DIR/.env" | cut -d'=' -f2)
DB_NAME=$(grep "^DATABASE_NAME=" "$BACKEND_DIR/.env" | cut -d'=' -f2)
DB_USER=$(grep "^DATABASE_USER=" "$BACKEND_DIR/.env" | cut -d'=' -f2)

if command -v mysql &> /dev/null; then
  if mysql -h "$DB_HOST" -u "$DB_USER" -e "SELECT 1 FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME='$DB_NAME'" 2>/dev/null; then
    echo "   ✅ 数据库连接正常"
  else
    echo "   ❌ 数据库连接失败"
    echo "   请检查 .env 中的数据库配置："
    echo "     DATABASE_HOST=$DB_HOST"
    echo "     DATABASE_NAME=$DB_NAME"
    echo "     DATABASE_USER=$DB_USER"
  fi
else
  echo "   ⚠️ 未安装 mysql-client，无法测试数据库连接"
fi

# 5. 检查 PM2 进程
echo ""
echo "5️⃣ 检查 PM2 进程..."
if command -v pm2 &> /dev/null; then
  if pm2 list | grep -q "hiking-app-backend"; then
    STATUS=$(pm2 list | grep "hiking-app-backend" | awk '{print $9}')
    if [ "$STATUS" = "online" ]; then
      echo "   ✅ 后端服务运行中"
    else
      echo "   ❌ 后端服务未运行（状态: $STATUS）"
      echo "   重启服务..."
      pm2 restart hiking-app-backend
      sleep 3
      pm2 list
    fi
  else
    echo "   ❌ PM2 未注册后端服务"
    echo "   启动服务..."
    cd "$BACKEND_DIR"
    pm2 start ecosystem.config.cjs --env production
    sleep 3
    pm2 list
  fi
else
  echo "   ❌ 未安装 PM2"
fi

# 6. 检查后端端口
echo ""
echo "6️⃣ 检查后端端口..."
if netstat -tlnp 2>/dev/null | grep -q ":3000 "; then
  echo "   ✅ 后端监听 3000 端口"
  netstat -tlnp | grep ":3000 "
else
  echo "   ❌ 后端未监听 3000 端口"
  echo "   查看后端日志："
  pm2 logs hiking-app-backend --lines 20 --nostream
fi

# 7. 检查后端直连
echo ""
echo "7️⃣ 检查后端直连..."
if curl -s http://localhost:3000/health | grep -q '"status":"ok"'; then
  echo "   ✅ 后端直连正常"
else
  echo "   ❌ 后端直连异常"
  echo "   响应："
  curl -v http://localhost:3000/health 2>&1 | head -20
fi

# 8. 检查 Nginx 配置
echo ""
echo "8️⃣ 检查 Nginx 配置..."
if sudo nginx -t 2>&1 | grep -q "successful"; then
  echo "   ✅ Nginx 配置正确"
else
  echo "   ❌ Nginx 配置有误"
  sudo nginx -t
fi

if sudo systemctl is-active --quiet nginx; then
  echo "   ✅ Nginx 运行中"
else
  echo "   ❌ Nginx 未运行"
  echo "   启动 Nginx..."
  sudo systemctl start nginx
fi

# 9. 检查 Nginx 反向代理
echo ""
echo "9️⃣ 检查 Nginx 反向代理..."
if curl -s http://localhost/health | grep -q '"status":"ok"'; then
  echo "   ✅ Nginx 反向代理正常"
else
  echo "   ❌ Nginx 反向代理异常"
  echo "   响应："
  curl -v http://localhost/health 2>&1 | head -20
fi

# 10. 完整测试
echo ""
echo "🔟 完整 API 测试..."
echo "   测试登录接口..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}')

HTTP_CODE=$(echo "$LOGIN_RESPONSE" | grep -o '"code":[0-9]*' | cut -d':' -f2)
if [ "$HTTP_CODE" = "0" ] || [ "$HTTP_CODE" = "1" ]; then
  echo "   ✅ 登录接口正常"
else
  echo "   ⚠️ 登录返回: HTTP $HTTP_CODE"
fi

# 11. 检查关键文件权限
echo ""
echo "1️⃣1️⃣ 检查文件权限..."
if [ -f "$BACKEND_DIR/dist/server.js" ]; then
  echo "   ✅ server.js 可读"
else
  echo "   ❌ server.js 不存在或无权限"
fi

if [ -d "$BACKEND_DIR/uploads" ]; then
  echo "   ✅ uploads 目录存在"
else
  echo "   ⚠️ uploads 目录不存在，创建..."
  mkdir -p "$BACKEND_DIR/uploads"
fi

# 总结
echo ""
echo "=========================================="
echo "✅ 诊断完成！"
echo "=========================================="
echo ""
echo "如果有问题，请检查："
echo "1. PM2 日志: pm2 logs hiking-app-backend"
echo "2. Nginx 日志: sudo tail -f /var/log/nginx/error.log"
echo "3. 数据库连接: 检查 .env 中的 DATABASE_* 配置"
echo "4. 后端构建: npm run build"
echo ""

EOF

echo ""
echo "✅ 远程诊断完成"
