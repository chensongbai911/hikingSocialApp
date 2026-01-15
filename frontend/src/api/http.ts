// HTTP请求客户端配置
import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios'
import { useUserStore } from '@/stores/user'

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
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
  (error: AxiosError<any>) => {
    const userStore = useUserStore()

    // 处理401 - token过期或无效
    if (error.response?.status === 401) {
      // 直接清空本地状态，不调用logout接口避免循环
      userStore.setToken(null)
      userStore.setCurrentUser(null)

      // 只在不是登录页面时才重定向
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
