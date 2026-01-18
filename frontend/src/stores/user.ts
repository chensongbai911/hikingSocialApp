// 用户状态管理 Store
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi, userApi } from '@/api'
import type { User, LoginCredentials, RegisterData, UpdateProfileData, UserPhoto } from '@/types'
import { disconnectWebSocket } from '@/utils/websocket'
import { cache } from '@/utils/helpers'

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))

  const getBaseUrl = () => {
    const envBase = import.meta.env.VITE_API_BASE_URL
    const base = envBase && /^https?:\/\//i.test(envBase)
      ? envBase
      : (window.location.origin || 'http://localhost:3000')
    return base.endsWith('/') ? base.slice(0, -1) : base
  }

  const withFullUrl = (url?: string | null) => {
    if (!url) return ''
    const lower = url.toLowerCase()
    if (lower.startsWith('http://') || lower.startsWith('https://') || lower.startsWith('data:')) {
      return url
    }
    const normalized = url.startsWith('/') ? url : `/${url}`
    return `${getBaseUrl()}${normalized}`
  }

  const normalizeUserMedia = (user: User | null): User | null => {
    if (!user) return null
    const photos = (user.photos || []).map((p) => ({ ...p, photo_url: withFullUrl(p.photo_url) }))
    return {
      ...user,
      avatar_url: withFullUrl(user.avatar_url),
      photos,
    }
  }

  // 初始化时从本地缓存恢复用户信息，避免刷新后 token 还在但 currentUser 为空导致路由拦截/401
  const cachedUser = localStorage.getItem('currentUser')
  if (!currentUser.value && cachedUser) {
    try {
      currentUser.value = JSON.parse(cachedUser)
    } catch (e) {
      localStorage.removeItem('currentUser')
    }
  }
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 计算属性
  const isLoggedIn = computed(() => !!token.value && !!currentUser.value)
  const userId = computed(() => currentUser.value?.id || '')
  const userLevel = computed(() => currentUser.value?.hiking_level || 'beginner')
  const avatarUrl = computed(() => currentUser.value?.avatar_url || '')

  // 设置token
  const setToken = (newToken: string | null) => {
    token.value = newToken
    if (newToken) {
      localStorage.setItem('token', newToken)
    } else {
      localStorage.removeItem('token')
    }
  }

  // 设置用户信息
  const setCurrentUser = (user: User | null) => {
    currentUser.value = normalizeUserMedia(user)
    if (currentUser.value) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser.value))
    } else {
      localStorage.removeItem('currentUser')
    }
  }

  // 登录
  const login = async (credentials: LoginCredentials) => {
    try {
      loading.value = true
      error.value = null
      const response = await authApi.login(credentials)

      if (response.code === 200 && response.data) {
        setToken(response.data.token)
        setCurrentUser(response.data.user)
        return true
      }

      error.value = response.message || '登录失败'
      return false
    } catch (err: any) {
      error.value = err.message || '登录失败'
      return false
    } finally {
      loading.value = false
    }
  }

  // 注册
  const register = async (data: RegisterData) => {
    try {
      loading.value = true
      error.value = null
      const response = await authApi.register(data)

      if (response.code === 200 && response.data) {
        // 注册成功，不自动登录，让用户手动登录
        return { success: true, email: data.email }
      }

      error.value = response.message || '注册失败'
      return { success: false, error: error.value }
    } catch (err: any) {
      error.value = err.message || '注册失败'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // 获取当前用户信息
  /**
   * @param silent 是否静默模式（不输出错误日志）
   * @param includePhotos 是否包含用户的所有照片
   * @param includePreferences 是否包含用户偏好设置
   */
  const fetchCurrentUser = async (silent = false, includePhotos = false, includePreferences = false) => {
    try {
      loading.value = true
      // 添加查询参数来请求包含照片/偏好设置的用户数据
      const response = await authApi.getCurrentUser(false, includePhotos, includePreferences)

      if (response.code === 200 && response.data) {
        setCurrentUser(response.data)
        return true
      }

      return false
    } catch (err) {
      // 静默模式下不清空 token，避免初始化时的竞态条件
      if (!silent) {
        console.error('获取用户信息失败:', err)
      }
      return false
    } finally {
      loading.value = false
    }
  }

  // 不在 store 初始化时自动拉取，改为由路由守卫按需拉取，避免竞态条件
  // 移除自动拉取逻辑，防止启动时 token 失效导致的无限 401 循环

  // 更新个人资料
  const updateProfile = async (data: UpdateProfileData) => {
    try {
      loading.value = true
      error.value = null
      const response = await userApi.updateProfile(data)

      if (response.code === 200 && response.data) {
        setCurrentUser(response.data)
        return true
      }

      error.value = response.message || '更新失败'
      return false
    } catch (err: any) {
      error.value = err.message || '更新失败'
      return false
    } finally {
      loading.value = false
    }
  }

  // 登出
  const logout = async () => {
    try {
      await authApi.logout()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      currentUser.value = null
      setToken(null)
      // 断开WebSocket连接
      disconnectWebSocket()
      // 清空所有缓存
      cache.clear()
    }
  }

  // 更新用户偏好
  const updatePreferences = async (preferences: string[]) => {
    try {
      loading.value = true
      error.value = null

      // 将偏好标签数组转换为API需要的格式 { preferences: [{ type, value }] }
      const preferencesData = {
        preferences: preferences.map(pref => ({
          type: 'hiking_preference',
          value: pref
        }))
      }

      const response = await userApi.updatePreferences(preferencesData)

      if (response.code === 200) {
        // 重新获取用户资料以更新preferences
        await fetchCurrentUser()
        return true
      }

      error.value = response.message || '更新偏好失败'
      return false
    } catch (err: any) {
      error.value = err.message || '更新偏好失败'
      return false
    } finally {
      loading.value = false
    }
  }

  // 添加本地照片（用于乐观更新）
  const addLocalPhoto = (photo: UserPhoto) => {
    if (currentUser.value) {
      if (!currentUser.value.photos) {
        currentUser.value.photos = []
      }
      currentUser.value.photos.push({ ...photo, photo_url: withFullUrl(photo.photo_url) })
      // 更新localStorage
      localStorage.setItem('currentUser', JSON.stringify(currentUser.value))
    }
  }

  // 删除照片
  const deletePhoto = async (photoId: string) => {
    try {
      loading.value = true
      error.value = null

      // 乐观更新：先在本地删除
      let originalPhotos: UserPhoto[] = []
      if (currentUser.value && currentUser.value.photos) {
        originalPhotos = [...currentUser.value.photos]
        currentUser.value.photos = currentUser.value.photos.filter(p => p.id !== photoId)
      }

      const response = await userApi.deletePhoto(photoId)

      if (response.code === 200) {
        // 成功后更新localStorage
        if (currentUser.value) {
          localStorage.setItem('currentUser', JSON.stringify(currentUser.value))
        }
        return true
      }

      // 失败则回滚
      if (currentUser.value) {
        currentUser.value.photos = originalPhotos
      }
      error.value = response.message || '删除照片失败'
      return false
    } catch (err: any) {
      // 失败则回滚
      if (currentUser.value && originalPhotos.length > 0) {
        currentUser.value.photos = originalPhotos
      }
      error.value = err.message || '删除照片失败'
      return false
    } finally {
      loading.value = false
    }
  }

  // 初始化时从localStorage恢复用户信息
  const initUser = () => {
    const savedUser = localStorage.getItem('currentUser')
    if (savedUser) {
      try {
        currentUser.value = normalizeUserMedia(JSON.parse(savedUser))
      } catch (err) {
        localStorage.removeItem('currentUser')
      }
    }
  }

  // 上传头像
  const uploadAvatar = async (file: File): Promise<string | null> => {
    try {
      loading.value = true
      error.value = null

      const formData = new FormData()
      formData.append('avatar', file)

      const response = await userApi.uploadAvatar(formData)

      if (response.code === 200 && response.data) {
        // 获取头像URL（可能是相对路径）
        const avatarUrl = withFullUrl(response.data.avatar_url || response.data.url)

        if (currentUser.value) {
          currentUser.value.avatar_url = avatarUrl
          localStorage.setItem('currentUser', JSON.stringify(currentUser.value))
        }
        return avatarUrl
      }

      error.value = response.message || '头像上传失败'
      return null
    } catch (err: any) {
      error.value = err.message || '头像上传失败'
      return null
    } finally {
      loading.value = false
    }
  }

  // 立即初始化
  initUser()

  return {
    currentUser,
    token,
    loading,
    error,
    isLoggedIn,
    userId,
    userLevel,
    avatarUrl,
    setToken,
    setCurrentUser,
    login,
    register,
    fetchCurrentUser,
    updateProfile,
    updatePreferences,
    addLocalPhoto,
    deletePhoto,
    uploadAvatar,
    logout,
    initUser,
  }
})
