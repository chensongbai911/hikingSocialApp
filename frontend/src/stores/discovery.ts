// 发现页面状态管理
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { discoveryApi } from '@/api'
import type { Activity, User, DiscoveryFilters, PaginatedData } from '@/types'

interface UserRecommendation extends User {
  common_preferences: number
  photo_count: number
}

export const useDiscoveryStore = defineStore('discovery', () => {
  // 状态
  const recommendedActivities = ref<Activity[]>([])
  const recommendedUsers = ref<UserRecommendation[]>([])
  const searchResults = ref<Activity[] | User[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const pagination = ref({
    page: 1,
    page_size: 10,
    total: 0,
    total_pages: 0,
  })

  // 筛选状态
  const filters = ref<DiscoveryFilters>({
    keyword: '',
    difficulty: undefined,
    location: undefined,
    gender: undefined,
    hiking_level: undefined,
  })

  // 获取推荐活动
  const fetchRecommendedActivities = async (options?: { page?: number; page_size?: number }) => {
    loading.value = true
    error.value = null

    try {
      const response = await discoveryApi.getRecommendedActivities(options)

      if (response.code === 200 && response.data) {
        const data = response.data as PaginatedData<Activity>
        recommendedActivities.value = data.items
        pagination.value = data.pagination
      }
    } catch (err: any) {
      error.value = err.message || '获取推荐活动失败'
      console.error('Fetch recommended activities error:', err)
    } finally {
      loading.value = false
    }
  }

  // 获取推荐用户
  const fetchRecommendedUsers = async (options?: { page?: number; page_size?: number }) => {
    loading.value = true
    error.value = null

    try {
      const response = await discoveryApi.getRecommendedUsers(options)

      if (response.code === 200 && response.data) {
        const data = response.data as PaginatedData<UserRecommendation>
        recommendedUsers.value = data.items
        pagination.value = data.pagination
      }
    } catch (err: any) {
      error.value = err.message || '获取推荐用户失败'
      console.error('Fetch recommended users error:', err)
    } finally {
      loading.value = false
    }
  }

  // 搜索活动
  const searchActivities = async (searchFilters: DiscoveryFilters) => {
    loading.value = true
    error.value = null

    try {
      const response = await discoveryApi.searchActivities(searchFilters)

      if (response.code === 200 && response.data) {
        const data = response.data as PaginatedData<Activity>
        searchResults.value = data.items
        pagination.value = data.pagination
      }
    } catch (err: any) {
      error.value = err.message || '搜索活动失败'
      console.error('Search activities error:', err)
    } finally {
      loading.value = false
    }
  }

  // 搜索用户
  const searchUsers = async (searchFilters: DiscoveryFilters) => {
    loading.value = true
    error.value = null

    try {
      const response = await discoveryApi.searchUsers(searchFilters)

      if (response.code === 200 && response.data) {
        const data = response.data as PaginatedData<User>
        searchResults.value = data.items
        pagination.value = data.pagination
      }
    } catch (err: any) {
      error.value = err.message || '搜索用户失败'
      console.error('Search users error:', err)
    } finally {
      loading.value = false
    }
  }

  // 更新筛选条件
  const updateFilters = (newFilters: Partial<DiscoveryFilters>) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  // 清除筛选条件
  const clearFilters = () => {
    filters.value = {
      keyword: '',
      difficulty: undefined,
      location: undefined,
      gender: undefined,
      hiking_level: undefined,
    }
  }

  // 重置状态
  const reset = () => {
    recommendedActivities.value = []
    recommendedUsers.value = []
    searchResults.value = []
    loading.value = false
    error.value = null
    pagination.value = {
      page: 1,
      page_size: 10,
      total: 0,
      total_pages: 0,
    }
    clearFilters()
  }

  return {
    // 状态
    recommendedActivities,
    recommendedUsers,
    searchResults,
    loading,
    error,
    pagination,
    filters,
    // 方法
    fetchRecommendedActivities,
    fetchRecommendedUsers,
    searchActivities,
    searchUsers,
    updateFilters,
    clearFilters,
    reset,
  }
})
