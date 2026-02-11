<template>
  <div class="message-center">
    <!-- 标签页 -->
    <div class="tabs">
      <div
        class="tab"
        :class="{ active: activeTab === 'conversations' }"
        @click="handleTabChange('conversations')"
      >
        <span>私信</span>
        <span v-if="unreadConversations > 0" class="badge">{{ unreadConversations }}</span>
      </div>
      <div
        class="tab"
        :class="{ active: activeTab === 'notifications' }"
        @click="handleTabChange('notifications')"
      >
        <span>通知</span>
        <span v-if="unreadNotifications > 0" class="badge">{{ unreadNotifications }}</span>
      </div>
      <div
        class="tab"
        :class="{ active: activeTab === 'activity' }"
        @click="handleTabChange('activity')"
      >
        <span>活动消息</span>
        <span v-if="unreadActivity > 0" class="badge">{{ unreadActivity }}</span>
      </div>
    </div>

    <!-- 私信列表 -->
    <div v-if="activeTab === 'conversations'" class="tab-content">
      <!-- 加载状态 -->
      <div v-if="loadingConversations" class="loading-container">
        <div class="spinner"></div>
        <p>加载对话中...</p>
      </div>

      <!-- 空状态 -->
      <div v-else-if="conversations.length === 0" class="empty">
        <div class="empty-icon">💬</div>
        <p>暂无私信</p>
      </div>

      <!-- 对话列表 -->
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
            @error="handleAvatarError"
          />
          <div class="conversation-info">
            <div class="header">
              <h4 class="name">{{ conv.name }}</h4>
              <span class="time">{{ formatTime(conv.last_message_time) }}</span>
            </div>
            <div class="preview">
              <p class="message">{{ conv.last_message || '暂无消息' }}</p>
              <span v-if="conv.unread_count && conv.unread_count > 0" class="unread-badge">
                {{ conv.unread_count }}
              </span>
            </div>
          </div>
          <!-- 删除按钮 -->
          <button
            class="delete-btn"
            @click.stop="deleteConversation(conv.id)"
            title="删除对话"
          >
            ✕
          </button>
        </div>
      </div>
    </div>

    <!-- 通知列表 -->
    <div v-if="activeTab === 'notifications'" class="tab-content">
      <!-- 加载状态 -->
      <div v-if="loadingNotifications" class="loading-container">
        <div class="spinner"></div>
        <p>加载通知中...</p>
      </div>

      <!-- 空状态 -->
      <div v-else-if="notifications.length === 0" class="empty">
        <div class="empty-icon">🔔</div>
        <p>暂无通知</p>
      </div>

      <!-- 通知列表 -->
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
          <button
            v-if="!notif.is_read"
            class="mark-read"
            @click="markNotificationAsRead(notif.id)"
            title="标记为已读"
          >
            ✓
          </button>
        </div>
      </div>
    </div>

    <!-- 活动消息 -->
    <div v-if="activeTab === 'activity'" class="tab-content">
      <!-- 加载状态 -->
      <div v-if="loadingActivity" class="loading-container">
        <div class="spinner"></div>
        <p>加载活动消息中...</p>
      </div>

      <!-- 空状态 -->
      <div v-else-if="activityMessages.length === 0" class="empty">
        <div class="empty-icon">🎯</div>
        <p>暂无活动消息</p>
      </div>

      <!-- 活动消息列表 -->
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

    <!-- 错误提示 -->
    <div v-if="error" class="error-banner">
      <p>{{ error }}</p>
      <button @click="dismissError" class="close-btn">✕</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { messageApi } from '@/api/index'
import toast from '@/utils/toast'

interface Conversation {
  id: string | number
  name: string
  avatar_url: string
  last_message: string
  last_message_time: string
  unread_count?: number
}

interface Notification {
  id: string | number
  type: string
  content: string
  created_at: string
  is_read: boolean
}

interface ActivityMessage {
  id: string | number
  type: string
  title: string
  content: string
  activity_name: string
  activity_id: string
  created_at: string
  is_read: boolean
}

const router = useRouter()

const activeTab = ref<'conversations' | 'notifications' | 'activity'>('conversations')
const loadingConversations = ref(false)
const loadingNotifications = ref(false)
const loadingActivity = ref(false)
const error = ref<string | null>(null)

// 实际数据
const conversations = ref<Conversation[]>([])
const notifications = ref<Notification[]>([])
const activityMessages = ref<ActivityMessage[]>([])

// Tab切换时滚动到顶部
const handleTabChange = (tab: 'conversations' | 'notifications' | 'activity') => {
  activeTab.value = tab
  window.scrollTo({ top: 0, behavior: 'smooth' })

  // 根据tab加载对应数据
  if (tab === 'conversations' && conversations.value.length === 0) {
    loadConversations()
  } else if (tab === 'notifications' && notifications.value.length === 0) {
    loadNotifications()
  } else if (tab === 'activity' && activityMessages.value.length === 0) {
    loadActivityMessages()
  }
}

// 加载对话列表
const loadConversations = async () => {
  try {
    loadingConversations.value = true
    error.value = null

    const response = await messageApi.getConversations()
    console.log('Conversations API response:', response)

    if (response && Array.isArray(response.data)) {
      conversations.value = response.data.map((conv: any) => ({
        id: conv.id,
        name: conv.other_user_name || '未知用户',
        avatar_url: conv.other_user_avatar || '',
        last_message: conv.last_message || '',
        last_message_time: conv.last_message_time || new Date().toISOString(),
        unread_count: conv.unread_count || 0
      }))
    }
  } catch (err: any) {
    console.error('加载对话失败:', err)
    error.value = '加载对话失败，请重试'
    toast.error('加载对话失败')
  } finally {
    loadingConversations.value = false
  }
}

// 加载通知列表
const loadNotifications = async () => {
  try {
    loadingNotifications.value = true
    error.value = null

    // 使用模拟数据，因为后端通知系统可能未完全实现
    notifications.value = [
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
    ]
  } catch (err: any) {
    console.error('加载通知失败:', err)
    error.value = '加载通知失败，请重试'
    toast.error('加载通知失败')
  } finally {
    loadingNotifications.value = false
  }
}

// 加载活动消息
const loadActivityMessages = async () => {
  try {
    loadingActivity.value = true
    error.value = null

    // 使用模拟数据，因为后端活动通知系统可能未完全实现
    activityMessages.value = [
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
      }
    ]
  } catch (err: any) {
    console.error('加载活动消息失败:', err)
    error.value = '加载活动消息失败，请重试'
    toast.error('加载活动消息失败')
  } finally {
    loadingActivity.value = false
  }
}

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
const openConversation = (conversationId: string | number) => {
  router.push(`/chat/${conversationId}`)
}

// 删除对话
const deleteConversation = async (conversationId: string | number) => {
  try {
    await messageApi.clearConversation(String(conversationId))
    conversations.value = conversations.value.filter(c => c.id !== conversationId)
    toast.success('对话已删除')
  } catch (err: any) {
    console.error('删除对话失败:', err)
    toast.error('删除失败，请重试')
  }
}

// 标记通知为已读
const markNotificationAsRead = (notificationId: string | number) => {
  const notif = notifications.value.find(n => n.id === notificationId)
  if (notif) {
    notif.is_read = true
  }
}

// 处理活动消息点击
const handleActivityMessage = (message: ActivityMessage) => {
  // 标记为已读
  message.is_read = true
  // 跳转到活动详情
  router.push(`/activity/${message.activity_id}`)
}

// 格式化时间
const formatTime = (dateString: string) => {
  try {
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
  } catch {
    return '未知时间'
  }
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

// 处理头像加载错误
const handleAvatarError = (e: Event) => {
  const img = e.target as HTMLImageElement
  img.src = '/default-avatar.png'
}

// 关闭错误提示
const dismissError = () => {
  error.value = null
}

// 组件挂载时加载数据
onMounted(() => {
  loadConversations()

  // 每30秒刷新一次对话列表
  const refreshInterval = setInterval(() => {
    if (activeTab.value === 'conversations') {
      loadConversations()
    }
  }, 30000)

  // 清理定时器
  return () => clearInterval(refreshInterval)
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
  min-height: calc(100vh - 56px);
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #ff6b00;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-container p {
  color: #999;
  font-size: 14px;
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
  transition: transform 0.2s, background 0.2s;
  position: relative;
}

.conversation-item:active {
  transform: scale(0.98);
}

.conversation-item:hover {
  background: #f9f9f9;
}

.conversation-item:hover .delete-btn {
  opacity: 1;
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
  flex-shrink: 0;
}

/* 删除按钮 */
.delete-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid #e0e0e0;
  background: white;
  color: #999;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-left: 8px;
  opacity: 0;
}

.delete-btn:hover {
  background: #ff6b00;
  color: white;
  border-color: #ff6b00;
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

/* 错误提示 */
.error-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ff4444;
  color: white;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 999;
}

.error-banner p {
  margin: 0;
  font-size: 14px;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 16px;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  opacity: 0.8;
}
</style>
