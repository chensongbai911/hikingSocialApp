<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 顶部标题栏 -->
    <div class="bg-white p-4 sticky top-0 z-10">
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-2xl font-bold text-gray-800">消息中心</h1>
      </div>

      <!-- 搜索框 -->
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索联系人或聊天记录"
          class="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <svg class="w-6 h-6 text-teal-500 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
      </div>
    </div>

    <!-- 通知卡片区域 -->
    <div class="p-4 grid grid-cols-2 gap-4">
      <!-- 系统通知卡片 -->
      <div
        @click="router.push('/messages/system')"
        class="bg-white rounded-2xl p-4 flex flex-col items-center justify-center space-y-3 cursor-pointer active:scale-95 transition-transform"
      >
        <div class="relative">
          <div class="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/>
            </svg>
          </div>
        </div>
        <div class="text-center">
          <div class="font-medium text-gray-800">系统通知</div>
        </div>
      </div>

      <!-- 活动提醒卡片 -->
      <div
        @click="router.push('/messages/activity')"
        class="bg-white rounded-2xl p-4 flex flex-col items-center justify-center space-y-3 cursor-pointer active:scale-95 transition-transform"
      >
        <div class="relative">
          <div class="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7"/>
            </svg>
          </div>
        </div>
        <div class="text-center">
          <div class="font-medium text-gray-800">活动提醒</div>
        </div>
      </div>
    </div>

    <!-- 最近私聊标题 -->
    <div class="px-4 py-2">
      <h2 class="text-lg font-bold text-teal-600">最近私聊</h2>
    </div>

    <!-- 聊天列表 -->
    <div class="bg-white">
      <div
        v-for="chat in filteredChats"
        :key="chat.id"
        @click="openChat(chat)"
        class="flex items-center p-4 border-b border-gray-100 active:bg-gray-50 cursor-pointer"
      >
        <!-- 头像 -->
        <div class="relative flex-shrink-0">
          <img
            :src="chat.avatar"
            :alt="chat.name"
            class="w-14 h-14 rounded-full object-cover"
          />
          <!-- 在线状态 -->
          <div
            v-if="chat.isOnline"
            class="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"
          ></div>
        </div>

        <!-- 聊天信息 -->
        <div class="ml-4 flex-1 min-w-0">
          <div class="flex items-center justify-between mb-1">
            <h3 class="font-medium text-gray-800 truncate">{{ chat.name }}</h3>
            <span class="text-sm text-gray-400 flex-shrink-0">{{ chat.time }}</span>
          </div>
          <p class="text-sm text-gray-500 truncate">{{ chat.lastMessage }}</p>
        </div>

        <!-- 未读数角标 -->
        <div
          v-if="chat.unreadCount > 0"
          class="ml-3 flex-shrink-0 w-6 h-6 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center"
        >
          {{ chat.unreadCount > 9 ? '9+' : chat.unreadCount }}
        </div>
      </div>

      <!-- 空状态 -->
      <div
        v-if="filteredChats.length === 0"
        class="py-20 text-center text-gray-400"
      >
        <svg class="w-20 h-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
        </svg>
        <p>暂无聊天记录</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const searchQuery = ref('')

interface Chat {
  id: string
  name: string
  avatar: string
  lastMessage: string
  time: string
  unreadCount: number
  isOnline: boolean
}

// 模拟聊天列表数据
const chats = ref<Chat[]>([
  {
    id: '1',
    name: '李华 (徒步达人)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    lastMessage: '周六的香山徒步，我们要在南门集...',
    time: '14:20',
    unreadCount: 3,
    isOnline: true
  },
  {
    id: '2',
    name: '小美',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    lastMessage: '好的，那我们就这么说定了，不见不散！',
    time: '昨天',
    unreadCount: 0,
    isOnline: false
  },
  {
    id: '3',
    name: '张三-领队',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    lastMessage: '记得带上手杖和防晒霜，山上紫外线强。',
    time: '星期三',
    unreadCount: 0,
    isOnline: false
  },
  {
    id: '4',
    name: '王五',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop',
    lastMessage: '[图片]',
    time: '星期一',
    unreadCount: 1,
    isOnline: false
  }
])

// 搜索过滤
const filteredChats = computed(() => {
  if (!searchQuery.value.trim()) {
    return chats.value
  }
  const query = searchQuery.value.toLowerCase()
  return chats.value.filter(chat =>
    chat.name.toLowerCase().includes(query) ||
    chat.lastMessage.toLowerCase().includes(query)
  )
})

// 打开聊天窗口
const openChat = (chat: Chat) => {
  router.push(`/chat/${chat.id}`)
}
</script>
