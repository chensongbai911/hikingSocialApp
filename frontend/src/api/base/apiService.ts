/**
 * API 服务层 - 统一请求封装
 * 创建日期: 2026-01-19
 * 任务编号: T0.5
 */

import request from '../http'
import type { ApiResponse, ApiOptions } from './types'

class ApiService {
  /**
   * GET 请求
   */
  async get<T>(url: string, params?: any, options?: ApiOptions): Promise<T> {
    try {
      const response = await request.get<ApiResponse<T>>(url, {
        params,
        timeout: options?.timeout,
        headers: options?.headers,
      })

      // 后端已经统一返回 { code, message, data } 格式
      // 拦截器会自动解包 response.data，这里直接返回
      return response.data as T
    } catch (error) {
      options?.onError?.(error as Error)
      throw error
    }
  }

  /**
   * POST 请求
   */
  async post<T>(url: string, data?: any, options?: ApiOptions): Promise<T> {
    try {
      const response = await request.post<ApiResponse<T>>(url, data, {
        timeout: options?.timeout,
        headers: options?.headers,
      })

      return response.data as T
    } catch (error) {
      options?.onError?.(error as Error)
      throw error
    }
  }

  /**
   * PUT 请求
   */
  async put<T>(url: string, data?: any, options?: ApiOptions): Promise<T> {
    try {
      const response = await request.put<ApiResponse<T>>(url, data, {
        timeout: options?.timeout,
        headers: options?.headers,
      })

      return response.data as T
    } catch (error) {
      options?.onError?.(error as Error)
      throw error
    }
  }

  /**
   * PATCH 请求
   */
  async patch<T>(url: string, data?: any, options?: ApiOptions): Promise<T> {
    try {
      const response = await request.patch<ApiResponse<T>>(url, data, {
        timeout: options?.timeout,
        headers: options?.headers,
      })

      return response.data as T
    } catch (error) {
      options?.onError?.(error as Error)
      throw error
    }
  }

  /**
   * DELETE 请求
   */
  async delete<T>(url: string, options?: ApiOptions): Promise<T> {
    try {
      const response = await request.delete<ApiResponse<T>>(url, {
        timeout: options?.timeout,
        headers: options?.headers,
      })

      return response.data as T
    } catch (error) {
      options?.onError?.(error as Error)
      throw error
    }
  }

  /**
   * 上传文件
   */
  async upload<T>(url: string, file: File, options?: ApiOptions): Promise<T> {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await request.post<ApiResponse<T>>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...options?.headers,
        },
        timeout: options?.timeout || 30000, // 上传默认 30s 超时
      })

      return response.data as T
    } catch (error) {
      options?.onError?.(error as Error)
      throw error
    }
  }

  /**
   * 批量上传文件
   */
  async uploadMultiple<T>(url: string, files: File[], options?: ApiOptions): Promise<T> {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append('files', file)
    })

    try {
      const response = await request.post<ApiResponse<T>>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...options?.headers,
        },
        timeout: options?.timeout || 60000, // 批量上传默认 60s 超时
      })

      return response.data as T
    } catch (error) {
      options?.onError?.(error as Error)
      throw error
    }
  }
}

export const apiService = new ApiService()
export default apiService
