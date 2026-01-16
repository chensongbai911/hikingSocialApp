// 用户相关 API
import api from './http'
import type {
  ApiResponse,
  PaginatedData,
  User,
  UserDetail,
  UpdateProfileData,
  UpdatePreferencesData,
  UserPreference,
  UserPhoto
} from '@/types'

export const userApi = {
  /**
   * 获取用户资料
   * GET /users/profile
   */
  async getProfile(): Promise<ApiResponse<User>> {
    return api.get('/users/profile')
  },

  /**
   * 获取其他用户资料
   * GET /users/:userId/profile
   */
  async getUserProfile(userId: string): Promise<ApiResponse<User>> {
    return api.get(`/users/${userId}/profile`)
  },

  /**
   * 更新用户资料
   * PUT /users/profile
   */
  async updateProfile(data: UpdateProfileData): Promise<ApiResponse<User>> {
    return api.put('/users/profile', data)
  },

  /**
   * 获取用户偏好
   * GET /users/preferences
   */
  async getPreferences(): Promise<ApiResponse<UserPreference[]>> {
    return api.get('/users/preferences')
  },

  /**
   * 更新用户偏好
   * PUT /users/preferences
   */
  async updatePreferences(data: UpdatePreferencesData): Promise<ApiResponse<UserPreference[]>> {
    return api.put('/users/preferences', data)
  },

  /**
   * 添加用户照片
   * POST /users/photos
   */
  async addPhoto(photo_url: string): Promise<ApiResponse<UserPhoto>> {
    return api.post('/users/photos', { photo_url })
  },

  /**
   * 删除用户照片
   * DELETE /users/photos/:id
   */
  async deletePhoto(photoId: string): Promise<ApiResponse<void>> {
    return api.delete(`/users/photos/${photoId}`)
  },

  /**
   * 获取用户照片列表
   * GET /users/photos
   */
  async getPhotos(): Promise<ApiResponse<UserPhoto[]>> {
    return api.get('/users/photos')
  },

  /**
   * 获取用户详情（包含关注者、徒步次数等）
   * GET /users/:userId/detail
   */
  async getUserDetail(userId: string): Promise<ApiResponse<UserDetail>> {
    return api.get(`/users/${userId}/detail`)
  },

  /**
   * 关注用户
   * POST /users/:userId/follow
   */
  async followUser(userId: string): Promise<ApiResponse<{ message: string }>> {
    return api.post(`/users/${userId}/follow`)
  },

  /**
   * 取消关注用户
   * DELETE /users/:userId/follow
   */
  async unfollowUser(userId: string): Promise<ApiResponse<{ message: string }>> {
    return api.delete(`/users/${userId}/follow`)
  },

  /**
   * 获取关注状态
   * GET /users/:userId/follow-status
   */
  async getFollowStatus(userId: string): Promise<ApiResponse<{ is_following: boolean }>> {
    return api.get(`/users/${userId}/follow-status`)
  },

  /**
   * 上传头像
   * POST /users/avatar
   */
  async uploadAvatar(formData: FormData): Promise<ApiResponse<{ avatar_url: string; url: string }>> {
    return api.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
}

export default userApi
