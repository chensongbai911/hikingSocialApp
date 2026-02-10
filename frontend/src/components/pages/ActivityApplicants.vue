<template>
  <div class="activity-applicants-page min-h-screen bg-gray-50 flex flex-col overflow-hidden">
    <!-- 顶部导航栏 -->
    <div class="bg-white border-b border-gray-100 sticky top-0 z-10 flex-shrink-0">
      <div class="flex items-center justify-between px-4 py-4">
        <button @click="goBack" class="w-10 h-10 flex items-center justify-center">
          <span class="text-2xl">←</span>
        </button>
        <h1 class="text-lg font-bold text-gray-800">活动申请者</h1>
        <div class="w-10"></div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="p-8 text-center">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
      <p class="text-gray-500 mt-4">加载中...</p>
    </div>

    <!-- 申请者列表 -->
    <div v-else-if="applicants.length > 0" class="flex-1 overflow-y-auto p-4 space-y-3">
      <div v-for="applicant in applicants" :key="applicant.user.id" class="bg-white rounded-2xl p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <!-- 用户信息 -->
          <div class="flex items-center gap-3 flex-1">
            <img
              :src="applicant.user.avatar_url || '/default-avatar.png'"
              :alt="applicant.user.nickname"
              class="w-12 h-12 rounded-full object-cover"
            />
            <div class="flex-1">
              <h3 class="font-semibold text-gray-800">{{ applicant.user.nickname }}</h3>
              <p class="text-sm text-gray-500">
                {{ formatApplyTime(applicant.applied_at) }}
              </p>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div v-if="applicant.status === 'pending'" class="flex gap-2">
            <button
              @click="handleApprove(applicant.user.id)"
              class="px-4 py-2 bg-teal-500 text-white rounded-full text-sm font-medium hover:bg-teal-600 transition"
            >
              同意
            </button>
            <button
              @click="handleReject(applicant.user.id)"
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-300 transition"
            >
              拒绝
            </button>
          </div>
          <div v-else-if="applicant.status === 'approved'" class="text-teal-600 font-medium">
            已通过
          </div>
          <div v-else-if="applicant.status === 'rejected'" class="text-gray-500">
            已拒绝
          </div>
          <div v-else-if="applicant.status === 'joined'" class="text-blue-600 font-medium">
            已加入
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="p-8 text-center">
      <div class="text-6xl mb-4">📋</div>
      <h3 class="text-lg font-semibold text-gray-800 mb-2">暂无申请者</h3>
      <p class="text-gray-500">还没有用户申请参加此活动</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/api'
import toast from '@/utils/toast'

const route = useRoute()
const router = useRouter()

const activityId = ref<string>('')
const loading = ref(true)
const applicants = ref<any[]>([])

// 加载申请者列表
const loadApplicants = async () => {
  try {
    loading.value = true
    const response = await api.get(`/api/v1/activities/${activityId.value}/applicants`)
    applicants.value = response.data.applicants || []
  } catch (error: any) {
    console.error('加载申请者失败:', error)
    toast.error(error.response?.data?.message || '加载申请者失败')
  } finally {
    loading.value = false
  }
}

// 同意申请
const handleApprove = async (userId: string) => {
  try {
    await api.post(`/api/v1/activities/${activityId.value}/approve`, {
      user_id: userId
    })
    toast.success('已同意申请')
    // 重新加载列表
    await loadApplicants()
  } catch (error: any) {
    console.error('同意申请失败:', error)
    toast.error(error.response?.data?.message || '操作失败')
  }
}

// 拒绝申请
const handleReject = async (userId: string) => {
  try {
    await api.post(`/api/v1/activities/${activityId.value}/reject`, {
      user_id: userId
    })
    toast.success('已拒绝申请')
    // 重新加载列表
    await loadApplicants()
  } catch (error: any) {
    console.error('拒绝申请失败:', error)
    toast.error(error.response?.data?.message || '操作失败')
  }
}

// 格式化申请时间
const formatApplyTime = (dateString: string) => {
  if (!dateString) return ''

  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  // 1分钟内
  if (diff < 60000) {
    return '刚刚'
  }
  // 1小时内
  if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`
  }
  // 1天内
  if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}小时前`
  }
  // 7天内
  if (diff < 604800000) {
    return `${Math.floor(diff / 86400000)}天前`
  }

  // 超过7天，显示具体日期
  return date.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  activityId.value = route.params.id as string
  if (activityId.value) {
    loadApplicants()
  } else {
    toast.error('活动ID无效')
    router.back()
  }
})
</script>

<style scoped>
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
