// 发现/推荐相关 API
import api from './http'
import type { ApiResponse, PaginatedData, Activity, User, DiscoveryFilters } from '@/types'

interface UserRecommendation extends User {
  common_preferences: number
  photo_count: number
}

export const discoveryApi = {
  /**
   * 获取推荐活动
   * GET /discovery/activities
   */
  async getRecommendedActivities(options?: {
    page?: number
    page_size?: number
  }): Promise<ApiResponse<PaginatedData<Activity>>> {
    return api.get('/discovery/activities', { params: options })
  },

  /**
   * 获取推荐用户
   * GET /discovery/users
   */
  async getRecommendedUsers(options?: {
    page?: number
    page_size?: number
  }): Promise<ApiResponse<PaginatedData<UserRecommendation>>> {
    return api.get('/discovery/users', { params: options })
  },

  /**
   * 搜索活动
   * GET /discovery/search/activities
   */
  async searchActivities(filters: DiscoveryFilters): Promise<ApiResponse<PaginatedData<Activity>>> {
    return api.get('/discovery/search/activities', { params: filters })
  },

  /**
   * 搜索用户
   * GET /discovery/search/users
   */
  async searchUsers(filters: DiscoveryFilters): Promise<ApiResponse<PaginatedData<User>>> {
    return api.get('/discovery/search/users', { params: filters })
  },
}

export default discoveryApi
