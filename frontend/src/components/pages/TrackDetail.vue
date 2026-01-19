<template>
  <div class="track-detail">
    <button class="btn-back" @click="$router.back()">← 返回</button>

    <!-- 基本信息 -->
    <div class="track-header" v-if="trackData">
      <h1>{{ trackData.route_name || '徒步记录' }}</h1>
      <div class="track-meta">
        <span>📅 {{ formatDate(trackData.created_at) }}</span>
        <span>⏱ {{ formatDuration(trackData.duration) }}</span>
      </div>
    </div>

    <!-- 加载状态 -->
    <div class="loading" v-if="loading">加载中...</div>

    <!-- 错误提示 -->
    <div class="error" v-if="error">{{ error }}</div>

    <!-- 统计数据 -->
    <div class="track-stats" v-if="trackData && !loading">
      <div class="stat-card">
        <div class="stat-icon">📍</div>
        <div class="stat-content">
          <div class="stat-label">总距离</div>
          <div class="stat-value">{{ formatDistance(trackData.distance) }} km</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">⬆️</div>
        <div class="stat-content">
          <div class="stat-label">爬升</div>
          <div class="stat-value">{{ trackData.elevation_gain || 0 }} m</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">🔥</div>
        <div class="stat-content">
          <div class="stat-label">消耗卡路里</div>
          <div class="stat-value">{{ trackData.calories || 0 }} kcal</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">💧</div>
        <div class="stat-content">
          <div class="stat-label">平均配速</div>
          <div class="stat-value">{{ calculatePace(trackData.distance, trackData.duration) }} min/km</div>
        </div>
      </div>
    </div>

    <!-- 轨迹点列表 -->
    <div class="track-points" v-if="trackData && trackPoints.length > 0">
      <h2>轨迹点 ({{ trackPoints.length }})</h2>
      <div class="points-list">
        <div class="point-item" v-for="(point, index) in trackPoints.slice(0, 10)" :key="point.id">
          <span class="point-number">#{{ index + 1 }}</span>
          <span class="point-coord">{{ point.latitude.toFixed(4) }}, {{ point.longitude.toFixed(4) }}</span>
          <span class="point-time">{{ formatTime(point.recorded_at) }}</span>
          <span class="point-altitude" v-if="point.altitude">{{ point.altitude }}m</span>
        </div>
        <div class="points-more" v-if="trackPoints.length > 10">
          ... 还有 {{ trackPoints.length - 10 }} 个轨迹点
        </div>
      </div>
    </div>

    <!-- 评分和笔记 -->
    <div class="track-feedback" v-if="trackData && !loading">
      <div class="feedback-card">
        <h3>👤 评价此徒步</h3>
        <div class="rating">
          <span v-for="i in 5" :key="i"
                class="star"
                :class="{ active: i <= (feedback.rating || 0) }"
                @click="feedback.rating = i">★</span>
        </div>
        <textarea
          v-model="feedback.comment"
          placeholder="分享你的徒步体验..."
          class="feedback-textarea"></textarea>
        <button class="btn btn-primary" @click="submitFeedback">提交评价</button>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="track-actions" v-if="trackData && !loading">
      <button class="btn btn-secondary" @click="shareTrack">📤 分享</button>
      <button class="btn btn-secondary" @click="downloadData">⬇️ 下载数据</button>
      <button class="btn btn-danger" @click="deleteTrack">🗑️ 删除</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute as useVueRoute, useRouter } from 'vue-router'
import { trackApi } from '@/api/modules/track'

interface TrackPoint {
  id: string
  latitude: number
  longitude: number
  altitude?: number
  recorded_at: string
}

interface TrackDetail {
  id: string
  route_name?: string
  distance: number
  duration: number
  elevation_gain?: number
  calories?: number
  created_at: string
  updated_at?: string
  status?: 'completed' | 'in_progress'
}

const vueRoute = useVueRoute()
const router = useRouter()
const trackId = vueRoute.params.id as string

const trackData = ref<TrackDetail | null>(null)
const trackPoints = ref<TrackPoint[]>([])
const loading = ref(true)
const error = ref('')

const feedback = ref({
  rating: 0,
  comment: ''
})

const formatDate = (date?: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const formatDistance = (distance: number) => {
  if (!distance) return '0'
  return (distance / 1000).toFixed(2)
}

const formatDuration = (seconds?: number) => {
  if (!seconds) return '-'
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  if (hours > 0) return `${hours}h ${mins}m ${secs}s`
  if (mins > 0) return `${mins}m ${secs}s`
  return `${secs}s`
}

const calculatePace = (distance: number, duration: number) => {
  if (!distance || !duration) return '-'
  const km = distance / 1000
  const pace = duration / 60 / km
  return pace.toFixed(1)
}

const loadTrack = async () => {
  try {
    loading.value = true
    error.value = ''

    // 获取轨迹信息
    const detail = await trackApi.getTrackDetail(trackId)
    trackData.value = detail as TrackDetail

    // 获取轨迹点
    const points = await trackApi.getTrackPoints(trackId)
    trackPoints.value = (points as any).points || []
  } catch (err) {
    error.value = '无法加载轨迹数据，请稍后重试'
    console.error('Failed to load track:', err)
  } finally {
    loading.value = false
  }
}

const submitFeedback = async () => {
  if (feedback.value.rating === 0) {
    alert('请选择评分')
    return
  }

  try {
    await trackApi.addTrackFeedback(trackId, {
      rating: feedback.value.rating,
      comment: feedback.value.comment
    })
    alert('评价提交成功！')
    feedback.value = { rating: 0, comment: '' }
  } catch (err) {
    alert('提交评价失败，请重试')
  }
}

const shareTrack = () => {
  const shareUrl = `${window.location.origin}/track/${trackId}`
  navigator.clipboard.writeText(shareUrl)
  alert('分享链接已复制到剪贴板')
}

const downloadData = () => {
  const data = {
    track: trackData.value,
    points: trackPoints.value,
    exportTime: new Date().toISOString()
  }
  const jsonStr = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `track-${trackId}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const deleteTrack = async () => {
  if (!confirm('确认删除此徒步记录？此操作不可撤销。')) {
    return
  }

  try {
    await trackApi.deleteTrack(trackId)
    alert('删除成功')
    router.push('/my-hiking')
  } catch (err) {
    alert('删除失败，请重试')
  }
}

onMounted(() => {
  loadTrack()
})
</script>

<style scoped lang="scss">
.track-detail {
  padding: 16px;
  max-width: 800px;
  margin: 0 auto;
}

.btn-back {
  background: transparent;
  border: none;
  font-size: 16px;
  cursor: pointer;
  margin-bottom: 20px;
  color: #666;

  &:hover {
    color: #333;
  }
}

.track-header {
  margin-bottom: 24px;

  h1 {
    font-size: 28px;
    margin: 0 0 8px 0;
    color: #1a1a1a;
  }
}

.track-meta {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #666;
}

.loading {
  text-align: center;
  padding: 40px 16px;
  color: #999;
}

.error {
  background-color: #fee;
  border: 1px solid #fcc;
  color: #c33;
  padding: 12px 16px;
  border-radius: 4px;
  margin-bottom: 16px;
}

.track-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;

  .stat-icon {
    font-size: 24px;
  }

  .stat-content {
    flex: 1;
  }

  .stat-label {
    font-size: 12px;
    color: #999;
    margin-bottom: 4px;
  }

  .stat-value {
    font-size: 18px;
    font-weight: 600;
    color: #1a1a1a;
  }
}

.track-points {
  margin-bottom: 24px;

  h2 {
    font-size: 16px;
    margin: 0 0 12px 0;
    color: #333;
  }
}

.points-list {
  background: #f9f9f9;
  border-radius: 8px;
  overflow: hidden;
}

.point-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-bottom: 1px solid #eee;
  font-size: 13px;

  &:last-child {
    border-bottom: none;
  }

  .point-number {
    min-width: 40px;
    color: #999;
    font-weight: 600;
  }

  .point-coord {
    flex: 1;
    font-family: monospace;
    color: #666;
  }

  .point-time {
    color: #999;
    font-size: 12px;
  }

  .point-altitude {
    color: #666;
    font-weight: 600;
  }
}

.points-more {
  padding: 12px;
  text-align: center;
  color: #999;
  font-size: 12px;
}

.track-feedback {
  margin-bottom: 24px;
}

.feedback-card {
  background: #f9f9f9;
  padding: 16px;
  border-radius: 8px;

  h3 {
    margin: 0 0 12px 0;
    font-size: 16px;
    color: #333;
  }
}

.rating {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.star {
  font-size: 32px;
  cursor: pointer;
  color: #ddd;
  transition: color 0.2s;

  &:hover,
  &.active {
    color: #ffb800;
  }
}

.feedback-textarea {
  width: 100%;
  min-height: 100px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
  font-size: 14px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #4a90e2;
  }
}

.track-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  flex-wrap: wrap;

  .btn {
    flex: 1;
    min-width: 120px;
  }
}

.btn {
  padding: 12px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 600;
}

.btn-primary {
  background-color: #4a90e2;
  color: white;

  &:hover {
    background-color: #3a7bc8;
  }
}

.btn-secondary {
  background-color: #f0f0f0;
  color: #333;

  &:hover {
    background-color: #e0e0e0;
  }
}

.btn-danger {
  background-color: #ff4757;
  color: white;

  &:hover {
    background-color: #ff3838;
  }
}

@media (max-width: 768px) {
  .track-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .track-actions {
    flex-direction: column;

    .btn {
      flex: none;
      width: 100%;
    }
  }
}
</style>
