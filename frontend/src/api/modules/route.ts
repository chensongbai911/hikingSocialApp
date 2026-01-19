/**
 * 路线 API 模块
 * 创建日期: 2026-01-19
 * 任务编号: T1.5
 */

import apiService from '../base/apiService'
import type {
  Route,
  RouteWaypoint,
  RouteListParams,
  RouteCreateDto,
  ApiResponseWithPagination,
} from '../base/types'

/**
 * 路线 API
 */
export const routeApi = {
  /**
   * 获取路线列表
   */
  async getList(params: RouteListParams = {}) {
    return apiService.get<ApiResponseWithPagination<Route[]>>('/api/v1/routes', params)
  },

  /**
   * 获取路线详情
   */
  async getDetail(id: string) {
    return apiService.get<Route>(`/api/v1/routes/${id}`)
  },

  /**
   * 创建路线
   */
  async create(data: RouteCreateDto) {
    return apiService.post<Route>('/api/v1/routes', data)
  },

  /**
   * 更新路线
   */
  async update(id: string, data: Partial<RouteCreateDto>) {
    return apiService.put<Route>(`/api/v1/routes/${id}`, data)
  },

  /**
   * 删除路线
   */
  async delete(id: string) {
    return apiService.delete<void>(`/api/v1/routes/${id}`)
  },

  /**
   * 获取路线关键点列表
   */
  async getWaypoints(routeId: string) {
    return apiService.get<RouteWaypoint[]>(`/api/v1/routes/${routeId}/waypoints`)
  },

  /**
   * 添加关键点
   */
  async addWaypoint(routeId: string, data: Omit<RouteWaypoint, 'id' | 'routeId' | 'createdAt' | 'updatedAt'>) {
    return apiService.post<RouteWaypoint>(`/api/v1/routes/${routeId}/waypoints`, data)
  },

  /**
   * 更新关键点
   */
  async updateWaypoint(routeId: string, waypointId: string, data: Partial<RouteWaypoint>) {
    return apiService.put<RouteWaypoint>(`/api/v1/routes/${routeId}/waypoints/${waypointId}`, data)
  },

  /**
   * 删除关键点
   */
  async deleteWaypoint(routeId: string, waypointId: string) {
    return apiService.delete<void>(`/api/v1/routes/${routeId}/waypoints/${waypointId}`)
  },

  /**
   * 批量排序关键点
   */
  async reorderWaypoints(routeId: string, waypointIds: string[]) {
    return apiService.put<void>(`/api/v1/routes/${routeId}/waypoints/reorder`, { waypointIds })
  },

  /**
   * 收藏路线
   */
  async favorite(routeId: string) {
    return apiService.post<void>(`/api/v1/routes/${routeId}/favorite`)
  },

  /**
   * 取消收藏
   */
  async unfavorite(routeId: string) {
    return apiService.delete<void>(`/api/v1/routes/${routeId}/favorite`)
  },

  /**
   * 获取热门路线
   */
  async getHotRoutes(limit = 10) {
    return apiService.get<Route[]>('/api/v1/routes/hot', { limit })
  },

  /**
   * 搜索附近路线
   */
  async searchNearby(lat: number, lng: number, radius = 50) {
    return apiService.get<Route[]>('/api/v1/routes/nearby', { lat, lng, radius })
  },
}

export default routeApi
