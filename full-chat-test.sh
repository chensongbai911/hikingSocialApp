#!/bin/bash

SERVER_IP="${1:-115.190.252.62}"

echo "🎯 完整的聊天接口测试和修复验证"
echo ""

ssh root@$SERVER_IP << 'FULL_TEST'

API_BASE="http://localhost:3000/api/v1"

echo "📝 步骤1: 检查现有用户..."
echo ""

# 生成一个随机邮箱用于测试
TEST_EMAIL="test$(date +%s)@example.com"
TEST_NICKNAME="TestUser_$(date +%s)"
TEST_PASSWORD="password123"

echo "✓ 将注册新测试用户："
echo "  Email: $TEST_EMAIL"
echo "  Nickname: $TEST_NICKNAME"
echo "  Password: $TEST_PASSWORD"
echo ""

# 尝试注册新用户
echo "注册新用户..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_BASE/auth/register" \
  -H 'Content-Type: application/json' \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"nickname\": \"$TEST_NICKNAME\"
  }")

echo "注册响应:"
echo "$REGISTER_RESPONSE" | jq '.' 2>/dev/null || echo "$REGISTER_RESPONSE"

# 提取token和user ID
TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.data.token' 2>/dev/null)
USER_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.data.user.id' 2>/dev/null)

if [ "$TOKEN" != "null" ] && [ ! -z "$TOKEN" ]; then
  echo ""
  echo "✅ 注册成功！"
  echo "  Token: ${TOKEN:0:30}..."
  echo "  User ID: $USER_ID"
  echo ""

  # 现在我们有有效的token，测试对话列表
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🧪 测试1: 获取对话列表（应该返回此用户的所有对话）"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""

  CONV_RESPONSE=$(curl -s -X GET "$API_BASE/messages/conversations?page=1&limit=20" \
    -H "Authorization: Bearer $TOKEN" \
    -H 'Content-Type: application/json')

  echo "对话列表API响应:"
  echo "$CONV_RESPONSE" | jq '.' 2>/dev/null || echo "$CONV_RESPONSE"

  # 检查是否有对话
  CONV_COUNT=$(echo "$CONV_RESPONSE" | jq '.data.conversations | length' 2>/dev/null)

  if [ "$CONV_COUNT" -gt 0 ]; then
    echo ""
    echo "✅ 找到 $CONV_COUNT 个对话"
    echo ""

    # 获取第一个对话的信息
    FIRST_CONV=$(echo "$CONV_RESPONSE" | jq '.data.conversations[0]' 2>/dev/null)
    CONV_ID=$(echo "$FIRST_CONV" | jq -r '.id')

    echo "第一个对话的详细信息："
    echo "$FIRST_CONV" | jq '.'

    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🧪 测试2: 获取对话的消息列表（对话ID: $CONV_ID）"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    MSG_RESPONSE=$(curl -s -X GET "$API_BASE/messages/conversations/$CONV_ID?page=1&limit=50" \
      -H "Authorization: Bearer $TOKEN" \
      -H 'Content-Type: application/json')

    echo "消息列表API响应:"
    echo "$MSG_RESPONSE" | jq '.' 2>/dev/null || echo "$MSG_RESPONSE"

    MSG_COUNT=$(echo "$MSG_RESPONSE" | jq '.data.messages | length' 2>/dev/null)
    echo ""
    echo "✅ 消息列表返回 $MSG_COUNT 条消息"

    # 显示一条消息的详细结构
    if [ "$MSG_COUNT" -gt 0 ]; then
      echo ""
      echo "第一条消息的结构:"
      echo "$MSG_RESPONSE" | jq '.data.messages[0]'
    fi
  else
    echo ""
    echo "ℹ️ 此用户没有对话，这是正常的（新用户）"
    echo ""
    echo "尝试测试现有的对话ID=4..."

    MSG_RESPONSE=$(curl -s -X GET "$API_BASE/messages/conversations/4?page=1&limit=50" \
      -H "Authorization: Bearer $TOKEN" \
      -H 'Content-Type: application/json')

    echo "消息列表API响应:"
    echo "$MSG_RESPONSE" | jq '.' 2>/dev/null || echo "$MSG_RESPONSE"
  fi

else
  echo ""
  echo "❌ 注册失败"
  echo "尝试用已知用户登录..."

  LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
    -H 'Content-Type: application/json' \
    -d '{
      "email": "user001@example.com",
      "password": "password123"
    }')

  echo "登录响应:"
  echo "$LOGIN_RESPONSE" | jq '.' 2>/dev/null || echo "$LOGIN_RESPONSE"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 数据库直接查询验证"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 直接查询数据库
mysql -h 127.0.0.1 -u hiking_user -psenbochen hiking_social_db 2>/dev/null << 'SQL_CHECK'
SELECT 'Users' as type, COUNT(*) as count FROM users
UNION
SELECT 'Conversations' as type, COUNT(*) as count FROM conversations
UNION
SELECT 'Messages' as type, COUNT(*) as count FROM messages;
SQL_CHECK

FULL_TEST

echo ""
echo "✅ 完整测试完成！"
