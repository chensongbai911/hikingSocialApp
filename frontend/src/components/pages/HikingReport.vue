<template>
  <div class="hiking-report min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <!-- 顶部导航栏 -->
    <div class="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div class="flex items-center justify-between px-4 h-14">
        <button @click="$router.back()" class="p-2">
          <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 class="text-lg font-semibold text-gray-900">徒步复盘</h1>
        <button @click="shareReport" class="p-2">
          <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
          </svg>
        </button>
      </div>
    </div>

    <div class="pt-14 pb-20 px-4 space-y-6">
      <!-- 顶部概览卡片 -->
      <div class="bg-gradient-to-br from-teal-500 to-teal-600 rounded-3xl p-6 text-white shadow-xl mt-4">
        <div class="text-center mb-6">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-full mb-3">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h2 class="text-2xl font-bold mb-1">徒步完成！</h2>
          <p class="text-teal-100 text-sm">{{ reportData.date }}</p>
        </div>

        <div class="grid grid-cols-3 gap-4">
          <div class="text-center">
            <p class="text-3xl font-bold">{{ reportData.distance }}</p>
            <p class="text-teal-100 text-xs mt-1">公里</p>
          </div>
          <div class="text-center border-l border-r border-teal-400">
            <p class="text-3xl font-bold">{{ reportData.duration }}</p>
            <p class="text-teal-100 text-xs mt-1">时长</p>
          </div>
          <div class="text-center">
            <p class="text-3xl font-bold">{{ reportData.elevation }}</p>
            <p class="text-teal-100 text-xs mt-1">爬升(m)</p>
          </div>
        </div>
      </div>

      <!-- Tab 切换 -->
      <div class="bg-white rounded-2xl shadow-sm p-1 flex">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="flex-1 h-10 rounded-xl font-medium text-sm transition-all"
          :class="activeTab === tab.id
            ? 'bg-teal-500 text-white shadow-md'
            : 'text-gray-600 hover:bg-gray-50'"
        >
          {{ tab.name }}
        </button>
      </div>

      <!-- 数据统计 Tab -->
      <div v-if="activeTab === 'stats'" class="space-y-4">
        <!-- 运动数据卡片 -->
        <div class="bg-white rounded-2xl shadow-sm p-5">
          <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <svg class="w-5 h-5 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
            运动数据
          </h3>

          <div class="grid grid-cols-2 gap-4">
            <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
              <div class="flex items-center mb-2">
                <svg class="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
                <span class="text-sm text-gray-600">平均配速</span>
              </div>
              <p class="text-2xl font-bold text-blue-600">{{ reportData.avgPace }}</p>
              <p class="text-xs text-gray-500 mt-1">分钟/公里</p>
            </div>

            <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
              <div class="flex items-center mb-2">
                <svg class="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span class="text-sm text-gray-600">平均速度</span>
              </div>
              <p class="text-2xl font-bold text-green-600">{{ reportData.avgSpeed }}</p>
              <p class="text-xs text-gray-500 mt-1">km/h</p>
            </div>

            <div class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4">
              <div class="flex items-center mb-2">
                <svg class="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
                </svg>
                <span class="text-sm text-gray-600">累计爬升</span>
              </div>
              <p class="text-2xl font-bold text-orange-600">{{ reportData.elevation }}</p>
              <p class="text-xs text-gray-500 mt-1">米</p>
            </div>

            <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
              <div class="flex items-center mb-2">
                <svg class="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
                </svg>
                <span class="text-sm text-gray-600">累计下降</span>
              </div>
              <p class="text-2xl font-bold text-purple-600">{{ reportData.descent }}</p>
              <p class="text-xs text-gray-500 mt-1">米</p>
            </div>
          </div>
        </div>

        <!-- 海拔图表 -->
        <div class="bg-white rounded-2xl shadow-sm p-5">
          <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <svg class="w-5 h-5 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/>
            </svg>
            海拔变化曲线
          </h3>

          <div class="relative h-48 bg-gradient-to-b from-teal-50 to-white rounded-xl p-4">
            <svg class="w-full h-full" viewBox="0 0 400 160" preserveAspectRatio="none">
              <!-- 网格线 -->
              <line x1="0" y1="40" x2="400" y2="40" stroke="#e5e7eb" stroke-width="1"/>
              <line x1="0" y1="80" x2="400" y2="80" stroke="#e5e7eb" stroke-width="1"/>
              <line x1="0" y1="120" x2="400" y2="120" stroke="#e5e7eb" stroke-width="1"/>

              <!-- 渐变填充 -->
              <defs>
                <linearGradient id="elevationGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style="stop-color:#14b8a6;stop-opacity:0.3"/>
                  <stop offset="100%" style="stop-color:#14b8a6;stop-opacity:0"/>
                </linearGradient>
              </defs>

              <!-- 海拔曲线 -->
              <path
                :d="elevationPath"
                fill="url(#elevationGradient)"
                stroke="#14b8a6"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
              />

              <!-- 最高点标记 -->
              <circle cx="240" cy="30" r="4" fill="#14b8a6"/>
              <text x="240" y="20" text-anchor="middle" class="text-xs fill-teal-600 font-semibold">
                最高 {{ reportData.maxElevation }}m
              </text>

              <!-- 最低点标记 -->
              <circle cx="50" cy="130" r="4" fill="#14b8a6"/>
              <text x="50" y="150" text-anchor="middle" class="text-xs fill-teal-600 font-semibold">
                最低 {{ reportData.minElevation }}m
              </text>
            </svg>
          </div>
        </div>

        <!-- 热量消耗 -->
        <div class="bg-white rounded-2xl shadow-sm p-5">
          <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <svg class="w-5 h-5 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"/>
            </svg>
            能量消耗
          </h3>

          <div class="flex items-center justify-between">
            <div>
              <p class="text-4xl font-bold text-red-500">{{ reportData.calories }}</p>
              <p class="text-sm text-gray-500 mt-1">千卡</p>
            </div>
            <div class="text-right text-sm text-gray-600">
              <p>相当于</p>
              <p class="font-semibold text-gray-900">{{ Math.floor(reportData.calories / 200) }} 碗米饭</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 深度分析 Tab -->
      <div v-if="activeTab === 'analysis'" class="space-y-4">
        <!-- 亮点表现 -->
        <div class="bg-white rounded-2xl shadow-sm p-5">
          <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <svg class="w-5 h-5 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            亮点表现
          </h3>

          <div class="space-y-3">
            <div
              v-for="(highlight, index) in highlights"
              :key="index"
              class="flex items-start p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl"
            >
              <div class="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                <span class="text-white font-bold text-sm">{{ index + 1 }}</span>
              </div>
              <div class="flex-1">
                <h4 class="font-semibold text-gray-900 mb-1">{{ highlight.title }}</h4>
                <p class="text-sm text-gray-600">{{ highlight.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 改进建议 -->
        <div class="bg-white rounded-2xl shadow-sm p-5">
          <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <svg class="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
            </svg>
            改进建议
          </h3>

          <div class="space-y-3">
            <div
              v-for="(suggestion, index) in suggestions"
              :key="index"
              class="flex items-start p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl"
            >
              <svg class="w-5 h-5 text-blue-500 flex-shrink-0 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
              </svg>
              <div>
                <h4 class="font-semibold text-gray-900 mb-1">{{ suggestion.title }}</h4>
                <p class="text-sm text-gray-600">{{ suggestion.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 成就徽章 -->
        <div class="bg-white rounded-2xl shadow-sm p-5">
          <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <svg class="w-5 h-5 text-teal-500 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            本次成就
          </h3>

          <div class="grid grid-cols-3 gap-3">
            <div
              v-for="badge in badges"
              :key="badge.id"
              class="text-center p-4 bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl"
            >
              <div class="text-4xl mb-2">{{ badge.icon }}</div>
              <p class="text-xs font-semibold text-gray-900">{{ badge.name }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 分享海报 Tab -->
      <div v-if="activeTab === 'share'" class="space-y-4">
        <div class="text-center py-4">
          <h3 class="text-lg font-bold text-gray-900 mb-2">选择分享模板</h3>
          <p class="text-sm text-gray-500">生成精美海报，分享你的徒步成果</p>
        </div>

        <!-- 模板选择 -->
        <div class="grid grid-cols-2 gap-4">
          <div
            v-for="template in shareTemplates"
            :key="template.id"
            @click="selectedTemplate = template.id"
            class="relative rounded-2xl overflow-hidden cursor-pointer transition-all transform hover:scale-105"
            :class="selectedTemplate === template.id ? 'ring-4 ring-teal-500' : ''"
          >
            <div
              class="aspect-[3/4] bg-gradient-to-br p-6 flex flex-col justify-between"
              :style="{ background: template.gradient }"
            >
              <div>
                <h4 class="text-white font-bold text-lg mb-1">{{ template.name }}</h4>
                <p class="text-white text-opacity-80 text-xs">{{ template.description }}</p>
              </div>
              <div class="space-y-2">
                <div class="bg-white bg-opacity-20 backdrop-blur rounded-lg p-3 text-white">
                  <p class="text-xs opacity-80">今日徒步</p>
                  <p class="text-2xl font-bold">{{ reportData.distance }}km</p>
                </div>
              </div>
            </div>
            <div
              v-if="selectedTemplate === template.id"
              class="absolute top-2 right-2 w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center"
            >
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- 生成按钮 -->
        <button
          @click="generatePoster"
          class="w-full h-14 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-xl font-semibold text-lg transition shadow-lg"
        >
          生成分享海报
        </button>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 safe-area-bottom">
      <div class="flex gap-3">
        <button
          @click="saveReport"
          class="flex-1 h-12 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition"
        >
          保存记录
        </button>
        <button
          @click="shareReport"
          class="flex-1 h-12 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-semibold transition"
        >
          分享成果
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// Tab 管理
const tabs = [
  { id: 'stats', name: '数据统计' },
  { id: 'analysis', name: '深度分析' },
  { id: 'share', name: '分享海报' }
]
const activeTab = ref('stats')

// 报告数据
const reportData = ref({
  date: new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  }),
  distance: route.query.distance || '12.5',
  duration: formatDuration(parseInt(route.query.time as string || '0')),
  elevation: route.query.elevation || '642',
  descent: '638',
  avgPace: '6\'30"',
  avgSpeed: '5.8',
  maxElevation: '840',
  minElevation: '210',
  calories: 856
})

// 海拔路径数据
const elevationPath = computed(() => {
  // 模拟海拔数据点
  const points = [
    { x: 0, y: 130 },
    { x: 50, y: 130 },
    { x: 100, y: 110 },
    { x: 150, y: 90 },
    { x: 200, y: 70 },
    { x: 240, y: 30 },
    { x: 280, y: 50 },
    { x: 320, y: 70 },
    { x: 360, y: 90 },
    { x: 400, y: 100 }
  ]

  const pathD = points.map((p, i) =>
    i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`
  ).join(' ')

  return `${pathD} L 400 160 L 0 160 Z`
})

// 亮点表现
const highlights = ref([
  {
    title: '配速稳定',
    description: '全程配速波动小于10%，保持了良好的节奏'
  },
  {
    title: '爬升优秀',
    description: '累计爬升642米，超过80%的同路线用户'
  },
  {
    title: '耐力出色',
    description: '连续行进3小时无长时间休息，体能表现优异'
  }
])

// 改进建议
const suggestions = ref([
  {
    title: '适当控制前半程速度',
    description: '前5公里配速偏快，建议保持匀速以获得更好的整体表现'
  },
  {
    title: '增加爬坡训练',
    description: '上坡路段配速下降明显，可针对性进行爬坡训练'
  },
  {
    title: '注意补充水分',
    description: '运动时长较长，建议每30分钟补水一次'
  }
])

// 成就徽章
const badges = ref([
  { id: 1, icon: '🏔️', name: '登顶者' },
  { id: 2, icon: '⚡', name: '速度之星' },
  { id: 3, icon: '💪', name: '耐力王' },
  { id: 4, icon: '🎯', name: '精准配速' },
  { id: 5, icon: '🌟', name: '全勤达人' },
  { id: 6, icon: '🔥', name: '燃脂能手' }
])

// 分享模板
const shareTemplates = ref([
  {
    id: 'simple',
    name: '简约风',
    description: '清新简洁',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    id: 'vibrant',
    name: '活力风',
    description: '活力四射',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    id: 'professional',
    name: '专业风',
    description: '专业严谨',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  {
    id: 'natural',
    name: '自然风',
    description: '贴近自然',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  }
])

const selectedTemplate = ref('simple')

// 工具函数
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}h ${minutes}min`
  }
  return `${minutes}min`
}

// 方法
const shareReport = () => {
  // TODO: 实现分享功能
  alert('分享功能开发中...')
}

const saveReport = () => {
  // TODO: 保存到后端
  alert('记录已保存！')
  router.push('/my-hiking')
}

const generatePoster = () => {
  // TODO: 生成海报图片
  alert(`正在生成${shareTemplates.value.find(t => t.id === selectedTemplate.value)?.name}海报...`)
}
</script>

<style scoped>
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
