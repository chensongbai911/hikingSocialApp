<template>
  <div class="my-hiking-page">
    <!-- 页面头部 -->
    <div class="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
      <div class="px-4 py-4">
        <h1 class="text-2xl font-bold text-gray-800 text-center">徒步记录</h1>
      </div>

      <!-- 标签页导航 -->
      <div class="flex gap-0 border-b border-gray-200">
        <button
          @click="handleTabChange('joined')"
          :class="[
            'flex-1 py-3 px-4 font-medium text-center transition-all relative',
            activeTab === 'joined' ? 'text-teal-600' : 'text-gray-600 hover:text-gray-800',
          ]"
        >
          <span>我加入的</span>
          <div
            v-if="activeTab === 'joined'"
            class="absolute bottom-0 left-0 right-0 h-1 bg-teal-500 rounded-t-sm"
          ></div>
        </button>
        <button
          @click="handleTabChange('created')"
          :class="[
            'flex-1 py-3 px-4 font-medium text-center transition-all relative',
            activeTab === 'created' ? 'text-teal-600' : 'text-gray-600 hover:text-gray-800',
          ]"
        >
          <span>我发布的</span>
          <div
            v-if="activeTab === 'created'"
            class="absolute bottom-0 left-0 right-0 h-1 bg-teal-500 rounded-t-sm"
          ></div>
        </button>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="px-4 py-4 pb-20">
      <!-- 我加入的活动 -->
      <div v-if="activeTab === 'joined'">
        <div v-if="joinedActivities.length > 0" class="space-y-4">
          <div
            v-for="activity in joinedActivities"
            :key="activity.id"
            @click="viewActivity(activity.id)"
            class="activity-card-joined bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
          >
            <!-- 大图封面 -->
            <div class="relative overflow-hidden h-56">
              <img
                :src="activity.coverImage"
                :alt="activity.title"
                class="w-full h-full object-cover"
              />
              <!-- 状态标签 -->
              <div class="absolute top-4 left-4">
                <span
                  :class="[
                    'inline-block text-xs font-bold px-3 py-1 rounded-full text-white',
                    activity.status === '待参加'
                      ? 'bg-teal-500'
                      : activity.status === '进行中'
                      ? 'bg-orange-500'
                      : activity.status === '已完成'
                      ? 'bg-green-500'
                      : 'bg-gray-500',
                  ]"
                >
                  {{ activity.status }}
                </span>
              </div>
              <!-- 渐变遮罩 -->
              <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>

            <!-- 活动信息 -->
            <div class="p-4">
              <h3 class="font-bold text-lg text-gray-800 mb-3">{{ activity.title }}</h3>

              <!-- 时间和地点 -->
              <div class="space-y-2 mb-4 text-sm text-gray-600">
                <div class="flex items-center gap-2">
                  <svg
                    class="w-4 h-4 text-gray-500 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"
                    />
                  </svg>
                  <span>{{ formatDateTime(activity.startTime) }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <svg
                    class="w-4 h-4 text-gray-500 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                    />
                  </svg>
                  <span>{{ activity.location }}</span>
                </div>
              </div>

              <!-- 参与者头像 -->
              <div
                v-if="activity.participants && activity.participants.length > 0"
                class="flex items-center gap-2 py-3 border-t border-gray-100"
              >
                <div class="flex -space-x-2">
                  <img
                    v-for="(participant, index) in (activity.participants || []).slice(0, 5)"
                    :key="index"
                    :src="participant.avatar"
                    :alt="participant.name"
                    :title="participant.name"
                    class="w-8 h-8 rounded-full border-2 border-white object-cover hover:z-10 transition-transform hover:scale-110"
                  />
                  <div
                    v-if="(activity.participants || []).length > 5"
                    class="w-8 h-8 rounded-full border-2 border-white bg-teal-100 flex items-center justify-center text-xs font-semibold text-teal-600"
                  >
                    +{{ (activity.participants || []).length - 5 }}
                  </div>
                </div>
                <span class="text-sm text-gray-600 ml-2">
                  {{ activity.participants.length }}人参加
                </span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-16">
          <div class="text-5xl mb-3 opacity-50">🥾</div>
          <p class="text-gray-600 text-lg mb-4">还没有加入任何徒步活动</p>
          <router-link
            to="/discover"
            class="inline-block px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-semibold text-sm"
          >
            去发现活动
          </router-link>
        </div>
      </div>

      <!-- 我发布的活动 -->
      <div v-if="activeTab === 'created'">
        <div v-if="createdActivities.length > 0" class="space-y-4">
          <div
            v-for="activity in createdActivities"
            :key="activity.id"
            class="activity-card-created bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 group"
          >
            <!-- 大图封面 -->
            <div
              class="relative overflow-hidden h-56 cursor-pointer"
              @click="viewActivity(activity.id)"
            >
              <img
                :src="activity.coverImage"
                :alt="activity.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <!-- 状态标签 -->
              <div class="absolute top-4 right-4">
                <span
                  :class="[
                    'inline-block text-xs font-bold px-3 py-1 rounded-full text-white',
                    activity.status === '招募中'
                      ? 'bg-teal-500'
                      : activity.status === '进行中'
                      ? 'bg-orange-500'
                      : 'bg-gray-500',
                  ]"
                >
                  {{ activity.status }}
                </span>
              </div>
              <!-- 难度标签 -->
              <div class="absolute top-4 left-4">
                <span
                  class="inline-block text-xs font-bold px-3 py-1 rounded-full bg-yellow-500 text-white"
                >
                  难度 {{ activity.difficulty || '3.0' }}
                </span>
              </div>
              <!-- 渐变遮罩 -->
              <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
            </div>

            <!-- 活动信息 -->
            <div class="p-4">
              <h3
                class="font-bold text-lg text-gray-800 mb-3 cursor-pointer hover:text-teal-600 transition"
                @click="viewActivity(activity.id)"
              >
                {{ activity.title }}
              </h3>

              <!-- 时间和地点 -->
              <div class="space-y-2 mb-4 text-sm text-gray-600">
                <div class="flex items-center gap-2">
                  <svg
                    class="w-4 h-4 text-gray-500 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"
                    />
                  </svg>
                  <span>{{ formatDateTime(activity.startTime) }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <svg
                    class="w-4 h-4 text-gray-500 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                    />
                  </svg>
                  <span>{{ activity.location }}</span>
                </div>
              </div>

              <!-- 申请者信息 - 招募中 -->
              <div
                v-if="activity.status === '招募中'"
                class="mb-4 p-3 bg-teal-50 rounded-xl border border-teal-200"
              >
                <div class="flex items-center justify-between gap-2">
                  <div class="flex items-center gap-2 flex-1 min-w-0">
                    <div class="flex -space-x-2 flex-shrink-0">
                      <img
                        v-for="(applicant, index) in (activity.applicants || []).slice(0, 3)"
                        :key="index"
                        :src="applicant.avatar"
                        :alt="applicant.name"
                        :title="applicant.name"
                        class="w-7 h-7 rounded-full border-2 border-white object-cover"
                      />
                    </div>
                    <span class="text-sm font-semibold text-gray-700 whitespace-nowrap">
                      <span class="text-teal-600">{{ activity.applicantCount || 0 }}</span
                      >人申请中
                    </span>
                  </div>
                  <button
                    @click.stop="viewApplicants(activity.id)"
                    class="text-sm text-teal-600 font-semibold hover:text-teal-700 whitespace-nowrap"
                  >
                    查看申请 →
                  </button>
                </div>
              </div>

              <!-- 参与者信息 - 进行中 -->
              <div
                v-else-if="activity.status === '进行中'"
                class="mb-4 p-3 bg-orange-50 rounded-xl border border-orange-200"
              >
                <div class="flex items-center justify-between gap-2">
                  <div class="flex items-center gap-2 flex-1 min-w-0">
                    <div class="flex -space-x-2 flex-shrink-0">
                      <img
                        v-for="(participant, index) in (activity.participants || []).slice(0, 5)"
                        :key="index"
                        :src="participant.avatar"
                        :alt="participant.name"
                        :title="participant.name"
                        class="w-7 h-7 rounded-full border-2 border-white object-cover"
                      />
                    </div>
                    <span class="text-sm font-semibold text-gray-700">
                      {{ (activity.participants || []).length }}人参加
                    </span>
                  </div>
                  <button
                    @click.stop="viewDetails(activity.id)"
                    class="text-sm text-orange-600 font-semibold hover:text-orange-700 whitespace-nowrap"
                  >
                    详情 →
                  </button>
                </div>
              </div>

              <!-- 操作按钮 -->
              <div class="flex gap-2 pt-3 border-t border-gray-100">
                <button
                  @click.stop="editActivity(activity.id)"
                  class="flex-1 py-2 px-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-medium text-sm"
                >
                  编辑
                </button>
                <button
                  @click.stop="deleteActivity(activity.id)"
                  class="flex-1 py-2 px-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium text-sm"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-16">
          <div class="text-5xl mb-3 opacity-50">🗻</div>
          <p class="text-gray-600 text-lg mb-4">还没有发布任何徒步活动</p>
          <router-link
            to="/create-activity"
            class="inline-block px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-semibold text-sm"
          >
            发布第一个活动
          </router-link>
        </div>
      </div>
    </div>

    <!-- 取消活动确认弹窗 -->
    <div
      v-if="showDeleteConfirm"
      @click="showDeleteConfirm = false"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <div @click.stop class="bg-white rounded-3xl w-full max-w-sm p-6 animate-scale-in">
        <div class="text-center mb-6">
          <div
            class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">确认取消该活动吗？</h3>
          <p class="text-gray-600 text-sm">此操作不可撤销，活动取消后所有参与者都会收到通知。</p>
        </div>
        <div class="flex gap-3">
          <button
            @click="showDeleteConfirm = false"
            class="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
          >
            我再想想
          </button>
          <button
            @click="confirmDelete"
            class="flex-1 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition"
          >
            确认取消
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useActivityStore } from '@/stores/activity'
import { useUserStore } from '@/stores/user'
import type { Activity as ActivityType } from '@/types'
import toast from '@/utils/toast'

interface Participant {
  avatar: string
  name: string
}

interface Activity {
  id: string | number
  title: string
  location: string
  startTime: string
  coverImage?: string
  status: string
  difficulty?: string
  participantCount?: number
  completedDate?: string
  rating?: number
  applicantCount?: number
  applicants?: Participant[]
  participants?: Participant[]
}

const router = useRouter()
const route = useRoute()
const activityStore = useActivityStore()
const userStore = useUserStore()
const activeTab = ref<'joined' | 'created'>('joined')
const loading = computed(() => activityStore.loading)
const showDeleteConfirm = ref(false)
const activityToDelete = ref<string | number | null>(null)

// Helper function to get activity status
const getActivityStatus = (activity: ActivityType): string => {
  const now = new Date()
  const startTime = new Date(activity.start_time)
  const endTime = activity.end_time ? new Date(activity.end_time) : null

  if (activity.status === 'cancelled') return '已取消'
  if (activity.status === 'completed') return '已完成'
  if (endTime && now > endTime) return '已完成'
  if (now >= startTime && (!endTime || now <= endTime)) return '进行中'
  if (now < startTime) return '待参加'

  return activity.status === 'recruiting' ? '招募中' : '已完成'
}

// Transform backend activity format to component format
const transformActivity = (activity: ActivityType): Activity => {
  return {
    id: activity.id, // 保持字符串类型
    title: activity.title,
    location: activity.location,
    startTime: activity.start_time,
    coverImage:
      activity.cover_image_url ||
      'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=400&fit=crop',
    status: getActivityStatus(activity),
    difficulty: activity.difficulty || 'easy',
    participantCount: activity.participant_count || 0,
    participants: [],
    applicants: [],
  }
}

// Compute joined activities from store
const joinedActivities = computed(() => {
  return activityStore.joinedActivities.map(transformActivity)
})
// Compute created activities from store
const createdActivities = computed(() => {
  return activityStore.createdActivities.map(transformActivity)
})

// Tab切换时滚动到顶部
const handleTabChange = (tab: 'joined' | 'created') => {
  activeTab.value = tab
  // 滚动到页面顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 页面加载时获取数据
onMounted(async () => {
  // Check if tab query parameter is set
  if (route.query.tab === 'created') {
    activeTab.value = 'created'
  }
  // 初始加载
  await loadActivities()
})

// 加载活动列表
const loadActivities = async () => {
  try {
    // 分开加载，避免状态覆盖
    // 这里的逻辑可以优化为按需加载，但为了保证数据新鲜度，这里都加载
    await Promise.all([
      activityStore.fetchMyJoinedActivities({ page: 1, page_size: 20 }),
      activityStore.fetchMyCreatedActivities({ page: 1, page_size: 20 }),
    ])

    console.log('活动列表加载成功')
  } catch (error) {
    console.error('加载活动列表失败:', error)
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

const viewActivity = (id: string | number) => {
  router.push(`/activity/${id}`)
}

// 查看申请者列表
const viewApplicants = (id: string | number) => {
  console.log('查看申请者列表:', id)
  router.push(`/activity/${id}/applicants`)
}

// 查看活动详情
const viewDetails = (id: string | number) => {
  router.push(`/activity/${id}`)
}

const editActivity = (id: string | number) => {
  router.push(`/create-activity?id=${id}`)
}

const deleteActivity = (id: string | number) => {
  activityToDelete.value = id
  showDeleteConfirm.value = true
}

const confirmDelete = async () => {
  if (!activityToDelete.value) return

  try {
    await activityStore.deleteActivity(activityToDelete.value.toString())
    toast.success('活动已取消')
    await loadActivities()
  } catch (error) {
    console.error('取消活动失败:', error)
    toast.error('取消活动失败')
  } finally {
    showDeleteConfirm.value = false
    activityToDelete.value = null
  }
}
</script>

<style scoped>
.my-hiking-page {
  min-height: 100vh;
  background-color: #f9fafb;
}

/* 活动卡片 - 我加入的 */
.activity-card-joined {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: block;
}

.activity-card-joined:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

/* 活动卡片 - 我发布的 */
.activity-card-created {
  cursor: default;
  transition: all 0.3s ease;
}

.activity-card-created:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

/* 响应式设计 */
@media (max-width: 640px) {
  .my-hiking-page {
    padding-bottom: 60px;
  }
}

/* 动画过渡 */
button {
  font-family: inherit;
}

/* Tab 指示器动画 */
.absolute.bottom-0.left-0 {
  transition: all 0.3s ease;
}
</style>
