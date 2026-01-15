import request from './http'
import type {
  ApiResponse,
  Application,
  CreateApplicationData,
  ReviewApplicationData,
  User
} from '../types'

/**
 * 申请参加活动
 */
export const applyToActivity = async (data: CreateApplicationData): Promise<ApiResponse<Application>> => {
  return request.post('/applications', data)
}

/**
 * 获取我的申请列表
 */
export const getMyApplications = async (params?: {
  status?: 'pending' | 'approved' | 'rejected'
}): Promise<ApiResponse<Application[]>> => {
  return request.get('/applications/my', { params })
}

/**
 * 审核申请
 */
export const reviewApplication = async (
  applicationId: string,
  data: ReviewApplicationData
): Promise<ApiResponse<Application>> => {
  return request.put(`/applications/${applicationId}/review`, data)
}

/**
 * 获取活动的待审核申请列表（组织者）
 */
export const getPendingApplications = async (
  activityId: string
): Promise<ApiResponse<Application[]>> => {
  return request.get(`/activities/${activityId}/applications/pending`)
}

/**
 * 获取活动的已通过参与者列表
 */
export const getApprovedParticipants = async (
  activityId: string
): Promise<ApiResponse<{ count: number; participants: User[] }>> => {
  return request.get(`/activities/${activityId}/participants`)
}
