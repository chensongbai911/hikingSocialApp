<template>
  <div class="route-detail">
    <button class="btn-back" @click="$router.back()">← 返回</button>
    <h1>{{ routeData ? routeData.name : '路线详情' }}</h1>
    <p>{{ routeData ? routeData.description : '' }}</p>
    <div class="route-stats" v-if="routeData">
      <p>📍 距离: {{ formatDistance(routeData.distance) }} km</p>
      <p>⬆️ 爬升: {{ routeData.elevation_gain }} m</p>
      <p>⏱ 时长: {{ formatDuration(routeData.estimated_duration) }}</p>
    </div>
    <button class="btn btn-primary" @click="startHiking">开始徒步</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute as useVueRoute, useRouter } from 'vue-router'
import { routeApi } from '@/api/modules/route'

interface RouteDetail {
  id: string
  name: string
  description: string
  distance: number
  elevation_gain: number
  estimated_duration: number
}

const vueRoute = useVueRoute()
const router = useRouter()
const routeId = vueRoute.params.id as string
const routeData = ref<RouteDetail | null>(null)

const formatDistance = (distance: number) => {
  if (!distance) return '0'
  return (distance / 1000).toFixed(1)
}

const formatDuration = (seconds?: number) => {
  if (!seconds) return '-'
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
}

const loadRoute = async () => {
  try {
    const data = await routeApi.getDetail(routeId)
    routeData.value = data as unknown as RouteDetail
  } catch (error) {
    console.error('Failed to load route:', error)
  }
}

const startHiking = () => {
  router.push({
    name: 'TrackRecorder',
    query: { routeId }
  })
}

onMounted(() => {
  loadRoute()
})
</script>

<style scoped lang="scss">
.route-detail {
  padding: 20px;
  background: white;
  border-radius: 8px;
  margin: 20px;

  .btn-back {
    margin-bottom: 15px;
    padding: 8px 12px;
    border: none;
    background: #f0f0f0;
    border-radius: 4px;
    cursor: pointer;

    &:hover {
      background: #e0e0e0;
    }
  }

  h1 {
    margin: 0 0 10px 0;
    font-size: 24px;
    color: #333;
  }

  p {
    color: #666;
    line-height: 1.6;
  }

  .route-stats {
    background: #f9f9f9;
    padding: 15px;
    border-radius: 4px;
    margin: 15px 0;

    p {
      margin: 5px 0;
      font-size: 14px;
    }
  }

  .btn {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    font-weight: bold;

    &.btn-primary {
      background: #4CAF50;
      color: white;

      &:hover {
        background: #45a049;
      }
    }
  }
}
</style>
