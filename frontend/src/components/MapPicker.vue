<template>
  <div class="fixed inset-0 bg-white z-50 flex flex-col">
    <!-- 顶部导航栏和搜索框 -->
    <div class="border-b border-gray-100">
      <!-- 导航栏 -->
      <div class="flex items-center justify-between p-4">
        <button @click="$emit('close')" class="p-2 -ml-2">
          <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <h3 class="text-lg font-bold text-gray-800">选择集合地点</h3>
        <div class="w-6"></div>
      </div>

      <!-- 搜索框 -->
      <div class="px-4 pb-4">
        <div class="relative">
          <input
            v-model="searchKeyword"
            @input="handleSearch"
            type="text"
            placeholder="搜索地点"
            class="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <svg class="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </div>

        <!-- 搜索结果列表 -->
        <div v-if="searchResults.length > 0" class="mt-2 bg-white rounded-2xl shadow-lg max-h-60 overflow-y-auto">
          <div
            v-for="(item, index) in searchResults"
            :key="index"
            @click="selectSearchResult(item)"
            class="p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 cursor-pointer"
          >
            <div class="font-medium text-gray-800">{{ item.name }}</div>
            <div class="text-sm text-gray-500 mt-1">{{ item.address }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 地图容器 -->
    <div class="flex-1 relative">
      <div ref="mapContainer" class="w-full h-full"></div>

      <!-- 中心标记点 -->
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <svg class="w-12 h-12 text-teal-500 drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      </div>

      <!-- 当前位置按钮 -->
      <button
        @click="getCurrentLocation"
        class="absolute bottom-24 right-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center"
      >
        <svg class="w-6 h-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
      </button>
    </div>

    <!-- 底部信息卡片和确认按钮 -->
    <div class="bg-white border-t border-gray-100 p-4">
      <div v-if="selectedLocation.name" class="bg-gray-50 rounded-2xl p-4 mb-4">
        <div class="flex items-start">
          <svg class="w-5 h-5 text-teal-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          <div class="ml-3 flex-1">
            <div class="font-medium text-gray-800">{{ selectedLocation.name }}</div>
            <div class="text-sm text-gray-500 mt-1">{{ selectedLocation.address }}</div>
          </div>
        </div>
      </div>

      <button
        @click="confirmLocation"
        :disabled="!selectedLocation.name"
        class="w-full py-4 bg-teal-500 text-white font-medium rounded-2xl disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        确认位置
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import toast from '../utils/toast'

interface Location {
  name: string
  address: string
  lat: number
  lng: number
}

const emit = defineEmits<{
  close: []
  confirm: [location: Location]
}>()

const mapContainer = ref<HTMLDivElement | null>(null)
const searchKeyword = ref('')
const searchResults = ref<any[]>([])
const selectedLocation = ref<Partial<Location>>({
  name: '',
  address: '',
  lat: 0,
  lng: 0
})

let map: any = null
let geocoder: any = null
let placeSearch: any = null
let searchTimer: number | null = null

onMounted(() => {
  initMap()
})

onUnmounted(() => {
  if (map) {
    map.destroy()
  }
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
})

const initMap = () => {
  if (!window.AMap) {
    toast.error('地图加载失败，请检查网络连接或API密钥配置')
    return
  }

  // 初始化地图
  map = new window.AMap.Map(mapContainer.value, {
    zoom: 14, // 调整缩放级别，不要太大
    center: [116.397428, 39.90923], // 默认北京天安门
    viewMode: '2D',
    pitch: 0,
    mapStyle: 'amap://styles/normal',
    zooms: [3, 18]
  })

  // 隐藏高德logo和版权信息
  map.on('complete', () => {
    setTimeout(() => {
      const amapLogo = document.querySelector('.amap-logo')
      const amapCopyright = document.querySelector('.amap-copyright')
      if (amapLogo) (amapLogo as HTMLElement).style.display = 'none'
      if (amapCopyright) (amapCopyright as HTMLElement).style.display = 'none'
    }, 100)
  })

  // 初始化地理编码
  geocoder = new window.AMap.Geocoder({
    city: '北京'
  })

  // 初始化地点搜索
  placeSearch = new window.AMap.PlaceSearch({
    city: '北京',
    pageSize: 10,
    pageIndex: 1
  })

  // 地图移动结束事件
  map.on('moveend', () => {
    const center = map.getCenter()
    updateLocationInfo(center.lng, center.lat)
  })

  // 尝试获取当前位置
  getCurrentLocation()
}

const getCurrentLocation = () => {
  if (!window.AMap) return

  const geolocation = new window.AMap.Geolocation({
    enableHighAccuracy: true,
    timeout: 10000
  })

  geolocation.getCurrentPosition((status: string, result: any) => {
    if (status === 'complete') {
      const { lng, lat } = result.position
      map.setCenter([lng, lat])
      updateLocationInfo(lng, lat)
    } else {
      console.log('定位失败，使用默认位置')
    }
  })
}

const updateLocationInfo = (lng: number, lat: number) => {
  if (!geocoder) return

  geocoder.getAddress([lng, lat], (status: string, result: any) => {
    if (status === 'complete' && result.info === 'OK') {
      const addressComponent = result.regeocode.addressComponent
      const formattedAddress = result.regeocode.formattedAddress
      const poi = result.regeocode.pois[0]

      selectedLocation.value = {
        name: poi ? poi.name : addressComponent.township || addressComponent.district,
        address: formattedAddress,
        lat,
        lng
      }
    }
  })
}

const handleSearch = () => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }

  searchTimer = window.setTimeout(() => {
    if (!searchKeyword.value.trim() || !placeSearch) {
      searchResults.value = []
      return
    }

    placeSearch.search(searchKeyword.value, (status: string, result: any) => {
      if (status === 'complete' && result.poiList && result.poiList.pois) {
        searchResults.value = result.poiList.pois.map((poi: any) => ({
          name: poi.name,
          address: poi.address || poi.pname + poi.cityname + poi.adname,
          location: poi.location
        }))
      } else {
        searchResults.value = []
      }
    })
  }, 300)
}

const selectSearchResult = (item: any) => {
  const { lng, lat } = item.location
  map.setCenter([lng, lat])
  searchResults.value = []
  searchKeyword.value = ''
  updateLocationInfo(lng, lat)
}

const confirmLocation = () => {
  if (selectedLocation.value.name) {
    emit('confirm', selectedLocation.value as Location)
  }
}

// 全局声明
declare global {
  interface Window {
    AMap: any
    _AMapSecurityConfig: any
  }
}
</script>

<style scoped>
/* 隐藏高德地图logo和版权信息 */
:deep(.amap-logo),
:deep(.amap-copyright) {
  display: none !important;
  opacity: 0 !important;
  visibility: hidden !important;
}
</style>
