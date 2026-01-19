/**
 * 用户 API 模块
 * 创建日期: 2026-01-19
 */

import apiService from '../base/apiService'
import type { User } from '../base/types'

export interface RegisterData {
  username: string
  email: string
  password: string
  nickname?: string
}

export interface LoginData {
  username: string
  password: string
}

export interface AuthResponse {
  user: User
  token: string
  refreshToken: string
}

export interface UpdateProfileData {
  nickname?: string
  gender?: 'male' | 'female' | 'other'
  birthday?: string
  bio?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
}

export const userApi = {
  /**
   * 用户注册
   */
  register: (data: RegisterData) =>
    apiService.post<AuthResponse>('/users/register', data),

  /**
   * 用户登录
   */
  login: (data: LoginData) =>
    apiService.post<AuthResponse>('/users/login', data),

  /**
   * 获取当前用户信息
   */
  getCurrentUser: () =>
    apiService.get<User>('/users/me'),

  /**
   * 获取用户公开信息
   */
  getUserProfile: (userId: number) =>
    apiService.get<User>(`/users/${userId}`),

  /**
   * 更新用户信息
   */
  updateProfile: (data: UpdateProfileData) =>
    apiService.put<null>('/users/profile', data),

  /**
   * 上传头像
   */
  uploadAvatar: (file: File) =>
    apiService.upload<{ url: string }>('/users/avatar', file, 'avatar'),
}
