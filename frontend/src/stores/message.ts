import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as messageApi from '@/api/message'
import { socketService } from '@/services/socket'
import { useUserStore } from './user'

export interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string
  contentType: 'text' | 'image' | 'file'
  isRead: boolean
  readAt: string | null
  createdAt: string
  isOwn: boolean
  senderNickname?: string
  senderAvatar?: string
}

export interface Conversation {
  id: string
  userId1: string
  userId2: string
  lastMessageContent: string | null
  lastMessageAt: string | null
  user1UnreadCount: number
  user2UnreadCount: number
  user1?: { id: string; nickname: string; avatarUrl: string }
  user2?: { id: string; nickname: string; avatarUrl: string }
}

export const useMessageStore = defineStore('message', () => {
  const conversations = ref<Conversation[]>([])
  const messages = ref<Message[]>([])
  const currentConversationId = ref<string | null>(null)
  const pagination = ref({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  })
  const conversationPagination = ref({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })
  const isLoading = ref(false)
  const unreadCount = ref(0)
  const typingUsers = ref<Set<string>>(new Set())

  const userStore = useUserStore()
  const currentUserId = computed(() => userStore.currentUser?.id || userStore.currentUser?.user_id || '')

  const getUnreadForConversation = (conversation: Conversation) => {
    if (!conversation) return 0
    return conversation.userId1 === currentUserId.value
      ? conversation.user1UnreadCount
      : conversation.user2UnreadCount
  }

  const totalUnread = computed(() => {
    const sumFromConversations = conversations.value.reduce(
      (sum, c) => sum + (getUnreadForConversation(c) || 0),
      0
    )
    return sumFromConversations > 0 ? sumFromConversations : unreadCount.value
  })

  /**
   * 获取对话列表
   */
  const fetchConversations = async (page: number = 1, limit: number = 20) => {
    try {
      isLoading.value = true
      const result = await messageApi.getConversations(page, limit)
      conversations.value = result.conversations || []
      conversationPagination.value = {
        page,
        limit,
        total: result.total || 0,
        totalPages: result.totalPages || 0,
      }
      unreadCount.value = conversations.value.reduce(
        (sum, c) => sum + (getUnreadForConversation(c) || 0),
        0
      )
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 获取对话的消息列表
   */
  const fetchMessages = async (
    conversationId: string,
    page: number = 1,
    limit: number = 50
  ) => {
    try {
      isLoading.value = true
      currentConversationId.value = conversationId
      const result = await messageApi.getMessages(conversationId, page, limit)
      messages.value = result.messages || []
      pagination.value = {
        page,
        limit,
        total: result.total || 0,
        totalPages: result.totalPages || 0,
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 发送消息
   */
  const sendMessage = async (
    conversationId: string,
    content: string,
    contentType: 'text' | 'image' | 'file' = 'text',
    imageUrl?: string,
    fileUrl?: string
  ) => {
    try {
      const message = await messageApi.sendMessage(
        conversationId,
        content,
        contentType,
        imageUrl,
        fileUrl
      )

      // 添加到本地消息列表
      const newMessage: Message = {
        ...message,
        isOwn: message.senderId === userStore.currentUser?.id,
      }

      messages.value.push(newMessage)

      // 通过 Socket.io 发送给对方
      const conversation = conversations.value.find((c) => c.id === conversationId)
      if (conversation) {
        const targetUserId =
          conversation.userId1 === userStore.currentUser?.id
            ? conversation.userId2
            : conversation.userId1

        socketService.sendMessage({
          conversationId,
          targetUserId,
          content,
          contentType,
        })
      }

      return newMessage
    } catch (error) {
      console.error('Failed to send message:', error)
      throw error
    }
  }

  /**
   * 接收消息（来自 Socket.io）
   */
  const receiveMessage = (message: any) => {
    const newMessage: Message = {
      ...message,
      isOwn: message.senderId === userStore.currentUser?.id,
    }

    // 如果当前正在该对话，添加到消息列表
    if (message.conversationId === currentConversationId.value) {
      messages.value.push(newMessage)
    }

    // 更新对话列表中的最后消息
    const conversation = conversations.value.find(
      (c) => c.id === message.conversationId
    )
    if (conversation) {
      conversation.lastMessageContent =
        message.content?.substring(0, 100) || '[消息]'
      conversation.lastMessageAt = new Date().toISOString()
      const isSelf = message.senderId === currentUserId.value
      const isCurrent = message.conversationId === currentConversationId.value
      if (!isSelf && !isCurrent) {
        if (conversation.userId1 === currentUserId.value) {
          conversation.user1UnreadCount += 1
        } else {
          conversation.user2UnreadCount += 1
        }
        unreadCount.value = totalUnread.value
      }
    }
  }

  /**
   * 标记消息为已读
   */
  const markAsRead = async (messageId: string) => {
    try {
      await messageApi.markMessageAsRead(messageId)
      const message = messages.value.find((m) => m.id === messageId)
      if (message) {
        message.isRead = true
      }
    } catch (error) {
      console.error('Failed to mark message as read:', error)
    }
  }

  /**
   * 标记对话为已读
   */
  const markConversationAsRead = async (conversationId: string) => {
    try {
      await messageApi.markConversationAsRead(conversationId)
      const conversation = conversations.value.find((c) => c.id === conversationId)
      if (conversation) {
        if (conversation.userId1 === userStore.currentUser?.id) {
          conversation.user1UnreadCount = 0
        } else {
          conversation.user2UnreadCount = 0
        }
        unreadCount.value = totalUnread.value
      }
    } catch (error) {
      console.error('Failed to mark conversation as read:', error)
    }
  }

  /**
   * 删除消息
   */
  const deleteMessage = async (messageId: string) => {
    try {
      await messageApi.deleteMessage(messageId)
      const index = messages.value.findIndex((m) => m.id === messageId)
      if (index > -1) {
        messages.value.splice(index, 1)
      }
    } catch (error) {
      console.error('Failed to delete message:', error)
      throw error
    }
  }

  /**
   * 获取未读消息数
   */
  const fetchUnreadCount = async () => {
    try {
      const result = await messageApi.getUnreadCount()
      unreadCount.value = result.count || 0
    } catch (error) {
      console.error('Failed to fetch unread count:', error)
    }
  }

  /**
   * 搜索消息
   */
  const searchMessages = async (conversationId: string, keyword: string) => {
    try {
      isLoading.value = true
      const result = await messageApi.searchMessages(conversationId, keyword)
      return result.messages || []
    } catch (error) {
      console.error('Failed to search messages:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 处理用户正在输入状态
   */
  const handleUserTyping = (data: any) => {
    if (data.isTyping && data.conversationId === currentConversationId.value) {
      // 添加到正在输入的用户集合
      typingUsers.value.add(data.userId)

      // 2秒后移除
      setTimeout(() => {
        typingUsers.value.delete(data.userId)
      }, 2000)
    }
  }

  /**
   * 初始化 Socket 事件监听
   */
  const initializeSocketListeners = () => {
    // 监听消息接收
    socketService.onMessageReceived((message) => {
      receiveMessage(message)
    })

    // 监听用户正在输入
    socketService.onUserTyping((data) => {
      handleUserTyping(data)
    })

    // 监听用户在线状态
    socketService.onOnlineStatusChange(() => {
      // 可选：刷新对话列表
    })
  }

  /**
   * 获取对话中的其他用户
   */
  const getOtherUser = (conversation: Conversation) => {
    if (userStore.currentUser?.id === conversation.userId1) {
      return conversation.user2
    }
    return conversation.user1
  }

  /**
   * 创建或获取对话
   */
  const getOrCreateConversation = async (targetUserId: string) => {
    try {
      const conversation = await messageApi.createConversation(targetUserId)

      // 检查是否已在列表中
      const existing = conversations.value.find(
        (c) => c.id === conversation.id
      )
      if (!existing) {
        conversations.value.unshift(conversation)
      }

      return conversation
    } catch (error) {
      console.error('Failed to create conversation:', error)
      throw error
    }
  }

  /**
   * 清除当前对话
   */
  const clearCurrentConversation = () => {
    currentConversationId.value = null
    messages.value = []
  }

  return {
    // State
    conversations,
    messages,
    currentConversationId,
    pagination,
    conversationPagination,
    isLoading,
    unreadCount,
    typingUsers,
    totalUnread,

    // Getters
    currentConversation: computed(() => {
      return conversations.value.find((c) => c.id === currentConversationId.value)
    }),

    // Actions
    fetchConversations,
    fetchMessages,
    sendMessage,
    receiveMessage,
    markAsRead,
    markConversationAsRead,
    deleteMessage,
    fetchUnreadCount,
    searchMessages,
    handleUserTyping,
    initializeSocketListeners,
    getOtherUser,
    getOrCreateConversation,
    clearCurrentConversation,
  }
})
