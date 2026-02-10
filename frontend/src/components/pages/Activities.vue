<template>
  <div class="activities-page min-h-screen bg-gray-50 pb-24">
    <!-- 页面头部 -->
    <div class="bg-white pt-6 pb-4 px-4 border-b border-gray-100 sticky top-0 z-10">
      <div class="container mx-auto">
        <div class="flex items-center justify-between mb-4">
          <button @click="router.back()" class="p-2 hover:bg-gray-100 rounded-full">
            <span class="text-2xl">←</span>
          </button>
          <h1 class="text-xl font-bold text-gray-800">推荐活动</h1>
          <div class="w-10"></div>
        </div>

        <!-- 搜索框 -->
        <div class="relative">
          <span class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
          <input
            v-model="searchQuery"
            @input="debouncedSearch"
            type="text"
            placeholder="搜索活动"
            class="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
          />
        </div>
      </div>
    </div>

    <!-- 活动列表 -->
    <div class="px-4 py-4">
      <!-- 加载状态 -->
      <div v-if="loading && activities.length === 0" class="space-y-4">
        <div v-for="i in 5" :key="i" class="bg-white rounded-2xl p-4 animate-pulse">
          <div class="h-40 bg-gray-200 rounded-xl mb-3"></div>
          <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div class="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>

      <!-- 活动列表 -->
      <div v-else-if="activities.length > 0" class="space-y-4">
        <div
          v-for="activity in activities"
          :key="activity.id"
          @click="viewActivity(activity.id)"
          class="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition cursor-pointer"
        >
          <!-- 封面图 -->
          <div class="relative h-48 overflow-hidden">
            <img
              :src="activity.cover_image_url || 'https://picsum.photos/800/600'"
              :alt="activity.title"
              class="w-full h-full object-cover"
            />
            <div class="absolute top-3 left-3">
              <span
                :class="[
                  'px-3 py-1 rounded-full text-xs font-medium',
                  getDifficultyClass(activity.difficulty),
                ]"
              >
                {{ getDifficultyText(activity.difficulty) }}
              </span>
            </div>
          </div>

          <!-- 内容 -->
          <div class="p-4">
            <h3 class="text-lg font-bold text-gray-800 mb-2">{{ activity.title }}</h3>
            <p class="text-sm text-gray-600 mb-3 line-clamp-2">{{ activity.description }}</p>

            <div class="flex items-center justify-between text-sm text-gray-500">
              <div class="flex items-center gap-4">
                <span>📍 {{ activity.location }}</span>
                <span>👥 {{ activity.participant_count || 0 }}/{{ activity.max_participants }}</span>
              </div>
              <span>{{ formatDate(activity.start_time) }}</span>
            </div>

            <!-- 创建者信息 -->
            <div v-if="activity.creator" class="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
              <img
                :src="activity.creator.avatar_url || 'https://picsum.photos/40/40'"
                :alt="activity.creator.nickname"
                class="w-8 h-8 rounded-full object-cover"
              />
              <span class="text-sm text-gray-700">{{ activity.creator.nickname }}</span>
            </div>
          </div>
        </div>

        <!-- 加载更多 -->
        <div v-if="hasMore" class="text-center py-4">
          <button
            v-if="!loadingMore"
            @click="loadMore"
            class="px-6 py-2 bg-teal-500 text-white rounded-full hover:bg-teal-600 transition"
          >
            加载更多
          </button>
          <div v-else class="text-gray-500">加载中...</div>
        </div>

        <!-- 没有更多 -->
        <div v-else class="text-center py-4 text-gray-500 text-sm">
          没有更多活动了
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="bg-white rounded-2xl p-8 text-center mt-4">
        <div class="text-6xl mb-3">🏔️</div>
        <p class="text-gray-500 mb-4">暂无推荐活动</p>
        <button
          @click="router.push('/create-activity')"
          class="px-6 py-2 bg-teal-500 text-white rounded-full hover:bg-teal-600 transition"
        >
          发起第一个活动
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api/http'

const router = useRouter()

// 数据
const activities = ref<any[]>([])
const loading = ref(false)
const loadingMore = ref(false)
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

// 计算是否还有更多
const hasMore = ref(true)

// 加载活动列表
const loadActivities = async (page: number = 1) => {
  try {
    if (page === 1) {
      loading.value = true
    } else {
      loadingMore.value = true
    }

    const response = await api.get('/discovery/activities', {
      params: {
        page,
        page_size: pageSize.value,
        keyword: searchQuery.value || undefined
      }
    })

    if (response.data) {
      const newActivities = response.data.data?.items || []
      total.value = response.data.data?.pagination?.total || 0

      if (page === 1) {
        activities.value = newActivities
      } else {
        activities.value = [...activities.value, ...newActivities]
      }

      // 检查是否还有更多
      hasMore.value = activities.value.length < total.value
      currentPage.value = page
    }
  } catch (error: any) {
    console.error('加载活动列表失败:', error)
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

// 加载更多
const loadMore = () => {
  loadActivities(currentPage.value + 1)
}

// 防抖搜索
let searchTimeout: any = null
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    loadActivities(1)
  }, 500)
}

// 查看活动详情
const viewActivity = (id: string) => {
  router.push(`/activity/${id}`)
}

// 获取难度文本
const getDifficultyText = (difficulty: string) => {
  const map: Record<string, string> = {
    easy: '简单',
    moderate: '中等',
    hard: '困难',
    expert: '专家'
  }
  return map[difficulty] || difficulty
}

// 获取难度样式
const getDifficultyClass = (difficulty: string) => {
  const map: Record<string, string> = {
    easy: 'bg-green-100 text-green-700',
    moderate: 'bg-yellow-100 text-yellow-700',
    hard: 'bg-orange-100 text-orange-700',
    expert: 'bg-red-100 text-red-700'
  }
  return map[difficulty] || 'bg-gray-100 text-gray-700'
}

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}月${day}日`
}

// 初始化
onMounted(() => {
  loadActivities()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
