#!/bin/bash

# ===================================================================
# 🔧 查看测试用户和诊断聊天接口
# ===================================================================

SERVER_IP="${1:-115.190.252.62}"

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   🔧 查看测试用户和诊断聊天接口                            ║"
echo "║   服务器: $SERVER_IP"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

ssh root@$SERVER_IP << 'DIAGNOSIS'

echo "1️⃣ 查看数据库中的用户..."
mysql -h localhost -u hiking_user -psenbochen hiking_social_db << 'SQL_USERS'
SELECT
    id,
    email,
    nickname,
    LEFT(avatar_url, 50) as avatar_preview,
    created_at
FROM users
WHERE deleted_at IS NULL
ORDER BY created_at DESC
LIMIT 10;
SQL_USERS

echo ""
echo "2️⃣ 查看对话数据..."
mysql -h localhost -u hiking_user -psenbochen hiking_social_db << 'SQL_CONV'
SELECT
    id,
    user_id1,
    user_id2,
    left(last_message_content, 30) as last_msg,
    last_message_at,
    user1_unread_count,
    user2_unread_count
FROM conversations
WHERE deleted_at IS NULL
ORDER BY last_message_at DESC
LIMIT 5;
SQL_CONV

echo ""
echo "3️⃣ 查看消息数据..."
mysql -h localhost -u hiking_user -psenbochen hiking_social_db << 'SQL_MSG'
SELECT
    m.id,
    m.conversation_id,
    m.sender_id,
    m.content,
    u.nickname,
    u.avatar_url,
    m.created_at
FROM messages m
LEFT JOIN users u ON m.sender_id = u.id
WHERE m.deleted_at IS NULL
ORDER BY m.created_at DESC
LIMIT 10;
SQL_MSG

echo ""
echo "4️⃣ 查看用户与对话的关系..."
mysql -h localhost -u hiking_user -psenbochen hiking_social_db << 'SQL_REL'
SELECT
    c.id as conv_id,
    u1.id as user1_id,
    u1.nickname as user1_nickname,
    u1.avatar_url as user1_avatar,
    u2.id as user2_id,
    u2.nickname as user2_nickname,
    u2.avatar_url as user2_avatar,
    c.last_message_content
FROM conversations c
LEFT JOIN users u1 ON c.user_id1 = u1.id
LEFT JOIN users u2 ON c.user_id2 = u2.id
WHERE c.deleted_at IS NULL
LIMIT 5;
SQL_REL

DIAGNOSIS

echo ""
echo "✅ 诊断完成"
echo ""
