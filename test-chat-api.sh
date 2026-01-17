#!/bin/bash

# ===================================================================
# 🧪 测试聊天接口 - 验证修复
# ===================================================================

SERVER_IP="${1:-115.190.252.62}"
API_BASE="http://$SERVER_IP/api/v1"

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   🧪 测试聊天接口 - 验证修复                              ║"
echo "║   服务器: $SERVER_IP"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# 第一步：获取数据库中的用户信息
echo "📊 获取测试用户信息..."
ssh root@$SERVER_IP << 'GET_USERS'

mysql -h localhost -u hiking_user -psenbochen hiking_social_db -N << 'SQL_QUERY'
SELECT
  CONCAT('ID: ', id, ' | Email: ', email, ' | Nickname: ', IFNULL(nickname, 'NULL'), ' | Avatar: ', IFNULL(avatar_url, 'NULL')) as user_info
FROM users
LIMIT 5;
SQL_QUERY

echo ""
echo "📊 获取对话信息..."
mysql -h localhost -u hiking_user -psenbochen hiking_social_db -N << 'SQL_QUERY2'
SELECT
  CONCAT('Conv ID: ', id, ' | User1: ', user_id1, ' | User2: ', user_id2, ' | Last Msg: ', IFNULL(last_message_content, 'NULL')) as conversation_info
FROM conversations
LIMIT 5;
SQL_QUERY2

echo ""
echo "📊 获取消息信息..."
mysql -h localhost -u hiking_user -psenbochen hiking_social_db -N << 'SQL_QUERY3'
SELECT
  CONCAT('Msg ID: ', id, ' | Conv: ', conversation_id, ' | Sender: ', sender_id, ' | Content: ', SUBSTR(content, 1, 30)) as message_info
FROM messages
LIMIT 5;
SQL_QUERY3

GET_USERS

# 第二步：测试登录
echo ""
echo "🔐 正在登录..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }')

echo "响应内容: $LOGIN_RESPONSE"

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ 登录失败，尝试获取现有用户"

  # 尝试获取第一个用户的信息
  ssh root@$SERVER_IP << 'GET_FIRST_USER'

  FIRST_USER=$(mysql -h localhost -u hiking_user -psenbochen hiking_social_db -N -s << 'SQL_GET'
  SELECT email FROM users LIMIT 1;
  SQL_GET
  )

  echo "尝试使用用户: $FIRST_USER"

  GET_FIRST_USER
else
  echo "✅ 登录成功"
  echo "Token: ${TOKEN:0:20}..."

  # 第三步：测试对话列表接口
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🧪 接口1: 获取对话列表 (/api/v1/messages/conversations)"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  CONV_RESPONSE=$(curl -s -X GET "$API_BASE/messages/conversations?page=1&limit=20" \
    -H "Authorization: Bearer $TOKEN" \
    -H 'Content-Type: application/json')

  echo "$CONV_RESPONSE" | jq '.' 2>/dev/null || echo "$CONV_RESPONSE"

  # 提取第一个对话ID用于下一个测试
  CONV_ID=$(echo "$CONV_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')

  if [ -n "$CONV_ID" ]; then
    echo ""
    echo "✅ 找到对话 ID: $CONV_ID"

    # 第四步：测试消息列表接口
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🧪 接口2: 获取消息列表 (/api/v1/messages/conversations/$CONV_ID)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    MSG_RESPONSE=$(curl -s -X GET "$API_BASE/messages/conversations/$CONV_ID?page=1&limit=50" \
      -H "Authorization: Bearer $TOKEN" \
      -H 'Content-Type: application/json')

    echo "$MSG_RESPONSE" | jq '.' 2>/dev/null || echo "$MSG_RESPONSE"
  fi
fi

echo ""
echo "✅ 测试完成！"
