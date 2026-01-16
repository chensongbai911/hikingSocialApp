// HTTP请求客户端配置
import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios'
import { useUserStore } from '@/stores/user'

// 获取API基础URL
const getBaseURL = () => {
  const envBaseURL = import.meta.env.VITE_API_BASE_URL

  // 如果配置的是相对路径，使用当前域名
  if (envBaseURL && envBaseURL.startsWith('/')) {
    return `${window.location.origin}${envBaseURL}`
  }

  // 如果是完整URL，直接使用
  if (envBaseURL && envBaseURL.startsWith('http')) {
    return envBaseURL
  }

  // 默认值
  return 'http://localhost:3000/api/v1'
}

const api: AxiosInstance = axios.create({
  baseURL: getBaseURL(),
  timeout: import.meta.env.VITE_API_TIMEOUT ? parseInt(import.meta.env.VITE_API_TIMEOUT) : 30000,
})

// 请求拦截器 - 添加认证token
api.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
      console.log('[HTTP] 请求拦截器 - 添加token:', {
        url: config.url,
        method: config.method,
        hasToken: true,
        tokenPrefix: userStore.token.substring(0, 20) + '...'
      })
    } else {
      console.warn('[HTTP] 请求拦截器 - 未找到token:', {
        url: config.url,
        method: config.method
      })
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器 - 处理响应和错误
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // 后端返回格式: { code, message, data, timestamp }
    // 直接返回整个响应供业务层处理
    return response.data
  },
  async (error: AxiosError<any>) => {
    const userStore = useUserStore()

    // 处理401 - token过期或无效
    if (error.response?.status === 401) {
      console.error('[HTTP] 401错误:', {
        url: error.config?.url,
        method: error.config?.method,
        hasToken: !!userStore.token,
        hasUser: !!userStore.currentUser,
        responseData: error.response?.data
      })

      // 避免在获取用户信息接口本身失败时再次调用造成无限循环
      const isGetCurrentUser = error.config?.url?.includes('/auth/me')

      if (!isGetCurrentUser && userStore.token && !userStore.currentUser) {
        console.log('[HTTP] 尝试静默刷新用户信息...')
        // 尝试静默刷新用户信息
        try {
          const success = await userStore.fetchCurrentUser(true)
          if (success && userStore.currentUser) {
            console.log('[HTTP] 用户信息刷新成功，重试请求')
            // 重试原请求
            return api.request(error.config as any)
          }
        } catch (e) {
          console.error('[HTTP] 静默刷新用户信息失败:', e)
        }
      }

      console.warn('[HTTP] 清空token并跳转登录页')
      // 清空本地状态并跳转登录
      userStore.setToken(null)
      userStore.setCurrentUser(null)
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }

    // 返回错误响应数据
    return Promise.reject(error.response?.data || {
      code: error.response?.status || 500,
      message: error.message || '请求失败'
    })
  }
)

export default api
