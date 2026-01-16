# 💬 完整社交聊天系统 - 需求分析与方案设计

**需求分析日期**: 2025-01-16
**版本**: v2.0.0
**状态**: 🎯 **详细需求分析**

---

## 📋 核心需求整理

### 用户交互流程图

```
用户A进入用户B的主页
    ↓
【关注流程】
    ├─ 如果未关注 B → 显示 "+ 关注" 按钮
    │   ↓ 点击关注
    │   ├─ 关注成功
    │   └─ 按钮变为 "已关注" + "💬 私信" 按钮
    │
    └─ 如果已关注 B → 显示 "已关注" + "💬 私信" 按钮

【聊天流程】
    ↓
A 点击 "💬 私信" 按钮
    ↓
进入聊天页面
    ↓
【判断关系状态】
    │
    ├─【互相关注】
    │   └─ ✅ 正常聊天（无限制）
    │
    ├─【A 关注 B，B 未关注 A】
    │   ├─ 🔴 受限制聊天
    │   ├─ ⚠️ 显示提示："只能发送3条消息，等待对方关注或回复后可正常聊天"
    │   ├─ 📊 发送计数: 1/3 | 2/3 | 3/3 ❌ 已达上限
    │   └─ 等待对方关注或回复后 → 解除限制
    │
    └─【从未关注】
        └─ ❌ 不允许聊天

【消息列表】
    ↓
    ├─ 未聊天过：为空（显示 "暂无消息" 提示）
    ├─ 有聊天记录：显示对话列表（实时更新）
    └─ 删除历史消息：数据库清空，列表刷新为空
```

---

## 🏗️ 系统架构设计

### 1. 数据库设计（E-R 模型）

#### messages 表（消息表）

```sql
CREATE TABLE messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  conversation_id INT NOT NULL,
  sender_id VARCHAR(50) NOT NULL,
  receiver_id VARCHAR(50) NOT NULL,
  -- 文本消息正文，最长200字符（应用层校验，DB采用VARCHAR以利索引与校验）
  content VARCHAR(200) NULL,
  message_type ENUM('text', 'image', 'file') DEFAULT 'text',
  -- 图片/文件类消息的附件地址与元数据
  attachment_url VARCHAR(1024) NULL,
  attachment_meta JSON NULL,

  -- 已读状态
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP NULL,

  -- 撤回能力（2分钟内），撤回后客户端以“你撤回了一条消息”展示
  is_recalled BOOLEAN DEFAULT FALSE,
  recalled_at TIMESTAMP NULL,
  recalled_by VARCHAR(50) NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (conversation_id) REFERENCES conversations(id),
  FOREIGN KEY (sender_id) REFERENCES users(id),
  FOREIGN KEY (receiver_id) REFERENCES users(id),
  INDEX idx_conversation (conversation_id),
  INDEX idx_sender (sender_id),
  INDEX idx_created_at (created_at),
  INDEX idx_read_at (read_at)
);
```

#### conversations 表（对话表）

```sql
CREATE TABLE conversations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user1_id VARCHAR(50) NOT NULL,
  user2_id VARCHAR(50) NOT NULL,
  last_message_id INT,
  last_message_at TIMESTAMP NULL,
  user1_unread_count INT DEFAULT 0,
  user2_unread_count INT DEFAULT 0,
  is_user1_blocked BOOLEAN DEFAULT FALSE,
  is_user2_blocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE KEY unique_conversation (user1_id, user2_id),
  FOREIGN KEY (last_message_id) REFERENCES messages(id),
  INDEX idx_users (user1_id, user2_id)
);
```

#### message_limits 表（消息限制表）新增

```sql
CREATE TABLE message_limits (
  id INT PRIMARY KEY AUTO_INCREMENT,
  conversation_id INT NOT NULL,
  sender_id VARCHAR(50) NOT NULL,      -- 发送受限方
  receiver_id VARCHAR(50) NOT NULL,    -- 接收方
  message_count INT DEFAULT 0,          -- 已发送消息数（0-3）
  is_limited BOOLEAN DEFAULT TRUE,      -- 是否受限
  limit_reason ENUM(
    'not_mutual_follow',                -- 非互关
    'receiver_not_replied'              -- 对方未回复
  ) DEFAULT 'not_mutual_follow',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY unique_sender_receiver (conversation_id, sender_id),
  INDEX idx_conversation (conversation_id)
);
```

#### user_followers 表（现有，已创建）

```sql
-- 已存在
CREATE TABLE user_followers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  follower_id VARCHAR(50) NOT NULL,
  following_id VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE KEY (follower_id, following_id),
  FOREIGN KEY (follower_id) REFERENCES users(id),
  FOREIGN KEY (following_id) REFERENCES users(id)
);
```

#### user_blacklist 表（黑名单，新增）

```sql
CREATE TABLE user_blacklist (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(50) NOT NULL,
  blocked_user_id VARCHAR(50) NOT NULL,
  reason VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_user_blocked (user_id, blocked_user_id),
  INDEX idx_user (user_id),
  INDEX idx_blocked (blocked_user_id)
);
```

#### message_reports 表（消息举报，新增）

```sql
CREATE TABLE message_reports (
  id INT PRIMARY KEY AUTO_INCREMENT,
  message_id INT NOT NULL,
  reporter_id VARCHAR(50) NOT NULL,
  reason VARCHAR(255) NOT NULL,
  extra JSON NULL,
  status ENUM('pending', 'reviewing', 'resolved', 'rejected') DEFAULT 'pending',
  handled_by VARCHAR(50) NULL,
  handled_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (message_id) REFERENCES messages(id),
  INDEX idx_message (message_id),
  INDEX idx_reporter (reporter_id),
  INDEX idx_status (status)
);
```

#### messages_archive 表（消息归档/审计，可选，新增）

```sql
CREATE TABLE messages_archive (
  id INT PRIMARY KEY AUTO_INCREMENT,
  conversation_id INT NOT NULL,
  original_message_id INT NULL,
  snapshot JSON NOT NULL,
  archived_reason ENUM('conversation_cleared','moderation','other') DEFAULT 'conversation_cleared',
  archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_conv (conversation_id),
  INDEX idx_archived_at (archived_at)
);
```

---

## 🎯 核心业务逻辑

### 1. 关注状态检查

```typescript
// 检查两个用户之间的关系
async function checkFollowRelationship(userId1: string, userId2: string) {
  const isUser1FollowUser2 = await userFollowers.exists({
    follower_id: userId1,
    following_id: userId2,
  })

  const isUser2FollowUser1 = await userFollowers.exists({
    follower_id: userId2,
    following_id: userId1,
  })

  return {
    isMutualFollow: isUser1FollowUser2 && isUser2FollowUser1,
    isUser1FollowUser2,
    isUser2FollowUser1,
    relationshipType:
      isUser1FollowUser2 && isUser2FollowUser1
        ? 'mutual'
        : isUser1FollowUser2
        ? 'one_way'
        : isUser2FollowUser1
        ? 'follower'
        : 'none',
  }
}
```

### 2. 消息发送限制逻辑

```typescript
async function canSendMessage(
  senderId: string,
  receiverId: string,
  conversationId: number
): Promise<{
  canSend: boolean
  reason?: string
  remainingMessages?: number
}> {
  // 1. 检查关注关系
  const relationship = await checkFollowRelationship(senderId, receiverId)

  // 2. 如果互相关注，无限制
  if (relationship.isMutualFollow) {
    return { canSend: true }
  }

  // 3. 如果发送方未关注接收方，完全禁止
  if (!relationship.isUser1FollowUser2) {
    return {
      canSend: false,
      reason: 'must_follow_to_message',
    }
  }

  // 4. 如果只是发送方关注接收方（非互关），检查消息限制
  const limit = await messageLimits.findOne({
    conversation_id: conversationId,
    sender_id: senderId,
  })

  if (!limit) {
    // 第一次聊天，创建限制记录
    await messageLimits.create({
      conversation_id: conversationId,
      sender_id: senderId,
      receiver_id: receiverId,
      message_count: 0,
      is_limited: true,
      limit_reason: 'not_mutual_follow',
    })
    return {
      canSend: true,
      remainingMessages: 3,
    }
  }

  // 已达上限
  if (limit.message_count >= 3) {
    return {
      canSend: false,
      reason: 'message_limit_exceeded',
      remainingMessages: 0,
    }
  }

  return {
    canSend: true,
    remainingMessages: 3 - limit.message_count,
  }
}
```

### 3. 消息发送处理

```typescript
async function sendMessage(
  senderId: string,
  receiverId: string,
  content: string
): Promise<SendMessageResult> {
  // 1. 获取或创建对话
  let conversation = await conversations.findOne({
    $or: [
      { user1_id: senderId, user2_id: receiverId },
      { user1_id: receiverId, user2_id: senderId },
    ],
  })

  if (!conversation) {
    conversation = await conversations.create({
      user1_id: senderId,
      user2_id: receiverId,
    })
  }

  // 2. 检查是否可以发送
  const canSend = await canSendMessage(senderId, receiverId, conversation.id)

  if (!canSend.canSend) {
    throw new Error(canSend.reason)
  }

  // 3. 创建消息
  const message = await messages.create({
    conversation_id: conversation.id,
    sender_id: senderId,
    receiver_id: receiverId,
    content,
    message_type: 'text',
  })

  // 4. 更新消息限制计数
  const relationship = await checkFollowRelationship(senderId, receiverId)
  if (!relationship.isMutualFollow && relationship.isUser1FollowUser2) {
    await messageLimits.update(
      {
        conversation_id: conversation.id,
        sender_id: senderId,
      },
      {
        message_count: { $inc: 1 },
      }
    )
  }

  // 5. 更新对话的最后消息
  await conversations.update(
    { id: conversation.id },
    {
      last_message_id: message.id,
      last_message_at: new Date(),
    }
  )

  // 6. WebSocket 实时推送
  await socketService.emitToUser(receiverId, 'new_message', {
    conversationId: conversation.id,
    message,
  })

  return {
    success: true,
    message,
    remainingMessages: canSend.remainingMessages,
  }
}
```

### 4. 消息限制解除逻辑

```typescript
// 当对方关注了我时 (WebSocket 事件)
async function onUserFollowed(followerId: string, followingId: string) {
  // 检查是否存在对话
  const conversations_list = await conversations.find({
    $or: [
      { user1_id: followerId, user2_id: followingId },
      { user1_id: followingId, user2_id: followerId },
    ],
  })

  for (const conv of conversations_list) {
    // 解除对方之前的消息限制
    await messageLimits.update(
      {
        conversation_id: conv.id,
        sender_id: followingId, // 之前被限制的发送方
      },
      {
        is_limited: false,
        limit_reason: null,
        message_count: 0, // 重置计数
      }
    )
  }
}

// 当对方回复我的消息时 (消息到达时)
async function onMessageReceived(senderId: string, receiverId: string, conversationId: number) {
  // 如果接收方回复了，说明互动开始，解除限制
  const relationship = await checkFollowRelationship(senderId, receiverId)

  if (!relationship.isMutualFollow && relationship.isUser2FollowUser1) {
    // receiverId 没有关注 senderId，但 senderId 关注了 receiverId
    // 现在 receiverId 回复了消息，说明有互动开始
    await messageLimits.update(
      {
        conversation_id: conversationId,
        sender_id: senderId,
      },
      {
        is_limited: false,
        limit_reason: 'receiver_replied',
        message_count: 0,
      }
    )
  }
}
```

---

## 🔒 约束与策略（结合新需求）

- 消息长度：
  - 文本消息最大 200 字符；服务端在创建/更新时校验，超长返回 400 错误码 `message_too_long`。
  - 图片/文件消息可附带文本说明，同样不超过 200 字符。
- 清空消息后的历史：
  - `DELETE /conversations/:id` 触发“软清空”：当前消息物理删除前，将整段会话消息快照写入 `messages_archive`，仅供后台审计查询；普通用户清空后不可见。
  - 归档保留期建议 90 天（可配置）。
- 头像与图片上传：
  - 单文件大小 ≤ 10MB；校验 MIME 与扩展名；图片限 `jpg/png/webp`。
  - 图片消息通过 `attachment_url` 存储，必要的宽高、大小等写入 `attachment_meta`。
- 打字状态：
  - 仅通过 WebSocket 广播 `typing` 事件，payload `{ conversationId, fromUserId, isTyping: boolean }`；不持久化。
- 已读回执：
  - 进入会话或拉取消息时批量 `markRead`；逐条也可 PATCH；通过 `message_read` 事件通知对端更新“已读”。
- Emoji 支持：
  - DB 与连接字符集需为 `utf8mb4`，避免表情四字节截断；前端使用原生 Emoji 选择器或第三方组件。
- 撤回消息：
  - 允许在发送后 2 分钟内撤回；服务端校验 `NOW() - created_at <= 120s`；撤回后设置 `is_recalled=true` 并广播 `message_recalled`。
- 举报功能：
  - `POST /messages/:id/report` 写入 `message_reports`，后台流转状态；对被举报方无即时影响（除非命中风控策略）。
- 黑名单：
  - `user_blacklist` 持久化；被拉黑后双方不可发起或继续聊天；在会话顶部显示显著横幅，并禁用输入与发送按钮。

---

## 🎨 前端 UI/UX 设计

### 1. UserProfile 页面改进

```vue
<!-- 用户资料页 - 底部操作按钮 -->
<template>
  <div class="profile-actions">
    <!-- 当前用户是自己 -->
    <div v-if="isOwnProfile" class="actions-own">
      <button class="btn-edit-profile">编辑资料</button>
    </div>

    <!-- 当前用户是他人 -->
    <div v-else class="actions-other">
      <!-- 第一阶段：未关注 -->
      <template v-if="!isFollowing && !hasBlocked">
        <button class="btn-follow btn-primary" @click="handleFollow" :disabled="followLoading">
          {{ followLoading ? '处理中...' : '+ 关注' }}
        </button>
      </template>

      <!-- 第二阶段：已关注 -->
      <template v-else-if="isFollowing">
        <button class="btn-message btn-primary" @click="goToChatWith(userId)">💬 私信</button>

        <button class="btn-unfollow btn-secondary" @click="handleUnfollow">已关注</button>
      </template>

      <!-- 被屏蔽 -->
      <template v-else-if="hasBlocked">
        <button disabled class="btn-blocked">已屏蔽</button>
      </template>
    </div>
  </div>
</template>

<style scoped>
.profile-actions {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: white;
  border-top: 1px solid #eee;
}

.btn-follow {
  flex: 1;
  padding: 12px;
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.btn-message {
  flex: 1;
  padding: 12px;
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  color: white;
}

.btn-unfollow {
  padding: 12px 16px;
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}
</style>
```

### 2. MessageCenter 聊天列表页面

```vue
<!-- 消息中心 - 对话列表 -->
<template>
  <div class="message-center">
    <!-- 头部 -->
    <div class="header">
      <h1>消息</h1>
      <button class="btn-options">⋮</button>
    </div>

    <!-- 搜索框 -->
    <div class="search-bar">
      <input v-model="searchQuery" placeholder="搜索对话..." class="search-input" />
    </div>

    <!-- 对话列表 -->
    <div class="conversations-list">
      <!-- 空状态 -->
      <div v-if="conversations.length === 0" class="empty-state">
        <div class="empty-icon">💬</div>
        <p class="empty-title">暂无消息</p>
        <p class="empty-desc">与朋友开始聊天，消息会显示在这里</p>
      </div>

      <!-- 对话项 -->
      <div
        v-for="conv in conversations"
        :key="conv.id"
        class="conversation-item"
        @click="openConversation(conv.id)"
      >
        <!-- 头像 -->
        <img :src="conv.otherUser.avatar" class="avatar" />

        <!-- 内容 -->
        <div class="content">
          <div class="header-line">
            <h3 class="name">{{ conv.otherUser.nickname }}</h3>
            <span class="time">{{ formatTime(conv.lastMessageAt) }}</span>
          </div>

          <p class="last-message">
            {{ conv.lastMessage }}
            <span v-if="conv.isLimited" class="badge-limited"> (受限) </span>
          </p>
        </div>

        <!-- 未读数 -->
        <div v-if="conv.unreadCount > 0" class="unread-badge">
          {{ conv.unreadCount }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { messageApi } from '@/api'

const conversations = ref([])
const searchQuery = ref('')

onMounted(async () => {
  await loadConversations()
})

async function loadConversations() {
  try {
    const res = await messageApi.getConversations()
    if (res.code === 200) {
      // 过滤出有消息记录的对话
      conversations.value = res.data.filter((c) => c.messageCount > 0)
    }
  } catch (error) {
    console.error('加载对话失败:', error)
  }
}

function openConversation(conversationId) {
  router.push(`/chat/${conversationId}`)
}
</script>

<style scoped>
.message-center {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f9fafb;
}

.conversations-list {
  flex: 1;
  overflow-y: auto;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #9ca3af;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.conversation-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: background 0.2s;
}

.conversation-item:hover {
  background: #f3f4f6;
}

.badge-limited {
  color: #f59e0b;
  font-size: 12px;
}
</style>
```

### 3. ChatWindow 聊天详情页面

```vue
<!-- 聊天窗口 -->
<template>
  <div class="chat-window">
    <!-- 头部 -->
    <div class="chat-header">
      <div class="user-info">
        <img :src="otherUser.avatar" class="avatar" />
        <div>
          <h2>{{ otherUser.nickname }}</h2>
          <p class="status" :class="{ online: isOnline }">
            {{ isOnline ? '在线' : '离线' }}
          </p>
        </div>
      </div>
      <button class="btn-more">⋮</button>
    </div>

    <!-- 消息提示（受限时显示） -->
    <div v-if="isMessageLimited" class="message-limit-banner">
      <span class="icon">⚠️</span>
      <span class="text"> 只能发送 {{ remainingMessages }}/3 条消息 </span>
      <span class="hint"> 等待对方关注或回复消息后可正常聊天 </span>
    </div>

    <!-- 消息列表 -->
    <div class="messages-container">
      <div
        v-for="message in messages"
        :key="message.id"
        class="message"
        :class="[message.senderId === currentUserId ? 'sent' : 'received']"
      >
        <img :src="message.senderAvatar" class="message-avatar" />
        <div class="message-content">
          <div class="message-bubble">
            {{ message.content }}
          </div>
          <span class="message-time">
            {{ formatTime(message.createdAt) }}
          </span>
        </div>
      </div>
    </div>

    <!-- 输入框 -->
    <div class="message-input-area">
      <!-- 输入被禁用的提示 -->
      <div v-if="!canSendMessage" class="input-disabled-banner">
        <p>🔒 消息已达上限，请等待对方关注或回复</p>
      </div>

      <!-- 输入框 -->
      <div v-else class="input-wrapper">
        <textarea
          v-model="messageContent"
          placeholder="输入消息..."
          class="message-textarea"
          @keydown.enter.ctrl="sendMessage"
        />

        <div class="input-actions">
          <button class="btn-emoji">😊</button>
          <button class="btn-image">🖼️</button>
          <button
            class="btn-send"
            @click="sendMessage"
            :disabled="!messageContent.trim() || sendLoading"
          >
            {{ sendLoading ? '...' : '发送' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { messageApi, userApi } from '@/api'

const conversationId = ref(null)
const messages = ref([])
const messageContent = ref('')
const sendLoading = ref(false)
const isMessageLimited = ref(false)
const canSendMessage = ref(true)
const remainingMessages = ref(3)
const otherUser = ref(null)

onMounted(async () => {
  conversationId.value = route.params.id
  await loadMessages()
  await loadConversationInfo()
})

async function loadMessages() {
  try {
    const res = await messageApi.getMessages(conversationId.value)
    if (res.code === 200) {
      messages.value = res.data
    }
  } catch (error) {
    console.error('加载消息失败:', error)
  }
}

async function loadConversationInfo() {
  try {
    const res = await messageApi.getConversationInfo(conversationId.value)
    if (res.code === 200) {
      otherUser.value = res.data.otherUser
      isMessageLimited.value = res.data.isLimited
      canSendMessage.value = res.data.canSend
      remainingMessages.value = res.data.remainingMessages
    }
  } catch (error) {
    console.error('加载对话信息失败:', error)
  }
}

async function sendMessage() {
  if (!messageContent.value.trim()) return

  try {
    sendLoading.value = true
    const res = await messageApi.sendMessage(conversationId.value, {
      content: messageContent.value,
    })

    if (res.code === 200) {
      messages.value.push(res.data.message)
      messageContent.value = ''

      // 更新剩余消息数
      if (res.data.remainingMessages !== undefined) {
        remainingMessages.value = res.data.remainingMessages
        if (remainingMessages.value === 0) {
          canSendMessage.value = false
          toast.warning('已达消息上限，等待对方回复')
        }
      }

      // 滚动到底部
      scrollToBottom()
    }
  } catch (error) {
    toast.error(error.message || '发送失败')
  } finally {
    sendLoading.value = false
  }
}
</script>

<style scoped>
.chat-window {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.message-limit-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fef3c7;
  color: #92400e;
  border-bottom: 1px solid #fcd34d;
}

.message {
  display: flex;
  margin: 8px 0;
  gap: 8px;
}

.message.sent {
  flex-direction: row-reverse;
  margin-left: auto;
  width: fit-content;
}

.message.received {
  margin-right: auto;
}

.message-bubble {
  padding: 10px 14px;
  border-radius: 16px;
  word-wrap: break-word;
  max-width: 300px;
}

.message.sent .message-bubble {
  background: #14b8a6;
  color: white;
  border-radius: 16px 4px 16px 16px;
}

.message.received .message-bubble {
  background: #e5e7eb;
  color: #1f2937;
  border-radius: 4px 16px 16px 16px;
}

.input-disabled-banner {
  padding: 12px;
  background: #fee2e2;
  color: #991b1b;
  text-align: center;
}

.message-textarea {
  flex: 1;
  padding: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  resize: none;
  max-height: 100px;
}
</style>
```

---

## 🔌 API 端点设计

### 1. 获取对话列表

```typescript
GET /api/v1/messages/conversations

Response:
{
  code: 200,
  data: [
    {
      id: 1,
      otherUserId: "user-002",
      otherUser: {
        id: "user-002",
        nickname: "张三",
        avatar: "http://..."
      },
      lastMessage: "你好吗？",
      lastMessageAt: "2025-01-16T10:30:00Z",
      unreadCount: 2,
      isLimited: false,      // 是否受限制
      remainingMessages: 3   // 剩余消息数（0-3）
    }
  ]
}
```

### 2. 获取对话信息和聊天限制状态

```typescript
GET /api/v1/messages/conversations/:conversationId/info

Response:
{
  code: 200,
  data: {
    conversationId: 1,
    otherUser: {...},
    isLimited: true,           // 是否受限
    limitReason: "not_mutual_follow",  // 受限原因
    messageCount: 2,           // 已发送消息数
    remainingMessages: 1,      // 剩余消息数
    canSend: true,            // 是否可以发送
    relationshipType: "one_way"  // 关系类型
  }
}
```

### 3. 获取消息列表

```typescript
GET /api/v1/messages/conversations/:conversationId/messages?page=1&limit=20

Response:
{
  code: 200,
  data: [
    {
      id: 1,
      conversationId: 1,
      senderId: "user-001",
      senderAvatar: "http://...",
      receiverId: "user-002",
      content: "你好",
      messageType: "text",
      isRead: true,
      createdAt: "2025-01-16T10:00:00Z"
    }
  ]
}
```

### 4. 发送消息

```typescript
POST /api/v1/messages/conversations/:conversationId/messages

Request:
{
  content: "消息内容",
  messageType: "text"
}

Response:
{
  code: 200,
  data: {
    message: {
      id: 2,
      conversationId: 1,
      senderId: "user-001",
      content: "消息内容",
      createdAt: "2025-01-16T10:30:00Z"
    },
    remainingMessages: 2,  // 剩余可发送消息数（受限时）
    canContinue: true      // 是否还能继续发送
  }
}
```

### 5. 清空对话历史（含归档）

```typescript
DELETE /api/v1/messages/conversations/:conversationId

Response:
{
  code: 200,
  message: "对话历史已清空并归档"
}
```

### 6. 撤回消息（2 分钟内）

```typescript
POST /api/v1/messages/:messageId/recall

Response:
{
  code: 200,
  data: { messageId: 123, recalledAt: "2026-01-16T10:00:00Z" }
}
```

### 7. 举报消息

```typescript
POST /api/v1/messages/:messageId/report

Request: { reason: string, extra?: object }

Response: { code: 200, message: '已接收举报' }
```

### 8. 黑名单管理

```typescript
POST   /api/v1/blacklist/:targetUserId
DELETE /api/v1/blacklist/:targetUserId
GET    /api/v1/blacklist
```

### 9. 上传图片（消息/头像复用，网关或独立模块）

```typescript
POST /api/v1/uploads/image  // 限制 10MB、校验 MIME

Response: { code: 200, data: { url, width, height, size } }
```

---

## 🔄 WebSocket 实时事件

### 1. 接收新消息

```typescript
socket.on('new_message', (data) => {
  {
    conversationId: 1,
    message: {
      id: 2,
      content: "消息内容",
      senderId: "user-002",
      createdAt: "2025-01-16T10:30:00Z"
    }
  }
});
```

### 2. 消息已读

```typescript
socket.on('message_read', (data) => {
  {
    conversationId: 1,
    messageId: 1,
    readAt: "2025-01-16T10:31:00Z"
  }
});
```

### 3. 对方关注了你

```typescript
socket.on('user_followed', (data) => {
  {
    followerId: "user-002",
    follower: {
      nickname: "张三",
      avatar: "http://..."
    },
    message: "用户 张三 关注了你"
  }
  // 此时，如果你们有对话，消息限制应该解除
});
```

### 4. 对方回复了消息

```typescript
socket.on('message_replied', (data) => {
  {
    conversationId: 1,
    repliedMessage: {
      id: 1,
      content: "你的消息内容"
    },
    replyMessage: {
      id: 2,
      content: "对方的回复"
    }
  }
  // 此时消息限制应该解除
});
```

### 5. 正在输入（新增）

```typescript
socket.emit('typing', { conversationId, isTyping: true })
// 服务器转发给会话对端
socket.on('typing', { conversationId, fromUserId, isTyping })
```

### 6. 消息被撤回（新增）

```typescript
socket.on('message_recalled', { messageId, conversationId, recalledAt })
```

### 7. 黑名单更新（新增）

```typescript
socket.on('blacklist_updated', { userId, targetUserId, action })
```

---

## 🗄️ 后端服务设计

### 1. MessageService - 消息业务逻辑

```typescript
class MessageService {
  // 获取对话列表
  async getConversations(userId: string, page: number, limit: number) {
    // 1. 查询用户的所有对话
    // 2. 获取每个对话的最后消息、未读数、限制状态
    // 3. 排序（最新消息优先）
    // 4. 分页返回
  }

  // 获取对话信息
  async getConversationInfo(userId: string, conversationId: number) {
    // 1. 查询对话
    // 2. 检查关注关系
    // 3. 检查消息限制状态
    // 4. 返回对话信息和限制状态
  }

  // 获取消息列表
  async getMessages(conversationId: number, page: number, limit: number) {
    // 1. 查询消息
    // 2. 标记为已读
    // 3. 按时间排序
    // 4. 分页返回
  }

  // 发送消息
  async sendMessage(senderId: string, receiverId: string, content: string) {
    // 1. 检查能否发送
    // 2. 创建消息
    // 3. 更新对话
    // 4. 更新限制计数
    // 5. WebSocket 推送
  }

  // 检查消息限制
  async checkMessageLimit(conversationId: number, senderId: string) {
    // 返回是否受限、剩余消息数等
  }

  // 解除消息限制
  async unlimitMessage(conversationId: number, senderId: string) {
    // 用户关注、或对方回复后调用
  }

  // 清空对话
  async clearConversation(conversationId: number) {
    // 删除所有消息和限制记录
  }
}
```

### 2. 关注状态变化处理

```typescript
// 当用户被关注时
async function onUserFollowed(followerId: string, followingId: string) {
  // 1. 查找所有包含这两个用户的对话
  // 2. 解除对话中的消息限制
  // 3. 广播 WebSocket 事件通知双方
}

// 当用户回复消息时
async function onMessageReceived(conversationId: number) {
  // 1. 检查对话中是否有消息限制
  // 2. 解除限制
  // 3. 通知发送方
}
```

---

## 🧪 测试场景

### 场景 1: A 关注 B，A 可以给 B 发 3 条消息

```
1. A 关注 B
2. A 进入 B 的主页
3. A 看到 "💬 私信" 按钮
4. A 点击进入聊天
5. 显示提示："只能发送 3/3 条消息"
6. A 发送 1 条消息 → "2/3 条消息"
7. A 发送 2 条消息 → "1/3 条消息"
8. A 发送 3 条消息 → "0/3 条消息，已达上限"
9. A 无法继续发送
10. 等待 B 关注 A 或 B 回复消息 → 限制解除
```

### 场景 2: A 和 B 互相关注，可以正常聊天

```
1. A 关注 B
2. B 也关注 A
3. A 进入 B 的主页
4. 显示 "已关注" 和 "💬 私信"
5. A 进入聊天
6. 显示 "正常聊天"（无限制提示）
7. A 可以无限发送消息
```

### 场景 3: A 未关注 B，无法聊天

```
1. A 未关注 B
2. A 进入 B 的主页
3. 只显示 "+ 关注" 按钮，无 "💬 私信"
```

### 场景 4: 清空聊天记录

```
1. A 和 B 有对话历史
2. 消息列表中显示对话
3. A 选择 "清空对话"
4. 所有消息被删除
5. 消息列表清空或该对话消失
```

### 场景 5: 撤回消息

```
1. A 发送一条文本消息
2. 30 秒内执行撤回接口 → 成功，展示“你撤回了一条消息”
3. 超过 2 分钟再次尝试 → 返回错误 `recall_window_closed`
```

### 场景 6: 图片消息与大小限制

```
1. A 选择 12MB 图片上传 → 前端/后端均拦截并提示“超出 10MB”
2. A 选择 2MB PNG → 上传成功，消息携带 attachment_url 与 meta
```

### 场景 7: 黑名单拦截

```
1. A 将 B 加入黑名单
2. B 尝试进入与 A 的会话 → 顶部横幅“已被对方拉黑”，输入区域禁用
3. B 通过 API 发送消息 → 返回 403 `blocked_by_recipient`
```

### 场景 8: 清空对话并可审计

```
1. A 清空与 B 的会话
2. 前端对话与消息消失
3. 后端验证 messages_archive 存在该会话归档快照
```

---

## 📱 交互流程时序图

```
用户A                        服务器                        用户B
  │                            │                             │
  ├─────关注用户B──────────────>│                             │
  │                            ├────→ 创建/更新关注关系      │
  │<────成功响应────────────────┤                             │
  │                            │ ◄──────【WebSocket事件】────┤
  │◄────用户被关注通知──────────┤                             │
  │                            │                             │
  ├─────进入B的个人主页────────>│                             │
  │<────返回个人信息────────────┤                             │
  │   (显示"💬私信"按钮)      │                             │
  │                            │                             │
  ├─────点击"💬私信"──────────>│                             │
  │                            ├────→ 创建/获取对话          │
  │                            ├────→ 检查关注关系           │
  │                            ├────→ 检查消息限制状态       │
  │<────返回对话信息(受限)─────┤                             │
  │   (显示"只能发送3条消息") │                             │
  │                            │                             │
  ├─────发送消息(1/3)─────────>│                             │
  │<────消息已保存─────────────┤                             │
  │                            ├───→【WebSocket事件】───────>│
  │                            │    (新消息通知)             │
  │<────返回成功(还剩2/3)──────┤    (显示新消息)             │
  │                            │                             │
  │   ...重复2/3...            │                             │
  │                            │                             │
  ├─────尝试发送第4条消息─────>│                             │
  │<─────错误:已达上限─────────┤                             │
  │   (显示"已达上限"提示)    │                             │
  │                            │                             │
  │                            │◄─────【B回复消息】──────────┤
  │                            ├───→【解除限制事件】────────>│
  │◄────通知:限制已解除────────┤                             │
  │   (现在可以继续发送)      │                             │
  │                            │                             │
  └────────────────────────────┘─────────────────────────────┘
```

---

## 📊 实现优先级

### Phase 1: 核心聊天功能 (第一周)

- [ ] 创建 message_limits 表
- [ ] 实现消息发送限制逻辑
- [ ] 实现消息历史清空功能
- [ ] 前端 ChatWindow 页面 UI
- [ ] API 端点实现
- [ ] 基本测试

### Phase 2: 完整集成 (第二周)

- [ ] 关注状态变化时自动解除限制
- [ ] 对方回复时自动解除限制
- [ ] WebSocket 实时通知
- [ ] 前端消息列表实时更新
- [ ] 完整测试用例

### Phase 3: 优化和扩展 (第三周)

- [ ] 消息搜索功能
- [ ] 消息预览
- [ ] 表情包支持
- [ ] 图片上传
- [ ] 性能优化

新增（本次需求补充）：

- [ ] 文本消息 200 字限制与服务端校验
- [ ] 图片上传 10MB 校验（前后端）
- [ ] 打字状态 WebSocket 事件
- [ ] 已读回执批量/逐条接口
- [ ] 撤回消息（2 分钟窗口）
- [ ] 举报消息与后台流转
- [ ] 黑名单管理与聊天拦截
- [ ] 会话清空归档（messages_archive）

---

## 🔐 安全考虑

1. **防止 API 滥用**: 速率限制
2. **隐私保护**: 只能给关注者发送消息
3. **数据验证**: 所有输入都要验证
4. **错误处理**: 敏感错误不暴露给用户
5. **存储安全**: 上传文件校验 MIME、扩展名与内容签名；生成防直链 URL 或签名 URL；开启病毒扫描（如集成 ClamAV）。
6. **权限隔离**: 举报与归档仅管理员可查；黑名单仅私有可见。

---

## 📈 性能考虑

1. **消息分页**: 避免一次加载大量消息
2. **缓存**: 缓存对话列表和用户信息
3. **索引**: 数据库查询优化
4. **WebSocket**: 使用消息队列避免堵塞
5. **字符集**: MySQL 与连接字符串设置为 `utf8mb4`，避免 Emoji 截断；必要字段建前缀索引。

---

## ✅ 需求验证清单

- [x] 个人主页显示关注按钮
- [x] 关注后显示私信按钮
- [x] 非互关时消息限制为 3 条
- [x] 达上限时无法继续发送
- [x] 对方关注/回复后解除限制
- [x] 消息列表为空时显示提示
- [x] 清空聊天数据功能
- [x] WebSocket 实时推送
- [x] 完整的错误处理
- [ ] 文本消息不超过 200 字
- [ ] 图片消息大小限制 10MB
- [ ] 显示“对方正在输入...”
- [ ] 显示已读/未读状态
- [ ] 消息 2 分钟内可撤回
- [ ] 支持消息举报
- [ ] 黑名单拦截与显著标识

---

**这是一个完整的社交聊天系统设计，涵盖产品、设计和开发的所有方面。**

准备好开始实现了吗？ 🚀
