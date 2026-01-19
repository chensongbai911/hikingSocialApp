<template>
  <div class="route-creator min-h-screen bg-gray-50">
    <!-- 顶部导航栏 -->
    <div class="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div class="flex items-center justify-between px-4 h-14">
        <button @click="handleBack" class="p-2">
          <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 class="text-lg font-semibold text-gray-900">创建路线</h1>
        <button @click="saveRoute" class="text-teal-600 font-semibold text-sm">
          保存
        </button>
      </div>
    </div>

    <!-- 步骤指示器 -->
    <div class="fixed top-14 left-0 right-0 z-40 bg-white border-b border-gray-200 px-4 py-3">
      <div class="flex items-center justify-between">
        <div
          v-for="(step, index) in steps"
          :key="step.id"
          class="flex items-center"
          :class="index < steps.length - 1 ? 'flex-1' : ''"
        >
          <div class="flex items-center">
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-all"
              :class="currentStep >= index + 1
                ? 'bg-teal-500 text-white'
                : 'bg-gray-200 text-gray-500'"
            >
              <svg
                v-if="currentStep > index + 1"
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              <span v-else>{{ index + 1 }}</span>
            </div>
            <span
              class="ml-2 text-xs font-medium"
              :class="currentStep >= index + 1 ? 'text-gray-900' : 'text-gray-400'"
            >
              {{ step.name }}
            </span>
          </div>
          <div
            v-if="index < steps.length - 1"
            class="flex-1 h-0.5 mx-3"
            :class="currentStep > index + 1 ? 'bg-teal-500' : 'bg-gray-200'"
          ></div>
        </div>
      </div>
    </div>

    <div class="pt-28 pb-24 px-4">
      <!-- 步骤 1: 基本信息 -->
      <div v-if="currentStep === 1" class="space-y-6">
        <div class="bg-white rounded-2xl shadow-sm p-5">
          <h3 class="text-lg font-bold text-gray-900 mb-4">路线基本信息</h3>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">路线名称 *</label>
              <input
                v-model="routeData.name"
                type="text"
                placeholder="例如：香山-植物园环线"
                class="w-full h-12 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">路线描述 *</label>
              <textarea
                v-model="routeData.description"
                rows="4"
                placeholder="描述这条路线的特点、景色、难度等..."
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
              ></textarea>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">总距离 (km) *</label>
                <input
                  v-model.number="routeData.distance"
                  type="number"
                  step="0.1"
                  placeholder="12.5"
                  class="w-full h-12 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">预计时长 (小时)</label>
                <input
                  v-model.number="routeData.duration"
                  type="number"
                  step="0.5"
                  placeholder="4"
                  class="w-full h-12 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">累计爬升 (m)</label>
                <input
                  v-model.number="routeData.elevation"
                  type="number"
                  placeholder="500"
                  class="w-full h-12 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">难度等级 *</label>
                <select
                  v-model="routeData.difficulty"
                  class="w-full h-12 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="">选择难度</option>
                  <option value="easy">简单 ⭐</option>
                  <option value="moderate">中等 ⭐⭐</option>
                  <option value="hard">困难 ⭐⭐⭐</option>
                  <option value="extreme">极难 ⭐⭐⭐⭐</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">路线类型</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="type in routeTypes"
                  :key="type"
                  @click="toggleType(type)"
                  class="px-4 py-2 rounded-full text-sm font-medium transition-all"
                  :class="routeData.types.includes(type)
                    ? 'bg-teal-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                >
                  {{ type }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 步骤 2: 地图标记 -->
      <div v-if="currentStep === 2" class="space-y-4">
        <div class="bg-white rounded-2xl shadow-sm p-5">
          <h3 class="text-lg font-bold text-gray-900 mb-2">在地图上标记路线</h3>
          <p class="text-sm text-gray-500 mb-4">点击地图添加路线点，长按可编辑或删除</p>

          <!-- 地图区域 -->
          <div class="relative w-full h-96 bg-gray-200 rounded-xl overflow-hidden mb-4">
            <div class="absolute inset-0 flex items-center justify-center text-gray-400">
              <div class="text-center">
                <svg class="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
                </svg>
                <p class="text-sm">地图加载中...</p>
                <p class="text-xs text-gray-400 mt-1">实际项目中集成高德/百度地图</p>
              </div>
            </div>

            <!-- 示意路径 -->
            <svg v-if="routeData.waypoints.length > 0" class="absolute inset-0 pointer-events-none">
              <polyline
                :points="waypointPath"
                fill="none"
                stroke="#14b8a6"
                stroke-width="4"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <circle
                v-for="(point, index) in routeData.waypoints"
                :key="index"
                :cx="point.x"
                :cy="point.y"
                r="8"
                :fill="index === 0 ? '#10b981' : index === routeData.waypoints.length - 1 ? '#ef4444' : '#14b8a6'"
                stroke="white"
                stroke-width="2"
              />
            </svg>
          </div>

          <!-- 路点列表 -->
          <div class="space-y-2">
            <div
              v-for="(point, index) in routeData.waypoints"
              :key="index"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div class="flex items-center flex-1">
                <div
                  class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3"
                  :class="index === 0 ? 'bg-green-500' : index === routeData.waypoints.length - 1 ? 'bg-red-500' : 'bg-teal-500'"
                >
                  {{ index === 0 ? '起' : index === routeData.waypoints.length - 1 ? '终' : index + 1 }}
                </div>
                <div class="flex-1">
                  <input
                    v-model="point.name"
                    type="text"
                    :placeholder="index === 0 ? '起点名称' : index === routeData.waypoints.length - 1 ? '终点名称' : `路点 ${index + 1}`"
                    class="w-full h-8 px-2 border border-gray-300 rounded text-sm"
                  />
                </div>
              </div>
              <button
                @click="removeWaypoint(index)"
                class="ml-3 p-2 text-red-500 hover:bg-red-50 rounded"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
          </div>

          <button
            @click="addWaypoint"
            class="w-full h-12 mt-3 bg-teal-50 text-teal-600 rounded-xl font-medium hover:bg-teal-100 transition"
          >
            + 添加路点
          </button>
        </div>
      </div>

      <!-- 步骤 3: 关键点和风险点 -->
      <div v-if="currentStep === 3" class="space-y-4">
        <!-- 关键点 -->
        <div class="bg-white rounded-2xl shadow-sm p-5">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-gray-900 flex items-center">
              <svg class="w-5 h-5 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              关键点标记
            </h3>
            <button
              @click="addKeyPoint"
              class="text-teal-600 text-sm font-medium"
            >
              + 添加
            </button>
          </div>

          <div v-if="routeData.keyPoints.length === 0" class="text-center py-8 text-gray-400">
            <p class="text-sm">暂无关键点</p>
            <p class="text-xs mt-1">标记景点、休息点等重要位置</p>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="(point, index) in routeData.keyPoints"
              :key="index"
              class="border border-gray-200 rounded-xl p-4"
            >
              <div class="flex items-start justify-between mb-3">
                <input
                  v-model="point.name"
                  type="text"
                  placeholder="关键点名称"
                  class="flex-1 h-10 px-3 border border-gray-300 rounded-lg text-sm font-medium"
                />
                <button
                  @click="removeKeyPoint(index)"
                  class="ml-2 p-2 text-red-500 hover:bg-red-50 rounded"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              <select
                v-model="point.type"
                class="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm mb-3"
              >
                <option value="">选择类型</option>
                <option value="景点">📸 景点</option>
                <option value="休息点">☕ 休息点</option>
                <option value="补给点">🏪 补给点</option>
                <option value="观景台">🌄 观景台</option>
                <option value="分叉口">🔀 分叉口</option>
              </select>

              <textarea
                v-model="point.description"
                rows="2"
                placeholder="描述这个地点的特色..."
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- 风险点 -->
        <div class="bg-white rounded-2xl shadow-sm p-5">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-gray-900 flex items-center">
              <svg class="w-5 h-5 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
              风险点预警
            </h3>
            <button
              @click="addRiskPoint"
              class="text-orange-600 text-sm font-medium"
            >
              + 添加
            </button>
          </div>

          <div v-if="routeData.riskPoints.length === 0" class="text-center py-8 text-gray-400">
            <p class="text-sm">暂无风险点</p>
            <p class="text-xs mt-1">标记陡坡、岔路等需要注意的位置</p>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="(point, index) in routeData.riskPoints"
              :key="index"
              class="border border-orange-200 bg-orange-50 rounded-xl p-4"
            >
              <div class="flex items-start justify-between mb-3">
                <input
                  v-model="point.name"
                  type="text"
                  placeholder="风险点名称"
                  class="flex-1 h-10 px-3 border border-gray-300 rounded-lg text-sm font-medium bg-white"
                />
                <button
                  @click="removeRiskPoint(index)"
                  class="ml-2 p-2 text-red-500 hover:bg-red-50 rounded"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              <select
                v-model="point.riskLevel"
                class="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm mb-3 bg-white"
              >
                <option value="">选择风险等级</option>
                <option value="low">⚠️ 低风险</option>
                <option value="medium">🔶 中风险</option>
                <option value="high">🔴 高风险</option>
              </select>

              <textarea
                v-model="point.warning"
                rows="2"
                placeholder="安全提示和注意事项..."
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none bg-white"
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- 步骤 4: 预览和发布 -->
      <div v-if="currentStep === 4" class="space-y-4">
        <div class="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl p-6 text-white shadow-xl">
          <h3 class="text-xl font-bold mb-2">{{ routeData.name }}</h3>
          <p class="text-teal-100 text-sm mb-4">{{ routeData.description }}</p>

          <div class="grid grid-cols-3 gap-4">
            <div class="text-center">
              <p class="text-2xl font-bold">{{ routeData.distance }}</p>
              <p class="text-teal-100 text-xs mt-1">公里</p>
            </div>
            <div class="text-center border-l border-r border-teal-400">
              <p class="text-2xl font-bold">{{ routeData.duration }}</p>
              <p class="text-teal-100 text-xs mt-1">小时</p>
            </div>
            <div class="text-center">
              <p class="text-2xl font-bold">{{ routeData.elevation }}</p>
              <p class="text-teal-100 text-xs mt-1">爬升(m)</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm p-5">
          <h3 class="text-lg font-bold text-gray-900 mb-4">路线信息确认</h3>

          <div class="space-y-4">
            <div class="flex items-center justify-between py-3 border-b border-gray-100">
              <span class="text-gray-600">难度等级</span>
              <span class="font-semibold">{{ getDifficultyText(routeData.difficulty) }}</span>
            </div>

            <div class="flex items-center justify-between py-3 border-b border-gray-100">
              <span class="text-gray-600">路线类型</span>
              <span class="font-semibold">{{ routeData.types.join(', ') || '未设置' }}</span>
            </div>

            <div class="flex items-center justify-between py-3 border-b border-gray-100">
              <span class="text-gray-600">路点数量</span>
              <span class="font-semibold">{{ routeData.waypoints.length }} 个</span>
            </div>

            <div class="flex items-center justify-between py-3 border-b border-gray-100">
              <span class="text-gray-600">关键点</span>
              <span class="font-semibold">{{ routeData.keyPoints.length }} 个</span>
            </div>

            <div class="flex items-center justify-between py-3">
              <span class="text-gray-600">风险点</span>
              <span class="font-semibold text-orange-600">{{ routeData.riskPoints.length }} 个</span>
            </div>
          </div>
        </div>

        <div class="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div class="flex items-start">
            <svg class="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <div class="text-sm text-blue-900">
              <p class="font-semibold mb-1">发布须知</p>
              <p class="text-blue-700">路线发布后将经过平台审核，审核通过后其他用户可以查看和使用这条路线。请确保提供的信息准确完整。</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作按钮 -->
    <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
      <div class="flex gap-3">
        <button
          v-if="currentStep > 1"
          @click="prevStep"
          class="w-24 h-12 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition"
        >
          上一步
        </button>
        <button
          v-if="currentStep < 4"
          @click="nextStep"
          :disabled="!canProceed"
          class="flex-1 h-12 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition"
        >
          下一步
        </button>
        <button
          v-else
          @click="publishRoute"
          class="flex-1 h-12 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-semibold transition"
        >
          发布路线
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 步骤定义
const steps = [
  { id: 1, name: '基本信息' },
  { id: 2, name: '地图标记' },
  { id: 3, name: '关键点' },
  { id: 4, name: '预览发布' }
]

const currentStep = ref(1)

// 路线类型选项
const routeTypes = ['环线', '往返', '单程', '登山', '休闲', '探险', '亲子']

// 路线数据
interface Waypoint {
  x: number
  y: number
  name: string
}

interface KeyPoint {
  name: string
  type: string
  description: string
}

interface RiskPoint {
  name: string
  riskLevel: string
  warning: string
}

const routeData = ref({
  name: '',
  description: '',
  distance: null as number | null,
  duration: null as number | null,
  elevation: null as number | null,
  difficulty: '',
  types: [] as string[],
  waypoints: [] as Waypoint[],
  keyPoints: [] as KeyPoint[],
  riskPoints: [] as RiskPoint[]
})

// 计算路径
const waypointPath = computed(() => {
  return routeData.value.waypoints
    .map(p => `${p.x},${p.y}`)
    .join(' ')
})

// 检查是否可以进入下一步
const canProceed = computed(() => {
  switch (currentStep.value) {
    case 1:
      return !!(
        routeData.value.name &&
        routeData.value.description &&
        routeData.value.distance &&
        routeData.value.difficulty
      )
    case 2:
      return routeData.value.waypoints.length >= 2
    case 3:
      return true // 关键点和风险点是可选的
    case 4:
      return true
    default:
      return false
  }
})

// 方法
const handleBack = () => {
  if (currentStep.value > 1) {
    prevStep()
  } else {
    if (confirm('确定要放弃创建路线吗？')) {
      router.back()
    }
  }
}

const nextStep = () => {
  if (canProceed.value && currentStep.value < 4) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const toggleType = (type: string) => {
  const index = routeData.value.types.indexOf(type)
  if (index > -1) {
    routeData.value.types.splice(index, 1)
  } else {
    routeData.value.types.push(type)
  }
}

const addWaypoint = () => {
  // 模拟添加路点（实际应该从地图点击获取）
  const x = 50 + routeData.value.waypoints.length * 60
  const y = 100 + Math.random() * 100
  routeData.value.waypoints.push({
    x,
    y,
    name: ''
  })
}

const removeWaypoint = (index: number) => {
  routeData.value.waypoints.splice(index, 1)
}

const addKeyPoint = () => {
  routeData.value.keyPoints.push({
    name: '',
    type: '',
    description: ''
  })
}

const removeKeyPoint = (index: number) => {
  routeData.value.keyPoints.splice(index, 1)
}

const addRiskPoint = () => {
  routeData.value.riskPoints.push({
    name: '',
    riskLevel: '',
    warning: ''
  })
}

const removeRiskPoint = (index: number) => {
  routeData.value.riskPoints.splice(index, 1)
}

const getDifficultyText = (difficulty: string) => {
  const map: Record<string, string> = {
    easy: '简单 ⭐',
    moderate: '中等 ⭐⭐',
    hard: '困难 ⭐⭐⭐',
    extreme: '极难 ⭐⭐⭐⭐'
  }
  return map[difficulty] || '未设置'
}

const saveRoute = () => {
  // TODO: 保存草稿到本地或后端
  alert('路线已保存为草稿')
}

const publishRoute = () => {
  // TODO: 提交到后端API
  console.log('发布路线:', routeData.value)
  alert('路线已提交审核！\n\n审核通过后将自动发布，请耐心等待。')
  router.push('/my-hiking')
}
</script>

<style scoped>
input:disabled,
textarea:disabled,
select:disabled {
  background-color: #f9fafb;
  cursor: not-allowed;
}
</style>
