/**
 * API 通用类型定义
 * 创建日期: 2026-01-19
 * 任务编号: T0.5
 */

/**
 * 统一 API 响应格式
 */
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T | null
  timestamp: number
  requestId?: string
}

/**
 * 分页元数据
 */
export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

/**
 * 带分页的 API 响应
 */
export interface ApiResponseWithPagination<T = any> extends ApiResponse<T> {
  pagination: PaginationMeta
}

/**
 * API 请求选项
 */
export interface ApiOptions {
  cache?: boolean | number // true = 默认 TTL, number = 毫秒
  retry?: number // 重试次数
  timeout?: number // 超时时间
  onError?: (error: Error) => void
  headers?: Record<string, string>
}

/**
 * 缓存 TTL 枚举
 */
export enum CACHE_TTL {
  NONE = 0,
  SHORT = 60000, // 1 分钟
  DEFAULT = 300000, // 5 分钟
  LONG = 1800000, // 30 分钟
  ROUTE = 600000, // 10 分钟 (路线)
  MESSAGE = 180000, // 3 分钟 (消息)
  USER = 900000, // 15 分钟 (用户信息)
  TRACK = 300000, // 5 分钟 (轨迹)
}

/**
 * 列表查询参数
 */
export interface ListQueryParams {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
}

/**
 * 路线相关类型
 */
export interface Route {
  id: string
  name: string
  description: string
  difficulty: 'easy' | 'moderate' | 'hard' | 'expert'
  distance: number // 公里
  elevationGain: number // 米
  elevationLoss: number // 米
  estimatedDuration: number // 分钟
  season: string
  routeType: 'loop' | 'out_and_back' | 'point_to_point'
  startPoint: { lat: number; lng: number }
  endPoint?: { lat: number; lng: number }
  region: string
  creatorId: string
  status: 'draft' | 'published' | 'archived'
  privacy: 'public' | 'private' | 'friends_only'
  viewCount: number
  favoriteCount: number
  completionCount: number
  ratingAvg: number
  ratingCount: number
  isVerified: boolean
  coverImage?: string
  images?: string[]
  warnings?: string
  createdAt: string
  updatedAt: string
}

/**
 * 路线关键点类型
 */
export interface RouteWaypoint {
  id: string
  routeId: string
  name: string
  description?: string
  location: { lat: number; lng: number }
  elevation?: number
  orderIndex: number
  waypointType: 'start' | 'checkpoint' | 'rest' | 'viewpoint' | 'water' | 'shelter' | 'end'
  estimatedArrivalTime?: number
  distanceFromStart?: number
  photos?: string[]
  tips?: string
  createdAt: string
  updatedAt: string
}

/**
 * 路线列表查询参数
 */
export interface RouteListParams extends ListQueryParams {
  difficulty?: string
  minDistance?: number
  maxDistance?: number
  minElevation?: number
  maxElevation?: number
  season?: string
  region?: string
  tags?: string[]
  nearby?: {
    lat: number
    lng: number
    radius: number // 公里
  }
}

/**
 * 路线创建 DTO
 */
export interface RouteCreateDto {
  name: string
  description: string
  difficulty: 'easy' | 'moderate' | 'hard' | 'expert'
  season: string
  routeType: 'loop' | 'out_and_back' | 'point_to_point'
  startPoint: { lat: number; lng: number }
  endPoint?: { lat: number; lng: number }
  region: string
  privacy: 'public' | 'private' | 'friends_only'
  coverImage?: string
  warnings?: string
  waypoints: Array<{
    name: string
    description?: string
    location: { lat: number; lng: number }
    elevation?: number
    waypointType: string
    tips?: string
  }>
  tags?: string[]
}

/**
 * 轨迹相关类型
 */
export interface Track {
  id: string
  userId: string
  routeId?: string
  activityId?: string
  startTime: string
  endTime?: string
  duration?: number
  distance?: number
  elevationGain?: number
  avgPace?: number
  avgSpeed?: number
  maxSpeed?: number
  minElevation?: number
  maxElevation?: number
  status: 'recording' | 'completed' | 'cancelled'
  createdAt: string
  updatedAt: string
}

/**
 * 轨迹点类型
 */
export interface TrackPoint {
  id?: number
  trackId: string
  latitude: number
  longitude: number
  elevation?: number
  accuracy?: number
  speed?: number
  timestamp: number
  recordedAt: string
}

/**
 * 复盘报告类型
 */
export interface HikeReport {
  id: string
  trackId: string
  userId: string
  routeId?: string
  title: string
  summary?: string
  highlights?: string[]
  suggestions?: string[]
  badges?: string[]
  photos?: string[]
  createdAt: string
  updatedAt: string
}
