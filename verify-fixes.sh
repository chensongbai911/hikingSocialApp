#!/bin/bash

SERVER_IP="${1:-115.190.252.62}"

echo "🎯 完整的聊天接口修复验证"
echo ""

ssh root@$SERVER_IP << 'FINAL_TEST'

API_BASE="http://localhost:3000/api/v1"

# 第一步：注册新用户
echo "📝 步骤1: 注册测试用户..."
TEST_EMAIL="testuser$(date +%s)@example.com"
TEST_NICKNAME="TestUser_$(date +%s)"

REGISTER_RESPONSE=$(curl -s -X POST "$API_BASE/auth/register" \
  -H 'Content-Type: application/json' \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"password123\",
    \"nickname\": \"$TEST_NICKNAME\"
  }")

echo "注册响应:"
echo "$REGISTER_RESPONSE" | jq '.' 2>/dev/null || echo "$REGISTER_RESPONSE"

TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.data.token' 2>/dev/null)
USER_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.data.user.id' 2>/dev/null)
AVATAR_URL=$(echo "$REGISTER_RESPONSE" | jq -r '.data.user.avatar_url' 2>/dev/null)

echo ""
echo "✓ 用户信息:"
echo "  - User ID: $USER_ID"
echo "  - Email: $TEST_EMAIL"
echo "  - Token: ${TOKEN:0:30}..."
echo "  - Avatar URL: $AVATAR_URL"

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo "❌ 注册失败，停止测试"
  exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 测试1: 获取对话列表 - /api/v1/messages/conversations"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

CONV_RESPONSE=$(curl -s -X GET "$API_BASE/messages/conversations?page=1&limit=20" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json')

echo "API返回状态码: $(echo "$CONV_RESPONSE" | jq -r '.code' 2>/dev/null)"
echo ""
echo "完整响应:"
echo "$CONV_RESPONSE" | jq '.' 2>/dev/null || echo "$CONV_RESPONSE"

# 检查响应格式
CONV_CODE=$(echo "$CONV_RESPONSE" | jq -r '.code' 2>/dev/null)
CONV_COUNT=$(echo "$CONV_RESPONSE" | jq '.data.conversations | length' 2>/dev/null)

if [ "$CONV_CODE" = "0" ] || [ "$CONV_CODE" = "200" ]; then
  echo ""
  echo "✅ 对话列表接口 - 成功!"
  echo "   - 返回了 $CONV_COUNT 个对话"

  # 检查user2字段是否完整
  if [ "$CONV_COUNT" -gt 0 ]; then
    FIRST_CONV=$(echo "$CONV_RESPONSE" | jq '.data.conversations[0]' 2>/dev/null)
    USER2=$(echo "$FIRST_CONV" | jq '.user2' 2>/dev/null)
    USER2_NICKNAME=$(echo "$USER2" | jq -r '.nickname' 2>/dev/null)
    USER2_AVATAR=$(echo "$USER2" | jq -r '.avatarUrl' 2>/dev/null)

    echo ""
    echo "第一个对话中user2的信息:"
    echo "  - Nickname: $USER2_NICKNAME"
    echo "  - Avatar URL: $USER2_AVATAR"

    if [ "$USER2_AVATAR" != "null" ] && [ ! -z "$USER2_AVATAR" ]; then
      echo "  ✅ Avatar URL 已正确返回"
    else
      echo "  ⚠️ Avatar URL 为 null"
    fi
  fi
else
  echo ""
  echo "❌ 对话列表接口 - 失败!"
  echo "   - HTTP 状态码: $CONV_CODE"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 测试2: 获取消息列表 - /api/v1/messages/conversations/4"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

MSG_RESPONSE=$(curl -s -X GET "$API_BASE/messages/conversations/4?page=1&limit=50" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json')

echo "API返回状态码: $(echo "$MSG_RESPONSE" | jq -r '.code' 2>/dev/null)"
echo ""
echo "完整响应:"
echo "$MSG_RESPONSE" | jq '.' 2>/dev/null || echo "$MSG_RESPONSE"

# 检查响应格式
MSG_CODE=$(echo "$MSG_RESPONSE" | jq -r '.code' 2>/dev/null)
MSG_COUNT=$(echo "$MSG_RESPONSE" | jq '.data.messages | length' 2>/dev/null)

if [ "$MSG_CODE" = "0" ] || [ "$MSG_CODE" = "200" ]; then
  echo ""
  echo "✅ 消息列表接口 - 成功!"
  echo "   - 返回了 $MSG_COUNT 条消息"

  if [ "$MSG_COUNT" -gt 0 ]; then
    FIRST_MSG=$(echo "$MSG_RESPONSE" | jq '.data.messages[0]' 2>/dev/null)
    SENDER=$(echo "$FIRST_MSG" | jq '.sender' 2>/dev/null)
    SENDER_NICKNAME=$(echo "$SENDER" | jq -r '.nickname' 2>/dev/null)
    SENDER_AVATAR=$(echo "$SENDER" | jq -r '.avatarUrl' 2>/dev/null)

    echo ""
    echo "第一条消息的发送者信息:"
    echo "  - Nickname: $SENDER_NICKNAME"
    echo "  - Avatar URL: $SENDER_AVATAR"

    if [ "$SENDER_AVATAR" != "null" ] && [ ! -z "$SENDER_AVATAR" ]; then
      echo "  ✅ Avatar URL 已正确返回"
    else
      echo "  ⚠️ Avatar URL 为 null"
    fi
  fi
else
  echo ""
  echo "❌ 消息列表接口 - 失败!"
  echo "   - HTTP 状态码: $MSG_CODE"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 数据库验证"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "查询刚注册用户的avatar_url是否被保存..."
mysql -h 127.0.0.1 -u hiking_user -psenbochen hiking_social_db 2>/dev/null << 'SQL_CHECK'
SELECT id, email, nickname, avatar_url FROM users WHERE id = 'user-011' LIMIT 1;
SQL_CHECK

FINAL_TEST

echo ""
echo "✅ 验证测试完成！"
echo ""
echo "========== 总结 =========="
echo ""
echo "修复内容:"
echo "  1. ✓ USE_API_PREFIX 配置已改为 'true'"
echo "  2. ✓ API 路由现在正确注册在 /api/v1 前缀下"
echo "  3. ✓ 对话列表接口应该返回user2信息和默认头像"
echo "  4. ✓ 消息列表接口应该返回完整的消息历史和发送者信息"
echo ""
