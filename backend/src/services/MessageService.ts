import { Message } from '../models/Message'
import { Conversation } from '../models/Conversation'
import { User } from '../models/User'
import { Op, Sequelize } from 'sequelize'

/**
 * 消息服务 - 处理聊天消息的业务逻辑
 */
export class MessageService {
  /**
   * 获取或创建对话
   */
  async getOrCreateConversation(
    userId1: number,
    userId2: number
  ): Promise<Conversation> {
    // 确保 userId1 < userId2 以保证唯一性
    const [minId, maxId] =
      userId1 < userId2 ? [userId1, userId2] : [userId2, userId1]

    let conversation = await Conversation.findOne({
      where: {
        userId1: minId,
        userId2: maxId,
      },
    })

    if (!conversation) {
      conversation = await Conversation.create({
        userId1: minId,
        userId2: maxId,
      })
    }

    return conversation
  }

  /**
   * 获取用户的对话列表
   */
  async getConversations(
    userId: number,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    conversations: Conversation[]
    total: number
    totalPages: number
  }> {
    const offset = (page - 1) * limit

    const { count, rows } = await Conversation.findAndCountAll({
      where: {
        [Op.or]: [{ userId1: userId }, { userId2: userId }],
        deletedAt: null,
      },
      include: [
        {
          model: User,
          as: 'user1',
          attributes: ['id', 'nickname', 'avatarUrl', 'hikingLevel'],
        },
        {
          model: User,
          as: 'user2',
          attributes: ['id', 'nickname', 'avatarUrl', 'hikingLevel'],
        },
      ],
      order: [['lastMessageAt', 'DESC']],
      limit,
      offset,
    })

    return {
      conversations: rows,
      total: count,
      totalPages: Math.ceil(count / limit),
    }
  }

  /**
   * 获取对话的消息列表
   */
  async getMessages(
    conversationId: number,
    page: number = 1,
    limit: number = 50
  ): Promise<{
    messages: Message[]
    total: number
    totalPages: number
  }> {
    const offset = (page - 1) * limit

    const { count, rows } = await Message.findAndCountAll({
      where: {
        conversationId,
        deletedAt: null,
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'nickname', 'avatarUrl'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    })

    // 反向排序以显示最新消息在底部
    return {
      messages: rows.reverse(),
      total: count,
      totalPages: Math.ceil(count / limit),
    }
  }

  /**
   * 发送消息
   */
  async sendMessage(
    conversationId: number,
    senderId: number,
    content: string,
    contentType: 'text' | 'image' | 'file' = 'text',
    imageUrl?: string,
    fileUrl?: string
  ): Promise<Message> {
    // 验证对话存在且用户是参与者
    const conversation = await Conversation.findByPk(conversationId)
    if (!conversation) {
      throw new Error('对话不存在')
    }

    if (
      conversation.userId1 !== senderId &&
      conversation.userId2 !== senderId
    ) {
      throw new Error('用户不是对话的参与者')
    }

    // 创建消息
    const message = await Message.create({
      conversationId,
      senderId,
      content,
      contentType,
      imageUrl: imageUrl || null,
      fileUrl: fileUrl || null,
      isRead: false,
    })

    // 更新对话的最后消息信息
    const otherUserId =
      conversation.userId1 === senderId
        ? conversation.userId2
        : conversation.userId1

    await conversation.update({
      lastMessageId: message.id,
      lastMessageAt: new Date(),
      lastMessageContent:
        contentType === 'text'
          ? content.substring(0, 100)
          : `[${contentType === 'image' ? '图片' : '文件'}]`,
      [conversation.userId1 === senderId
        ? 'user2UnreadCount'
        : 'user1UnreadCount']: (conversation[
        conversation.userId1 === senderId
          ? 'user2UnreadCount'
          : 'user1UnreadCount'
      ] || 0) + 1,
    })

    // 返回完整消息对象（包括发送者信息）
    const messageWithSender = await Message.findByPk(message.id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'nickname', 'avatarUrl'],
        },
      ],
    })

    return messageWithSender!
  }

  /**
   * 标记消息为已读
   */
  async markMessageAsRead(messageId: number): Promise<Message> {
    const message = await Message.findByPk(messageId)
    if (!message) {
      throw new Error('消息不存在')
    }

    if (!message.isRead) {
      await message.update({
        isRead: true,
        readAt: new Date(),
      })
    }

    return message
  }

  /**
   * 标记对话的所有消息为已读
   */
  async markConversationAsRead(
    conversationId: number,
    userId: number
  ): Promise<void> {
    const conversation = await Conversation.findByPk(conversationId)
    if (!conversation) {
      throw new Error('对话不存在')
    }

    // 检查用户是否是对话参与者
    if (
      conversation.userId1 !== userId &&
      conversation.userId2 !== userId
    ) {
      throw new Error('用户不是对话的参与者')
    }

    // 标记该用户的所有未读消息为已读
    const unreadMessages = await Message.findAll({
      where: {
        conversationId,
        isRead: false,
        [Op.not]: { senderId: userId }, // 不包括自己发送的消息
      },
    })

    await Promise.all(
      unreadMessages.map((msg) =>
        msg.update({
          isRead: true,
          readAt: new Date(),
        })
      )
    )

    // 重置对话中该用户的未读计数
    const unreadCountField =
      conversation.userId1 === userId ? 'user1UnreadCount' : 'user2UnreadCount'
    await conversation.update({
      [unreadCountField]: 0,
    })
  }

  /**
   * 删除消息（软删除）
   */
  async deleteMessage(messageId: number): Promise<void> {
    const message = await Message.findByPk(messageId)
    if (!message) {
      throw new Error('消息不存在')
    }

    await message.update({
      deletedAt: new Date(),
      content: null,
    })
  }

  /**
   * 获取未读消息数量
   */
  async getUnreadCount(userId: number): Promise<number> {
    const conversations = await Conversation.findAll({
      where: {
        [Op.or]: [{ userId1: userId }, { userId2: userId }],
      },
    })

    let totalUnread = 0
    conversations.forEach((conv) => {
      if (conv.userId1 === userId) {
        totalUnread += conv.user1UnreadCount || 0
      } else {
        totalUnread += conv.user2UnreadCount || 0
      }
    })

    return totalUnread
  }

  /**
   * 搜索消息
   */
  async searchMessages(
    conversationId: number,
    keyword: string,
    limit: number = 20
  ): Promise<Message[]> {
    return await Message.findAll({
      where: {
        conversationId,
        content: {
          [Op.like]: `%${keyword}%`,
        },
        deletedAt: null,
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'nickname', 'avatarUrl'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
    })
  }

  /**
   * 获取用户的所有对话统计信息
   */
  async getConversationStats(userId: number): Promise<{
    totalConversations: number
    totalUnreadMessages: number
    onlineConversations: number
  }> {
    const conversations = await Conversation.findAll({
      where: {
        [Op.or]: [{ userId1: userId }, { userId2: userId }],
        deletedAt: null,
      },
      include: [
        {
          model: User,
          as: 'user1',
        },
        {
          model: User,
          as: 'user2',
        },
      ],
    })

    let totalUnread = 0
    conversations.forEach((conv) => {
      if (conv.userId1 === userId) {
        totalUnread += conv.user1UnreadCount || 0
      } else {
        totalUnread += conv.user2UnreadCount || 0
      }
    })

    return {
      totalConversations: conversations.length,
      totalUnreadMessages: totalUnread,
      onlineConversations: 0, // 需要与 Socket.io 集成来获取在线状态
    }
  }
}
