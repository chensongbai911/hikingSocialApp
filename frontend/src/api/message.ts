import request from './http'

/**
 * 消息 API 模块
 * 处理所有与聊天消息相关的 API 请求
 */

/**
 * 获取对话列表
 */
export const getConversations = async (page: number = 1, limit: number = 20) => {
  const response = await request.get('/messages/conversations', {
    params: { page, limit },
  })
  console.log('getConversations API response:', response)
  return response.data
}

/**
 * 获取或创建对话
 */
export const createConversation = async (targetUserId: string) => {
  const response = await request.post('/messages/conversations', {
    targetUserId,
  })
  return response.data.data.conversation
}

/**
 * 获取对话的消息列表
 */
export const getMessages = async (
  conversationId: string,
  page: number = 1,
  limit: number = 50
) => {
  const response = await request.get(`/messages/conversations/${conversationId}`, {
    params: { page, limit },
  })
  return response.data.data
}

/**
 * 获取对话信息（限制、黑名单等）
 */
export const getConversationInfo = async (conversationId: string) => {
  const response = await request.get(`/messages/conversations/${conversationId}/info`)
  return response.data.data
}

/**
 * 发送消息
 */
export const sendMessage = async (
  conversationId: string,
  content: string,
  contentType: 'text' | 'image' | 'file' = 'text',
  imageUrl?: string,
  fileUrl?: string
) => {
  const response = await request.post(
    `/messages/conversations/${conversationId}/messages`,
    {
      content,
      contentType,
      imageUrl,
      fileUrl,
    }
  )
  return response.data.data
}

/**
 * 标记消息为已读
 */
export const markMessageAsRead = async (messageId: string) => {
  const response = await request.put(`/messages/${messageId}/read`)
  return response.data.data.message
}

/**
 * 标记对话的所有消息为已读
 */
export const markConversationAsRead = async (conversationId: string) => {
  const response = await request.put(
    `/messages/conversations/${conversationId}/read-all`
  )
  return response.data
}

/**
 * 删除消息
 */
export const deleteMessage = async (messageId: string) => {
  const response = await request.delete(`/messages/${messageId}`)
  return response.data
}

/**
 * 撤回消息（2分钟内）
 */
export const recallMessage = async (messageId: string) => {
  const response = await request.post(`/messages/${messageId}/recall`)
  return response.data.data
}

/**
 * 举报消息
 */
export const reportMessage = async (messageId: string, reason: string, extra?: any) => {
  const response = await request.post(`/messages/${messageId}/report`, { reason, extra })
  return response.data
}

/**
 * 清空对话（归档后删除）
 */
export const clearConversation = async (conversationId: string) => {
  const response = await request.delete(`/messages/conversations/${conversationId}`)
  return response.data
}

/**
 * 黑名单管理
 */
export const getBlacklist = async () => {
  const response = await request.get('/messages/blacklist')
  return response.data.data as string[]
}

export const addToBlacklist = async (targetUserId: string) => {
  const response = await request.post(`/messages/blacklist/${targetUserId}`)
  return response.data
}

export const removeFromBlacklist = async (targetUserId: string) => {
  const response = await request.delete(`/messages/blacklist/${targetUserId}`)
  return response.data
}

/**
 * 获取未读消息数
 */
export const getUnreadCount = async () => {
  const response = await request.get('/messages/unread-count')
  console.log('getUnreadCount API response:', response)
  return response.data
}

/**
 * 搜索消息
 */
export const searchMessages = async (
  conversationId: string,
  keyword: string,
  limit: number = 20
) => {
  const response = await request.get(
    `/messages/conversations/${conversationId}/search`,
    {
      params: { keyword, limit },
    }
  )
  return response.data.data
}

/**
 * 获取消息统计信息
 */
export const getMessageStats = async () => {
  const response = await request.get('/messages/stats')
  return response.data.data
}

export default {
  getConversations,
  createConversation,
  getMessages,
  getConversationInfo,
  sendMessage,
  markMessageAsRead,
  markConversationAsRead,
  deleteMessage,
  recallMessage,
  reportMessage,
  clearConversation,
  getBlacklist,
  addToBlacklist,
  removeFromBlacklist,
  getUnreadCount,
  searchMessages,
  getMessageStats,
}
