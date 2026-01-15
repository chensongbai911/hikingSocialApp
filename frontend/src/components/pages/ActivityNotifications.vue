<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 顶部导航栏 -->
    <div class="bg-white p-4 sticky top-0 z-10 border-b border-gray-100">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <button @click="router.back()" class="p-2 -ml-2">
            <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <h1 class="text-xl font-bold text-gray-800">活动提醒</h1>
        </div>
        <button
          @click="markAllAsRead"
          class="text-sm text-teal-500 font-medium"
        >
          全部已读
        </button>
      </div>
    </div>

    <!-- 提醒列表 -->
    <div class="p-4 space-y-4">
      <div
        v-for="reminder in reminders"
        :key="reminder.id"
        class="bg-white rounded-2xl p-4 shadow-sm"
      >
        <div class="flex items-start space-x-4">
          <!-- 用户头像/图标 -->
          <div class="relative flex-shrink-0">
            <img
              v-if="reminder.avatar"
              :src="reminder.avatar"
              :alt="reminder.userName"
              class="w-12 h-12 rounded-full object-cover"
            />
            <div v-else :class="['w-12 h-12 rounded-full flex items-center justify-center', getIconBgClass(reminder.type)]">
              <svg v-if="reminder.type === 'join'" class="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
              </svg>
              <svg v-else-if="reminder.type === 'start'" class="w-6 h-6 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7"/>
              </svg>
              <svg v-else-if="reminder.type === 'comment'" class="w-6 h-6 text-teal-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
              </svg>
              <svg v-else class="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
              </svg>
            </div>
            <div
              v-if="reminder.badge"
              :class="['absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center', reminder.badge.bgClass]"
            >
              <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path v-if="reminder.badge.icon === 'add'" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
            </div>
          </div>

          <!-- 内容 -->
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between mb-2">
              <div>
                <span class="font-medium text-gray-800">{{ reminder.userName }}</span>
                <span class="text-gray-600"> {{ reminder.action }}</span>
              </div>
              <span class="text-sm text-gray-400 flex-shrink-0 ml-2">{{ reminder.time }}</span>
            </div>

            <p class="text-sm text-teal-600 font-medium mb-2">"{{ reminder.activityName }}"</p>

            <p v-if="reminder.content" class="text-sm text-gray-600 mb-3">{{ reminder.content }}</p>

            <!-- 操作按钮 -->
            <div v-if="reminder.actions" class="flex items-center space-x-3">
              <button
                v-for="action in reminder.actions"
                :key="action.text"
                @click="handleAction(action.type, reminder)"
                :class="[
                  'px-6 py-2 rounded-full text-sm font-medium transition-colors',
                  action.primary
                    ? 'bg-teal-500 text-white'
                    : 'border border-teal-500 text-teal-500'
                ]"
              >
                {{ action.text }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="reminders.length === 0" class="py-20 text-center text-gray-400">
        <svg class="w-20 h-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
        </svg>
        <p>暂无活动提醒</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

interface ReminderAction {
  type: string
  text: string
  primary?: boolean
}

interface Reminder {
  id: string
  type: 'join' | 'start' | 'comment' | 'verify'
  userName: string
  avatar?: string
  action: string
  activityName: string
  content?: string
  time: string
  badge?: {
    icon: string
    bgClass: string
  }
  actions?: ReminderAction[]
}

const reminders = ref<Reminder[]>([
  {
    id: '1',
    type: 'join',
    userName: '李华',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    action: '申请加入你的活动',
    activityName: '周末香山红叶徒步之旅',
    content: '希望能一起成行！',
    time: '10分钟前',
    badge: {
      icon: 'add',
      bgClass: 'bg-blue-500'
    },
    actions: [
      { type: 'approve', text: '查看详情', primary: true }
    ]
  },
  {
    id: '2',
    type: 'start',
    userName: '',
    action: '活动即将开始提醒',
    activityName: '京郊百望山日落攀爬',
    content: '你报名的活动还有2小时开始，请做好准备。',
    time: '1小时前',
    actions: [
      { type: 'route', text: '查看路线', primary: false }
    ]
  },
  {
    id: '3',
    type: 'comment',
    userName: '小美',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    action: '评价了你的活动',
    activityName: '大觉寺至妙峰山穿越',
    content: '"这次路线规划得太棒了，领队人也超级Nice，下次活动还想参加！"',
    time: '昨天',
    actions: [
      { type: 'reply', text: '去回复', primary: true }
    ]
  },
  {
    id: '4',
    type: 'verify',
    userName: '',
    action: '实名认证审核通过',
    activityName: '',
    content: '恭喜！你的实名身份已通过审核，现在可以发起更多户外活动了。',
    time: '3天前',
    actions: [
      { type: 'detail', text: '查看详情', primary: false }
    ]
  }
])

const getIconBgClass = (type: string) => {
  const classes = {
    join: 'bg-blue-50',
    start: 'bg-orange-50',
    comment: 'bg-teal-50',
    verify: 'bg-blue-50'
  }
  return classes[type as keyof typeof classes] || 'bg-gray-50'
}

const handleAction = (actionType: string, reminder: Reminder) => {
  console.log('Action:', actionType, reminder)
  // 这里处理不同的操作
  switch (actionType) {
    case 'approve':
      // 查看详情
      break
    case 'route':
      // 查看路线
      break
    case 'reply':
      // 去回复
      break
    case 'detail':
      // 查看详情
      break
  }
}

const markAllAsRead = () => {
  // 标记所有为已读（这里只是模拟）
  console.log('标记所有为已读')
}
</script>
