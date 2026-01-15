<template>
  <div class="user-card rounded-lg shadow-md p-4 bg-white cursor-pointer hover:shadow-lg transition-shadow" @click="$emit('click')">
    <!-- 用户信息头 -->
    <div class="flex items-center gap-3 mb-3">
      <img
        :src="user.avatar"
        :alt="user.name"
        class="w-12 h-12 rounded-full object-cover"
      />
      <div class="flex-1 min-w-0">
        <h3 class="font-semibold truncate">{{ user.name }}</h3>
        <p class="text-xs text-gray-600">{{ user.level }}</p>
      </div>
    </div>

    <!-- 用户简介 -->
    <p v-if="user.bio" class="text-sm text-gray-700 mb-3 line-clamp-2">{{ user.bio }}</p>

    <!-- 统计信息 -->
    <div class="grid grid-cols-3 gap-2 mb-3 text-center text-xs">
      <div>
        <p class="font-semibold text-primary">{{ user.activitiesCount }}</p>
        <p class="text-gray-600">活动</p>
      </div>
      <div>
        <p class="font-semibold text-primary">{{ user.followersCount }}</p>
        <p class="text-gray-600">粉丝</p>
      </div>
      <div>
        <p class="font-semibold text-primary">{{ user.rating }}</p>
        <p class="text-gray-600">评分</p>
      </div>
    </div>

    <!-- 标签 -->
    <div v-if="user.tags && user.tags.length" class="flex gap-2 mb-3 flex-wrap">
      <span v-for="tag in user.tags.slice(0, 2)" :key="tag" class="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
        {{ tag }}
      </span>
    </div>

    <!-- 操作按钮 -->
    <div class="flex gap-2">
      <button
        @click.stop="$emit('follow')"
        :class="['flex-1 py-2 rounded text-xs font-semibold transition', isFollowing ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-primary text-white hover:bg-secondary']"
      >
        {{ isFollowing ? '已关注' : '关注' }}
      </button>
      <button
        @click.stop="$emit('message')"
        class="flex-1 py-2 rounded text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
      >
        聊天
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface User {
  id: number
  name: string
  avatar: string
  level: string
  bio?: string
  activitiesCount: number
  followersCount: number
  rating: number
  tags?: string[]
}

const props = defineProps<{
  user: User
}>()

defineEmits<{
  click: []
  follow: []
  message: []
}>()

const isFollowing = ref(false)
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
