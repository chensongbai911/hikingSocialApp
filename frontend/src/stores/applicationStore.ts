import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Application, User } from '../types'
import * as applicationApi from '../api/applicationApi'

export const useApplicationStore = defineStore('application', () => {
  // 状态
  const myApplications = ref<Application[]>([])
  const pendingApplications = ref<Application[]>([])
  const approvedParticipants = ref<User[]>([])
  const participantCount = ref(0)
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * 申请参加活动
   */
  const applyToActivity = async (activityId: string, message?: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await applicationApi.applyToActivity({
        activity_id: activityId,
        message
      })

      if (response.code === 200) {
        // 添加到我的申请列表
        myApplications.value.unshift(response.data)
        return response.data
      } else {
        error.value = response.message
        throw new Error(response.message)
      }
    } catch (err: any) {
      error.value = err.message || '申请失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取我的申请列表
   */
  const fetchMyApplications = async (status?: 'pending' | 'approved' | 'rejected') => {
    loading.value = true
    error.value = null
    try {
      const response = await applicationApi.getMyApplications(status ? { status } : undefined)

      if (response.code === 200) {
        myApplications.value = response.data
      } else {
        error.value = response.message
      }
    } catch (err: any) {
      error.value = err.message || '获取申请列表失败'
    } finally {
      loading.value = false
    }
  }

  /**
   * 审核申请（组织者）
   */
  const reviewApplication = async (
    applicationId: string,
    action: 'approve' | 'reject'
  ) => {
    loading.value = true
    error.value = null
    try {
      const response = await applicationApi.reviewApplication(applicationId, { action })

      if (response.code === 200) {
        // 从待审核列表中移除
        const index = pendingApplications.value.findIndex(app => app.application_id === applicationId)
        if (index !== -1) {
          pendingApplications.value.splice(index, 1)
        }
        return response.data
      } else {
        error.value = response.message
        throw new Error(response.message)
      }
    } catch (err: any) {
      error.value = err.message || '审核失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取活动的待审核申请（组织者）
   */
  const fetchPendingApplications = async (activityId: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await applicationApi.getPendingApplications(activityId)

      if (response.code === 200) {
        pendingApplications.value = response.data
      } else {
        error.value = response.message
      }
    } catch (err: any) {
      error.value = err.message || '获取待审核申请失败'
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取已通过的参与者
   */
  const fetchApprovedParticipants = async (activityId: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await applicationApi.getApprovedParticipants(activityId)

      if (response.code === 200) {
        approvedParticipants.value = response.data.participants
        participantCount.value = response.data.count
      } else {
        error.value = response.message
      }
    } catch (err: any) {
      error.value = err.message || '获取参与者列表失败'
    } finally {
      loading.value = false
    }
  }

  /**
   * 清空状态
   */
  const clearApplications = () => {
    myApplications.value = []
    pendingApplications.value = []
    approvedParticipants.value = []
    participantCount.value = 0
    error.value = null
  }

  return {
    // 状态
    myApplications,
    pendingApplications,
    approvedParticipants,
    participantCount,
    loading,
    error,
    // 方法
    applyToActivity,
    fetchMyApplications,
    reviewApplication,
    fetchPendingApplications,
    fetchApprovedParticipants,
    clearApplications
  }
})
