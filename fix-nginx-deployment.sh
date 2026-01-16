#!/bin/bash

# 徒步社交 App - Nginx 部署修复脚本
# 用于生产环境快速修复 404 错误问题
# 使用方式：bash fix-nginx-deployment.sh

set -e

echo "============================================"
echo "🔧 徒步社交 App - Nginx 部署修复"
echo "============================================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. 诊断信息收集
echo -e "${BLUE}📊 收集诊断信息...${NC}"
echo ""

echo "1️⃣  检查 Nginx 状态..."
if systemctl is-active --quiet nginx; then
  echo -e "${GREEN}✅ Nginx 正在运行${NC}"
else
  echo -e "${YELLOW}⚠️  Nginx 未运行${NC}"
fi

echo ""
echo "2️⃣  检查后端服务状态..."
if pm2 list 2>/dev/null | grep -q "hiking-app-backend"; then
  echo -e "${GREEN}✅ 后端服务已启动${NC}"
else
  echo -e "${YELLOW}⚠️  后端服务未启动${NC}"
  echo "   建议执行：pm2 start ecosystem.config.cjs --env production"
fi

echo ""
echo "3️⃣  检查后端响应..."
if curl -s -f http://localhost:3000/health > /dev/null 2>&1; then
  echo -e "${GREEN}✅ 后端 localhost:3000 正常响应${NC}"
else
  echo -e "${RED}❌ 后端 localhost:3000 无响应${NC}"
fi

echo ""
echo "4️⃣  验证 Nginx 配置..."
if sudo nginx -t > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Nginx 配置有效${NC}"
else
  echo -e "${RED}❌ Nginx 配置有错误${NC}"
  echo "   执行诊断命令："
  echo "   sudo nginx -t"
fi

echo ""
echo "5️⃣  检查 Nginx 代理配置..."
if sudo grep -q "proxy_pass http://localhost:3000" /etc/nginx/sites-available/default 2>/dev/null; then
  echo -e "${GREEN}✅ 找到正确的代理配置${NC}"
else
  echo -e "${YELLOW}⚠️  未找到代理配置或配置不正确${NC}"
  echo "   这可能导致 404 错误"
fi

echo ""
echo "6️⃣  测试直接后端访问..."
if curl -s -f http://115.190.252.62:3000/api/v1/health > /dev/null 2>&1; then
  echo -e "${GREEN}✅ 直接访问后端 (IP:3000) 正常${NC}"
else
  echo -e "${RED}❌ 直接访问后端 (IP:3000) 失败${NC}"
fi

echo ""
echo "7️⃣  测试 Nginx 代理访问..."
if curl -s -f http://115.190.252.62/health > /dev/null 2>&1; then
  echo -e "${GREEN}✅ 通过 Nginx 代理访问正常${NC}"
else
  echo -e "${RED}❌ 通过 Nginx 代理访问失败${NC}"
  echo "   这是导致 API 返回 404 的根本原因"
fi

echo ""
echo "============================================"
echo "🔨 执行修复步骤..."
echo "============================================"
echo ""

PROJECT_DIR="/var/www/hikingSocialApp"
NGINX_CONF="/etc/nginx/sites-available/default"
NGINX_BACKUP="/etc/nginx/sites-available/default.backup.$(date +%Y%m%d_%H%M%S)"

# 检查项目目录是否存在
if [ ! -d "$PROJECT_DIR" ]; then
  echo -e "${RED}❌ 项目目录不存在: $PROJECT_DIR${NC}"
  exit 1
fi

# 检查 Nginx 配置文件是否存在项目中
if [ ! -f "$PROJECT_DIR/nginx/hiking-app-single-server.conf" ]; then
  echo -e "${RED}❌ 项目中找不到 Nginx 配置: $PROJECT_DIR/nginx/hiking-app-single-server.conf${NC}"
  echo "   请确保项目已正确部署"
  exit 1
fi

echo "1️⃣  备份现有 Nginx 配置..."
sudo cp "$NGINX_CONF" "$NGINX_BACKUP"
echo -e "${GREEN}✅ 备份已保存: $NGINX_BACKUP${NC}"

echo ""
echo "2️⃣  部署新的 Nginx 配置..."
sudo cp "$PROJECT_DIR/nginx/hiking-app-single-server.conf" "$NGINX_CONF"
echo -e "${GREEN}✅ 新配置已部署${NC}"

echo ""
echo "3️⃣  验证新配置..."
if sudo nginx -t > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Nginx 配置有效${NC}"
else
  echo -e "${RED}❌ 新配置有错误，恢复备份...${NC}"
  sudo cp "$NGINX_BACKUP" "$NGINX_CONF"
  exit 1
fi

echo ""
echo "4️⃣  重载 Nginx..."
sudo systemctl reload nginx
echo -e "${GREEN}✅ Nginx 已重载${NC}"

echo ""
echo "5️⃣  确保后端服务运行..."
if ! pm2 list 2>/dev/null | grep -q "hiking-app-backend"; then
  echo "   启动后端服务..."
  cd "$PROJECT_DIR/backend"
  pm2 start ecosystem.config.cjs --env production
  sleep 3
fi

echo ""
echo "============================================"
echo "✅ 验证修复结果..."
echo "============================================"
echo ""

sleep 2

echo "📌 测试 5 个关键 API 接口..."
echo ""

# 创建一个测试用户来获取 token
TEST_EMAIL="test_$(date +%s)@test.com"
echo "   注册测试用户..."
REGISTER_RESPONSE=$(curl -s -X POST http://115.190.252.62/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"test123456\",\"nickname\":\"TestUser\"}" 2>/dev/null)

TEST_TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TEST_TOKEN" ]; then
  echo -e "${YELLOW}⚠️  无法获取测试 token，尝试使用现有用户...${NC}"
  # 尝试登录已知用户
  LOGIN_RESPONSE=$(curl -s -X POST http://115.190.252.62/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"testuser@test.com","password":"test123"}' 2>/dev/null)
  TEST_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
fi

echo ""

# 测试接口
ENDPOINTS=(
  "GET /api/v1/messages/unread-count"
  "GET /api/v1/messages/conversations?page=1"
  "GET /api/v1/users/user-010/detail"
  "GET /api/v1/users/user-009/follow-status"
)

SUCCESS_COUNT=0
FAIL_COUNT=0

for endpoint in "${ENDPOINTS[@]}"; do
  METHOD=$(echo "$endpoint" | awk '{print $1}')
  PATH=$(echo "$endpoint" | awk '{print $2}')

  if [ -n "$TEST_TOKEN" ]; then
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X "$METHOD" "http://115.190.252.62$PATH" \
      -H "Authorization: Bearer $TEST_TOKEN" 2>/dev/null)
  else
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X "$METHOD" "http://115.190.252.62$PATH" 2>/dev/null)
  fi

  if [ "$HTTP_CODE" == "200" ] || [ "$HTTP_CODE" == "201" ]; then
    echo -e "${GREEN}✅ $METHOD $PATH${NC} -> HTTP $HTTP_CODE"
    ((SUCCESS_COUNT++))
  elif [ "$HTTP_CODE" == "401" ] || [ "$HTTP_CODE" == "403" ]; then
    echo -e "${YELLOW}⚠️  $METHOD $PATH${NC} -> HTTP $HTTP_CODE (需要认证)"
    ((SUCCESS_COUNT++))
  else
    echo -e "${RED}❌ $METHOD $PATH${NC} -> HTTP $HTTP_CODE"
    ((FAIL_COUNT++))
  fi
done

echo ""
echo "============================================"
echo "📊 修复总结"
echo "============================================"
echo ""
echo "✅ 成功: $SUCCESS_COUNT"
echo "❌ 失败: $FAIL_COUNT"
echo ""

if [ "$FAIL_COUNT" -eq 0 ]; then
  echo -e "${GREEN}🎉 所有接口都已恢复！${NC}"
  echo ""
  echo "可以访问以下地址："
  echo "  - 前端: http://115.190.252.62"
  echo "  - 后端 API: http://115.190.252.62/api/v1"
else
  echo -e "${YELLOW}⚠️  部分接口仍然存在问题${NC}"
  echo ""
  echo "故障排除步骤："
  echo "1. 检查后端是否正常运行："
  echo "   pm2 list"
  echo ""
  echo "2. 检查 Nginx 日志："
  echo "   sudo tail -f /var/log/nginx/error.log"
  echo ""
  echo "3. 验证 Nginx 配置："
  echo "   sudo nginx -T | grep -A 20 'location /api/v1'"
  echo ""
  echo "4. 检查防火墙和端口："
  echo "   sudo netstat -tlnp | grep 3000"
fi

echo ""
echo "============================================"
echo "✅ 脚本执行完成"
echo "============================================"
