<template>
  <div class="min-h-screen bg-gray-50">
    <div class="bg-white p-4 sticky top-0 z-10">
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-2xl font-bold text-gray-800">消息中心</h1>
        <span v-if="totalUnread > 0" class="text-xs px-2 py-1 bg-red-100 text-red-600 rounded-full"
          >未读 {{ totalUnread }}</span
        >
      </div>
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索联系人或聊天记录"
          class="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <svg
          class="w-6 h-6 text-teal-500 absolute left-4 top-1/2 -translate-y-1/2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <div class="flex justify-end mt-2 space-x-2 text-sm">
        <button
          class="px-3 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
          @click="
            () => {
              if (!loading) loadConversations(true)
            }
          "
        >
          刷新
        </button>
      </div>
    </div>

    <div class="px-4 py-2">
      <h2 class="text-lg font-bold text-teal-600">最近私聊</h2>
    </div>

    <div class="bg-white flex-1 overflow-y-auto" @scroll.passive="onScroll">
      <div v-if="loading && chats.length === 0" class="p-4 space-y-3">
        <div v-for="n in 6" :key="n" class="flex items-center animate-pulse space-x-4">
          <div class="w-14 h-14 bg-gray-200 rounded-full"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-gray-200 rounded w-1/3"></div>
            <div class="h-3 bg-gray-100 rounded w-2/3"></div>
          </div>
          <div class="w-8 h-4 bg-gray-100 rounded"></div>
        </div>
      </div>

      <div
        v-for="chat in filteredChats"
        :key="chat.id"
        @click="openChat(chat)"
        class="flex items-center p-4 border-b border-gray-100 active:bg-gray-50 cursor-pointer"
      >
        <div class="relative flex-shrink-0">
          <img
            :src="chat.avatar || fallbackAvatar"
            :alt="chat.name"
            class="w-14 h-14 rounded-full object-cover"
          />
          <div
            v-if="chat.isOnline"
            class="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"
          ></div>
        </div>

        <div class="ml-4 flex-1 min-w-0">
          <div class="flex items-center justify-between mb-1">
            <h3 class="font-medium text-gray-800 truncate">{{ chat.name || '陌生人' }}</h3>
            <span class="text-sm text-gray-400 flex-shrink-0">{{ formatTime(chat.lastTime) }}</span>
          </div>
          <p class="text-sm text-gray-500 truncate">{{ chat.lastMessage || '暂无消息' }}</p>
        </div>

        <div
          v-if="chat.unreadCount > 0"
          class="ml-3 flex-shrink-0 w-6 h-6 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center"
        >
          {{ chat.unreadCount > 9 ? '9+' : chat.unreadCount }}
        </div>
      </div>

      <div v-if="!loading && filteredChats.length === 0" class="py-20 text-center text-gray-400">
        <svg
          class="w-20 h-20 mx-auto mb-4 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <p>暂无聊天记录</p>
      </div>

      <div v-if="loading" class="py-12 text-center text-gray-400">加载中...</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getConversations, markConversationAsRead } from '@/api/message'
import { socketService } from '@/services/socket'
import { useUserStore } from '@/stores/user'
import toast from '@/utils/toast'

// 轻量节流，避免多次 loadMore 按钮快速点击
const throttle = (fn: (...args: any[]) => void, delay = 600) => {
  let last = 0
  return (...args: any[]) => {
    const now = Date.now()
    if (now - last > delay) {
      last = now
      fn(...args)
    }
  }
}

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const searchQuery = ref('')
const loading = ref(false)
const loadingMore = ref(false)
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)
const fallbackAvatar = 'https://placehold.co/120x120'

interface ChatItem {
  id: string
  name: string
  avatar: string
  lastMessage: string
  lastTime: string | null
  unreadCount: number
  isOnline: boolean
  otherUserId?: string
}

const chats = ref<ChatItem[]>([])
const totalUnread = computed(() => chats.value.reduce((sum, c) => sum + (c.unreadCount || 0), 0))

const formatTime = (time: string | null) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
}

const mapConversation = (raw: any): ChatItem => {
  const userId = String(userStore.userId)
  const other = String(raw.userId1) === userId ? raw.user2 : raw.user1
  const unread = String(raw.userId1) === userId ? raw.user2UnreadCount : raw.user1UnreadCount

  // 支持驼峰和下划线两种命名
  const otherName = other?.nickname || other?.name || '陌生人'
  const otherAvatar = other?.avatarUrl || other?.avatar_url || ''
  const lastMessage = raw.lastMessageContent || ''

  console.log('[Messages] 映射对话:', {
    conversationId: raw.id,
    otherUser: other,
    otherName,
    otherAvatar,
    lastMessage,
    unread
  })

  return {
    id: String(raw.id),
    name: otherName,
    avatar: otherAvatar,
    lastMessage,
    lastTime: raw.lastMessageAt || raw.updatedAt || raw.createdAt || null,
    unreadCount: unread || 0,
    isOnline: false,
    otherUserId: other?.id ? String(other.id) : undefined,
  }
}

const loadConversations = async (reset = true) => {
  // 如果未登录，不加载会话列表
  if (!userStore.isLoggedIn) {
    return
  }

  if (reset) {
    page.value = 1
    chats.value = []
  }
  if (reset) loading.value = true
  else loadingMore.value = true
  try {
    const res = await getConversations(page.value, pageSize.value)
    console.log('[Messages] getConversations 原始响应:', res)

    // 处理返回值结构
    const list = res?.conversations || res?.data?.conversations || []
    const convMap = new Map<string, any>()
    total.value = res?.total ?? res?.data?.total ?? list.length

    console.log('[Messages] 原始对话数:', list.length, '列表:', list)

    // 基于 otherUserId 做去重，若不存在 otherUserId 则退化为 conversation id
    list.map(mapConversation).forEach((c) => {
      const key = c.otherUserId ? `u_${c.otherUserId}` : `c_${c.id}`
      const existed = convMap.get(key)
      const newer = () => !existed || (c.lastTime && existed.lastTime && new Date(c.lastTime) > new Date(existed.lastTime))
      if (newer()) convMap.set(key, c)
    })

    const mapped = Array.from(convMap.values())
    console.log('[Messages] 映射后对话数:', mapped.length, '列表:', mapped)

    chats.value = reset
      ? mapped
      : [...chats.value, ...mapped].sort(
          (a, b) =>
            (b.lastTime ? new Date(b.lastTime).getTime() : 0) -
            (a.lastTime ? new Date(a.lastTime).getTime() : 0)
        )
    if (list.length > 0) page.value += 1
  } catch (err) {
    console.error('[Messages] 加载对话列表失败:', err)
    toast.error(err?.message || '加载会话失败')
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

const filteredChats = computed(() => {
  if (!searchQuery.value.trim()) return chats.value
  const q = searchQuery.value.toLowerCase()
  return chats.value.filter(
    (c) => c.name.toLowerCase().includes(q) || (c.lastMessage || '').toLowerCase().includes(q)
  )
})

const canLoadMore = computed(() => chats.value.length < (total.value || chats.value.length))

const handleLoadMore = throttle(() => {
  if (!loadingMore.value) loadConversations(false)
}, 500)

const handleRefresh = throttle(() => {
  if (!loading.value) loadConversations(true)
}, 500)

const openChat = (chat: ChatItem) => {
  chats.value = chats.value.map((c) => (c.id === chat.id ? { ...c, unreadCount: 0 } : c))
  markConversationAsRead(chat.id).catch(() => {})
  router.push({
    name: 'ChatWindow',
    params: { id: chat.id },
    state: { from: 'messages' },
  })
}

const upsertChat = (conversationId: string, payload: Partial<ChatItem>) => {
  const idx = chats.value.findIndex((c) => c.id === conversationId)
  const existed = idx >= 0
  if (existed) {
    const current = chats.value[idx]
    chats.value.splice(idx, 1, { ...current, ...payload })
  } else {
    chats.value.unshift({
      id: conversationId,
      name: payload.name || '陌生人',
      avatar: payload.avatar || '',
      lastMessage: payload.lastMessage || '',
      lastTime: payload.lastTime || new Date().toISOString(),
      unreadCount: payload.unreadCount ?? 1,
      isOnline: payload.isOnline ?? false,
      otherUserId: payload.otherUserId,
    })
  }
  chats.value = [...chats.value].sort(
    (a, b) =>
      (b.lastTime ? new Date(b.lastTime).getTime() : 0) -
      (a.lastTime ? new Date(a.lastTime).getTime() : 0)
  )
  return existed
}

const socketOff: Array<() => void> = []

const onScroll = (e: Event) => {
  const el = e.target as HTMLElement
  if (!el) return
  const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120
  if (nearBottom && canLoadMore.value && !loadingMore.value) {
    handleLoadMore()
  }
}

onMounted(async () => {
  await loadConversations()

  // 如果从 URL 中传入了 conversationId，自动打开该对话
  const conversationId = route.query.conversationId as string
  if (conversationId) {
    // 等待对话列表加载完成后再打开
    setTimeout(() => {
      const chat = chats.value.find(c => c.id === conversationId)
      if (chat) {
        openChat(chat)
      }
    }, 300)
  }

  socketOff.push(
    socketService.onMessageReceived((data: any) => {
      const conversationId = String(data.conversationId || data.conversation_id)
      const otherUser = data.senderId || data.sender_id
      const isSelf = String(otherUser) === String(userStore.userId)
      const existed = upsertChat(conversationId, {
        lastMessage: data.message?.content || data.content || '[新消息]',
        lastTime: data.message?.created_at || data.createdAt || new Date().toISOString(),
        unreadCount: isSelf
          ? 0
          : (chats.value.find((c) => c.id === conversationId)?.unreadCount || 0) + 1,
        name: data.senderNickname || data.sender_nickname || undefined,
        avatar: data.senderAvatar || data.sender_avatar || undefined,
        otherUserId: otherUser ? String(otherUser) : undefined,
      })
      if (!existed) loadConversations()
    })
  )

  socketOff.push(
    socketService.onOnlineStatusChange((data: any) => {
      const targetId = String(data.userId || data.id)
      chats.value = chats.value.map((c) =>
        c.otherUserId === targetId
          ? { ...c, isOnline: data.type === 'online' || data.status === 'online' }
          : c
      )
    })
  )
})

onUnmounted(() => {
  socketOff.forEach((off) => off())
})
</script>
