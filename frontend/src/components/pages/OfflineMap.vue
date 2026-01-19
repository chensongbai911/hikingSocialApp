<template>
  <div class="offline-map min-h-screen bg-gray-50">
    <!-- 顶部导航栏 -->
    <div class="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div class="flex items-center justify-between px-4 h-14">
        <button @click="$router.back()" class="p-2">
          <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 class="text-lg font-semibold text-gray-900">离线地图</h1>
        <button @click="showHelp = true" class="p-2">
          <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Tab切换 -->
    <div class="fixed top-14 left-0 right-0 z-40 bg-white border-b border-gray-200 px-4 py-2">
      <div class="flex gap-2">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="flex-1 h-10 rounded-xl font-medium text-sm transition-all"
          :class="activeTab === tab.id
            ? 'bg-teal-500 text-white shadow-md'
            : 'text-gray-600 hover:bg-gray-100'"
        >
          {{ tab.name }}
        </button>
      </div>
    </div>

    <div class="pt-28 pb-6 px-4">
      <!-- 已下载地图 Tab -->
      <div v-if="activeTab === 'downloaded'">
        <!-- 存储空间统计 -->
        <div class="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl p-5 text-white shadow-lg mb-4">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-lg font-bold">存储空间</h3>
            <button @click="clearAllMaps" class="text-sm text-teal-100 hover:text-white">
              清理全部
            </button>
          </div>

          <div class="mb-2">
            <div class="flex items-center justify-between text-sm mb-1">
              <span>已使用 {{ usedStorage }} / {{ totalStorage }} GB</span>
              <span>{{ storagePercentage }}%</span>
            </div>
            <div class="w-full h-2 bg-teal-400 bg-opacity-30 rounded-full overflow-hidden">
              <div
                class="h-full bg-white rounded-full transition-all duration-300"
                :style="{ width: `${storagePercentage}%` }"
              ></div>
            </div>
          </div>

          <p class="text-teal-100 text-xs">{{ downloadedMaps.length }} 个地图包已下载</p>
        </div>

        <!-- 已下载地图列表 -->
        <div v-if="downloadedMaps.length === 0" class="text-center py-16">
          <div class="text-6xl mb-4">🗺️</div>
          <p class="text-gray-600 mb-2">暂无离线地图</p>
          <p class="text-sm text-gray-400 mb-6">下载地图包，无网络也能导航</p>
          <button
            @click="activeTab = 'download'"
            class="px-6 py-2.5 bg-teal-500 text-white rounded-xl font-medium hover:bg-teal-600 transition"
          >
            去下载
          </button>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="map in downloadedMaps"
            :key="map.id"
            class="bg-white rounded-2xl shadow-sm p-4"
          >
            <div class="flex items-start">
              <div class="w-20 h-20 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0 mr-4">
                <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
                </svg>
              </div>

              <div class="flex-1">
                <div class="flex items-center justify-between mb-1">
                  <h4 class="font-bold text-gray-900">{{ map.name }}</h4>
                  <span
                    class="text-xs px-2 py-1 rounded-full"
                    :class="map.status === 'latest' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'"
                  >
                    {{ map.status === 'latest' ? '最新' : '有更新' }}
                  </span>
                </div>

                <div class="space-y-1 mb-3">
                  <div class="flex items-center text-sm text-gray-600">
                    <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
                    </svg>
                    <span>{{ map.size }} MB</span>
                  </div>
                  <div class="flex items-center text-sm text-gray-600">
                    <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span>{{ map.downloadDate }}</span>
                  </div>
                </div>

                <div class="flex gap-2">
                  <button
                    v-if="map.status === 'outdated'"
                    @click="updateMap(map.id)"
                    class="flex-1 h-9 bg-teal-50 text-teal-600 rounded-lg text-sm font-medium hover:bg-teal-100 transition"
                  >
                    更新地图
                  </button>
                  <button
                    @click="deleteMap(map.id)"
                    class="flex-1 h-9 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 下载地图 Tab -->
      <div v-if="activeTab === 'download'">
        <!-- 搜索框 -->
        <div class="mb-4">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索城市或地区..."
              class="w-full h-12 pl-12 pr-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            <svg class="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
        </div>

        <!-- 热门城市 -->
        <div class="mb-6">
          <h3 class="text-sm font-semibold text-gray-700 mb-3">热门城市</h3>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="city in hotCities"
              :key="city"
              @click="selectCity(city)"
              class="h-10 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-teal-500 hover:text-teal-600 transition"
            >
              {{ city }}
            </button>
          </div>
        </div>

        <!-- 可下载地图列表 -->
        <div>
          <h3 class="text-sm font-semibold text-gray-700 mb-3">全部地区</h3>
          <div class="space-y-3">
            <div
              v-for="map in availableMaps"
              :key="map.id"
              class="bg-white rounded-2xl shadow-sm p-4"
            >
              <div class="flex items-start">
                <div class="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 mr-4">
                  <span class="text-2xl">{{ map.icon }}</span>
                </div>

                <div class="flex-1">
                  <h4 class="font-bold text-gray-900 mb-1">{{ map.name }}</h4>

                  <div class="flex items-center text-sm text-gray-600 mb-3">
                    <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                    </svg>
                    <span>{{ map.size }} MB</span>
                    <span class="mx-2">•</span>
                    <span>{{ map.version }}</span>
                  </div>

                  <!-- 下载进度 -->
                  <div v-if="map.downloading" class="mb-3">
                    <div class="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>下载中...</span>
                      <span>{{ map.progress }}%</span>
                    </div>
                    <div class="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        class="h-full bg-teal-500 rounded-full transition-all duration-300"
                        :style="{ width: `${map.progress}%` }"
                      ></div>
                    </div>
                  </div>

                  <button
                    v-if="!map.downloading"
                    @click="downloadMap(map.id)"
                    :disabled="map.downloaded"
                    class="w-full h-9 rounded-lg text-sm font-medium transition"
                    :class="map.downloaded
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-teal-500 text-white hover:bg-teal-600'"
                  >
                    {{ map.downloaded ? '已下载' : '下载地图' }}
                  </button>
                  <button
                    v-else
                    @click="cancelDownload(map.id)"
                    class="w-full h-9 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition"
                  >
                    取消下载
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 帮助说明模态框 -->
    <div
      v-if="showHelp"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4"
      @click.self="showHelp = false"
    >
      <div class="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-gray-900">使用说明</h3>
          <button @click="showHelp = false" class="p-1">
            <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="space-y-4 text-sm text-gray-600">
          <div>
            <h4 class="font-semibold text-gray-900 mb-2">📥 离线地图的作用</h4>
            <p>下载离线地图后，即使没有网络连接，也能查看地图、导航路线，保障户外徒步安全。</p>
          </div>

          <div>
            <h4 class="font-semibold text-gray-900 mb-2">💡 使用建议</h4>
            <ul class="list-disc list-inside space-y-1">
              <li>出发前提前下载目的地地图</li>
              <li>建议在WiFi环境下下载</li>
              <li>定期更新地图获取最新数据</li>
              <li>及时清理不需要的地图包</li>
            </ul>
          </div>

          <div>
            <h4 class="font-semibold text-gray-900 mb-2">⚠️ 注意事项</h4>
            <p>离线地图占用较多存储空间，请根据手机容量合理下载。部分功能（如实时路况）仍需网络支持。</p>
          </div>
        </div>

        <button
          @click="showHelp = false"
          class="w-full h-12 mt-6 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-semibold transition"
        >
          知道了
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// Tab管理
const tabs = [
  { id: 'downloaded', name: '已下载' },
  { id: 'download', name: '下载地图' }
]
const activeTab = ref('downloaded')

// 状态
const showHelp = ref(false)
const searchQuery = ref('')

// 存储空间数据
const totalStorage = 10 // GB
const usedStorage = computed(() => {
  const total = downloadedMaps.value.reduce((sum, map) => sum + map.size, 0)
  return (total / 1024).toFixed(2)
})
const storagePercentage = computed(() => {
  return Math.min(100, Math.round((parseFloat(usedStorage.value) / totalStorage) * 100))
})

// 已下载地图
const downloadedMaps = ref([
  {
    id: 1,
    name: '北京市地图',
    size: 256,
    status: 'latest' as 'latest' | 'outdated',
    downloadDate: '2024-01-15'
  },
  {
    id: 2,
    name: '河北省地图',
    size: 512,
    status: 'outdated' as 'latest' | 'outdated',
    downloadDate: '2023-12-20'
  }
])

// 热门城市
const hotCities = ['北京', '上海', '广州', '深圳', '杭州', '成都']

// 可下载地图
const availableMaps = ref([
  {
    id: 3,
    name: '天津市地图',
    icon: '🏙️',
    size: 180,
    version: 'v2024.01',
    downloaded: false,
    downloading: false,
    progress: 0
  },
  {
    id: 4,
    name: '山西省地图',
    icon: '⛰️',
    size: 420,
    version: 'v2024.01',
    downloaded: false,
    downloading: false,
    progress: 0
  },
  {
    id: 5,
    name: '内蒙古地图',
    icon: '🏕️',
    size: 680,
    version: 'v2024.01',
    downloaded: false,
    downloading: false,
    progress: 0
  },
  {
    id: 6,
    name: '浙江省地图',
    icon: '🌊',
    size: 320,
    version: 'v2024.01',
    downloaded: false,
    downloading: false,
    progress: 0
  }
])

// 方法
const selectCity = (city: string) => {
  searchQuery.value = city
  // TODO: 过滤地图列表
}

const downloadMap = (mapId: number) => {
  const map = availableMaps.value.find(m => m.id === mapId)
  if (!map) return

  map.downloading = true
  map.progress = 0

  // 模拟下载进度
  const interval = setInterval(() => {
    map.progress += 10
    if (map.progress >= 100) {
      clearInterval(interval)
      map.downloading = false
      map.downloaded = true

      // 添加到已下载列表
      downloadedMaps.value.push({
        id: map.id,
        name: map.name,
        size: map.size,
        status: 'latest',
        downloadDate: new Date().toISOString().split('T')[0]
      })

      alert(`${map.name}下载完成！`)
    }
  }, 300)
}

const cancelDownload = (mapId: number) => {
  const map = availableMaps.value.find(m => m.id === mapId)
  if (map) {
    map.downloading = false
    map.progress = 0
  }
}

const updateMap = (mapId: number) => {
  const map = downloadedMaps.value.find(m => m.id === mapId)
  if (map) {
    if (confirm(`确定要更新 ${map.name} 吗？`)) {
      alert('开始更新地图...')
      map.status = 'latest'
      map.downloadDate = new Date().toISOString().split('T')[0]
    }
  }
}

const deleteMap = (mapId: number) => {
  const map = downloadedMaps.value.find(m => m.id === mapId)
  if (map) {
    if (confirm(`确定要删除 ${map.name} 吗？删除后需要重新下载。`)) {
      const index = downloadedMaps.value.findIndex(m => m.id === mapId)
      downloadedMaps.value.splice(index, 1)

      // 更新可下载列表状态
      const availableMap = availableMaps.value.find(m => m.id === mapId)
      if (availableMap) {
        availableMap.downloaded = false
      }
    }
  }
}

const clearAllMaps = () => {
  if (confirm('确定要清理所有离线地图吗？这将释放存储空间，但需要重新下载。')) {
    downloadedMaps.value = []
    availableMaps.value.forEach(map => {
      map.downloaded = false
    })
    alert('清理完成！')
  }
}
</script>

<style scoped>
/* 自定义样式 */
</style>
