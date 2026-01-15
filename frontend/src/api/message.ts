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
  return response.data.data
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
  return response.data.data.message
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
 * 获取未读消息数
 */
export const getUnreadCount = async () => {
  const response = await request.get('/messages/unread-count')
  return response.data.data
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
  sendMessage,
  markMessageAsRead,
  markConversationAsRead,
  deleteMessage,
  getUnreadCount,
  searchMessages,
  getMessageStats,
}
