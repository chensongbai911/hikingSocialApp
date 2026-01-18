<template>
  <div class="fixed inset-0 bg-white z-50 flex flex-col">
    <!-- 顶部导航 -->
    <div class="bg-white border-b border-gray-100">
      <div class="flex items-center justify-center relative px-4 py-4">
        <button
          @click="$emit('close')"
          class="absolute left-4 w-10 h-10 flex items-center justify-center"
        >
          <span class="text-2xl">←</span>
        </button>
        <h2 class="text-lg font-bold text-gray-800">选择目的地</h2>
      </div>

      <!-- 搜索框 - 只在列表模式显示 -->
      <div v-if="!isMapMode" class="px-4 pb-4">
        <div class="relative">
          <span class="absolute left-4 top-1/2 transform -translate-y-1/2 text-teal-500 text-xl">🔍</span>
          <input
            v-model="searchQuery"
            @focus="showSearchSuggestions = true"
            type="text"
            placeholder="搜索山峰、路线、景区"
            class="w-full pl-12 pr-10 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <!-- 清空按钮 -->
          <button
            v-if="searchQuery"
            @click="searchQuery = ''; showSearchSuggestions = false"
            class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>

          <!-- 搜索结果下拉建议 -->
          <div
            v-if="showSearchSuggestions && searchQuery && filteredDestinations.length > 0"
            class="absolute top-full left-4 right-4 mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg max-h-64 overflow-y-auto z-50"
          >
            <div
              v-for="destination in filteredDestinations.slice(0, 8)"
              :key="destination.name"
              @click="selectDestination(destination.name)"
              class="px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-teal-50 cursor-pointer transition flex items-center gap-3"
            >
              <img
                :src="destination.image"
                :alt="destination.name"
                class="w-10 h-10 rounded-lg object-cover flex-shrink-0"
              />
              <div class="flex-1 min-w-0">
                <div class="font-medium text-gray-800 text-sm truncate">{{ destination.name }}</div>
                <div class="text-xs text-gray-500 mt-0.5 truncate">📍 {{ destination.area }}</div>
              </div>
              <span class="text-gray-400 text-xs flex-shrink-0">→</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 列表模式 -->
    <div v-if="!isMapMode" class="flex-1 overflow-y-auto">
      <!-- 地图找山入口 -->
      <div class="px-4 pt-4">
        <div
          @click="switchToMapMode"
          class="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition"
        >
          <div class="w-14 h-14 bg-teal-500 rounded-full flex items-center justify-center text-white text-2xl shadow-lg">
            🗺️
          </div>
          <div class="flex-1">
            <h3 class="text-base font-bold text-gray-800 mb-1">地图找山</h3>
            <p class="text-sm text-gray-500">在地图上发现你身边的宝藏徒步点</p>
          </div>
          <span class="text-teal-500 text-2xl">→</span>
        </div>
      </div>

      <div class="px-4 py-4 space-y-6">
        <!-- 最近搜索 -->
        <div v-if="recentSearches.length > 0">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-base font-bold text-teal-600">最近搜索</h3>
            <button @click="clearRecentSearches" class="text-sm text-gray-500">清除记录</button>
          </div>
          <div class="flex gap-2 flex-wrap">
            <button
              v-for="search in recentSearches"
              :key="search"
              @click="selectDestination(search)"
              class="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:border-teal-500 hover:bg-teal-50 hover:text-teal-600 transition flex items-center gap-2"
            >
              <span class="text-teal-500">🕐</span>
              <span>{{ search }}</span>
            </button>
          </div>
        </div>

        <!-- 热门推荐 -->
        <div>
          <h3 class="text-base font-bold text-gray-800 mb-3">热门推荐</h3>
          <div class="space-y-3">
            <div
              v-for="destination in filteredDestinations"
              :key="destination.name"
              @click="selectDestination(destination.name)"
              class="bg-white border border-gray-200 rounded-2xl p-3 flex items-center gap-3 hover:border-teal-500 hover:shadow-md transition cursor-pointer"
            >
              <img
                :src="destination.image"
                :alt="destination.name"
                class="w-16 h-16 rounded-xl object-cover"
              />
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <h4 class="font-bold text-gray-800">{{ destination.name }}</h4>
                  <span
                    v-if="destination.badge"
                    class="px-2 py-0.5 bg-teal-50 text-teal-500 text-xs rounded-full font-medium"
                  >
                    {{ destination.badge }}
                  </span>
                </div>
                <div class="flex items-center gap-2 text-xs text-gray-500">
                  <span>📍 {{ destination.distance }}</span>
                  <span>•</span>
                  <span>{{ destination.area }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 地图模式 -->
    <div v-else class="flex-1 relative">
      <!-- 地图容器 -->
      <div id="amap-container" class="absolute inset-0 bg-gray-100"></div>

      <!-- 顶部工具栏 - 未选中位置时显示 -->
      <div v-if="!selectedMapLocation" class="absolute top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 p-4 z-30">
        <div class="flex gap-2">
          <!-- 返回列表按钮 -->
          <button
            @click="switchToListMode"
            class="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition shadow-sm flex-shrink-0"
          >
            <span class="text-xl">←</span>
          </button>
          <!-- 搜索框 -->
          <div class="flex-1 relative">
            <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-teal-500 text-lg">🔍</span>
            <input
              v-model="mapSearchQuery"
              @input="onMapSearch"
              @keyup.enter="onMapSearchEnter"
              @focus="showMapSearchResults = true"
              type="text"
              placeholder="搜索地点或点击地图选择位置"
              class="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
            />

            <!-- 搜索结果下拉列表 -->
            <div
              v-if="showMapSearchResults && mapSearchResults.length > 0"
              class="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-2xl shadow-lg max-h-60 overflow-y-auto z-40"
            >
              <div
                v-for="(result, index) in mapSearchResults"
                :key="index"
                @click="selectMapSearchResult(result)"
                class="px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-teal-50 cursor-pointer transition"
              >
                <div class="font-medium text-gray-800 text-sm">📍 {{ result.name }}</div>
                <div class="text-xs text-gray-500 mt-1">{{ result.address }}</div>
              </div>
            </div>

            <!-- 清空搜索按钮 -->
            <button
              v-if="mapSearchQuery"
              @click="mapSearchQuery = ''; showMapSearchResults = false; mapSearchResults = []"
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <!-- 定位按钮 -->
          <button
            @click="centerToCurrentLocation"
            class="w-12 h-12 bg-teal-500 text-white rounded-full flex items-center justify-center hover:bg-teal-600 transition shadow-lg flex-shrink-0"
            title="定位到我的位置"
          >
            <span class="text-xl">📍</span>
          </button>
        </div>
      </div>

      <!-- 顶部返回按钮 - 选中位置后显示 -->
      <button
        v-if="selectedMapLocation"
        @click="switchToListMode"
        class="absolute top-4 left-4 z-20 bg-white rounded-full px-4 py-3 shadow-lg flex items-center gap-2 hover:bg-gray-50 transition"
      >
        <span class="text-base">←</span>
        <span class="text-sm font-medium">列表</span>
      </button>

      <!-- 地图底部确认栏 - 选中位置后显示 -->
      <div v-if="selectedMapLocation" class="absolute bottom-0 left-0 right-0 bg-gradient-to-b from-transparent via-white/90 to-white backdrop-blur-sm border-t border-teal-200 z-20" style="padding-bottom: max(16px, env(safe-area-inset-bottom));">
        <div class="px-4 pt-4 pb-4">
          <!-- 已选中提示 -->
          <div class="flex items-center gap-2 mb-3 text-teal-600">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
            <span class="text-xs font-semibold">已选中位置</span>
          </div>

          <!-- 位置卡片 -->
          <div class="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-4 mb-4 border border-teal-100">
            <div class="flex gap-3">
              <div class="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center text-white flex-shrink-0 text-xl">📍</div>
              <div class="flex-1 min-w-0">
                <div class="font-bold text-gray-900 text-base truncate">{{ selectedMapLocation.name || '未命名地点' }}</div>
                <div class="text-sm text-gray-600 mt-1 line-clamp-2">{{ selectedMapLocation.address || '位置信息' }}</div>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="flex gap-3">
            <button
              @click="cancelMapSelection"
              class="flex-1 py-3 bg-white text-teal-600 rounded-xl font-semibold hover:bg-gray-50 transition border border-gray-200 text-base"
            >
              重新选择
            </button>
            <button
              @click="confirmMapSelection"
              class="flex-1 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-bold hover:from-teal-600 hover:to-emerald-600 transition shadow-lg text-base flex items-center justify-center gap-2"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
              确认此位置
            </button>
          </div>
        </div>
      </div>

      <!-- 难度图例 - 右下角，仅在未选中位置时显示 -->
      <div v-if="!selectedMapLocation" class="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-3 z-20">
        <div class="flex flex-col gap-2 text-xs">
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 bg-green-500 rounded-full"></div>
            <span class="text-gray-700 font-medium">简单</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 bg-yellow-500 rounded-full"></div>
            <span class="text-gray-700 font-medium">中等</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 bg-red-500 rounded-full"></div>
            <span class="text-gray-700 font-medium">困难</span>
          </div>
        </div>
      </div>


    </div>

    <!-- 目的地详情悬浮窗 -->
    <div
      v-if="selectedDestination"
      class="fixed inset-x-0 bottom-0 z-60 animate-slide-up"
      @click.self="closeDestinationDetail"
    >
      <div class="bg-white rounded-t-3xl shadow-2xl max-h-[70vh] overflow-y-auto">
        <div class="relative">
          <!-- 关闭按钮 -->
          <button
            @click="closeDestinationDetail"
            class="absolute top-4 right-4 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white z-10"
          >
            ✕
          </button>

          <!-- 封面图 -->
          <div class="relative h-48 overflow-hidden rounded-t-3xl">
            <img
              :src="selectedDestination.image"
              :alt="selectedDestination.name"
              class="w-full h-full object-cover"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            <div class="absolute bottom-4 left-4 right-4">
              <h3 class="text-2xl font-bold text-white mb-1">{{ selectedDestination.name }}</h3>
              <div class="flex items-center gap-2 text-white/90 text-sm">
                <span>{{ selectedDestination.area }}</span>
                <span>•</span>
                <span>{{ selectedDestination.distance }}</span>
              </div>
            </div>
          </div>

          <!-- 详细信息 -->
          <div class="p-4 space-y-4">
            <!-- 标签 -->
            <div class="flex gap-2 flex-wrap">
              <span
                :class="[
                  'px-3 py-1 rounded-full text-xs font-medium',
                  selectedDestination.difficulty === '入门' ? 'bg-green-50 text-green-600' :
                  selectedDestination.difficulty === '中等' ? 'bg-yellow-50 text-yellow-600' :
                  'bg-red-50 text-red-600'
                ]"
              >
                {{ selectedDestination.difficulty }}难度
              </span>
              <span class="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                {{ selectedDestination.visitors }} 人去过
              </span>
              <span v-if="selectedDestination.badge" class="px-3 py-1 bg-teal-50 text-teal-600 rounded-full text-xs font-medium">
                {{ selectedDestination.badge }}
              </span>
            </div>

            <!-- 实景图 -->
            <div v-if="selectedDestination.photos" class="space-y-2">
              <h4 class="text-sm font-bold text-gray-800">📷 实景图</h4>
              <div class="flex gap-2 overflow-x-auto pb-2">
                <img
                  v-for="(photo, index) in selectedDestination.photos"
                  :key="index"
                  :src="photo"
                  class="w-24 h-24 rounded-xl object-cover flex-shrink-0"
                />
              </div>
            </div>

            <!-- 选择按钮 -->
            <button
              @click="confirmDestination(selectedDestination.name)"
              class="w-full py-4 bg-teal-500 text-white rounded-2xl font-bold text-base hover:bg-teal-600 transition"
            >
              选择此目的地
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { destinationApi, type Destination } from '@/api/destination'
import toast from '@/utils/toast'

// 高德地图类型声明
declare global {
  interface Window {
    AMap: any
  }
}

const emit = defineEmits<{
  close: []
  select: [name: string]
}>()

// 模式切换
const isMapMode = ref(false)
const searchQuery = ref('')
const showSearchSuggestions = ref(false)
const mapSearchQuery = ref('')
const loading = ref(false)
const showMapSearchResults = ref(false)
const mapSearchResults = ref<Array<{name: string; address: string; location: {lng: number; lat: number}}>>([])

// 地图相关
let map: any = null
let placeSearch: any = null
let geolocation: any = null
let geocoder: any = null
const markers: any[] = []
let centerMarker: any = null

// 地图选择的位置
const selectedMapLocation = ref<{
  name: string
  address: string
  lat: number
  lng: number
} | null>(null)

// 用户位置
const userLocation = ref<{ latitude: number; longitude: number } | null>(null)

// 目的地数据
const popularDestinations = ref<Destination[]>([])
const nearbyDestinations = ref<Destination[]>([])
const allDestinations = ref<Destination[]>([])
const recentSearches = ref<string[]>([])

// 排序方式
const sortBy = ref<'distance' | 'popularity' | 'rating' | 'activity_count'>('popularity')

// 选中的目的地详情
const selectedDestination = ref<Destination | null>(null)

// 难度中文映射
const difficultyMap: Record<string, string> = {
  easy: '入门',
  moderate: '中等',
  hard: '困难'
}

// 过滤后的目的地列表
const filteredDestinations = computed(() => {
  if (!searchQuery.value) return popularDestinations.value

  const keyword = searchQuery.value.toLowerCase()
  return allDestinations.value.filter(d =>
    d.name.toLowerCase().includes(keyword) ||
    d.area.toLowerCase().includes(keyword) ||
    d.tags?.toLowerCase().includes(keyword)
  )
})

// 根据难度返回颜色类
const getDifficultyColor = (difficulty: string) => {
  if (difficulty === 'easy') {
    return 'bg-green-500 text-white'
  } else if (difficulty === 'moderate') {
    return 'bg-yellow-500 text-white'
  } else {
    return 'bg-red-500 text-white'
  }
}

// 格式化距离
const formatDistance = (distance?: number) => {
  if (!distance) return ''
  return distance < 1 ? `${(distance * 1000).toFixed(0)}m` : `${distance.toFixed(1)}km`
}

// 初始化数据
onMounted(async () => {
  try {
    // 获取用户位置
    getUserLocation()

    // 加载搜索历史
    loadSearchHistory()

    // 加载热门目的地
    await loadPopularDestinations()

    // 加载所有目的地用于搜索
    await loadAllDestinations()
  } catch (error) {
    console.error('初始化失败:', error)
  }
})

// 获取用户位置
const getUserLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        userLocation.value = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }

        // 加载附近目的地
        await loadNearbyDestinations()
      },
      (error) => {
        console.error('获取位置失败:', error)
        // 使用默认位置（北京）
        userLocation.value = { latitude: 39.9042, longitude: 116.4074 }
      }
    )
  } else {
    // 使用默认位置
    userLocation.value = { latitude: 39.9042, longitude: 116.4074 }
  }
}

// 加载热门目的地
const loadPopularDestinations = async () => {
  try {
    loading.value = true
    const response = await destinationApi.getPopularDestinations(10)
    if (response.code === 200) {
      // 使用Set去重，根据id去重
      const uniqueDestinations = Array.from(
        new Map(response.data.map(d => [d.id, d])).values()
      )
      popularDestinations.value = uniqueDestinations.map(formatDestination)
    }
  } catch (error) {
    console.error('加载热门目的地失败:', error)
  } finally {
    loading.value = false
  }
}

// 加载附近目的地
const loadNearbyDestinations = async () => {
  if (!userLocation.value) return

  try {
    const response = await destinationApi.getNearbyDestinations(
      userLocation.value.latitude,
      userLocation.value.longitude,
      50,
      10
    )
    if (response.code === 200) {
      nearbyDestinations.value = response.data.map(formatDestination)
    }
  } catch (error) {
    console.error('加载附近目的地失败:', error)
  }
}

// 加载所有目的地
const loadAllDestinations = async () => {
  try {
    const response = await destinationApi.getDestinations({
      pageSize: 100,
      sortBy: sortBy.value,
      latitude: userLocation.value?.latitude,
      longitude: userLocation.value?.longitude
    })
    if (response.code === 200) {
      allDestinations.value = response.data.destinations.map(formatDestination)
    }
  } catch (error) {
    console.error('加载目的地列表失败:', error)
  }
}

// 格式化目的地数据
const formatDestination = (dest: Destination) => {
  return {
    ...dest,
    image: dest.cover_image || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    badge: dest.popularity_score > 1000 ? '人气榜 Top' : '',
    distance: dest.user_distance ? formatDistance(dest.user_distance) : `${dest.distance || 0}km`,
    visitors: `${(dest.visit_count / 1000).toFixed(1)}k+`,
    difficulty: difficultyMap[dest.difficulty] || dest.difficulty
  }
}

// 加载搜索历史
const loadSearchHistory = async () => {
  try {
    const response = await destinationApi.getSearchHistory(10)
    if (response.code === 200) {
      recentSearches.value = response.data
    }
  } catch (error) {
    // 未登录或加载失败，使用本地存储
    const local = localStorage.getItem('destination_search_history')
    if (local) {
      recentSearches.value = JSON.parse(local)
    }
  }
}

// 监听搜索关键词变化
watch(searchQuery, async (newValue) => {
  if (newValue) {
    // 搜索防抖
    setTimeout(async () => {
      if (searchQuery.value === newValue) {
        await loadAllDestinations()
      }
    }, 300)
  }
})

// 切换到地图模式
const switchToMapMode = () => {
  isMapMode.value = true
  // 延迟初始化地图，确保容器已渲染
  setTimeout(() => {
    initAMap()
  }, 100)
}

// 初始化高德地图
const initAMap = () => {
  if (!window.AMap) {
    toast.error('地图加载失败，请刷新重试')
    return
  }

  // 创建地图实例
  map = new window.AMap.Map('amap-container', {
    zoom: 12, // 适中的缩放级别
    center: userLocation.value
      ? [userLocation.value.longitude, userLocation.value.latitude]
      : [116.4074, 39.9042], // 默认北京
    mapStyle: 'amap://styles/normal', // 使用标准地图样式
    features: ['bg', 'road', 'building', 'point'], // 显示背景、道路、建筑、POI点
    viewMode: '2D', // 2D视图
    showLabel: true, // 显示文字标注
    labelzIndex: 130, // 标注层级
    zoomEnable: true, // 允许缩放
    dragEnable: true, // 允许拖拽
    doubleClickZoom: true, // 双击缩放
    scrollWheel: true, // 滚轮缩放
    touchZoom: true, // 触摸缩放
    // 调整控件位置
    zooms: [3, 18], // 缩放级别范围
    pitch: 0,
    rotation: 0
  })

  // 隐藏logo和版权信息
  map.on('complete', () => {
    console.log('地图加载完成')
    // 隐藏高德logo和版权
    setTimeout(() => {
      const amapLogo = document.querySelector('.amap-logo')
      const amapCopyright = document.querySelector('.amap-copyright')
      if (amapLogo) (amapLogo as HTMLElement).style.display = 'none'
      if (amapCopyright) (amapCopyright as HTMLElement).style.display = 'none'
    }, 100)
  })

  // 初始化搜索插件
  window.AMap.plugin(['AMap.PlaceSearch', 'AMap.Geolocation', 'AMap.Geocoder'], () => {
    // 地点搜索
    placeSearch = new window.AMap.PlaceSearch({
      map: map,
      pageSize: 10,
      pageIndex: 1,
      city: '北京',
      citylimit: false
    })

    // 定位插件
    geolocation = new window.AMap.Geolocation({
      enableHighAccuracy: true,
      timeout: 10000,
      zoomToAccuracy: true,
      buttonPosition: 'RB'
    })

    // 地理编码插件
    geocoder = new window.AMap.Geocoder({
      city: '全国'
    })
  })

  // 添加目的地标记
  addDestinationMarkers()

  // 添加地图点击事件 - 选择位置
  map.on('click', (e: any) => {
    const { lng, lat } = e.lnglat
    selectLocationOnMap(lng, lat)
  })
}

// 添加目的地标记
const addDestinationMarkers = () => {
  // 清除旧标记
  markers.forEach(marker => marker.setMap(null))
  markers.length = 0

  // 获取要显示的目的地列表
  const destinations = allDestinations.value.length > 0
    ? allDestinations.value
    : popularDestinations.value

  destinations.forEach((destination) => {
    if (!destination.latitude || !destination.longitude) return

    // 根据难度选择颜色
    let color = '#10b981' // 绿色 - 简单
    if (destination.difficulty === '中等' || destination.difficulty === 'moderate') {
      color = '#f59e0b' // 黄色
    } else if (destination.difficulty === '困难' || destination.difficulty === 'hard') {
      color = '#ef4444' // 红色
    }

    // 创建自定义标记内容
    const markerContent = `
      <div style="
        background: ${color};
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        cursor: pointer;
        border: 3px solid white;
      ">
        🏔️
      </div>
      <div style="
        position: absolute;
        top: 45px;
        left: 50%;
        transform: translateX(-50%);
        background: white;
        padding: 4px 8px;
        border-radius: 12px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        white-space: nowrap;
        font-size: 12px;
        font-weight: 600;
        color: #1f2937;
      ">
        ${destination.name}
      </div>
    `

    // 创建标记
    const marker = new window.AMap.Marker({
      position: [destination.longitude, destination.latitude],
      content: markerContent,
      offset: new window.AMap.Pixel(-20, -20),
      extData: destination // 存储目的地数据
    })

    // 点击标记显示详情
    marker.on('click', () => {
      showDestinationDetail(destination)
      // 地图居中到该标记
      map.setCenter([destination.longitude, destination.latitude])
    })

    marker.setMap(map)
    markers.push(marker)
  })
}

// 地图搜索（实时搜索 - 显示下拉列表）
let searchTimeout: any = null
const onMapSearch = () => {
  showMapSearchResults.value = true

  if (!mapSearchQuery.value || !placeSearch) {
    mapSearchResults.value = []
    return
  }

  // 搜索防抖
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    placeSearch.search(mapSearchQuery.value, (status: string, result: any) => {
      if (status === 'complete' && result.poiList) {
        const pois = result.poiList.pois
        if (pois && pois.length > 0) {
          // 格式化搜索结果显示在下拉列表
          mapSearchResults.value = pois.slice(0, 10).map((poi: any) => ({
            name: poi.name,
            address: poi.address || `${poi.pname}${poi.cityname}${poi.adname}`,
            location: poi.location
          }))
        } else {
          mapSearchResults.value = []
        }
      } else {
        mapSearchResults.value = []
      }
    })
  }, 300)
}

// 选择搜索结果
const selectMapSearchResult = (result: any) => {
  if (result && result.location) {
    selectLocationOnMap(result.location.lng, result.location.lat)
    showMapSearchResults.value = false
    mapSearchQuery.value = ''
    mapSearchResults.value = []
  }
}

// 切换到列表模式
const switchToListMode = () => {
  isMapMode.value = false
  selectedMapLocation.value = null
  // 销毁地图实例以释放资源
  if (map) {
    map.destroy()
    map = null
  }
  if (centerMarker) {
    centerMarker.setMap(null)
    centerMarker = null
  }
}

// 在地图上选择位置
const selectLocationOnMap = (lng: number, lat: number) => {
  // 移除旧的中心标记
  if (centerMarker) {
    centerMarker.setMap(null)
  }

  // 创建新的中心标记（大一点，更醒目）
  centerMarker = new window.AMap.Marker({
    position: [lng, lat],
    content: `
      <div style="
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 4px solid white;
        box-shadow: 0 4px 12px rgba(20, 184, 166, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          transform: rotate(45deg);
          font-size: 24px;
        ">📍</div>
      </div>
    `,
    offset: new window.AMap.Pixel(-25, -50),
    zIndex: 200
  })
  centerMarker.setMap(map)

  // 地图居中到选中位置
  map.setCenter([lng, lat])

  // 使用地理编码获取地址信息
  if (geocoder) {
    geocoder.getAddress([lng, lat], (status: string, result: any) => {
      if (status === 'complete' && result.info === 'OK') {
        const addressComponent = result.regeocode.addressComponent
        const formattedAddress = result.regeocode.formattedAddress
        const poi = result.regeocode.pois?.[0]

        selectedMapLocation.value = {
          name: poi?.name || addressComponent.township || addressComponent.district || '选中的位置',
          address: formattedAddress,
          lat: lat,
          lng: lng
        }
      } else {
        selectedMapLocation.value = {
          name: '选中的位置',
          address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          lat: lat,
          lng: lng
        }
      }
    })
  } else {
    selectedMapLocation.value = {
      name: '选中的位置',
      address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      lat: lat,
      lng: lng
    }
  }
}

// 取消地图选择
const cancelMapSelection = () => {
  selectedMapLocation.value = null
  if (centerMarker) {
    centerMarker.setMap(null)
    centerMarker = null
  }
}

// 确认地图选择
const confirmMapSelection = async () => {
  if (!selectedMapLocation.value) return

  const locationName = selectedMapLocation.value.name

  // 记录到搜索历史
  try {
    await destinationApi.recordSearch(locationName)
  } catch (error) {
    // 记录到本地存储
    if (!recentSearches.value.includes(locationName)) {
      recentSearches.value.unshift(locationName)
      if (recentSearches.value.length > 10) {
        recentSearches.value.pop()
      }
      localStorage.setItem('destination_search_history', JSON.stringify(recentSearches.value))
    }
  }

  // 更新最近搜索
  if (!recentSearches.value.includes(locationName)) {
    recentSearches.value.unshift(locationName)
    if (recentSearches.value.length > 10) {
      recentSearches.value.pop()
    }
  }

  // 触发选择事件
  emit('select', locationName)
  toast.success(`已选择: ${locationName}`)
}

// 地图搜索回车
const onMapSearchEnter = () => {
  if (!mapSearchQuery.value || !placeSearch) return

  placeSearch.search(mapSearchQuery.value, (status: string, result: any) => {
    if (status === 'complete' && result.poiList) {
      const pois = result.poiList.pois
      if (pois.length > 0) {
        const firstPoi = pois[0]
        const lng = firstPoi.location.lng
        const lat = firstPoi.location.lat

        // 选择第一个搜索结果
        selectLocationOnMap(lng, lat)
        map.setZoom(15)
        toast.success(`找到 ${pois.length} 个结果`)
      } else {
        toast.info('未找到相关地点')
      }
    }
  })
}

// 显示目的地详情
const showDestinationDetail = async (destination: Destination) => {
  try {
    // 获取完整详情
    const response = await destinationApi.getDestinationById(destination.id)
    if (response.code === 200) {
      selectedDestination.value = formatDestination(response.data)
    }
  } catch (error) {
    selectedDestination.value = formatDestination(destination)
  }
}

// 关闭详情窗口
const closeDestinationDetail = () => {
  selectedDestination.value = null
}

// 确认选择目的地
const confirmDestination = (name: string) => {
  selectDestination(name)
  selectedDestination.value = null
}

// 选择目的地
const selectDestination = async (name: string) => {
  // 记录搜索历史
  try {
    await destinationApi.recordSearch(name)
  } catch (error) {
    // 记录到本地存储
    if (!recentSearches.value.includes(name)) {
      recentSearches.value.unshift(name)
      if (recentSearches.value.length > 10) {
        recentSearches.value.pop()
      }
      localStorage.setItem('destination_search_history', JSON.stringify(recentSearches.value))
    }
  }

  // 更新最近搜索
  if (!recentSearches.value.includes(name)) {
    recentSearches.value.unshift(name)
    if (recentSearches.value.length > 10) {
      recentSearches.value.pop()
    }
  }

  emit('select', name)
}

// 清除最近搜索
const clearRecentSearches = () => {
  recentSearches.value = []
  localStorage.removeItem('destination_search_history')
  toast.success('已清除搜索记录')
}

// 定位到当前位置 - 改进版本
const centerToCurrentLocation = () => {
  if (!window.AMap) {
    toast.error('地图未加载，请稍后重试')
    return
  }

  // 更新按钮状态
  const button = document.querySelector('[title="定位到我的位置"]') as HTMLButtonElement
  if (button) {
    button.disabled = true
    const originalHtml = button.innerHTML
    button.innerHTML = '<span class="animate-spin text-lg">⏳</span>'

    // 设置超时恢复按钮
    setTimeout(() => {
      button.disabled = false
      button.innerHTML = originalHtml
    }, 15000)
  }

  if (isMapMode.value && map && geolocation) {
    geolocation.getCurrentPosition(
      (status: string, result: any) => {
        const button = document.querySelector('[title="定位到我的位置"]') as HTMLButtonElement
        if (button) {
          button.disabled = false
          button.innerHTML = '<span class="text-xl">📍</span>'
        }

        if (status === 'complete' && result.position) {
          const { lng, lat } = result.position

          // 设置地图中心和缩放
          map.setCenter([lng, lat])
          map.setZoom(14)

          userLocation.value = {
            latitude: lat,
            longitude: lng
          }

          // 更新位置信息
          updateMapLocationInfoFromCoords(lng, lat)

          toast.success('📍 定位成功')

          // 重新加载附近目的地
          loadNearbyDestinations()
        } else {
          toast.error('❌ 定位失败: ' + (result?.message || '无法获取位置信息'))
          console.error('Geolocation error:', status, result)
        }
      },
      (error: any) => {
        const button = document.querySelector('[title="定位到我的位置"]') as HTMLButtonElement
        if (button) {
          button.disabled = false
          button.innerHTML = '<span class="text-xl">📍</span>'
        }

        toast.error('❌ 定位出错: ' + error?.message || '请检查位置权限')
        console.error('Geolocation error:', error)
      }
    )
  } else {
    getUserLocation()
    toast.info('正在定位...')
  }
}

// 从坐标更新地点信息
const updateMapLocationInfoFromCoords = (lng: number, lat: number) => {
  if (!geocoder) return

  geocoder.getAddress([lng, lat], (status: string, result: any) => {
    if (status === 'complete' && result.info === 'OK') {
      try {
        const addressComponent = result.regeocode.addressComponent || {}
        const formattedAddress = result.regeocode.formattedAddress || '位置信息'
        const pois = result.regeocode.pois || []

        let locationName = ''

        // 优先使用POI名称
        if (pois.length > 0) {
          locationName = pois[0].name
        } else {
          // 从地址组件中提取最具体的地名
          locationName = addressComponent.township ||
                        addressComponent.district ||
                        addressComponent.city ||
                        '未知地点'
        }

        selectedMapLocation.value = {
          name: locationName || '选中的位置',
          address: formattedAddress,
          lat,
          lng
        }
      } catch (err) {
        console.error('Error updating location info:', err)
      }
    }
  })
}

// 切换图层菜单
const toggleLayerMenu = () => {
  toast.info('图层功能开发中...')
}

// 切换排序方式
const changeSortBy = async (newSortBy: typeof sortBy.value) => {
  sortBy.value = newSortBy
  await loadAllDestinations()

  // 如果在地图模式，更新标记
  if (isMapMode.value && map) {
    addDestinationMarkers()
  }
}

// 组件卸载时清理地图
onUnmounted(() => {
  if (map) {
    map.destroy()
    map = null
  }
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
})
</script>

<style scoped>
@keyframes slide-up {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}

.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 16px);
}

/* 隐藏高德地图logo和版权信息 */
:deep(.amap-logo),
:deep(.amap-copyright) {
  display: none !important;
  opacity: 0 !important;
  visibility: hidden !important;
}

/* 隐藏地图控件默认样式 */
:deep(.amap-ui-control-container) {
  display: none !important;
}
</style>
