<template>
  <div class="track-recorder-container">
    <div class="recorder-header">
      <h1>开始徒步</h1>
      <button
        v-if="!isRecording"
        class="btn-start"
        @click="startRecording"
      >
        🎯 开始记录
      </button>
      <button
        v-else
        class="btn-stop"
        @click="stopRecording"
      >
        ⏹ 停止记录
      </button>
    </div>

    <div class="recorder-content">
      <!-- 地图 -->
      <div class="map-section">
        <div id="map-container" class="map"></div>
      </div>

      <!-- 实时数据 -->
      <div class="stats-panel">
        <div class="stat-card">
          <span class="label">距离</span>
          <span class="value">{{ (stats.totalDistance / 1000).toFixed(2) }} km</span>
        </div>
        <div class="stat-card">
          <span class="label">时长</span>
          <span class="value">{{ formatDuration(stats.totalDuration) }}</span>
        </div>
        <div class="stat-card">
          <span class="label">速度</span>
          <span class="value">{{ stats.avgSpeed.toFixed(1) }} km/h</span>
        </div>
        <div class="stat-card">
          <span class="label">爬升</span>
          <span class="value">{{ stats.totalElevationGain.toFixed(0) }} m</span>
        </div>
      </div>

      <!-- 记录信息 -->
      <div class="recording-info">
        <div class="info-group">
          <label>徒步名称</label>
          <input
            v-model="trackName"
            type="text"
            placeholder="为这次徒步命名..."
            class="input"
            :disabled="isRecording"
          />
        </div>

        <div class="info-group">
          <label>选择路线（可选）</label>
          <select v-model="selectedRouteId" class="input" :disabled="isRecording">
            <option value="">-- 未关联路线 --</option>
            <option v-for="route in routes" :key="route.id" :value="route.id">
              {{ route.name }}
            </option>
          </select>
        </div>

        <div class="info-group">
          <label>描述</label>
          <textarea
            v-model="trackDescription"
            placeholder="记录这次徒步的感受..."
            class="textarea"
            :disabled="isRecording"
            rows="3"
          ></textarea>
        </div>
      </div>

      <!-- 轨迹点列表 -->
      <div class="points-info">
        <p>已记录 {{ points.length }} 个轨迹点</p>
        <div v-if="points.length > 0" class="points-preview">
          <div
            v-for="(point, index) in points.slice(-5)"
            :key="index"
            class="point-item"
          >
            <span class="time">{{ formatTime(point.recorded_at) }}</span>
            <span class="coords">{{ point.location.toFixed(4) }}</span>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <button
          class="btn btn-secondary"
          @click="pauseRecording"
          v-if="isRecording && !isPaused"
        >
          ⏸ 暂停
        </button>
        <button
          class="btn btn-secondary"
          @click="resumeRecording"
          v-if="isRecording && isPaused"
        >
          ▶ 继续
        </button>
        <button
          class="btn btn-success"
          @click="completeRecording"
          v-if="!isRecording && points.length > 0"
          :disabled="!trackName"
        >
          ✓ 完成
        </button>
        <button
          class="btn btn-danger"
          @click="cancelRecording"
          v-if="points.length > 0"
        >
          ✕ 放弃
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTrackRecorder } from '@/utils/trackRecorder'
import { createMap, getCurrentPosition } from '@/utils/map'
import { trackApi } from '@/api/modules/track'
import { routeApi } from '@/api/modules/route'

interface Route {
  id: string
  name: string
}

interface Point {
  location: number
  recorded_at: string
}

const router = useRouter()
const trackName = ref('')
const trackDescription = ref('')
const selectedRouteId = ref('')
const routes = ref<Route[]>([])
const points = ref<Point[]>([])
const isRecording = ref(false)
const isPaused = ref(false)
let map: any = null

const {
  isRecording: recorderActive,
  stats,
  points: recordedPoints,
  start,
  stop,
  pause,
  resume
} = useTrackRecorder({
  minDistance: 5,
  minInterval: 3000
})

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return `${hours}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

const formatTime = (timestamp: string): string => {
  return new Date(timestamp).toLocaleTimeString()
}

const startRecording = async () => {
  if (!trackName.value.trim()) {
    alert('请输入徒步名称')
    return
  }

  try {
    isRecording.value = true
    await start()
    // 初始化地图上的记录
    points.value = []
  } catch (error) {
    console.error('Failed to start recording:', error)
    isRecording.value = false
    alert('无法启动位置记录，请检查权限')
  }
}

const pauseRecording = () => {
  pause()
  isPaused.value = true
}

const resumeRecording = () => {
  resume()
  isPaused.value = false
}

const stopRecording = () => {
  stop()
  isRecording.value = false
}

const completeRecording = async () => {
  if (recordedPoints.value.length === 0) {
    alert('没有记录到轨迹点')
    return
  }

  try {
    const trackResponse = await trackApi.createTrack({
      name: trackName.value,
      description: trackDescription.value,
      route_id: selectedRouteId.value || null
    })

    // 上传轨迹点
    await trackApi.uploadTrackPoints(trackResponse.id, recordedPoints.value)

    // 完成轨迹
    await trackApi.completeTrack(trackResponse.id)

    alert('徒步记录保存成功！')
    router.push({ name: 'TrackDetail', params: { id: trackResponse.id } })
  } catch (error) {
    console.error('Failed to save track:', error)
    alert('保存失败，请重试')
  }
}

const cancelRecording = () => {
  if (confirm('确定要放弃此次记录吗？')) {
    recordedPoints.value = []
    points.value = []
    trackName.value = ''
    trackDescription.value = ''
    isRecording.value = false
    isPaused.value = false
  }
}

onMounted(async () => {
  try {
    // 加载路线列表
    const routesData = await routeApi.getRoutes()
    routes.value = routesData

    // 初始化地图
    map = await createMap('map-container')
    const pos = await getCurrentPosition()
    // 设置地图中心到当前位置
  } catch (error) {
    console.error('Failed to initialize:', error)
  }
})

onUnmounted(() => {
  if (isRecording.value) {
    stopRecording()
  }
})
</script>

<style scoped lang="scss">
.track-recorder-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f5f5;
}

.recorder-header {
  background: white;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  h1 {
    margin: 0;
    font-size: 24px;
    color: #333;
  }

  .btn-start,
  .btn-stop {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
  }

  .btn-start {
    background: #4CAF50;
    color: white;

    &:hover {
      background: #45a049;
    }
  }

  .btn-stop {
    background: #F44336;
    color: white;

    &:hover {
      background: #da190b;
    }
  }
}

.recorder-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 20px;
  gap: 20px;
}

.map-section {
  flex: 1;
  min-height: 300px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  #map-container {
    width: 100%;
    height: 100%;
  }
}

.stats-panel {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
}

.stat-card {
  background: white;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  .label {
    display: block;
    font-size: 12px;
    color: #999;
    margin-bottom: 8px;
  }

  .value {
    display: block;
    font-size: 18px;
    font-weight: bold;
    color: #333;
  }
}

.recording-info {
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.info-group {
  margin-bottom: 15px;

  &:last-child {
    margin-bottom: 0;
  }

  label {
    display: block;
    font-size: 12px;
    font-weight: bold;
    color: #666;
    margin-bottom: 6px;
  }

  .input,
  .textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    font-family: inherit;

    &:focus {
      outline: none;
      border-color: #4CAF50;
    }

    &:disabled {
      background: #f9f9f9;
      color: #999;
    }
  }

  .textarea {
    resize: vertical;
  }
}

.points-info {
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  p {
    margin: 0 0 10px 0;
    font-size: 14px;
    color: #666;
  }

  .points-preview {
    max-height: 150px;
    overflow-y: auto;
    border: 1px solid #eee;
    border-radius: 4px;
  }

  .point-item {
    display: flex;
    justify-content: space-between;
    padding: 8px;
    border-bottom: 1px solid #eee;
    font-size: 12px;

    &:last-child {
      border-bottom: none;
    }

    .time {
      color: #999;
      font-family: monospace;
    }

    .coords {
      color: #333;
      font-family: monospace;
    }
  }
}

.action-buttons {
  display: flex;
  gap: 10px;
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  .btn {
    flex: 1;
    padding: 12px 20px;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
    transition: background 0.3s;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .btn-secondary {
    background: #2196F3;
    color: white;

    &:hover:not(:disabled) {
      background: #0b7dda;
    }
  }

  .btn-success {
    background: #4CAF50;
    color: white;

    &:hover:not(:disabled) {
      background: #45a049;
    }
  }

  .btn-danger {
    background: #F44336;
    color: white;

    &:hover:not(:disabled) {
      background: #da190b;
    }
  }
}

@media (max-width: 768px) {
  .stats-panel {
    grid-template-columns: repeat(2, 1fr);
  }

  .action-buttons {
    flex-direction: column;
  }
}
</style>
