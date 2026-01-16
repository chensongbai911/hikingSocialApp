<template>
  <div class="user-profile-page min-h-screen bg-white">
    <!-- 顶部封面背景 -->
    <div class="relative h-64 overflow-hidden">
      <!-- 封面图片 -->
      <img
        v-if="user && user.coverImage"
        :src="user.coverImage"
        alt="Cover"
        class="w-full h-full object-cover"
      />
      <div v-else class="w-full h-full bg-gradient-to-br from-teal-400 to-blue-500"></div>

      <!-- 渐变遮罩 -->
      <div class="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent"></div>

      <!-- 顶部操作栏 -->
      <div class="absolute top-0 left-0 right-0 flex items-center justify-between p-4">
        <button
          @click="goBack"
          class="w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-md"
        >
          <span class="text-xl">←</span>
        </button>
        <button
          class="w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-md"
        >
          <span class="text-xl">⋯</span>
        </button>
      </div>
    </div>

    <!-- 用户信息卡片 -->
    <div class="relative px-4 -mt-16">
      <div class="bg-white rounded-3xl shadow-xl p-6">
        <!-- 头像和基本信息 - 响应式布局 -->
        <div class="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-4 sm:gap-4 mb-4">
          <div class="flex items-start flex-1 min-w-0">
            <img
              :src="(user && user.avatar) || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'"
              alt="Avatar"
              class="w-16 h-16 rounded-full border-4 border-white shadow-md flex-shrink-0"
            />
            <div class="ml-4 flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <h2 class="text-2xl font-bold text-gray-800 truncate">{{ (user && user.nickname) || '加载中...' }}</h2>
                <span class="px-3 py-1 bg-teal-500 text-white text-xs rounded-full font-semibold flex-shrink-0">
                  {{ (user && user.hikingLevel) || '新手' }}
                </span>
              </div>
              <p class="text-gray-600 text-sm mt-1 truncate" v-if="user && (user.region || user.province || user.city)">
                📍 {{ user.region || `${user.province || ''} ${user.city || ''}`.trim() }}
              </p>
            </div>
          </div>

          <!-- 关注/私信按钮（卡片右侧） - 响应式 -->
          <div class="w-full sm:w-auto sm:flex-shrink-0 space-y-2">
            <!-- 关注按钮 -->
            <button
              v-if="!isFollowing"
              @click="toggleFollow"
              :disabled="followLoading"
              class="w-full px-4 py-2 bg-teal-500 text-white rounded-xl font-medium text-sm hover:bg-teal-600 transition active:scale-95 flex items-center justify-center gap-1"
            >
              <span v-if="followLoading">⏳</span>
              <span v-else>+ 关注</span>
            </button>

            <!-- 私信按钮 -->
            <button
              v-if="isFollowing"
              @click="openChat"
              :disabled="chatLoading"
              class="w-full px-4 py-2 bg-teal-500 text-white rounded-xl font-medium text-sm hover:bg-teal-600 transition active:scale-95 flex items-center justify-center gap-1"
            >
              <span v-if="chatLoading">⏳ 加载中</span>
              <span v-else>💬 私信</span>
            </button>

            <!-- 取消关注按钮 -->
            <button
              v-if="isFollowing"
              @click="toggleFollow"
              :disabled="followLoading"
              class="w-full px-4 py-2 bg-gray-100 text-gray-600 rounded-xl font-medium text-sm hover:bg-gray-200 transition active:scale-95"
              title="取消关注"
            >
              <span v-if="followLoading">⏳</span>
              <span v-else>取消关注</span>
            </button>
          </div>
        </div>

        <!-- 用户统计 -->
        <div class="grid grid-cols-2 gap-4 py-4 border-t border-b border-gray-100">
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-800">{{ (user && user.stats && user.stats.activities) || 0 }}</div>
            <div class="text-xs text-gray-500 mt-1">徒步次数</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-800">{{ (user && user.stats && user.stats.followers) || 0 }}</div>
            <div class="text-xs text-gray-500 mt-1">关注者</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 个人简介 -->
    <div class="px-4 mt-6">
      <div class="bg-white rounded-2xl p-5 shadow-sm">
        <h3 class="text-lg font-bold text-gray-800 mb-3">个人简介</h3>
        <p class="text-gray-700 text-sm leading-relaxed">
          {{ (user && user.bio) || '热爱大自然的山野拾荒者。已经在周末征服了苏浙沪周边大部分山峰，希望能在这里遇到志同道合、节奏一致的小伙伴一起探索更远的高山。性格开朗，可以帮忙拍照和负重。' }}
        </p>
      </div>
    </div>

    <!-- 徒步足迹 -->
    <div class="px-4 mt-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold text-gray-800">徒步足迹</h3>
        <button class="text-teal-500 text-sm font-medium" v-if="(user && user.hikingTrails && user.hikingTrails.length)">
          查看全部 {{ user.hikingTrails.length }}
        </button>
      </div>

      <!-- 空状态提示 -->
      <div v-if="!displayedTrails.length" class="bg-gray-50 rounded-2xl p-8 text-center">
        <div class="text-5xl mb-3">🥾</div>
        <p class="text-gray-500 text-sm">还没有徒步足迹</p>
        <p class="text-gray-400 text-xs mt-1">期待TA的精彩户外旅程</p>
      </div>

      <!-- 足迹列表 -->
      <div v-else class="grid grid-cols-3 gap-3">
        <div
          v-for="(trail, index) in displayedTrails"
          :key="index"
          class="relative rounded-2xl overflow-hidden shadow-md"
          style="aspect-ratio: 3/4;"
        >
          <img
            :src="trail.image"
            :alt="trail.title"
            class="w-full h-full object-cover"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
          <div class="absolute bottom-0 left-0 right-0 p-3 text-white">
            <h4 class="font-bold text-sm mb-1">{{ trail.title }}</h4>
            <p class="text-xs opacity-90">{{ trail.date }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 发布的活动 -->
    <div class="px-4 mt-6" v-if="displayedPublishedActivities.length > 0">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold text-gray-800">发布的活动</h3>
        <button class="text-teal-500 text-sm font-medium">
          查看全部 {{ user && user.stats && user.stats.activities }}
        </button>
      </div>
      <div class="space-y-3">
        <div
          v-for="activity in displayedPublishedActivities"
          :key="activity.id"
          class="flex bg-white rounded-2xl p-3 shadow-md active:scale-95 transition-transform cursor-pointer"
          @click="router.push(`/activity/${activity.id}`)"
        >
          <img
            :src="activity.image"
            :alt="activity.title"
            class="w-20 h-20 rounded-xl object-cover"
          />
          <div class="ml-3 flex-1 flex flex-col justify-center">
            <h4 class="font-bold text-gray-800 mb-1 line-clamp-1">{{ activity.title }}</h4>
            <div class="flex items-center text-xs text-gray-500 mb-1">
              <span class="mr-2">📅 {{ activity.date }}</span>
              <span>📍 {{ activity.location }}</span>
            </div>
            <div class="flex items-center justify-between mt-1">
              <span
                class="text-xs px-2 py-0.5 rounded-full"
                :class="{
                  'bg-green-100 text-green-600': activity.status === 'ongoing',
                  'bg-blue-100 text-blue-600': activity.status === 'pending' || activity.status === 'approved',
                  'bg-gray-100 text-gray-600': activity.status === 'completed' || activity.status === 'cancelled'
                }"
              >
                {{ activity.status === 'ongoing' ? '进行中' : (activity.status === 'completed' ? '已结束' : '招募中') }}
              </span>
              <span class="text-teal-500 text-xs font-bold">点击加入 ></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 兴趣爱好 -->
    <div class="px-4 mt-6 pb-32">
      <h3 class="text-lg font-bold text-gray-800 mb-4">兴趣爱好</h3>

      <!-- 空状态提示 -->
      <div v-if="!(user && user.tags && user.tags.length)" class="bg-gray-50 rounded-2xl p-8 text-center">
        <div class="text-5xl mb-3">🏷️</div>
        <p class="text-gray-500 text-sm">还没有设置兴趣爱好</p>
        <p class="text-gray-400 text-xs mt-1">更多了解从设置兴趣开始</p>
      </div>

      <!-- 标签列表 -->
      <div v-else class="flex gap-3 flex-wrap">
        <span
          v-for="tag in user.tags"
          :key="tag"
          class="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
        >
          {{ getTagIcon(tag) }} {{ tag }}
        </span>
      </div>
    </div>

    <!-- 底部预留空间（不显示按钮，因为在卡片中已有） -->
    <div class="h-8"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { userApi, activityApi, messageApi } from '@/api'
import toast from '@/utils/toast'

const router = useRouter()
const route = useRoute()

// 用户数据（从 API 获取）
const user = ref<any>(null)
const loading = ref(true)
const isFollowing = ref(false)
const followLoading = ref(false)
const chatLoading = ref(false)

// 防止重复请求的标记
let isLoadingData = false
let loadedUserId: string | null = null

// 显示的徒步足迹（前3个）
const displayedTrails = computed(() => {
  return user.value?.hikingTrails?.slice(0, 3) || []
})

// 显示的已发布活动（前3个）
const displayedPublishedActivities = computed(() => {
  return user.value?.publishedActivities?.slice(0, 3) || []
})

// 标签图标映射
const getTagIcon = (tag: string): string => {
  const iconMap: Record<string, string> = {
    '登山': '⛰️',
    '摄影': '📷',
    '露营': '⛺',
    '徒步': '🥾',
    '越野': '🏃',
    '冒险': '🧗',
    '交友': '👥',
    '户外': '🌲',
    '路线开发': '🗺️',
    '自然': '🍃',
    '骑行': '🚴',
    '运动': '⚽',
    '诗歌': '✍️',
    '旅游': '✈️',
    '美食': '🍜',
    '宠物': '🐕',
    '慢生活': '☕'
  }
  return iconMap[tag] || '🏷️'
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 打开聊天对话
const openChat = async () => {
  if (!user.value || chatLoading.value) return

  try {
    chatLoading.value = true
    const targetUserId = user.value.id

    // 创建或获取对话
    try {
      const conversation = await messageApi.createConversation(targetUserId)
      const convId = conversation?.id || conversation?.conversationId || conversation?.conversation_id

      if (convId) {
        // 短暂延迟确保对话已在服务器创建
        await new Promise(resolve => setTimeout(resolve, 200))

        // 跳转到消息页面
        toast.success('正在打开私信...')
        await router.push({
          path: '/messages',
          query: { conversationId: convId }
        })
      } else {
        console.error('createConversation 返回异常:', conversation)
        toast.error('创建对话失败')
      }
    } catch (apiError: any) {
      console.error('API 错误:', apiError)
      throw apiError
    }
  } catch (error: any) {
    console.error('打开聊天失败:', error)
    toast.error(error.message || '打开聊天失败，请重试')
  } finally {
    chatLoading.value = false
  }
}

// 关注/取消关注
const toggleFollow = async () => {
  if (!user.value || followLoading.value) return

  try {
    followLoading.value = true
    const userId = user.value.id

    if (isFollowing.value) {
      // 取消关注
      const res = await userApi.unfollowUser(userId)
      if (res.code === 200) {
        isFollowing.value = false
        user.value.stats.followers = Math.max(0, user.value.stats.followers - 1)
        toast.success('已取消关注')
      } else {
        toast.error(res.message || '取消关注失败')
      }
    } else {
      // 关注
      const res = await userApi.followUser(userId)
      if (res.code === 200) {
        isFollowing.value = true
        user.value.stats.followers += 1
        toast.success('关注成功！现在可以发送私信了')
      } else {
        toast.error(res.message || '关注失败')
      }
    }
  } catch (error) {
    console.error('关注操作失败:', error)
    toast.error('操作失败，请重试')
  } finally {
    followLoading.value = false
  }
}

// 加载用户数据
onMounted(async () => {
  const userId = route.params.id as string

  if (!userId || userId === 'NaN') {
    toast.error('用户ID无效')
    router.back()
    return
  }

  // 防止重复加载同一用户
  if (isLoadingData || loadedUserId === userId) {
    console.log('防止重复加载:', userId)
    return
  }

  try {
    isLoadingData = true
    loadedUserId = userId
    loading.value = true

    // 从 API 获取用户详情（包含关注者、徒步次数等）
    const [detailRes, joinedRes, followStatusRes] = await Promise.all([
      userApi.getUserDetail(userId),
      activityApi.getUserJoinedActivities(userId, { page_size: 3 }),
      userApi.getFollowStatus(userId)
    ])

    if (detailRes.code === 200 && detailRes.data) {
      const userData = detailRes.data
      const joinedActivities = joinedRes.data?.items || []

      // 设置关注状态
      if (followStatusRes.code === 200 && followStatusRes.data) {
        isFollowing.value = followStatusRes.data.is_following
      }

      // 转换为组件需要的格式
      user.value = {
        id: userData.id,
        nickname: userData.nickname,
        gender: userData.gender === 'male' ? '男' : userData.gender === 'female' ? '女' : '其他',
        age: userData.age || 0,
        bio: userData.bio || '这个人很懒，什么都没写...',
        hikingLevel: userData.hiking_level || '新手',
        province: userData.province || '',
        city: userData.city || '',
        region: userData.region || '',
        tags: (userData.preferences || []).map((p: any) => p.preference_value),
        avatar: userData.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=user${userId}`,
        coverImage: userData.photos && userData.photos[0] ? userData.photos[0].photo_url : '',
        stats: {
          activities: userData.activities_count || 0,
          followers: userData.followers_count || 0,
          following: 0   // TODO: 后续可以添加 following 统计
        },
        hikingTrails: joinedActivities.map((act: any) => ({
          id: act.id,
          title: act.title,
          date: new Date(act.start_time).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit' }).replace(/\//g, '.'),
          image: act.cover_image_url || 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=300&h=400&fit=crop'
        })),
        publishedActivities: userData.photos ? userData.photos.slice(0, 3).map((photo: any) => ({
          id: photo.id,
          title: `照片 ${photo.display_order}`,
          date: new Date(photo.created_at).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }),
          location: userData.region || userData.city || userData.province || '地点未知',
          image: photo.photo_url,
          status: 'completed'
        })) : []
      }
    } else {
      toast.error('获取用户信息失败')
      router.back()
    }
  } catch (error) {
    console.error('加载用户资料失败:', error)
    toast.error('加载失败，请重试')
    router.back()
  } finally {
    loading.value = false
    isLoadingData = false
  }
})

// 组件卸载时重置标记，允许下次访问重新加载
onBeforeUnmount(() => {
  loadedUserId = null
  isLoadingData = false
})
</script>

<style scoped>
/* 页面样式 */
</style>
