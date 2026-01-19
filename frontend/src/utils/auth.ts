/**
 * 前端用户认证工具
 * 创建日期: 2026-01-19
 */

import { ref, computed } from 'vue'
import { userApi, type AuthResponse } from '../api/modules/user'
import type { User } from '../api/base/types'
import { localStorage } from './storage'

const TOKEN_KEY = 'auth_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const USER_KEY = 'user_info'

// 全局状态
const token = ref<string | null>(localStorage.get(TOKEN_KEY))
const refreshToken = ref<string | null>(localStorage.get(REFRESH_TOKEN_KEY))
const currentUser = ref<User | null>(localStorage.get(USER_KEY))

/**
 * 认证状态管理
 */
export const useAuth = () => {
  const isAuthenticated = computed(() => !!token.value)

  /**
   * 设置认证信息
   */
  const setAuth = (authData: AuthResponse) => {
    token.value = authData.token
    refreshToken.value = authData.refreshToken
    currentUser.value = authData.user

    localStorage.set(TOKEN_KEY, authData.token)
    localStorage.set(REFRESH_TOKEN_KEY, authData.refreshToken)
    localStorage.set(USER_KEY, authData.user)
  }

  /**
   * 清除认证信息
   */
  const clearAuth = () => {
    token.value = null
    refreshToken.value = null
    currentUser.value = null

    localStorage.remove(TOKEN_KEY)
    localStorage.remove(REFRESH_TOKEN_KEY)
    localStorage.remove(USER_KEY)
  }

  /**
   * 用户登录
   */
  const login = async (username: string, password: string) => {
    const response = await userApi.login({ username, password })
    setAuth(response)
    return response
  }

  /**
   * 用户注册
   */
  const register = async (
    username: string,
    email: string,
    password: string,
    nickname?: string
  ) => {
    const response = await userApi.register({
      username,
      email,
      password,
      nickname,
    })
    setAuth(response)
    return response
  }

  /**
   * 用户登出
   */
  const logout = () => {
    clearAuth()
    // 可以在这里跳转到登录页
    window.location.href = '/login'
  }

  /**
   * 刷新用户信息
   */
  const refreshUserInfo = async () => {
    if (!isAuthenticated.value) {
      return null
    }

    try {
      const user = await userApi.getCurrentUser()
      currentUser.value = user
      localStorage.set(USER_KEY, user)
      return user
    } catch (error) {
      // Token 可能已过期
      clearAuth()
      throw error
    }
  }

  /**
   * 获取 Authorization Header
   */
  const getAuthHeader = () => {
    if (!token.value) {
      return {}
    }
    return {
      Authorization: `Bearer ${token.value}`,
    }
  }

  return {
    // 状态
    token: computed(() => token.value),
    refreshToken: computed(() => refreshToken.value),
    currentUser: computed(() => currentUser.value),
    isAuthenticated,

    // 方法
    setAuth,
    clearAuth,
    login,
    register,
    logout,
    refreshUserInfo,
    getAuthHeader,
  }
}

/**
 * 获取当前 token (供 API 使用)
 */
export const getToken = (): string | null => {
  return token.value
}

/**
 * HTTP 拦截器：自动添加 Authorization header
 */
export const setupAuthInterceptor = (axiosInstance: any) => {
  axiosInstance.interceptors.request.use(
    (config: any) => {
      const authToken = getToken()
      if (authToken) {
        config.headers.Authorization = `Bearer ${authToken}`
      }
      return config
    },
    (error: any) => {
      return Promise.reject(error)
    }
  )

  // 响应拦截：处理 401 未授权
  axiosInstance.interceptors.response.use(
    (response: any) => response,
    (error: any) => {
      if (error.response?.status === 401) {
        // Token 过期，清除认证信息并跳转登录
        const { clearAuth } = useAuth()
        clearAuth()
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }
  )
}

export default useAuth
