#!/bin/bash

# ===================================================================
# 🔧 最终验证和修复 - 确保环境变量正确加载
# ===================================================================

SERVER_IP="${1:-115.190.252.62}"

echo ""
echo "🔍 最终验证和修复..."
echo ""

ssh root@$SERVER_IP << 'FINAL_VERIFICATION'

cd /var/www/hikingSocialApp/backend

echo "1️⃣ 检查ecosystem配置中的环境变量..."
echo "=== ecosystem.config.cjs ==="
cat ecosystem.config.cjs | grep -A 10 env:

echo ""
echo "2️⃣ 更新ecosystem配置，确保正确的环境变量..."

cat > ecosystem.config.cjs << 'ECOSYSTEM_FIX'
module.exports = {
  apps: [{
    name: 'hiking-app-backend',
    script: './src/server.ts',
    interpreter: 'node',
    interpreter_args: '--loader ts-node/esm',
    env: {
      NODE_ENV: 'production',
      USE_API_PREFIX: 'false',
      DATABASE_HOST: 'localhost',
      DATABASE_NAME: 'hiking_social_db',
      DATABASE_USER: 'hiking_user',
      DATABASE_PASSWORD: 'senbochen',
      PORT: '3000',
      API_VERSION: 'v1',
      JWT_SECRET: 'hiking_social_jwt_secret_production',
      CORS_ORIGIN: '*'
    },
    watch: false,
    instances: 1,
    exec_mode: 'cluster',
    max_memory_restart: '200M',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
ECOSYSTEM_FIX

echo "   ✅ ecosystem配置已更新"

echo ""
echo "3️⃣ 重启服务并强制更新环境变量..."
pm2 stop hiking-app-backend
pm2 delete hiking-app-backend
pm2 start ecosystem.config.cjs

echo ""
echo "等待服务启动..."
sleep 8

echo ""
echo "4️⃣ 查看启动日志，验证路由前缀..."
pm2 logs hiking-app-backend --lines 30 --nostream

echo ""
echo "5️⃣ 测试更新后的路由..."

# 健康检查（应该包含apiPrefix信息）
echo "健康检查 (应该显示 apiPrefix: ''):"
curl -s http://localhost:3000/health | grep -o '"apiPrefix":"[^"]*"' || echo "未找到apiPrefix"

echo ""
# 根路径（应该显示正确的路由）
echo "根路径信息:"
curl -s http://localhost:3000/ | python3 -m json.tool 2>/dev/null || curl -s http://localhost:3000/

echo ""
echo "6️⃣ 测试无前缀路由 (直连后端):"
declare -A routes=(
  ["/messages/conversations"]="消息对话"
  ["/users/test/detail"]="用户详情"
  ["/auth/login"]="登录"
)

for route in "${!routes[@]}"; do
  status=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000$route" 2>/dev/null)
  echo "   $route (${routes[$route]}): HTTP $status"
done

echo ""
echo "7️⃣ 测试Nginx代理 (应该从/api/v1/去掉前缀转发到后端):"

for route in "${!routes[@]}"; do
  nginx_route="/api/v1$route"
  status=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost$nginx_route" 2>/dev/null)
  echo "   $nginx_route -> $route: HTTP $status"
done

echo ""
echo "8️⃣ 最终状态总结:"

# 检查PM2状态
pm2_status=$(pm2 list | grep hiking-app-backend | awk '{print $10}' | head -1)
echo "   PM2状态: $pm2_status"

# 检查端口监听
port_count=$(netstat -tlnp | grep :3000 | wc -l)
echo "   端口监听: $port_count 个进程在3000端口"

# 关键路由测试
msg_direct=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/messages/conversations" 2>/dev/null)
msg_nginx=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost/api/v1/messages/conversations" 2>/dev/null)

user_direct=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/users/test/detail" 2>/dev/null)
user_nginx=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost/api/v1/users/test/detail" 2>/dev/null)

echo "   关键测试结果:"
echo "     消息接口 - 直连: $msg_direct, Nginx: $msg_nginx"
echo "     用户接口 - 直连: $user_direct, Nginx: $user_nginx"

echo ""
if [ "$msg_nginx" = "401" ] && [ "$user_nginx" = "401" ]; then
    echo "🎉 SUCCESS! API 路由修复成功!"
    echo "   401 表示路由正确，需要认证token"
    echo "   这说明请求正确到达了后端控制器"
elif [ "$msg_nginx" = "200" ] && [ "$user_nginx" = "200" ]; then
    echo "🎉 SUCCESS! API 路由修复成功!"
    echo "   200 表示请求成功处理"
elif [ "$msg_nginx" = "404" ] || [ "$user_nginx" = "404" ]; then
    echo "❌ 仍有404问题，需要进一步调试"
    echo "   建议检查："
    echo "   1. pm2 logs hiking-app-backend"
    echo "   2. 确认USE_API_PREFIX环境变量"
    echo "   3. 检查路由文件是否存在问题"
else
    echo "ℹ️ 状态码: 消息=$msg_nginx, 用户=$user_nginx"
    echo "   可能需要进一步检查具体错误"
fi

echo ""
echo "📋 调试命令:"
echo "   查看日志: pm2 logs hiking-app-backend"
echo "   查看配置: cat ecosystem.config.cjs"
echo "   重启服务: pm2 restart hiking-app-backend --update-env"
echo "   查看路由: curl http://localhost:3000/"

FINAL_VERIFICATION

echo ""
echo "✅ 最终验证完成！"
echo ""
