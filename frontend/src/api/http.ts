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
      // 尝试一次静默刷新用户信息（防止短暂失效或本地状态未拉取完成就被判未登录）
      if (userStore.token && !userStore.currentUser) {
        try {
          await userStore.fetchCurrentUser()
          // 如果拉取成功则重试原请求
          if (userStore.currentUser) {
            return api.request(error.config as any)
          }
        } catch (e) {
          // 忽略，走后续清理
        }
      }

      // 仍然 401，才清空本地并跳转登录
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
