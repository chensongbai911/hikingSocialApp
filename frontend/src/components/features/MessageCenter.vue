<template>
  <div class="message-center">
    <!-- 标签页 -->
    <div class="tabs">
      <div
        class="tab"
        :class="{ active: activeTab === 'conversations' }"
        @click="activeTab = 'conversations'"
      >
        <span>私信</span>
        <span v-if="unreadConversations > 0" class="badge">{{ unreadConversations }}</span>
      </div>
      <div
        class="tab"
        :class="{ active: activeTab === 'notifications' }"
        @click="activeTab = 'notifications'"
      >
        <span>通知</span>
        <span v-if="unreadNotifications > 0" class="badge">{{ unreadNotifications }}</span>
      </div>
      <div
        class="tab"
        :class="{ active: activeTab === 'activity' }"
        @click="activeTab = 'activity'"
      >
        <span>活动消息</span>
        <span v-if="unreadActivity > 0" class="badge">{{ unreadActivity }}</span>
      </div>
    </div>

    <!-- 私信列表 -->
    <div v-if="activeTab === 'conversations'" class="tab-content">
      <div v-if="conversations.length === 0" class="empty">
        <div class="empty-icon">💬</div>
        <p>暂无私信</p>
      </div>
      <div v-else class="conversation-list">
        <div
          v-for="conv in conversations"
          :key="conv.id"
          class="conversation-item"
          @click="openConversation(conv.id)"
        >
          <img
            :src="conv.avatar_url || '/default-avatar.png'"
            :alt="conv.name"
            class="avatar"
          />
          <div class="conversation-info">
            <div class="header">
              <h4 class="name">{{ conv.name }}</h4>
              <span class="time">{{ formatTime(conv.last_message_time) }}</span>
            </div>
            <div class="preview">
              <p class="message">{{ conv.last_message }}</p>
              <span v-if="conv.unread_count && conv.unread_count > 0" class="unread-badge">
                {{ conv.unread_count }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 通知列表 -->
    <div v-if="activeTab === 'notifications'" class="tab-content">
      <div v-if="notifications.length === 0" class="empty">
        <div class="empty-icon">🔔</div>
        <p>暂无通知</p>
      </div>
      <div v-else class="notification-list">
        <div
          v-for="notif in notifications"
          :key="notif.id"
          class="notification-item"
          :class="{ unread: !notif.is_read }"
        >
          <div class="icon" :class="`icon-${notif.type}`">
            {{ getNotificationIcon(notif.type) }}
          </div>
          <div class="notification-content">
            <p class="text">{{ notif.content }}</p>
            <span class="time">{{ formatTime(notif.created_at) }}</span>
          </div>
          <button v-if="!notif.is_read" class="mark-read" @click="markAsRead(notif.id)">
            ✓
          </button>
        </div>
      </div>
    </div>

    <!-- 活动消息 -->
    <div v-if="activeTab === 'activity'" class="tab-content">
      <div v-if="activityMessages.length === 0" class="empty">
        <div class="empty-icon">🎯</div>
        <p>暂无活动消息</p>
      </div>
      <div v-else class="activity-message-list">
        <div
          v-for="msg in activityMessages"
          :key="msg.id"
          class="activity-message-item"
          :class="{ unread: !msg.is_read }"
          @click="handleActivityMessage(msg)"
        >
          <div class="icon" :class="`icon-${msg.type}`">
            {{ getActivityIcon(msg.type) }}
          </div>
          <div class="message-content">
            <h4 class="title">{{ msg.title }}</h4>
            <p class="text">{{ msg.content }}</p>
            <div class="footer">
              <span class="activity-name">{{ msg.activity_name }}</span>
              <span class="time">{{ formatTime(msg.created_at) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { Conversation } from '../../types'

const router = useRouter()

const activeTab = ref<'conversations' | 'notifications' | 'activity'>('conversations')

// 模拟数据 (实际应从store获取)
const conversations = ref<Conversation[]>([
  {
    id: '1',
    name: '张三',
    avatar_url: '',
    last_message: '明天的徒步活动准备好了吗?',
    last_message_time: new Date(Date.now() - 3600000).toISOString(),
    unread_count: 2
  },
  {
    id: '2',
    name: '李四',
    avatar_url: '',
    last_message: '好的,那我们明天见',
    last_message_time: new Date(Date.now() - 7200000).toISOString(),
    unread_count: 0
  }
])

const notifications = ref([
  {
    id: '1',
    type: 'friend',
    content: '王五 接受了你的好友请求',
    created_at: new Date(Date.now() - 1800000).toISOString(),
    is_read: false
  },
  {
    id: '2',
    type: 'system',
    content: '您的账号安全等级已提升',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    is_read: true
  }
])

const activityMessages = ref([
  {
    id: '1',
    type: 'application_approved',
    title: '报名通过',
    content: '您的活动报名申请已通过',
    activity_name: '周末香山徒步',
    activity_id: '1',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    is_read: false
  },
  {
    id: '2',
    type: 'activity_reminder',
    title: '活动提醒',
    content: '活动将在1小时后开始,请做好准备',
    activity_name: '植物园徒步',
    activity_id: '2',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    is_read: false
  },
  {
    id: '3',
    type: 'activity_cancelled',
    title: '活动取消',
    content: '活动因天气原因取消,敬请谅解',
    activity_name: '雨中徒步',
    activity_id: '3',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    is_read: true
  }
])

// 未读数统计
const unreadConversations = computed(() => {
  return conversations.value.reduce((sum, conv) => sum + (conv.unread_count || 0), 0)
})

const unreadNotifications = computed(() => {
  return notifications.value.filter(n => !n.is_read).length
})

const unreadActivity = computed(() => {
  return activityMessages.value.filter(m => !m.is_read).length
})

// 打开对话
const openConversation = (conversationId: string) => {
  router.push(`/chat/${conversationId}`)
}

// 标记为已读
const markAsRead = (notificationId: string) => {
  const notif = notifications.value.find(n => n.id === notificationId)
  if (notif) {
    notif.is_read = true
  }
}

// 处理活动消息点击
const handleActivityMessage = (message: any) => {
  // 标记为已读
  message.is_read = true
  // 跳转到活动详情
  router.push(`/activity/${message.activity_id}`)
}

// 格式化时间
const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`

  return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
}

// 获取通知图标
const getNotificationIcon = (type: string) => {
  const icons: Record<string, string> = {
    friend: '👥',
    system: '⚙️',
    activity: '🎯',
    comment: '💬',
    like: '❤️'
  }
  return icons[type] || '📢'
}

// 获取活动图标
const getActivityIcon = (type: string) => {
  const icons: Record<string, string> = {
    application_approved: '✅',
    application_rejected: '❌',
    activity_reminder: '⏰',
    activity_cancelled: '🚫',
    activity_updated: '📝',
    new_participant: '👋'
  }
  return icons[type] || '🎯'
}

onMounted(() => {
  // TODO: 加载真实数据
})
</script>

<style scoped>
.message-center {
  min-height: 100vh;
  background: #f5f5f5;
}

/* 标签页 */
.tabs {
  display: flex;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.tab {
  flex: 1;
  padding: 16px;
  text-align: center;
  font-size: 15px;
  color: #666;
  cursor: pointer;
  position: relative;
  transition: color 0.3s;
}

.tab.active {
  color: #ff6b00;
  font-weight: 600;
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: #ff6b00;
}

.badge {
  display: inline-block;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  background: #ff4444;
  color: white;
  border-radius: 9px;
  font-size: 11px;
  line-height: 18px;
  margin-left: 4px;
}

/* 内容区域 */
.tab-content {
  padding: 16px;
}

/* 空状态 */
.empty {
  text-align: center;
  padding: 80px 20px;
  color: #999;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

/* 对话列表 */
.conversation-list {
  display: flex;
  flex-direction: column;
}

.conversation-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: white;
  border-radius: 12px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: transform 0.2s;
}

.conversation-item:active {
  transform: scale(0.98);
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 12px;
}

.conversation-info {
  flex: 1;
  min-width: 0;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.name {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
}

.time {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
}

.preview {
  display: flex;
  align-items: center;
  gap: 8px;
}

.message {
  flex: 1;
  font-size: 13px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.unread-badge {
  min-width: 18px;
  height: 18px;
  padding: 0 6px;
  background: #ff6b00;
  color: white;
  border-radius: 9px;
  font-size: 11px;
  line-height: 18px;
  text-align: center;
  font-weight: 500;
}

/* 通知列表 */
.notification-list {
  display: flex;
  flex-direction: column;
}

.notification-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: white;
  border-radius: 12px;
  margin-bottom: 8px;
  transition: background 0.2s;
}

.notification-item.unread {
  background: #fff8f0;
  border-left: 3px solid #ff6b00;
}

.icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-right: 12px;
  flex-shrink: 0;
}

.icon-friend {
  background: #e3f2fd;
}

.icon-system {
  background: #f3e5f5;
}

.icon-activity {
  background: #fff3e0;
}

.notification-content {
  flex: 1;
}

.text {
  font-size: 14px;
  color: #333;
  line-height: 1.5;
  margin-bottom: 4px;
}

.mark-read {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid #e0e0e0;
  background: white;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.mark-read:hover {
  background: #ff6b00;
  color: white;
  border-color: #ff6b00;
}

/* 活动消息 */
.activity-message-list {
  display: flex;
  flex-direction: column;
}

.activity-message-item {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  background: white;
  border-radius: 12px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: transform 0.2s;
}

.activity-message-item.unread {
  background: #fff8f0;
  border-left: 3px solid #ff6b00;
}

.activity-message-item:active {
  transform: scale(0.98);
}

.icon-application_approved {
  background: #e8f5e9;
}

.icon-application_rejected {
  background: #ffebee;
}

.icon-activity_reminder {
  background: #fff3e0;
}

.icon-activity_cancelled {
  background: #f5f5f5;
}

.icon-activity_updated {
  background: #e3f2fd;
}

.message-content {
  flex: 1;
}

.title {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.activity-name {
  font-size: 12px;
  color: #ff6b00;
  font-weight: 500;
}
</style>
