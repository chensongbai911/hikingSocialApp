// 认证相关 API
import api from './http'
import type { ApiResponse, LoginCredentials, RegisterData, User } from '@/types'
import { cacheManager, CACHE_TTL, CACHE_KEYS } from '@/utils/cache'

export const authApi = {
  /**
   * 用户注册
   * POST /auth/register
   */
  async register(data: RegisterData): Promise<ApiResponse<{ user: User; token: string }>> {
    return api.post('/auth/register', data)
  },

  /**
   * 用户登录
   * POST /auth/login
   */
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> {
    return api.post('/auth/login', credentials)
  },

  /**
   * 刷新 token
   * POST /auth/refresh
   */
  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    return api.post('/auth/refresh')
  },

  /**
   * 获取当前用户信息 (带缓存)
   * GET /auth/me?includePhotos=true&includePreferences=true
   * 使用本地缓存优化性能，减少API调用
   * @param forceRefresh 是否强制刷新
   * @param includePhotos 是否包含照片
   * @param includePreferences 是否包含偏好设置
   */
  async getCurrentUser(
    forceRefresh = false,
    includePhotos = false,
    includePreferences = false
  ): Promise<ApiResponse<User>> {
    const cacheKey = CACHE_KEYS.CURRENT_USER

    // 如果不需要强制刷新且不需要扩展数据，先尝试从缓存获取
    if (!forceRefresh && !includePhotos && !includePreferences) {
      const cachedUser = cacheManager.get<User>(cacheKey)
      if (cachedUser) {
        console.log('📦 Using cached user data')
        return {
          code: 0,
          data: cachedUser,
          message: 'success'
        } as any
      }
    }

    // 构建查询参数
    const params = new URLSearchParams()
    if (includePhotos) params.append('includePhotos', 'true')
    if (includePreferences) params.append('includePreferences', 'true')

    const queryString = params.toString()
    const url = queryString ? `/auth/me?${queryString}` : '/auth/me'

    // 从API获取数据
    const response = await api.get(url)

    // 仅在基础查询时缓存用户数据
    if (response?.data?.data && !includePhotos && !includePreferences) {
      cacheManager.set(cacheKey, response.data.data, CACHE_TTL.USER_INFO)
      console.log('💾 Cached user data for 10 minutes')
    }

    return response
  },

  /**
   * 登出
   * POST /auth/logout
   */
  async logout(): Promise<ApiResponse<void>> {
    // 登出时清除缓存
    cacheManager.clear(CACHE_KEYS.CURRENT_USER)
    return api.post('/auth/logout')
  },

  /**
   * 清除用户缓存
   */
  clearUserCache(): void {
    cacheManager.clear(CACHE_KEYS.CURRENT_USER)
  }
}

export default authApi
