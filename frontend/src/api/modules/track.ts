/**
 * 轨迹 API 模块
 * 创建日期: 2026-01-19
 */

import apiService from '../base/apiService'
import type { Track, TrackPoint, PaginatedResponse } from '../base/types'

export interface CreateTrackData {
  routeId?: number
  name: string
  description?: string
  startPoint: {
    lng: number
    lat: number
  }
  startLocationName?: string
  startTime?: string
}

export interface TrackPointData {
  lng: number
  lat: number
  altitude?: number
  accuracy?: number
  speed?: number
  heading?: number
  recordedAt?: string
}

export interface CompleteTrackData {
  endPoint: {
    lng: number
    lat: number
  }
  endLocationName?: string
  endTime?: string
  totalDistance: number
  totalDuration: number
  totalElevationGain?: number
  totalElevationLoss?: number
  maxAltitude?: number
  minAltitude?: number
  avgSpeed?: number
  maxSpeed?: number
}

export interface TrackListParams {
  page?: number
  pageSize?: number
  userId?: number
  routeId?: number
  status?: 'recording' | 'paused' | 'completed' | 'failed'
}

export const trackApi = {
  /**
   * 创建轨迹
   */
  create: (data: CreateTrackData) =>
    apiService.post<{ id: number }>('/tracks', data),

  /**
   * 批量上传轨迹点
   */
  uploadPoints: (trackId: number, points: TrackPointData[]) =>
    apiService.post<{ insertedCount: number; totalPoints: number }>(
      `/tracks/${trackId}/points`,
      { points }
    ),

  /**
   * 完成轨迹
   */
  complete: (trackId: number, data: CompleteTrackData) =>
    apiService.put<null>(`/tracks/${trackId}/complete`, data),

  /**
   * 获取轨迹列表
   */
  getList: (params?: TrackListParams) =>
    apiService.get<PaginatedResponse<Track>>('/tracks', params),

  /**
   * 获取轨迹详情
   */
  getDetail: (trackId: number) =>
    apiService.get<Track & { points: TrackPoint[] }>(`/tracks/${trackId}`),

  /**
   * 获取轨迹详情（字符串ID）
   */
  getTrackDetail: (trackId: string) =>
    apiService.get<any>(`/tracks/${trackId}`),

  /**
   * 获取轨迹点
   */
  getTrackPoints: (trackId: string) =>
    apiService.get<any>(`/tracks/${trackId}/points`),

  /**
   * 添加轨迹反馈
   */
  addTrackFeedback: (trackId: string, data: { rating: number; comment: string }) =>
    apiService.post<any>(`/tracks/${trackId}/feedback`, data),

  /**
   * 删除轨迹
   */
  deleteTrack: (trackId: string) =>
    apiService.delete<any>(`/tracks/${trackId}`),

  /**
   * 删除轨迹（兼容API）
   */
  delete: (trackId: number) =>
    apiService.delete<null>(`/tracks/${trackId}`),

  /**
   * 获取我的轨迹
   */
  getMyTracks: (params?: { page?: number; pageSize?: number; status?: string }) =>
    apiService.get<PaginatedResponse<Track>>('/tracks', params),
}
