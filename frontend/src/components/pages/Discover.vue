<template>
  <div class="discover-page min-h-screen bg-white pb-24">
    <!-- 页面头部 -->
    <div class="bg-white pt-6 pb-4 px-4 border-b border-gray-100">
      <div class="container mx-auto">
        <!-- 标题居中 -->
        <div class="flex items-center justify-center mb-4">
          <h1 class="text-2xl font-bold text-gray-800">发现徒步伴侣</h1>
        </div>

        <!-- 搜索框和筛选按钮 -->
        <div class="relative">
          <span class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索昵称或共同义趣"
            class="w-full pl-12 pr-14 py-3 bg-gray-100 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          />
          <button
            @click="showFilters = true"
            class="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-50 transition shadow-sm"
            title="筛选"
          >
            <span class="text-lg">⚙️</span>
          </button>
        </div>
      </div>

    </div>

    <!-- 全屏筛选面板（模态框） -->
    <div
      v-if="showFilters"
      class="fixed inset-0 bg-white z-50 overflow-y-auto"
      style="padding-top: env(safe-area-inset-top);"
    >
      <div class="min-h-screen">
        <!-- 顶部操作栏 -->
        <div class="flex items-center justify-between px-4 py-4 border-b border-gray-100">
          <button
            @click="resetFilters"
            class="text-gray-600 text-base font-medium"
          >
            重置
          </button>
          <h2 class="text-lg font-bold text-gray-800">筛选</h2>
          <button
            @click="showFilters = false"
            class="px-6 py-2 bg-teal-500 text-white rounded-full text-sm font-medium hover:bg-teal-600 transition"
          >
            完成
          </button>
        </div>

        <!-- 筛选内容 -->
        <div class="px-4 py-6 space-y-8">
          <!-- 性别 -->
          <div>
            <h3 class="text-lg font-bold text-gray-800 mb-4">性别</h3>
            <div class="flex gap-3">
              <button
                v-for="gender in genderOptions"
                :key="gender"
                @click="toggleFilter('gender', gender)"
                :class="[
                  'flex-1 py-3 rounded-full font-medium text-base transition',
                  activeFilters.gender.includes(gender)
                    ? 'bg-teal-500 text-white'
                    : 'bg-gray-100 text-gray-700'
                ]"
              >
                {{ gender }}
              </button>
            </div>
          </div>

          <!-- 年龄范围 -->
          <div>
            <h3 class="text-lg font-bold text-gray-800 mb-4">年龄范围</h3>
            <div class="px-2">
              <div class="flex justify-between mb-3">
                <span class="text-2xl font-bold text-gray-800">{{ ageRange[0] }}</span>
                <span class="text-2xl font-bold text-gray-800">{{ ageRange[1] }}</span>
              </div>
              <div class="relative">
                <input
                  type="range"
                  v-model.number="ageRange[0]"
                  min="18"
                  max="50"
                  class="range-slider"
                  style="position: absolute; width: 100%; pointer-events: auto;"
                />
                <input
                  type="range"
                  v-model.number="ageRange[1]"
                  min="18"
                  max="50"
                  class="range-slider"
                  style="position: absolute; width: 100%; pointer-events: auto;"
                />
                <div class="h-2 bg-gray-200 rounded-full relative">
                  <div
                    class="absolute h-2 bg-teal-500 rounded-full"
                    :style="{
                      left: ((ageRange[0] - 18) / 32) * 100 + '%',
                      right: (100 - ((ageRange[1] - 18) / 32) * 100) + '%'
                    }"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- 徒步经验 -->
          <div>
            <h3 class="text-lg font-bold text-gray-800 mb-4">徒步经验</h3>
            <div class="flex gap-3">
              <button
                v-for="level in levelOptions"
                :key="level"
                @click="toggleFilter('level', level)"
                :class="[
                  'flex-1 py-3 rounded-full font-medium text-base transition',
                  activeFilters.level.includes(level)
                    ? 'bg-teal-500 text-white'
                    : 'bg-gray-100 text-gray-700'
                ]"
              >
                {{ level }}
              </button>
            </div>
          </div>

          <!-- 共同兴趣 -->
          <div>
            <h3 class="text-lg font-bold text-gray-800 mb-4">共同兴趣</h3>
            <div class="flex gap-3 flex-wrap">
              <button
                v-for="interest in interestOptions"
                :key="interest"
                @click="toggleFilter('interests', interest)"
                :class="[
                  'px-6 py-3 rounded-full font-medium text-base transition',
                  activeFilters.interests.includes(interest)
                    ? 'bg-teal-500 text-white'
                    : 'bg-gray-100 text-gray-700'
                ]"
              >
                {{ interest }}
              </button>
            </div>
          </div>

          <!-- 距离范围 -->
          <div>
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-bold text-gray-800">距离范围</h3>
              <span class="text-teal-500 text-base font-semibold">{{ distance }}km内</span>
            </div>
            <div class="px-2">
              <input
                type="range"
                v-model.number="distance"
                min="1"
                max="100"
                class="range-slider w-full"
              />
              <div class="h-2 bg-gray-200 rounded-full relative overflow-hidden">
                <div
                  class="absolute h-2 bg-teal-500 rounded-full left-0"
                  :style="{ width: distance + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 用户卡片网格(2列布局) -->
    <div class="container mx-auto px-3 py-6">
      <!-- 加载状态 -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p class="text-gray-600">加载中...</p>
        </div>
      </div>

      <div v-else-if="filteredUsers.length > 0" class="grid grid-cols-2 gap-3">
        <div
          v-for="user in filteredUsers"
          :key="user.id"
          class="user-card group cursor-pointer"
          @click="viewUserProfile(user.id)"
        >
          <!-- 背景渐变卡片 -->
          <div
            class="relative rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
            style="aspect-ratio: 3/4;"
            :style="{ background: user.coverImage ? 'transparent' : user.gradient }"
          >
            <!-- 封面图片（如果有） -->
            <img
              v-if="user.coverImage"
              :src="user.coverImage"
              :alt="user.nickname"
              class="absolute inset-0 w-full h-full object-cover"
            />
            <!-- 遮罩层（增强文字可读性） -->
            <div v-if="user.coverImage" class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

            <!-- 卡片内容 -->
            <div class="absolute inset-0 flex flex-col justify-between p-4">
              <!-- 顶部：等级徽章 + 关注按钮 -->
              <div class="flex justify-between items-start">
                <span class="px-3 py-1 bg-white/90 backdrop-blur text-xs font-semibold text-gray-700 rounded-full">
                  {{ user.hikingLevel }}
                </span>
                <button
                  @click="toggleFollowUser(user.id, $event)"
                  :disabled="user.followingLoading"
                  :class="[
                    'px-3 py-1 rounded-full text-xs font-semibold transition-all',
                    user.isFollowing
                      ? 'bg-white/90 text-gray-700'
                      : 'bg-teal-500 text-white',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  ]"
                  class="backdrop-blur"
                >
                  {{ user.followingLoading ? '...' : (user.isFollowing ? '已关注' : '关注') }}
                </button>
              </div>

              <!-- 底部：用户信息 -->
              <div class="space-y-1">
                <!-- 昵称 -->
                <h3 class="font-bold text-white text-base">{{ user.nickname }}</h3>

                <!-- 基本信息 -->
                <p class="text-xs text-white/90">{{ user.gender }}, {{ user.age }}岁, {{ user.hikingLevel }}</p>

                <!-- 最近活动 -->
                <p class="text-xs text-white/80">最近活动: {{ user.recentActivity }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>      <!-- 无结果提示 -->
      <div v-else class="text-center py-12">
        <div class="text-6xl mb-4">🔍</div>
        <p class="text-gray-600 text-lg">没有找到匹配的徒步伙伴</p>
        <p class="text-gray-500 text-sm mt-2">试试调整搜索条件或筛选条件</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDiscoveryStore } from '@/stores/discovery'
import { userApi } from '@/api'
import toast from '@/utils/toast'

const router = useRouter()
const discoveryStore = useDiscoveryStore()

// 搜索和筛选
const searchQuery = ref('')
const showFilters = ref(false)

// 筛选选项
const genderOptions = ['男', '女']
const levelOptions = ['新手', '中级', '高手']
const interestOptions = ['摄影', '露营', '美食', '宠物']

// 活跃筛选条件
const activeFilters = ref({
  gender: [] as string[],
  level: [] as string[],
  interests: [] as string[]
})

// 范围筛选
const ageRange = ref([18, 50])
const distance = ref(50)

// 渐变背景配置（参考设计图）
const gradients = [
  'linear-gradient(135deg, #ffb6c1 0%, #ffd700 100%)', // 粉红→金黄
  'linear-gradient(135deg, #4db8a8 0%, #d4e157 100%)', // 青绿→黄绿
  'linear-gradient(135deg, #d4a574 0%, #f4a460 100%)', // 土黄→橙
  'linear-gradient(135deg, #8b7355 0%, #f4e4c1 100%)', // 咖啡→米黄
  'linear-gradient(135deg, #c9b998 0%, #6b5b4a 100%)', // 米色→深棕
  'linear-gradient(135deg, #5f9ea0 0%, #e0f7fa 100%)'  // 青蓝→天蓝
]

// 从store获取推荐用户
const recommendedUsers = computed(() => discoveryStore.recommendedUsers)
const loading = computed(() => discoveryStore.loading)

// 关注状态管理
const followingMap = ref<Map<string | number, boolean>>(new Map())
const followingLoading = ref<Map<string | number, boolean>>(new Map())

// 映射徒步等级
const mapHikingLevel = (level: string | undefined): string => {
  const map: Record<string, string> = {
    'beginner': '新手',
    'intermediate': '中级',
    'advanced': '高手',
    'expert': '专家'
  }
  return level ? (map[level] || level) : '新手'
}

// 计算过滤后的用户列表
const filteredUsers = computed(() => {
  // 将后端数据转换为前端显示格式
  const transformedUsers = recommendedUsers.value.map((user, index) => ({
    id: user.id, // 使用 user.id
    nickname: user.nickname,
    gender: user.gender === 'male' ? '男' : user.gender === 'female' ? '女' : '其他',
    age: user.age || 0,
    bio: user.bio || '这个人很懒，什么都没写...',
    hikingLevel: mapHikingLevel(user.hiking_level),
    level: mapHikingLevel(user.hiking_level),
    tags: user.preferences ? user.preferences.map((p: any) => p.preference_value) : [],
    recentActivity: '最近活跃',
    avatar: user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=user${user.id}`,
    coverImage: user.avatar_url || '',
    gradient: gradients[index % gradients.length],
    commonPreferences: user.common_preferences || 0,
    isFollowing: followingMap.value.get(user.id) ?? false,
    followingLoading: followingLoading.value.get(user.id) ?? false
  }))

  return transformedUsers.filter((user) => {
    // 搜索过滤
    const searchLower = searchQuery.value.toLowerCase()
    const matchesSearch =
      !searchQuery.value ||
      user.nickname.toLowerCase().includes(searchLower) ||
      user.bio.toLowerCase().includes(searchLower) ||
      (user.tags.length > 0 && user.tags.some((tag: string) => tag.toLowerCase().includes(searchLower)))

    // 性别过滤
    const matchesGender =
      activeFilters.value.gender.length === 0 || activeFilters.value.gender.includes(user.gender)

    // 年龄过滤 (允许年龄为0的用户，即未设置年龄的用户显示)
    const matchesAge = user.age === 0 || (user.age >= ageRange.value[0] && user.age <= ageRange.value[1])

    // 等级过滤
    const matchesLevel =
      activeFilters.value.level.length === 0 || activeFilters.value.level.includes(user.hikingLevel)

    // 兴趣过滤
    const matchesInterests =
      activeFilters.value.interests.length === 0 ||
      (user.tags.length > 0 && activeFilters.value.interests.some((interest: string) => user.tags.includes(interest)))

    return matchesSearch && matchesGender && matchesAge && matchesLevel && matchesInterests
  })
})

// 切换筛选选项
const toggleFilter = (filterType: 'gender' | 'level' | 'interests', value: string) => {
  const index = activeFilters.value[filterType].indexOf(value)
  if (index > -1) {
    activeFilters.value[filterType].splice(index, 1)
  } else {
    activeFilters.value[filterType].push(value)
  }
}

// 重置筛选
const resetFilters = () => {
  activeFilters.value = {
    gender: [],
    level: [],
    interests: []
  }
  ageRange.value = [18, 50]
  distance.value = 50
  searchQuery.value = ''
}

// 查看用户资料
const viewUserProfile = (userId: string | number) => {
  router.push({
    name: 'user-profile',
    params: { id: userId }
  })
}

// 加载推荐用户
const loadRecommendedUsers = async () => {
  try {
    await discoveryStore.fetchRecommendedUsers({ page: 1, page_size: 20 })
  } catch (error) {
    console.error('加载推荐用户失败:', error)
  }
}

// 关注/取消关注用户
const toggleFollowUser = async (userId: string | number, event: Event) => {
  event.stopPropagation() // 阻止卡片点击事件

  try {
    followingLoading.value.set(userId, true)
    const isFollowing = followingMap.value.get(userId) ?? false

    if (isFollowing) {
      // 取消关注
      const res = await userApi.unfollowUser(String(userId))
      if (res.code === 200) {
        followingMap.value.set(userId, false)
        toast.success('已取消关注')
      } else {
        toast.error(res.message || '取消关注失败')
      }
    } else {
      // 关注
      const res = await userApi.followUser(String(userId))
      if (res.code === 200) {
        followingMap.value.set(userId, true)
        toast.success('关注成功')
      } else {
        toast.error(res.message || '关注失败')
      }
    }
  } catch (error) {
    console.error('关注操作失败:', error)
    toast.error('操作失败，请重试')
  } finally {
    followingLoading.value.set(userId, false)
  }
}

// 加载单个用户的关注状态
const loadFollowStatus = async (userId: string | number) => {
  try {
    const res = await userApi.getFollowStatus(String(userId))
    if (res.code === 200 && res.data) {
      followingMap.value.set(userId, res.data.is_following)
    }
  } catch (error) {
    console.error(`加载关注状态失败 (${userId}):`, error)
  }
}

onMounted(async () => {
  await loadRecommendedUsers()
  // 加载所有用户的关注状态
  for (const user of recommendedUsers.value) {
    await loadFollowStatus(user.id)
  }
})
</script>

<style scoped>
.discover-page {
  background-color: #f9fafb;
}

/* 用户卡片悬停效果 */
.user-card:hover {
  transform: translateY(-4px);
}

/* 搜索框聚焦样式 */
input:focus {
  background-color: #f3f4f6 !important;
}

/* 滑块样式 */
.range-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 8px;
  background: transparent;
  outline: none;
  border-radius: 4px;
}

.range-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 24px;
  height: 24px;
  background: #14b8a6;
  border: 3px solid white;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 10;
}

.range-slider::-moz-range-thumb {
  width: 24px;
  height: 24px;
  background: #14b8a6;
  border: 3px solid white;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 10;
}
</style>
