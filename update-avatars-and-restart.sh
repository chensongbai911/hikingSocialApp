#!/bin/bash

# ===================================================================
# 🔧 更新现有用户默认头像和重启服务
# ===================================================================

SERVER_IP="${1:-115.190.252.62}"

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   🔧 更新现有用户默认头像和重启服务                        ║"
echo "║   服务器: $SERVER_IP"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

ssh root@$SERVER_IP << 'UPDATE_AVATARS'

cd /var/www/hikingSocialApp/backend

echo "🎯 开始更新现有用户的默认头像..."
echo ""

# 步骤1: 连接MySQL并更新用户头像
echo "1️⃣ 更新现有用户的默认头像..."

mysql -h localhost -u hiking_user -psenbochen hiking_social_db << 'SQL_UPDATE'

-- 为没有头像的用户设置默认头像
UPDATE users
SET avatar_url = CONCAT('https://api.dicebear.com/7.x/avataaars/svg?seed=user', id),
    updated_at = NOW()
WHERE avatar_url IS NULL OR avatar_url = '';

-- 查看更新结果
SELECT
    id,
    nickname,
    avatar_url,
    CASE
        WHEN avatar_url LIKE 'https://api.dicebear.com%' THEN '默认头像'
        ELSE '自定义头像'
    END as avatar_type
FROM users
WHERE deleted_at IS NULL
ORDER BY created_at DESC
LIMIT 10;

SQL_UPDATE

echo "   ✅ 用户头像更新完成"

echo ""
echo "2️⃣ 重启后端服务以应用消息修复..."

# 重启PM2服务
pm2 restart hiking-app-backend --update-env

echo ""
echo "等待服务启动..."
sleep 5

# 查看启动状态
pm2 list | grep hiking-app-backend

echo ""
echo "3️⃣ 测试修复后的接口..."

# 等待服务完全启动
sleep 3

# 测试健康检查
echo "健康检查:"
curl -s http://localhost:3000/health | python3 -m json.tool 2>/dev/null || curl -s http://localhost:3000/health

echo ""
echo "测试消息接口（需要token）:"
echo "直连: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/messages/conversations 2>/dev/null)"
echo "Nginx: $(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/v1/messages/conversations 2>/dev/null)"

echo ""
echo "测试用户接口（需要token）:"
echo "直连: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/users/user-001/detail 2>/dev/null)"
echo "Nginx: $(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/v1/users/user-001/detail 2>/dev/null)"

echo ""
echo "4️⃣ 显示最新用户信息..."

mysql -h localhost -u hiking_user -psenbochen hiking_social_db << 'SQL_SHOW'
SELECT
    id,
    nickname,
    LEFT(avatar_url, 50) as avatar_preview,
    created_at,
    updated_at
FROM users
WHERE deleted_at IS NULL
ORDER BY created_at DESC
LIMIT 5;
SQL_SHOW

echo ""
echo "🎉 修复完成！"
echo ""
echo "📊 修复总结："
echo "   - ✅ 修复了对话列表中用户信息显示问题"
echo "   - ✅ 修复了消息列表中发送者头像显示问题"
echo "   - ✅ 为新注册用户添加了默认头像设置"
echo "   - ✅ 为现有用户更新了默认头像"
echo "   - ✅ 重启了后端服务应用修复"
echo ""
echo "🔍 接下来可以："
echo "   1. 在前端测试聊天功能"
echo "   2. 测试新用户注册的默认头像"
echo "   3. 检查对话列表和消息历史显示"
echo ""
echo "📋 接口测试命令："
echo "   消息对话: curl -H 'Authorization: Bearer YOUR_TOKEN' http://localhost/api/v1/messages/conversations"
echo "   消息历史: curl -H 'Authorization: Bearer YOUR_TOKEN' http://localhost/api/v1/messages/conversations/4"
echo "   用户详情: curl -H 'Authorization: Bearer YOUR_TOKEN' http://localhost/api/v1/users/user-001/detail"
echo ""

UPDATE_AVATARS

echo ""
echo "✅ 用户头像更新和服务重启完成！"
echo ""
