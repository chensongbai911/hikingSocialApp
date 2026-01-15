import request from './http'
import type {
  ApiResponse,
  Friendship,
  SendFriendRequestData,
  FriendRequest,
  RecommendedUser,
  User
} from '../types'

/**
 * 发送好友请求
 */
export const sendFriendRequest = async (data: SendFriendRequestData): Promise<ApiResponse<Friendship>> => {
  return request.post('/friends/request', data)
}

/**
 * 获取好友列表
 */
export const getFriends = async (): Promise<ApiResponse<User[]>> => {
  return request.get('/friends')
}

/**
 * 获取待处理的好友请求
 */
export const getPendingRequests = async (): Promise<ApiResponse<FriendRequest[]>> => {
  return request.get('/friends/requests/pending')
}

/**
 * 搜索用户
 */
export const searchUsers = async (keyword: string): Promise<ApiResponse<User[]>> => {
  return request.get('/friends/search', { params: { keyword } })
}

/**
 * 获取推荐用户
 */
export const getRecommendedUsers = async (limit: number = 10): Promise<ApiResponse<RecommendedUser[]>> => {
  return request.get('/friends/recommendations', { params: { limit } })
}

/**
 * 获取好友关系状态
 */
export const getFriendshipStatus = async (
  friendId: string
): Promise<ApiResponse<{ status: 'pending' | 'accepted' | 'rejected' | 'blocked' | null }>> => {
  return request.get(`/friends/${friendId}/status`)
}

/**
 * 接受好友请求
 */
export const acceptFriendRequest = async (friendId: string): Promise<ApiResponse<Friendship>> => {
  return request.put(`/friends/${friendId}/accept`)
}

/**
 * 拒绝好友请求
 */
export const rejectFriendRequest = async (friendId: string): Promise<ApiResponse<Friendship>> => {
  return request.put(`/friends/${friendId}/reject`)
}

/**
 * 删除好友
 */
export const removeFriend = async (friendId: string): Promise<ApiResponse<void>> => {
  return request.delete(`/friends/${friendId}`)
}
