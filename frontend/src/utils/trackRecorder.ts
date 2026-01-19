/**
 * 轨迹记录工具
 * 创建日期: 2026-01-19
 */

import { ref, computed } from 'vue'
import type { TrackPointData } from '../api/modules/track'
import { calculateDistance } from './map'

interface TrackRecorderOptions {
  minDistance?: number // 最小距离间隔（米）
  minInterval?: number // 最小时间间隔（毫秒）
  onPointAdded?: (point: TrackPointData) => void
  onError?: (error: Error) => void
}

/**
 * 轨迹记录器
 */
export class TrackRecorder {
  private watchId: number | null = null
  private points: TrackPointData[] = []
  private isRecording = false
  private isPaused = false
  private lastPoint: TrackPointData | null = null
  private startTime: Date | null = null
  private totalDistance = 0
  private totalDuration = 0

  private options: Required<TrackRecorderOptions> = {
    minDistance: 5, // 5米
    minInterval: 3000, // 3秒
    onPointAdded: () => { },
    onError: () => { },
  }

  constructor(options?: TrackRecorderOptions) {
    if (options) {
      this.options = { ...this.options, ...options }
    }
  }

  /**
   * 开始记录
   */
  start(): void {
    if (this.isRecording) {
      return
    }

    this.isRecording = true
    this.isPaused = false
    this.startTime = new Date()

    if ('geolocation' in navigator) {
      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          if (!this.isPaused) {
            this.addPoint(position)
          }
        },
        (error) => {
          this.options.onError(new Error(`定位失败: ${error.message}`))
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 10000,
        }
      )
    } else {
      this.options.onError(new Error('浏览器不支持地理定位'))
    }
  }

  /**
   * 暂停记录
   */
  pause(): void {
    this.isPaused = true
  }

  /**
   * 继续记录
   */
  resume(): void {
    this.isPaused = false
  }

  /**
   * 停止记录
   */
  stop(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId)
      this.watchId = null
    }

    this.isRecording = false
    this.isPaused = false
  }

  /**
   * 添加轨迹点
   */
  private addPoint(position: GeolocationPosition): void {
    const point: TrackPointData = {
      lng: position.coords.longitude,
      lat: position.coords.latitude,
      altitude: position.coords.altitude || undefined,
      accuracy: position.coords.accuracy,
      speed: position.coords.speed || undefined,
      heading: position.coords.heading || undefined,
      recordedAt: new Date(position.timestamp).toISOString(),
    }

    // 检查是否满足记录条件
    if (this.shouldRecordPoint(point)) {
      // 计算距离
      if (this.lastPoint) {
        const distance = calculateDistance(this.lastPoint, point)
        this.totalDistance += distance
      }

      this.points.push(point)
      this.lastPoint = point
      this.options.onPointAdded(point)
    }
  }

  /**
   * 判断是否应该记录该点
   */
  private shouldRecordPoint(point: TrackPointData): boolean {
    if (!this.lastPoint) {
      return true
    }

    // 距离判断
    const distance = calculateDistance(this.lastPoint, point)
    if (distance < this.options.minDistance) {
      return false
    }

    // 时间间隔判断
    const lastTime = new Date(this.lastPoint.recordedAt!).getTime()
    const currentTime = new Date(point.recordedAt!).getTime()
    const interval = currentTime - lastTime

    if (interval < this.options.minInterval) {
      return false
    }

    return true
  }

  /**
   * 获取所有轨迹点
   */
  getPoints(): TrackPointData[] {
    return [...this.points]
  }

  /**
   * 获取统计信息
   */
  getStats() {
    const duration = this.startTime
      ? Math.floor((Date.now() - this.startTime.getTime()) / 1000)
      : 0

    const speeds = this.points
      .map((p) => p.speed)
      .filter((s) => s !== undefined) as number[]

    const altitudes = this.points
      .map((p) => p.altitude)
      .filter((a) => a !== undefined) as number[]

    return {
      totalPoints: this.points.length,
      totalDistance: this.totalDistance,
      totalDuration: duration,
      avgSpeed:
        speeds.length > 0
          ? speeds.reduce((a, b) => a + b, 0) / speeds.length
          : 0,
      maxSpeed: speeds.length > 0 ? Math.max(...speeds) : 0,
      maxAltitude: altitudes.length > 0 ? Math.max(...altitudes) : undefined,
      minAltitude: altitudes.length > 0 ? Math.min(...altitudes) : undefined,
    }
  }

  /**
   * 清空数据
   */
  clear(): void {
    this.points = []
    this.lastPoint = null
    this.totalDistance = 0
    this.startTime = null
  }

  /**
   * 获取录制状态
   */
  getStatus() {
    return {
      isRecording: this.isRecording,
      isPaused: this.isPaused,
    }
  }
}

/**
 * Vue Composable: 使用轨迹记录器
 */
export const useTrackRecorder = (options?: TrackRecorderOptions) => {
  const recorder = ref<TrackRecorder | null>(null)
  const isRecording = ref(false)
  const isPaused = ref(false)
  const points = ref<TrackPointData[]>([])
  const stats = ref({
    totalPoints: 0,
    totalDistance: 0,
    totalDuration: 0,
    avgSpeed: 0,
    maxSpeed: 0,
    maxAltitude: undefined as number | undefined,
    minAltitude: undefined as number | undefined,
  })

  /**
   * 初始化记录器
   */
  const init = () => {
    recorder.value = new TrackRecorder({
      ...options,
      onPointAdded: (point) => {
        points.value = recorder.value!.getPoints()
        stats.value = recorder.value!.getStats()
        options?.onPointAdded?.(point)
      },
      onError: (error) => {
        options?.onError?.(error)
      },
    })
  }

  /**
   * 开始记录
   */
  const start = () => {
    if (!recorder.value) {
      init()
    }
    recorder.value!.start()
    isRecording.value = true
    isPaused.value = false
  }

  /**
   * 暂停
   */
  const pause = () => {
    recorder.value?.pause()
    isPaused.value = true
  }

  /**
   * 继续
   */
  const resume = () => {
    recorder.value?.resume()
    isPaused.value = false
  }

  /**
   * 停止
   */
  const stop = () => {
    recorder.value?.stop()
    isRecording.value = false
    isPaused.value = false
  }

  /**
   * 清空
   */
  const clear = () => {
    recorder.value?.clear()
    points.value = []
    stats.value = {
      totalPoints: 0,
      totalDistance: 0,
      totalDuration: 0,
      avgSpeed: 0,
      maxSpeed: 0,
      maxAltitude: undefined,
      minAltitude: undefined,
    }
  }

  return {
    // 状态
    isRecording: computed(() => isRecording.value),
    isPaused: computed(() => isPaused.value),
    points: computed(() => points.value),
    stats: computed(() => stats.value),

    // 方法
    start,
    pause,
    resume,
    stop,
    clear,
  }
}

export default TrackRecorder
