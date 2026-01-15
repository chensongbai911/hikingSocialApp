// 活动状态管理
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { activityApi } from '@/api'
import type { Activity, PaginatedData, FilterOptions, CreateActivityData, UpdateActivityData } from '@/types'

export const useActivityStore = defineStore('activity', () => {
  // 状态
  const activities = ref<Activity[]>([])
  const joinedActivities = ref<Activity[]>([])
  const createdActivities = ref<Activity[]>([])
  const currentActivity = ref<Activity | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    page: 1,
    page_size: 10,
    total: 0,
    total_pages: 0,
  })

  // 计算属性
  const hasActivities = computed(() => activities.value.length > 0)

  // 获取活动列表
  const fetchActivities = async (options?: FilterOptions) => {
    loading.value = true
    error.value = null

    try {
      const response = await activityApi.getActivities(options)

      if (response.code === 200 && response.data) {
        const data = response.data as PaginatedData<Activity>
        activities.value = data.items
        pagination.value = data.pagination
      }
    } catch (err: any) {
      error.value = err.message || '获取活动列表失败'
      console.error('Fetch activities error:', err)
    } finally {
      loading.value = false
    }
  }

  // 获取活动详情
  const fetchActivityDetail = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await activityApi.getActivityDetail(id)

      if (response.code === 200 && response.data) {
        currentActivity.value = response.data
        return response.data
      }
      return null
    } catch (err: any) {
      error.value = err.message || '获取活动详情失败'
      console.error('Fetch activity detail error:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // 根据ID获取活动（用于编辑）
  const getActivityById = async (id: string): Promise<Activity | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await activityApi.getActivityDetail(id)

      if (response.code === 200 && response.data) {
        return response.data
      }
      return null
    } catch (err: any) {
      error.value = err.message || '获取活动失败'
      console.error('Get activity by ID error:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // 创建活动
  const createActivity = async (data: CreateActivityData) => {
    loading.value = true
    error.value = null

    try {
      const response = await activityApi.createActivity(data)

      if (response.code === 201 && response.data) {
        const newActivity = response.data
        activities.value.unshift(newActivity)
        return newActivity
      }

      throw new Error(response.message || '创建活动失败')
    } catch (err: any) {
      error.value = err.message || '创建活动失败'
      console.error('Create activity error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // 更新活动
  const updateActivity = async (id: string, data: UpdateActivityData) => {
    loading.value = true
    error.value = null

    try {
      const response = await activityApi.updateActivity(id, data)

      if (response.code === 200 && response.data) {
        const updatedActivity = response.data

        const index = activities.value.findIndex((a) => a.id === id)
        if (index !== -1) {
          activities.value[index] = updatedActivity
        }

        if (currentActivity.value?.id === id) {
          currentActivity.value = updatedActivity
        }

        return updatedActivity
      }

      throw new Error(response.message || '更新活动失败')
    } catch (err: any) {
      error.value = err.message || '更新活动失败'
      console.error('Update activity error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // 删除活动
  const deleteActivity = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await activityApi.deleteActivity(id)

      if (response.code === 204 || response.code === 200) {
        activities.value = activities.value.filter((a) => a.id !== id)

        if (currentActivity.value?.id === id) {
          currentActivity.value = null
        }
      }
    } catch (err: any) {
      error.value = err.message || '删除活动失败'
      console.error('Delete activity error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // 参加活动
  const joinActivity = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await activityApi.joinActivity(id)

      if (response.code === 201 || response.code === 200) {
        // 更新活动状态
        const activity = activities.value.find((a) => a.id === id)
        if (activity) {
          activity.is_joined = true
          if (activity.participant_count !== undefined) {
            activity.participant_count++
          }
        }

        if (currentActivity.value?.id === id) {
          currentActivity.value.is_joined = true
          if (currentActivity.value.participant_count !== undefined) {
            currentActivity.value.participant_count++
          }
        }
      }
    } catch (err: any) {
      error.value = err.message || '参加活动失败'
      console.error('Join activity error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // 退出活动
  const leaveActivity = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await activityApi.leaveActivity(id)

      if (response.code === 204 || response.code === 200) {
        // 更新活动状态
        const activity = activities.value.find((a) => a.id === id)
        if (activity) {
          activity.is_joined = false
          if (activity.participant_count !== undefined && activity.participant_count > 0) {
            activity.participant_count--
          }
        }

        if (currentActivity.value?.id === id) {
          currentActivity.value.is_joined = false
          if (currentActivity.value.participant_count !== undefined && currentActivity.value.participant_count > 0) {
            currentActivity.value.participant_count--
          }
        }
      }
    } catch (err: any) {
      error.value = err.message || '退出活动失败'
      console.error('Leave activity error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // 获取我参加的活动
  const fetchMyJoinedActivities = async (options?: FilterOptions) => {
    loading.value = true
    error.value = null

    try {
      const response = await activityApi.getMyJoinedActivities(options)

      if (response.code === 200 && response.data) {
        const data = response.data as PaginatedData<Activity>
        joinedActivities.value = data.items
        // 暂时不同步到全局activities，避免冲突
        // pagination.value = data.pagination
      }
    } catch (err: any) {
      error.value = err.message || '获取参加的活动失败'
      console.error('Fetch joined activities error:', err)
    } finally {
      loading.value = false
    }
  }

  // 获取我创建的活动
  const fetchMyCreatedActivities = async (options?: FilterOptions) => {
    loading.value = true
    error.value = null

    try {
      const response = await activityApi.getMyCreatedActivities(options)

      if (response.code === 200 && response.data) {
        const data = response.data as PaginatedData<Activity>
        createdActivities.value = data.items
        // 暂时不同步到全局activities，避免冲突
        // pagination.value = data.pagination
      }
    } catch (err: any) {
      error.value = err.message || '获取创建的活动失败'
      console.error('Fetch created activities error:', err)
    } finally {
      loading.value = false
    }
  }

  // 清除当前活动
  const clearCurrentActivity = () => {
    currentActivity.value = null
  }

  // 重置状态
  const reset = () => {
    activities.value = []
    currentActivity.value = null
    loading.value = false
    error.value = null
    pagination.value = {
      page: 1,
      page_size: 10,
      total: 0,
      total_pages: 0,
    }
  }

  return {
    // 状态
    activities,
    joinedActivities,
    createdActivities,
    currentActivity,
    loading,
    error,
    pagination,
    // 计算属性
    hasActivities,
    // 方法
    fetchActivities,
    fetchActivityDetail,
    getActivityById,
    createActivity,
    updateActivity,
    deleteActivity,
    joinActivity,
    leaveActivity,
    fetchMyJoinedActivities,
    fetchMyCreatedActivities,
    clearCurrentActivity,
    reset,
  }
})
