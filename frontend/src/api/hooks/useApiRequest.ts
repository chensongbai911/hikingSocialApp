/**
 * API 请求 Hook - 统一请求状态管理
 * 创建日期: 2026-01-19
 * 任务编号: T0.5
 */

import { ref, type Ref } from 'vue'
import type { ApiOptions } from '../base/types'
import { cache } from '@/utils/cache'

export interface UseApiRequestReturn<T> {
  data: Ref<T | null>
  loading: Ref<boolean>
  error: Ref<Error | null>
  execute: (forceRefresh?: boolean) => Promise<T>
  refresh: () => Promise<T>
  reset: () => void
}

/**
 * 通用 API 请求 Hook
 *
 * @example
 * const { data, loading, error, execute } = useApiRequest(
 *   () => routeApi.getList({ page: 1 }),
 *   { cache: CACHE_TTL.ROUTE }
 * )
 *
 * onMounted(() => execute())
 */
export function useApiRequest<T>(
  apiCall: () => Promise<T>,
  options: ApiOptions & { cacheKey?: string } = {}
): UseApiRequestReturn<T> {
  const data = ref<T | null>(null) as Ref<T | null>
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const execute = async (forceRefresh = false): Promise<T> => {
    loading.value = true
    error.value = null

    try {
      // 1. 检查缓存
      if (options.cache && options.cacheKey && !forceRefresh) {
        const cached = cache.get<T>(options.cacheKey)
        if (cached) {
          data.value = cached
          loading.value = false
          return cached
        }
      }

      // 2. 执行请求
      const result = await apiCall()

      // 3. 缓存结果
      if (options.cache && options.cacheKey) {
        const ttl = typeof options.cache === 'number' ? options.cache : 300000 // 默认 5 分钟
        cache.set(options.cacheKey, result, ttl)
      }

      data.value = result
      loading.value = false
      return result
    } catch (e) {
      error.value = e as Error
      loading.value = false
      options.onError?.(error.value)
      throw error.value
    }
  }

  const refresh = () => execute(true)

  const reset = () => {
    data.value = null
    loading.value = false
    error.value = null
  }

  return {
    data,
    loading,
    error,
    execute,
    refresh,
    reset,
  }
}

/**
 * 分页请求 Hook
 */
export function usePaginatedRequest<T>(
  apiCall: (page: number, pageSize: number) => Promise<{ data: T[]; total: number }>,
  options: ApiOptions & { initialPage?: number; initialPageSize?: number } = {}
) {
  const page = ref(options.initialPage || 1)
  const pageSize = ref(options.initialPageSize || 20)
  const total = ref(0)
  const data = ref<T[]>([]) as Ref<T[]>
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const execute = async () => {
    loading.value = true
    error.value = null

    try {
      const result = await apiCall(page.value, pageSize.value)
      data.value = result.data
      total.value = result.total
      loading.value = false
      return result
    } catch (e) {
      error.value = e as Error
      loading.value = false
      options.onError?.(error.value)
      throw error.value
    }
  }

  const nextPage = async () => {
    const totalPages = Math.ceil(total.value / pageSize.value)
    if (page.value < totalPages) {
      page.value++
      await execute()
    }
  }

  const prevPage = async () => {
    if (page.value > 1) {
      page.value--
      await execute()
    }
  }

  const goToPage = async (newPage: number) => {
    page.value = newPage
    await execute()
  }

  return {
    data,
    loading,
    error,
    page,
    pageSize,
    total,
    execute,
    nextPage,
    prevPage,
    goToPage,
  }
}
