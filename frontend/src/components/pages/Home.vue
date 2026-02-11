<template>
  <div class="home-page min-h-screen bg-gray-50 pb-20">
    <!-- 成功提示 -->
    <div
      v-if="joinSuccessMessage"
      class="fixed top-4 left-4 right-4 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg z-50"
    >
      {{ joinSuccessMessage }}
    </div>

    <!-- 顶部欢迎栏 -->
    <div class="bg-gradient-to-r from-teal-500 to-green-500 text-white">
      <div class="px-4 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold mb-1">
              {{ greeting }}, {{ userStore.currentUser?.nickname || '徒步者' }}!
            </h1>
            <p class="text-teal-100 text-sm">发现精彩的徒步活动</p>
          </div>
          <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <span class="text-3xl">🏔️</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 快速操作 -->
    <div class="px-4 -mt-4 mb-4">
      <div class="bg-white rounded-2xl shadow-md p-4 grid grid-cols-4 gap-2">
        <button
          @click="router.push('/create-activity')"
          class="flex flex-col items-center py-3 hover:bg-gray-50 rounded-xl transition"
        >
          <div class="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mb-2">
            <span class="text-2xl">➕</span>
          </div>
          <span class="text-xs text-gray-700">发起活动</span>
        </button>
        <button
          @click="router.push('/my-hiking')"
          class="flex flex-col items-center py-3 hover:bg-gray-50 rounded-xl transition"
        >
          <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
            <span class="text-2xl">📋</span>
          </div>
          <span class="text-xs text-gray-700">我的活动</span>
        </button>
        <button
          @click="router.push('/discover')"
          class="flex flex-col items-center py-3 hover:bg-gray-50 rounded-xl transition"
        >
          <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2">
            <span class="text-2xl">🔍</span>
          </div>
          <span class="text-xs text-gray-700">发现用户</span>
        </button>
        <button
          @click="router.push('/messages')"
          class="flex flex-col items-center py-3 hover:bg-gray-50 rounded-xl transition relative"
        >
          <div class="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-2">
            <span class="text-2xl">💬</span>
          </div>
          <span class="text-xs text-gray-700">消息</span>
          <div v-if="unreadCount > 0" class="absolute top-2 right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
            {{ unreadCount > 9 ? '9+' : unreadCount }}
          </div>
        </button>
      </div>
    </div>

    <!-- 推荐活动 -->
    <div class="px-4 mb-6">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-lg font-bold text-gray-800">🔥 推荐活动</h2>
        <div class="flex gap-2">
          <button @click="refreshRecommended" class="text-sm text-teal-600 hover:text-teal-700">
            换一批
          </button>
          <router-link to="/activities" class="text-sm text-teal-600 hover:text-teal-700">
            查看更多
          </router-link>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="space-y-3">
        <div v-for="i in 3" :key="i" class="bg-white rounded-2xl p-4 animate-pulse">
          <div class="h-40 bg-gray-200 rounded-xl mb-3"></div>
          <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div class="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>

      <!-- 活动列表 -->
      <div v-else-if="recommendedActivities.length > 0" class="space-y-3">
        <div
          v-for="activity in recommendedActivities"
          :key="activity.id"
          @click="viewActivity(activity.id)"
          class="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition cursor-pointer"
        >
          <!-- 封面图 -->
          <div class="relative h-48 overflow-hidden">
            <img
              :src="activity.cover_image_url || 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=400&fit=crop'"
              :alt="activity.title"
              class="w-full h-full object-cover"
            />
            <div class="absolute top-3 left-3">
              <span
                :class="[
                  'px-3 py-1 rounded-full text-xs font-medium text-white',
                  getDifficultyClass(activity.difficulty)
                ]"
              >
                {{ getDifficultyText(activity.difficulty) }}
              </span>
            </div>
          </div>

          <!-- 活动信息 -->
          <div class="p-4">
            <h3 class="font-bold text-base text-gray-800 mb-2">{{ activity.title }}</h3>

            <div class="space-y-1 text-sm text-gray-600 mb-3">
              <div class="flex items-center gap-2">
                <span>📍</span>
                <span>{{ activity.location }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span>🕐</span>
                <span>{{ formatDateTime(activity.start_time) }}</span>
              </div>
            </div>

          <!-- 创建者和参与人数 -->
            <div class="flex items-center justify-between pt-3 border-t border-gray-100">
              <div class="flex items-center gap-2 flex-1">
                <img
                  :src="activity.creator.avatar_url || '/default-avatar.png'"
                  :alt="activity.creator.nickname"
                  class="w-6 h-6 rounded-full object-cover"
                />
                <span class="text-xs text-gray-600">{{ activity.creator.nickname }}</span>
              </div>
              <div class="flex items-center gap-3">
                <div class="flex items-center gap-1 text-xs text-gray-500">
                  <span>👥</span>
                  <span>{{ activity.participant_count || 0 }}人</span>
                </div>
                <button
                  v-if="canJoinActivity(activity) && !activity.is_joined"
                  @click="joinActivity($event, activity.id)"
                  :disabled="joiningActivityId === activity.id"
                  class="px-3 py-1 bg-teal-500 text-white text-xs rounded-full hover:bg-teal-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                >
                  {{ joiningActivityId === activity.id ? '加入中...' : '加入' }}
                </button>
                <span
                  v-else-if="!canJoinActivity(activity)"
                  class="px-3 py-1 bg-gray-200 text-gray-600 text-xs rounded-full"
                >
                  {{ getJoinStatusText(activity) }}
                </span>
                <span v-else class="px-3 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                  已加入
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="bg-white rounded-2xl p-8 text-center">
        <div class="text-6xl mb-3">🏔️</div>
        <p class="text-gray-500 mb-4">暂无推荐活动</p>
        <button
          @click="router.push('/create-activity')"
          class="px-6 py-2 bg-teal-500 text-white rounded-full text-sm hover:bg-teal-600 transition"
        >
          发起第一个活动
        </button>
      </div>
    </div>

    <!-- 推荐用户 -->
    <div class="px-4 mb-6">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-lg font-bold text-gray-800">👥 推荐伙伴</h2>
        <router-link to="/discover" class="text-sm text-teal-600 hover:text-teal-700">
          查看更多
        </router-link>
      </div>

      <div class="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        <div
          v-for="user in recommendedUsers"
          :key="user.id"
          @click="router.push(`/user/${user.id}`)"
          class="flex-shrink-0 bg-white rounded-2xl p-4 w-32 hover:shadow-md transition cursor-pointer"
        >
          <img
            :src="user.avatar_url || '/default-avatar.png'"
            :alt="user.nickname"
            class="w-16 h-16 rounded-full object-cover mx-auto mb-2"
          />
          <p class="text-sm font-medium text-gray-800 text-center truncate">{{ user.nickname }}</p>
          <p class="text-xs text-gray-500 text-center">{{ getHikingLevelText(user.hiking_level) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useActivityStore } from '@/stores/activity'
import toast from '@/utils/toast'
import { api } from '@/api'

const router = useRouter()
const userStore = useUserStore()
const activityStore = useActivityStore()

const loading = ref(false)
const recommendedActivities = ref<any[]>([])
const recommendedUsers = ref<any[]>([])
const unreadCount = ref(0)
const currentActivityPage = ref(1)
const joiningActivityId = ref<string | null>(null)
const joinSuccessMessage = ref('')

const isPresetActivity = (activityId: string) => {
  return typeof activityId === 'string' && activityId.startsWith('preset-activity-')
}

const canJoinActivity = (activity: any) => {
  if (!activity || !activity.id) return false
  if (isPresetActivity(activity.id)) return false
  if (activity.is_joined) return false
  if (activity.status && !['approved', 'recruiting'].includes(activity.status)) return false
  if (activity.max_participants && activity.participant_count >= activity.max_participants) return false
  return true
}

const getJoinStatusText = (activity: any) => {
  if (!activity || !activity.id) return '不可加入'
  if (isPresetActivity(activity.id)) return '预设活动'
  if (activity.is_joined) return '已加入'
  if (activity.status === 'pending') return '待发布'
  if (activity.status === 'cancelled') return '已取消'
  if (activity.status === 'completed') return '已结束'
  if (activity.max_participants && activity.participant_count >= activity.max_participants) return '已满'
  return '不可加入'
}

// 问候语
const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return '早上好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

// 加载推荐活动
const loadRecommendedActivities = async () => {
  try {
    loading.value = true
    const response = await api.get('/discovery/activities', {
      params: { page: currentActivityPage.value, page_size: 5 }
    })
    console.log('推荐活动响应:', response)
    if (response?.data?.items) {
      recommendedActivities.value = response.data.items
      console.log('加载成功,数量:', recommendedActivities.value.length)
    } else {
      console.warn('响应数据结构不合预期:', response)
    }
  } catch (error) {
    console.error('加载推荐活动失败:', error)
  } finally {
    loading.value = false
  }
}

// 加载推荐用户
const loadRecommendedUsers = async () => {
  try {
    const response = await api.get('/discovery/users', {
      params: { page: 1, page_size: 10 }
    })
    console.log('推荐用户响应:', response)
    if (response?.data?.items) {
      recommendedUsers.value = response.data.items
      console.log('加载成功,数量:', recommendedUsers.value.length)
    } else {
      console.warn('响应数据结构不合预期:', response)
    }
  } catch (error) {
    console.error('加载推荐用户失败:', error)
  }
}

// 加载未读消息数
const loadUnreadCount = async () => {
  try {
    const response = await api.get('/messages/unread-count')
    if (response.data) {
      unreadCount.value = response.data.count || 0
    }
  } catch (error) {
    console.error('加载未读消息数失败:', error)
  }
}

// 刷新推荐
const refreshRecommended = async () => {
  currentActivityPage.value = Math.floor(Math.random() * 5) + 1 // 随机跳转到1-5页
  loadRecommendedActivities()
  loadRecommendedUsers()
}

// 查看活动详情
const viewActivity = (id: string) => {
  router.push(`/activity/${id}`)
}

// 加入活动
const joinActivity = async (e: Event, activityId: string) => {
  e.stopPropagation() // 阻止冒泡触发查看详情

  try {
    joiningActivityId.value = activityId
    // 使用 store 中的 joinActivity 方法
    await activityStore.joinActivity(activityId)

    // 加入成功，更新参与人数
    const activity = recommendedActivities.value.find(a => a.id === activityId)
    if (activity) {
      activity.participant_count = (activity.participant_count || 0) + 1
      activity.is_joined = true
    }

    // 显示成功消息
    joinSuccessMessage.value = '成功加入活动！'
    setTimeout(() => {
      joinSuccessMessage.value = ''
    }, 3000)

    console.log('成功加入活动:', activityId)
  } catch (error: any) {
    console.error('加入活动异常:', error)
    const errorMsg = error.message || '加入活动失败，请检查网络连接'
    toast.error(errorMsg)
  } finally {
    joiningActivityId.value = null
  }
}

// 格式化日期时间
const formatDateTime = (dateTimeStr: string): string => {
  if (!dateTimeStr) return ''
  try {
    const date = new Date(dateTimeStr)
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${month}-${day} ${hours}:${minutes}`
  } catch {
    return dateTimeStr
  }
}

// 难度样式
const getDifficultyClass = (difficulty: string) => {
  switch (difficulty) {
    case 'easy':
      return 'bg-green-500'
    case 'moderate':
      return 'bg-yellow-500'
    case 'hard':
      return 'bg-red-500'
    default:
      return 'bg-gray-500'
  }
}

// 难度文本
const getDifficultyText = (difficulty: string) => {
  switch (difficulty) {
    case 'easy':
      return '简单'
    case 'moderate':
      return '中等'
    case 'hard':
      return '困难'
    default:
      return '未知'
  }
}

// 徒步等级文本
const getHikingLevelText = (level: string) => {
  switch (level) {
    case 'beginner':
      return '新手'
    case 'intermediate':
      return '中级'
    case 'advanced':
      return '资深'
    default:
      return '新手'
  }
}

onMounted(() => {
  loadRecommendedActivities()
  loadRecommendedUsers()
  loadUnreadCount()
})
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
