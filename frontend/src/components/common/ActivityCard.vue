<template>
  <div
    :class="['activity-card rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow', clickable ? 'cursor-pointer' : '']"
    @click="$emit('click')"
  >
    <!-- 活动图片 -->
    <div class="relative h-40 overflow-hidden bg-gray-200">
      <img
        :src="activity.coverImage"
        :alt="activity.title"
        class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
      />
      <!-- 难度标签 -->
      <div class="absolute top-3 right-3">
        <span
          :class="['px-3 py-1 rounded-full text-xs font-semibold text-white', getDifficultyColor(activity.difficulty)]"
        >
          {{ activity.difficulty }}
        </span>
      </div>
    </div>

    <!-- 活动信息 -->
    <div class="p-4">
      <!-- 标题 -->
      <h3 class="font-bold text-lg truncate mb-2">{{ activity.title }}</h3>

      <!-- 位置 -->
      <div class="flex items-center text-gray-600 text-sm mb-2">
        <span class="mr-2">📍</span>
        <span class="truncate">{{ activity.location }}</span>
      </div>

      <!-- 时间 -->
      <div class="flex items-center text-gray-600 text-sm mb-3">
        <span class="mr-2">🕐</span>
        <span>{{ formatDate(activity.startTime) }}</span>
      </div>

      <!-- 底部信息 -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-1">
          <span
            :class="['px-2 py-1 rounded text-xs font-medium', activity.type === 'sunrise' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700']"
          >
            {{ getTypeLabel(activity.type) }}
          </span>
        </div>
        <div class="text-sm text-gray-600">
          👥 {{ activity.participantCount }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Activity {
  id: number
  title: string
  location: string
  startTime: string
  difficulty: string
  type: string
  coverImage: string
  participantCount: number
}

defineProps<{
  activity: Activity
  clickable?: boolean
}>()

defineEmits<{
  click: []
}>()

const getDifficultyColor = (difficulty: string) => {
  const colors: Record<string, string> = {
    easy: 'bg-green-600',
    moderate: 'bg-yellow-600',
    hard: 'bg-red-600',
    简单: 'bg-green-600',
    中等: 'bg-yellow-600',
    困难: 'bg-red-600',
  }
  return colors[difficulty] || 'bg-gray-600'
}

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    sunrise: '日出',
    sunset: '日落',
    classic: '经典',
    other: '其他',
    日出: '日出',
    日落: '日落',
    经典: '经典',
  }
  return labels[type] || type
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${month}-${day} ${hours}:${minutes}`
}
</script>

<style scoped>
.activity-card {
  background: white;
  transition: all 0.3s ease;
}

.activity-card:hover {
  box-shadow: 0 8px 16px rgba(0, 191, 165, 0.15);
}
</style>
