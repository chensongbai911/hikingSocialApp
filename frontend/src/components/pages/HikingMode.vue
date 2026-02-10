<template>
  <div class="hiking-mode min-h-screen bg-gray-50">
    <!-- 顶部导航栏 -->
    <div class="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 safe-area-inset-top">
      <div class="flex items-center justify-between px-4 h-14">
        <button @click="handleBack" class="p-2">
          <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 class="text-lg font-semibold text-gray-900">行进模式</h1>
        <button @click="showTeamPanel = true" class="p-2">
          <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- 地图区域 -->
    <div class="fixed top-14 left-0 right-0" :style="{ height: mapHeight }">
      <div class="relative w-full h-full bg-gray-200">
        <!-- 地图占位符（实际项目中集成高德/百度地图） -->
        <div class="absolute inset-0 flex items-center justify-center text-gray-400">
          <div class="text-center">
            <svg class="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
            </svg>
            <p class="text-sm">地图加载中...</p>
          </div>
        </div>

        <!-- 当前轨迹线（示意） -->
        <svg class="absolute inset-0 pointer-events-none" v-if="isTracking">
          <polyline
            :points="pathPoints"
            fill="none"
            stroke="#14b8a6"
            stroke-width="4"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>

      <!-- SOS 紧急按钮 -->
      <button
        @click="showSOSModal = true"
        class="absolute top-4 right-4 w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full shadow-lg flex items-center justify-center transition-all transform active:scale-95"
      >
        <span class="text-white text-2xl font-bold">SOS</span>
      </button>

      <!-- 展开数据面板按钮 -->
      <button
        @click="toggleDataPanel"
        class="absolute bottom-4 right-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center"
      >
        <svg class="w-6 h-6 text-gray-700" :class="{ 'rotate-180': dataPanelExpanded }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/>
        </svg>
      </button>
    </div>

    <!-- 底部数据面板 -->
    <div
      class="fixed left-0 right-0 bg-white rounded-t-3xl shadow-2xl transition-all duration-300"
      :class="dataPanelExpanded ? 'bottom-0' : 'bottom-0'"
      :style="{ height: dataPanelExpanded ? '60vh' : '180px' }"
    >
      <!-- 拖动指示器 -->
      <div class="flex justify-center pt-3 pb-2">
        <div class="w-10 h-1 bg-gray-300 rounded-full"></div>
      </div>

      <div class="px-4 pb-6 overflow-y-auto" :style="{ height: 'calc(100% - 20px)' }">
        <!-- 简化视图 -->
        <div v-if="!dataPanelExpanded">
          <!-- 核心数据卡片 -->
          <div class="grid grid-cols-3 gap-3 mb-4">
            <div class="text-center">
              <p class="text-xs text-gray-500 mb-1">已行进</p>
              <p class="text-2xl font-bold text-teal-600">{{ currentStats.distance }}</p>
              <p class="text-xs text-gray-400">km</p>
            </div>
            <div class="text-center">
              <p class="text-xs text-gray-500 mb-1">累计爬升</p>
              <p class="text-2xl font-bold text-orange-500">{{ currentStats.elevation }}</p>
              <p class="text-xs text-gray-400">m</p>
            </div>
            <div class="text-center">
              <p class="text-xs text-gray-500 mb-1">已用时</p>
              <p class="text-2xl font-bold text-blue-600">{{ formattedTime }}</p>
              <p class="text-xs text-gray-400">{{ currentStats.pace }}</p>
            </div>
          </div>

          <!-- 控制按钮 -->
          <div class="flex gap-3">
            <button
              v-if="!isTracking"
              @click="startTracking"
              class="flex-1 h-14 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-semibold text-lg transition-all transform active:scale-95 shadow-md"
            >
              开始徒步
            </button>
            <template v-else>
              <button
                v-if="!isPaused"
                @click="pauseTracking"
                class="flex-1 h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold text-lg transition-all transform active:scale-95 shadow-md"
              >
                暂停
              </button>
              <button
                v-else
                @click="resumeTracking"
                class="flex-1 h-14 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-semibold text-lg transition-all transform active:scale-95 shadow-md"
              >
                继续
              </button>
              <button
                @click="showEndConfirm = true"
                class="flex-1 h-14 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold text-lg transition-all transform active:scale-95 shadow-md"
              >
                结束
              </button>
            </template>
          </div>
        </div>

        <!-- 展开视图 -->
        <div v-else>
          <h3 class="text-lg font-bold text-gray-900 mb-4">详细数据</h3>

          <!-- 详细统计数据 -->
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-4">
              <div class="flex items-center mb-2">
                <svg class="w-5 h-5 text-teal-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                </svg>
                <span class="text-sm text-gray-600">已行进距离</span>
              </div>
              <p class="text-3xl font-bold text-teal-600">{{ currentStats.distance }}</p>
              <p class="text-xs text-gray-500 mt-1">公里</p>
            </div>

            <div class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4">
              <div class="flex items-center mb-2">
                <svg class="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
                </svg>
                <span class="text-sm text-gray-600">累计爬升</span>
              </div>
              <p class="text-3xl font-bold text-orange-600">{{ currentStats.elevation }}</p>
              <p class="text-xs text-gray-500 mt-1">米</p>
            </div>

            <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
              <div class="flex items-center mb-2">
                <svg class="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span class="text-sm text-gray-600">已用时间</span>
              </div>
              <p class="text-3xl font-bold text-blue-600">{{ formattedTime }}</p>
              <p class="text-xs text-gray-500 mt-1">{{ currentStats.pace }}</p>
            </div>

            <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
              <div class="flex items-center mb-2">
                <svg class="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
                <span class="text-sm text-gray-600">平均配速</span>
              </div>
              <p class="text-3xl font-bold text-purple-600">{{ currentStats.avgSpeed }}</p>
              <p class="text-xs text-gray-500 mt-1">km/h</p>
            </div>
          </div>

          <!-- 海拔图表 -->
          <div class="bg-white border border-gray-200 rounded-xl p-4 mb-6">
            <h4 class="text-sm font-semibold text-gray-700 mb-3">海拔变化</h4>
            <div class="h-32 flex items-end space-x-1">
              <div
                v-for="(point, index) in elevationData"
                :key="index"
                class="flex-1 bg-gradient-to-t from-teal-500 to-teal-300 rounded-t"
                :style="{ height: `${point}%` }"
              ></div>
            </div>
          </div>

          <!-- 控制按钮 -->
          <div class="flex gap-3">
            <button
              v-if="!isTracking"
              @click="startTracking"
              class="flex-1 h-14 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-semibold text-lg transition-all transform active:scale-95 shadow-md"
            >
              开始徒步
            </button>
            <template v-else>
              <button
                v-if="!isPaused"
                @click="pauseTracking"
                class="flex-1 h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold text-lg transition-all transform active:scale-95 shadow-md"
              >
                暂停
              </button>
              <button
                v-else
                @click="resumeTracking"
                class="flex-1 h-14 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-semibold text-lg transition-all transform active:scale-95 shadow-md"
              >
                继续
              </button>
              <button
                @click="showEndConfirm = true"
                class="flex-1 h-14 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold text-lg transition-all transform active:scale-95 shadow-md"
              >
                结束徒步
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- SOS 紧急求救模态框 -->
    <div
      v-if="showSOSModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4"
      @click.self="showSOSModal = false"
    >
      <div class="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl transform transition-all">
        <div class="text-center mb-6">
          <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">发送紧急求救</h3>
          <p class="text-gray-600 text-sm">将向您的紧急联系人和队友发送当前位置和求救信息</p>
        </div>

        <div class="bg-gray-50 rounded-xl p-4 mb-6">
          <div class="flex items-center text-sm text-gray-700 mb-2">
            <svg class="w-5 h-5 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <span>当前位置</span>
          </div>
          <p class="text-gray-900 font-medium pl-7">{{ currentLocation }}</p>
        </div>

        <div class="flex gap-3">
          <button
            @click="showSOSModal = false"
            class="flex-1 h-12 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition"
          >
            取消
          </button>
          <button
            @click="sendSOS"
            class="flex-1 h-12 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition"
          >
            确认发送
          </button>
        </div>
      </div>
    </div>

    <!-- 结束徒步确认框 -->
    <div
      v-if="showEndConfirm"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4"
      @click.self="showEndConfirm = false"
    >
      <div class="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <h3 class="text-xl font-bold text-gray-900 mb-4">结束本次徒步？</h3>
        <p class="text-gray-600 mb-6">徒步数据将被保存，您可以在记录中查看详情</p>

        <div class="flex gap-3">
          <button
            @click="showEndConfirm = false"
            class="flex-1 h-12 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition"
          >
            继续徒步
          </button>
          <button
            @click="endTracking"
            class="flex-1 h-12 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-semibold transition"
          >
            确认结束
          </button>
        </div>
      </div>
    </div>

    <!-- 队伍面板侧边栏 -->
    <div
      v-if="showTeamPanel"
      class="fixed inset-0 bg-black bg-opacity-50 z-50"
      @click.self="showTeamPanel = false"
    >
      <div class="fixed right-0 top-0 bottom-0 w-80 bg-white shadow-2xl transform transition-transform">
        <div class="flex items-center justify-between px-4 h-14 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">队伍成员 ({{ teamMembers.length }})</h3>
          <button @click="showTeamPanel = false" class="p-2">
            <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="p-4 space-y-3 overflow-y-auto" style="height: calc(100vh - 56px)">
          <div
            v-for="member in teamMembers"
            :key="member.id"
            class="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition"
          >
            <div class="flex items-start">
              <img :src="member.avatar" :alt="member.name" class="w-12 h-12 rounded-full object-cover"/>
              <div class="ml-3 flex-1">
                <div class="flex items-center justify-between mb-1">
                  <h4 class="font-semibold text-gray-900">{{ member.name }}</h4>
                  <span
                    class="text-xs px-2 py-1 rounded-full"
                    :class="member.status === 'online' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'"
                  >
                    {{ member.status === 'online' ? '在线' : '离线' }}
                  </span>
                </div>
                <p class="text-sm text-gray-500 mb-2">距离您 {{ member.distance }}km</p>
                <div class="flex gap-2">
                  <button class="flex-1 h-8 bg-teal-50 text-teal-600 rounded-lg text-xs font-medium hover:bg-teal-100 transition">
                    查看位置
                  </button>
                  <button class="flex-1 h-8 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition">
                    语音通话
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 状态管理
const isTracking = ref(false)
const isPaused = ref(false)
const dataPanelExpanded = ref(false)
const showSOSModal = ref(false)
const showEndConfirm = ref(false)
const showTeamPanel = ref(false)

// 追踪数据
const currentStats = ref({
  distance: '0.00',
  elevation: '0',
  time: 0, // 秒
  pace: '0\'00"',
  avgSpeed: '0.0'
})

const startTime = ref<number>(0)
const pauseTime = ref<number>(0)
const timerInterval = ref<number | null>(null)

// 当前位置
const currentLocation = ref('北京市海淀区香山公园')

// 轨迹点（示意）
const pathPoints = ref('50,100 100,80 150,90 200,70 250,85')

// 海拔数据（示意，百分比）
const elevationData = ref([30, 45, 55, 50, 60, 70, 65, 75, 80, 85, 90, 85, 80, 75])

// 队伍成员
const teamMembers = ref([
  {
    id: 1,
    name: '李明',
    avatar: 'https://i.pravatar.cc/150?img=1',
    status: 'online',
    distance: '0.5'
  },
  {
    id: 2,
    name: '王芳',
    avatar: 'https://i.pravatar.cc/150?img=2',
    status: 'online',
    distance: '0.3'
  },
  {
    id: 3,
    name: '张伟',
    avatar: 'https://i.pravatar.cc/150?img=3',
    status: 'offline',
    distance: '1.2'
  }
])

// 计算属性
const mapHeight = computed(() => {
  return dataPanelExpanded.value ? 'calc(40vh)' : 'calc(100vh - 56px - 180px)'
})

const formattedTime = computed(() => {
  const seconds = currentStats.value.time
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }
  return `${minutes}:${String(secs).padStart(2, '0')}`
})

// 方法
const handleBack = () => {
  if (isTracking.value) {
    if (confirm('徒步正在进行中，确定要退出吗？')) {
      router.back()
    }
  } else {
    router.back()
  }
}

const toggleDataPanel = () => {
  dataPanelExpanded.value = !dataPanelExpanded.value
}

const startTracking = () => {
  isTracking.value = true
  isPaused.value = false
  startTime.value = Date.now()

  // 开始计时器
  timerInterval.value = window.setInterval(() => {
    if (!isPaused.value) {
      currentStats.value.time++

      // 模拟数据增长
      const distance = parseFloat(currentStats.value.distance) + 0.001
      currentStats.value.distance = distance.toFixed(2)

      const elevation = parseInt(currentStats.value.elevation) + Math.floor(Math.random() * 2)
      currentStats.value.elevation = elevation.toString()

      // 计算配速
      if (distance > 0) {
        const speed = (distance / (currentStats.value.time / 3600)).toFixed(1)
        currentStats.value.avgSpeed = speed
        const paceMinutes = Math.floor(60 / parseFloat(speed))
        const paceSeconds = Math.floor((60 / parseFloat(speed) - paceMinutes) * 60)
        currentStats.value.pace = `${paceMinutes}'${String(paceSeconds).padStart(2, '0')}"`
      }
    }
  }, 1000)
}

const pauseTracking = () => {
  isPaused.value = true
  pauseTime.value = Date.now()
}

const resumeTracking = () => {
  isPaused.value = false
}

const endTracking = () => {
  isTracking.value = false
  showEndConfirm.value = false

  if (timerInterval.value) {
    clearInterval(timerInterval.value)
    timerInterval.value = null
  }

  // 跳转到复盘报告页
  router.push({
    name: 'HikingReport',
    params: { id: 'new' },
    query: {
      distance: currentStats.value.distance,
      elevation: currentStats.value.elevation,
      time: currentStats.value.time.toString()
    }
  })
}

const sendSOS = () => {
  showSOSModal.value = false

  // TODO: 实际实现中需要调用后端API发送SOS
  alert('紧急求救信号已发送！\n\n将通知您的：\n- 紧急联系人\n- 队伍成员\n- 平台客服\n\n请保持手机畅通')
}

onMounted(() => {
  // 组件挂载时的初始化
  console.log('行进模式已启动')
})

onUnmounted(() => {
  // 清理计时器
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
  }
})
</script>

<style scoped>
.hiking-mode {
  -webkit-user-select: none;
  user-select: none;
}

.rotate-180 {
  transform: rotate(180deg);
  transition: transform 0.3s ease;
}
</style>
