// 活动相关 API
import api from './http'
import type {
  ApiResponse,
  PaginatedData,
  Activity,
  CreateActivityData,
  UpdateActivityData,
  FilterOptions
} from '@/types'

export const activityApi = {
  /**
   * 获取活动列表
   * GET /activities
   */
  async getActivities(options?: FilterOptions): Promise<ApiResponse<PaginatedData<Activity>>> {
    return api.get('/activities', { params: options })
  },

  /**
   * 获取活动详情
   * GET /activities/:id
   */
  async getActivityDetail(id: string): Promise<ApiResponse<Activity>> {
    return api.get(`/activities/${id}`)
  },

  /**
   * 创建活动
   * POST /activities
   */
  async createActivity(data: CreateActivityData): Promise<ApiResponse<Activity>> {
    return api.post('/activities', data)
  },

  /**
   * 更新活动
   * PUT /activities/:id
   */
  async updateActivity(id: string, data: UpdateActivityData): Promise<ApiResponse<Activity>> {
    return api.put(`/activities/${id}`, data)
  },

  /**
   * 删除活动
   * DELETE /activities/:id
   */
  async deleteActivity(id: string): Promise<ApiResponse<void>> {
    return api.delete(`/activities/${id}`)
  },

  /**
   * 参加活动
   * POST /activities/:id/join
   */
  async joinActivity(id: string): Promise<ApiResponse<{ participation_id: string }>> {
    return api.post(`/activities/${id}/join`)
  },

  /**
   * 退出活动
   * POST /activities/:id/leave
   */
  async leaveActivity(id: string): Promise<ApiResponse<void>> {
    return api.post(`/activities/${id}/leave`)
  },

  /**
   * 获取我参加的活动
   * GET /activities/my-joined
   */
  async getMyJoinedActivities(options?: FilterOptions): Promise<ApiResponse<PaginatedData<Activity>>> {
    return api.get('/activities/my-joined', { params: options })
  },

  /**
   * 获取我创建的活动
   * GET /activities/my-created
   */
  async getMyCreatedActivities(options?: FilterOptions): Promise<ApiResponse<PaginatedData<Activity>>> {
    return api.get('/activities/my-created', { params: options })
  },

  /**
   * 获取指定用户参与的活动
   * GET /activities/user/:userId/joined
   */
  async getUserJoinedActivities(userId: string, options?: FilterOptions): Promise<ApiResponse<PaginatedData<Activity>>> {
    return api.get(`/activities/user/${userId}/joined`, { params: options })
  },
}

export default activityApi
