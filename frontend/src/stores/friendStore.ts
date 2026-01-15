import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, FriendRequest, RecommendedUser } from '../types'
import * as friendApi from '../api/friendApi'

export const useFriendStore = defineStore('friend', () => {
  // 状态
  const friends = ref<User[]>([])
  const pendingRequests = ref<FriendRequest[]>([])
  const searchResults = ref<User[]>([])
  const recommendedUsers = ref<RecommendedUser[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 计算属性
  const friendCount = computed(() => friends.value.length)
  const pendingRequestCount = computed(() => pendingRequests.value.length)

  /**
   * 发送好友请求
   */
  const sendFriendRequest = async (friendId: string, message?: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await friendApi.sendFriendRequest({
        friend_id: friendId,
        message
      })

      if (response.code === 200) {
        return response.data
      } else {
        error.value = response.message
        throw new Error(response.message)
      }
    } catch (err: any) {
      error.value = err.message || '发送好友请求失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取好友列表
   */
  const fetchFriends = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await friendApi.getFriends()

      if (response.code === 200) {
        friends.value = response.data
      } else {
        error.value = response.message
      }
    } catch (err: any) {
      error.value = err.message || '获取好友列表失败'
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取待处理的好友请求
   */
  const fetchPendingRequests = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await friendApi.getPendingRequests()

      if (response.code === 200) {
        pendingRequests.value = response.data
      } else {
        error.value = response.message
      }
    } catch (err: any) {
      error.value = err.message || '获取好友请求失败'
    } finally {
      loading.value = false
    }
  }

  /**
   * 搜索用户
   */
  const searchUsers = async (keyword: string) => {
    if (!keyword.trim()) {
      searchResults.value = []
      return
    }

    loading.value = true
    error.value = null
    try {
      const response = await friendApi.searchUsers(keyword)

      if (response.code === 200) {
        searchResults.value = response.data
      } else {
        error.value = response.message
        searchResults.value = []
      }
    } catch (err: any) {
      error.value = err.message || '搜索用户失败'
      searchResults.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取推荐用户
   */
  const fetchRecommendedUsers = async (limit: number = 10) => {
    loading.value = true
    error.value = null
    try {
      const response = await friendApi.getRecommendedUsers(limit)

      if (response.code === 200) {
        recommendedUsers.value = response.data
      } else {
        error.value = response.message
      }
    } catch (err: any) {
      error.value = err.message || '获取推荐用户失败'
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取好友关系状态
   */
  const getFriendshipStatus = async (friendId: string) => {
    try {
      const response = await friendApi.getFriendshipStatus(friendId)

      if (response.code === 200) {
        return response.data.status
      }
      return null
    } catch (err: any) {
      console.error('获取好友关系状态失败:', err)
      return null
    }
  }

  /**
   * 接受好友请求
   */
  const acceptFriendRequest = async (friendId: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await friendApi.acceptFriendRequest(friendId)

      if (response.code === 200) {
        // 从待处理列表中移除
        const index = pendingRequests.value.findIndex(req => req.user_id === friendId)
        if (index !== -1) {
          pendingRequests.value.splice(index, 1)
        }
        // 刷新好友列表
        await fetchFriends()
        return response.data
      } else {
        error.value = response.message
        throw new Error(response.message)
      }
    } catch (err: any) {
      error.value = err.message || '接受好友请求失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 拒绝好友请求
   */
  const rejectFriendRequest = async (friendId: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await friendApi.rejectFriendRequest(friendId)

      if (response.code === 200) {
        // 从待处理列表中移除
        const index = pendingRequests.value.findIndex(req => req.user_id === friendId)
        if (index !== -1) {
          pendingRequests.value.splice(index, 1)
        }
        return response.data
      } else {
        error.value = response.message
        throw new Error(response.message)
      }
    } catch (err: any) {
      error.value = err.message || '拒绝好友请求失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 删除好友
   */
  const removeFriend = async (friendId: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await friendApi.removeFriend(friendId)

      if (response.code === 200) {
        // 从好友列表中移除
        const index = friends.value.findIndex(friend => friend.user_id === friendId)
        if (index !== -1) {
          friends.value.splice(index, 1)
        }
      } else {
        error.value = response.message
        throw new Error(response.message)
      }
    } catch (err: any) {
      error.value = err.message || '删除好友失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 清空搜索结果
   */
  const clearSearchResults = () => {
    searchResults.value = []
  }

  /**
   * 清空所有状态
   */
  const clearFriendData = () => {
    friends.value = []
    pendingRequests.value = []
    searchResults.value = []
    recommendedUsers.value = []
    error.value = null
  }

  return {
    // 状态
    friends,
    pendingRequests,
    searchResults,
    recommendedUsers,
    loading,
    error,
    // 计算属性
    friendCount,
    pendingRequestCount,
    // 方法
    sendFriendRequest,
    fetchFriends,
    fetchPendingRequests,
    searchUsers,
    fetchRecommendedUsers,
    getFriendshipStatus,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    clearSearchResults,
    clearFriendData
  }
})
