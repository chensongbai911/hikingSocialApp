#!/bin/bash

echo "🔍 最终部署验证脚本"
echo "=================================="

# 检查服务器连接
echo "📡 检查服务器连接..."
if ssh root@115.190.252.62 "echo 'SSH连接正常'" 2>/dev/null; then
    echo "✅ SSH连接正常"
else
    echo "❌ SSH连接失败"
    exit 1
fi

# 检查PM2服务状态
echo ""
echo "🔄 检查PM2服务状态..."
ssh root@115.190.252.62 "pm2 status"

# 检查数据库连接
echo ""
echo "🗄️ 检查数据库连接..."
ssh root@115.190.252.62 "mysql -u hiking_user -psenbochen -e 'SELECT COUNT(*) as user_count FROM hiking_app.users;'" 2>/dev/null

# 检查后端API
echo ""
echo "🔌 检查后端API..."
API_RESPONSE=$(curl -s http://115.190.252.62/api/v1/health)
echo "API响应: $API_RESPONSE"

# 检查前端
echo ""
echo "🎨 检查前端..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://115.190.252.62/)
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "✅ 前端正常 (HTTP $FRONTEND_STATUS)"
else
    echo "❌ 前端异常 (HTTP $FRONTEND_STATUS)"
fi

# 检查nginx配置
echo ""
echo "⚙️ 检查nginx配置..."
ssh root@115.190.252.62 "nginx -t" 2>/dev/null && echo "✅ nginx配置正常"

echo ""
echo "=================================="
echo "🎉 部署验证完成！"
echo ""
echo "📍 应用访问地址:"
echo "   前端: http://115.190.252.62"
echo "   API:  http://115.190.252.62/api/v1"
echo ""
echo "🔧 如需查看详细日志:"
echo "   ssh root@115.190.252.62 'pm2 logs hiking-backend'"
