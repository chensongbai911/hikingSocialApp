<template>
  <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
    <div class="flex justify-around max-w-xl mx-auto">
      <router-link
        to="/discover"
        :class="[
          'flex-1 py-3 px-2 text-center transition',
          isActive('/discover') ? 'text-green-600 border-t-2 border-green-600' : 'text-gray-600',
        ]"
      >
        <div class="text-xl">🔍</div>
        <div class="text-xs mt-1">发现</div>
      </router-link>

      <router-link
        to="/create-activity"
        :class="[
          'flex-1 py-3 px-2 text-center transition',
          isActive('/create-activity')
            ? 'text-green-600 border-t-2 border-green-600'
            : 'text-gray-600',
        ]"
      >
        <div class="text-xl">✚</div>
        <div class="text-xs mt-1">创建</div>
      </router-link>

      <router-link
        to="/messages"
        :class="[
          'flex-1 py-3 px-2 text-center transition relative',
          isActive('/messages') ? 'text-green-600 border-t-2 border-green-600' : 'text-gray-600',
        ]"
      >
        <div class="text-xl">💬</div>
        <div class="text-xs mt-1">消息</div>
        <span
          v-if="unreadCount > 0"
          class="absolute top-1 right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
        >
          {{ unreadCount }}
        </span>
      </router-link>

      <router-link
        to="/my-hiking"
        :class="[
          'flex-1 py-3 px-2 text-center transition',
          isActive('/my-hiking') ? 'text-green-600 border-t-2 border-green-600' : 'text-gray-600',
        ]"
      >
        <div class="text-xl">📋</div>
        <div class="text-xs mt-1">记录</div>
      </router-link>

      <router-link
        to="/profile"
        :class="[
          'flex-1 py-3 px-2 text-center transition',
          isActive('/profile') ? 'text-green-600 border-t-2 border-green-600' : 'text-gray-600',
        ]"
      >
        <div class="text-xl">👤</div>
        <div class="text-xs mt-1">资料</div>
      </router-link>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useMessageStore } from '@/stores/message'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const messageStore = useMessageStore()
const userStore = useUserStore()

const unreadCount = computed(() => messageStore.totalUnread || 0)

// 轻量初始化：如果已登录且未读数为 0 且会话列表为空，主动拉取未读/会话
if (userStore.isLoggedIn) {
  if (!messageStore.unreadCount) {
    messageStore.fetchUnreadCount().catch(() => {})
  }
  if (!messageStore.conversations?.length) {
    messageStore.fetchConversations().catch(() => {})
  }
}

const isActive = (path: string) => {
  return route.path === path || route.path.startsWith(path + '/')
}
</script>

<style scoped>
nav {
  max-width: 100%;
}

@media (max-width: 640px) {
  nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding-bottom: env(safe-area-inset-bottom);
  }
}
</style>
