// 认证相关 API
import api from './http'
import type { ApiResponse, LoginCredentials, RegisterData, User } from '@/types'

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
   * 获取当前用户信息
   * GET /auth/me
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return api.get('/auth/me')
  },

  /**
   * 登出
   * POST /auth/logout
   */
  async logout(): Promise<ApiResponse<void>> {
    return api.post('/auth/logout')
  },
}

export default authApi
