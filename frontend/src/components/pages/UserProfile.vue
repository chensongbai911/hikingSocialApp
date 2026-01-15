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
        <!-- 头像和基本信息 -->
        <div class="flex items-center mb-4">
          <img
            :src="(user && user.avatar) || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'"
            alt="Avatar"
            class="w-16 h-16 rounded-full border-4 border-white shadow-md"
          />
          <div class="ml-4 flex-1">
            <div class="flex items-center gap-2">
              <h2 class="text-2xl font-bold text-gray-800">{{ (user && user.nickname) || '加载中...' }}</h2>
              <span class="px-3 py-1 bg-teal-500 text-white text-xs rounded-full font-semibold">
                {{ (user && user.hikingLevel) || '新手' }}
              </span>
            </div>
            <p class="text-gray-600 text-sm mt-1">
              📍 {{ (user && user.location) || '上海·浦东' }}
            </p>
          </div>
        </div>

        <!-- 用户统计 -->
        <div class="grid grid-cols-3 gap-4 py-4 border-t border-b border-gray-100">
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-800">{{ (user && user.stats && user.stats.activities) || 24 }}</div>
            <div class="text-xs text-gray-500 mt-1">徒步次数</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-800">{{ (user && user.stats && user.stats.followers) || 128 }}</div>
            <div class="text-xs text-gray-500 mt-1">关注者</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-800">{{ (user && user.stats && user.stats.following) || 86 }}</div>
            <div class="text-xs text-gray-500 mt-1">关注中</div>
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
        <button class="text-teal-500 text-sm font-medium">
          查看全部 {{ (user && user.hikingTrails && user.hikingTrails.length) || 24 }}
        </button>
      </div>
      <div class="grid grid-cols-3 gap-3">
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
      <div class="flex gap-3 flex-wrap">
        <span
          v-for="tag in (user && user.tags) || []"
          :key="tag"
          class="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
        >
          {{ getTagIcon(tag) }} {{ tag }}
        </span>
      </div>
    </div>

    <!-- 底部操作按钮 -->
    <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-lg">
      <div class="flex gap-3 max-w-lg mx-auto">
        <button
          class="flex-shrink-0 w-14 h-14 bg-white border-2 border-gray-200 rounded-2xl flex items-center justify-center text-2xl hover:border-teal-500 transition"
        >
          💬
        </button>
        <button
          class="flex-1 h-14 bg-teal-500 text-white rounded-2xl font-bold text-base hover:bg-teal-600 transition shadow-lg"
        >
          邀请徒步
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { userApi, activityApi } from '@/api'
import toast from '@/utils/toast'

const router = useRouter()
const route = useRoute()

// 用户数据（从 API 获取）
const user = ref<any>(null)
const loading = ref(true)

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

// 加载用户数据
onMounted(async () => {
  const userId = route.params.id as string

  if (!userId || userId === 'NaN') {
    toast.error('用户ID无效')
    router.back()
    return
  }

  try {
    loading.value = true
    // 从 API 获取用户资料
    const [profileRes, joinedRes, createdRes] = await Promise.all([
      userApi.getUserProfile(userId),
      activityApi.getUserJoinedActivities(userId, { page_size: 3 }),
      activityApi.getActivities({ creator_id: userId, page_size: 3 })
    ])

    if (profileRes.code === 200 && profileRes.data) {
      const userData = profileRes.data
      const joinedActivities = joinedRes.data?.items || []
      const createdActivities = createdRes.data?.items || []

      // 转换为组件需要的格式
      user.value = {
        id: userData.id,
        nickname: userData.nickname,
        gender: userData.gender === 'male' ? '男' : userData.gender === 'female' ? '女' : '其他',
        age: userData.age || 0,
        bio: userData.bio || '这个人很懒，什么都没写...',
        hikingLevel: userData.hiking_level || '新手',
        location: '上海·浦东', // TODO: 从用户资料获取
        tags: (userData.preferences || []).map((p: any) => p.preference_value),
        avatar: userData.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=user${userId}`,
        coverImage: userData.photos && userData.photos[0] ? userData.photos[0].photo_url : '',
        stats: {
          activities: createdRes.data?.pagination?.total || 0,
          followers: 128, // TODO: 需要关注API支持
          following: 86   // TODO: 需要关注API支持
        },
        hikingTrails: joinedActivities.map((act: any) => ({
          id: act.id,
          title: act.title,
          date: new Date(act.start_time).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit' }).replace(/\//g, '.'),
          image: act.cover_image_url || 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=300&h=400&fit=crop'
        })),
        publishedActivities: createdActivities.map((act: any) => ({
          id: act.id,
          title: act.title,
          date: new Date(act.start_time).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }),
          location: act.location,
          image: act.cover_image_url || 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=300&h=400&fit=crop',
          status: act.status
        }))
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
  }
})
</script>

<style scoped>
/* 页面样式 */
</style>
