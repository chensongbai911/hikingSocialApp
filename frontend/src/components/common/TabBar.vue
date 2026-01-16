<template>
  <nav class="fixed bottom-0 left-0 right-0 glass-bg border-t border-white/10 shadow-lg z-40">
    <div class="flex justify-around max-w-xl mx-auto px-2 py-2">
      <!-- 发现 -->
      <router-link
        to="/discover"
        :class="[
          'flex flex-col items-center justify-center flex-1 py-2 px-2 rounded-2xl transition-all duration-300',
          isActive('/discover') ? 'text-teal-500' : 'text-gray-500',
        ]"
      >
        <div class="relative">
          <svg
            :class="[
              'w-7 h-7 transition-all duration-300',
              isActive('/discover') ? 'scale-110' : 'scale-100',
            ]"
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
          <div
            v-if="isActive('/discover')"
            class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-teal-500 rounded-full"
          ></div>
        </div>
        <div
          :class="[
            'text-xs mt-1 font-medium',
            isActive('/discover') ? 'text-teal-500' : 'text-gray-500',
          ]"
        >
          发现
        </div>
      </router-link>

      <!-- 创建 -->
      <router-link
        to="/create-activity"
        :class="[
          'flex flex-col items-center justify-center flex-1 py-2 px-2 rounded-2xl transition-all duration-300',
          isActive('/create-activity') ? 'text-teal-500' : 'text-gray-500',
        ]"
      >
        <div class="relative">
          <div
            :class="[
              'w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 -mt-1',
              isActive('/create-activity')
                ? 'bg-gradient-to-br from-teal-500 to-emerald-500 scale-105 shadow-lg'
                : 'bg-gradient-to-br from-teal-400/20 to-emerald-400/20 scale-100',
            ]"
          >
            <svg
              :class="[
                'w-7 h-7 transition-all duration-300',
                isActive('/create-activity') ? 'text-white rotate-90' : 'text-gray-600',
              ]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.5"
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
        </div>
        <div
          :class="[
            'text-xs mt-1 font-medium',
            isActive('/create-activity') ? 'text-teal-500' : 'text-gray-500',
          ]"
        >
          创建
        </div>
      </router-link>

      <!-- 消息 -->
      <router-link
        to="/messages"
        :class="[
          'flex flex-col items-center justify-center flex-1 py-2 px-2 rounded-2xl transition-all duration-300 relative',
          isActive('/messages') ? 'text-teal-500' : 'text-gray-500',
        ]"
      >
        <div class="relative">
          <svg
            :class="[
              'w-7 h-7 transition-all duration-300',
              isActive('/messages') ? 'scale-110' : 'scale-100',
            ]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
          <span
            v-if="unreadCount > 0"
            class="absolute -top-1 -right-2 min-w-[18px] h-[18px] bg-gradient-to-br from-red-500 to-pink-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold shadow-md animate-pulse px-1"
          >
            {{ unreadCount > 99 ? '99+' : unreadCount }}
          </span>
          <div
            v-if="isActive('/messages')"
            class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-teal-500 rounded-full"
          ></div>
        </div>
        <div
          :class="[
            'text-xs mt-1 font-medium',
            isActive('/messages') ? 'text-teal-500' : 'text-gray-500',
          ]"
        >
          消息
        </div>
      </router-link>

      <!-- 记录 -->
      <router-link
        to="/my-hiking"
        :class="[
          'flex flex-col items-center justify-center flex-1 py-2 px-2 rounded-2xl transition-all duration-300',
          isActive('/my-hiking') ? 'text-teal-500' : 'text-gray-500',
        ]"
      >
        <div class="relative">
          <svg
            :class="[
              'w-7 h-7 transition-all duration-300',
              isActive('/my-hiking') ? 'scale-110' : 'scale-100',
            ]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
          <div
            v-if="isActive('/my-hiking')"
            class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-teal-500 rounded-full"
          ></div>
        </div>
        <div
          :class="[
            'text-xs mt-1 font-medium',
            isActive('/my-hiking') ? 'text-teal-500' : 'text-gray-500',
          ]"
        >
          记录
        </div>
      </router-link>

      <!-- 资料 -->
      <router-link
        to="/profile"
        :class="[
          'flex flex-col items-center justify-center flex-1 py-2 px-2 rounded-2xl transition-all duration-300',
          isActive('/profile') ? 'text-teal-500' : 'text-gray-500',
        ]"
      >
        <div class="relative">
          <svg
            :class="[
              'w-7 h-7 transition-all duration-300',
              isActive('/profile') ? 'scale-110' : 'scale-100',
            ]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <div
            v-if="isActive('/profile')"
            class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-teal-500 rounded-full"
          ></div>
        </div>
        <div
          :class="[
            'text-xs mt-1 font-medium',
            isActive('/profile') ? 'text-teal-500' : 'text-gray-500',
          ]"
        >
          资料
        </div>
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

/* 毛玻璃背景效果 */
.glass-bg {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
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
