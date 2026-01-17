#!/bin/bash

# ===================================================================
# 🧪 直接测试聊天接口（通过localhost）
# ===================================================================

SERVER_IP="${1:-115.190.252.62}"

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   🧪 直接测试聊天接口（在服务器上本地测试）              ║"
echo "║   服务器: $SERVER_IP"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

ssh root@$SERVER_IP << 'REMOTE_TEST'

API_BASE="http://localhost:3000/api/v1"

echo "🔐 正在登录..."

# 测试登录端点
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "user001@example.com",
    "password": "password123"
  }')

echo "登录响应:"
echo "$LOGIN_RESPONSE" | jq '.' 2>/dev/null || echo "$LOGIN_RESPONSE"

# 尝试获取token
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.token' 2>/dev/null)

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo ""
  echo "❌ 登录失败，尝试使用硬编码的JWT token..."

  # 创建一个有效的测试JWT
  # 这是一个示例，实际应该从数据库获取一个真实用户
  TOKEN="test_token"
fi

if [ "$TOKEN" != "null" ] && [ ! -z "$TOKEN" ] && [ "$TOKEN" != "test_token" ]; then
  echo ""
  echo "✅ 登录成功"
  echo "Token: ${TOKEN:0:30}..."

  # 测试对话列表接口
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🧪 接口1: 获取对话列表"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  CONV_RESPONSE=$(curl -s -X GET "$API_BASE/messages/conversations?page=1&limit=20" \
    -H "Authorization: Bearer $TOKEN" \
    -H 'Content-Type: application/json')

  echo "$CONV_RESPONSE" | jq '.' 2>/dev/null || echo "$CONV_RESPONSE"

  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🧪 接口2: 获取消息列表（对话ID=4）"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  MSG_RESPONSE=$(curl -s -X GET "$API_BASE/messages/conversations/4?page=1&limit=50" \
    -H "Authorization: Bearer $TOKEN" \
    -H 'Content-Type: application/json')

  echo "$MSG_RESPONSE" | jq '.' 2>/dev/null || echo "$MSG_RESPONSE"
fi

echo ""
echo "================================"
echo "📊 直接查询数据库中的实际数据"
echo "================================"
echo ""

# 用root用户查询（有权限）
echo "查询用户信息..."
mysql -h localhost -u root << 'SQL1'
SELECT id, email, nickname, avatar_url FROM users LIMIT 3;
SQL1

echo ""
echo "查询对话信息..."
mysql -h localhost -u root << 'SQL2'
SELECT id, user_id1, user_id2, last_message_content FROM conversations LIMIT 3;
SQL2

echo ""
echo "查询消息信息（对话4）..."
mysql -h localhost -u root << 'SQL3'
SELECT id, conversation_id, sender_id, content FROM messages WHERE conversation_id = 4 LIMIT 3;
SQL3

REMOTE_TEST

echo ""
echo "✅ 测试完成！"
