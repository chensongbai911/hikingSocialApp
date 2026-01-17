#!/bin/bash

# ===================================================================
# 🔧 诊断聊天接口问题
# ===================================================================

SERVER_IP="${1:-115.190.252.62}"

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   🔧 诊断聊天接口问题                                      ║"
echo "║   服务器: $SERVER_IP"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# 首先登录获取token
echo "1️⃣ 登录获取 token..."

LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user1@test.com",
    "password": "password123"
  }')

echo "登录响应:"
echo "$LOGIN_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$LOGIN_RESPONSE"

# 提取 token
TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('token', ''))" 2>/dev/null)
USER_ID=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('user', {}).get('id', ''))" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo "❌ 登录失败，无法获取token"
  exit 1
fi

echo ""
echo "✅ 登录成功"
echo "   Token: ${TOKEN:0:20}..."
echo "   User ID: $USER_ID"

echo ""
echo "2️⃣ 测试对话列表接口..."
echo "   URL: GET /api/v1/messages/conversations?page=1&limit=20"
echo ""

CONV_RESPONSE=$(curl -s -X GET "http://localhost:3000/api/v1/messages/conversations?page=1&limit=20" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "对话列表响应:"
echo "$CONV_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$CONV_RESPONSE"

# 提取第一个对话的ID
CONV_ID=$(echo "$CONV_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); convs = data.get('data', {}).get('conversations', []); print(convs[0].get('id', 4) if convs else 4)" 2>/dev/null)

echo ""
echo "3️⃣ 测试聊天历史接口..."
echo "   URL: GET /api/v1/messages/conversations/$CONV_ID?page=1&limit=50"
echo ""

MSG_RESPONSE=$(curl -s -X GET "http://localhost:3000/api/v1/messages/conversations/$CONV_ID?page=1&limit=50" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "聊天历史响应:"
echo "$MSG_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$MSG_RESPONSE"

echo ""
echo "4️⃣ 详细分析"
echo ""

# 分析对话列表
CONV_COUNT=$(echo "$CONV_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); convs = data.get('data', {}).get('conversations', []); print(len(convs))" 2>/dev/null)
echo "对话数量: $CONV_COUNT"

if [ "$CONV_COUNT" -gt 0 ]; then
  echo ""
  echo "第一个对话详情:"
  echo "$CONV_RESPONSE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
conv = data.get('data', {}).get('conversations', [])[0] if data.get('data', {}).get('conversations') else {}
print(f\"  ID: {conv.get('id')}\")
print(f\"  User1: {conv.get('user1')}\")
print(f\"  User2: {conv.get('user2')}\")
print(f\"  最后消息: {conv.get('lastMessageContent')}\")
" 2>/dev/null
fi

# 分析消息列表
MSG_COUNT=$(echo "$MSG_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); msgs = data.get('data', {}).get('messages', []); print(len(msgs))" 2>/dev/null)
echo ""
echo "消息数量: $MSG_COUNT"

if [ "$MSG_COUNT" -gt 0 ]; then
  echo ""
  echo "第一条消息详情:"
  echo "$MSG_RESPONSE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
msg = data.get('data', {}).get('messages', [])[0] if data.get('data', {}).get('messages') else {}
print(f\"  ID: {msg.get('id')}\")
print(f\"  发送者: {msg.get('sender')}\")
print(f\"  内容: {msg.get('content')}\")
print(f\"  创建时间: {msg.get('createdAt')}\")
" 2>/dev/null
fi

echo ""
echo "✅ 诊断完成"
echo ""
