import { Message } from '../models/Message'
import { Conversation } from '../models/Conversation'
import { User } from '../models/User'
import { Op, Sequelize } from 'sequelize'
import { pool } from '../config/database'
import { RowDataPacket, ResultSetHeader } from 'mysql2'

/**
 * 消息服务 - 处理聊天消息的业务逻辑
 */
export class MessageService {
  /**
   * 获取或创建对话
   */
  async getOrCreateConversation(
    userId1: string,
    userId2: string
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
        user1UnreadCount: 0,
        user2UnreadCount: 0,
      } as any)
    }

    return conversation
  }

  /**
   * 获取用户的对话列表
   */
  async getConversations(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    conversations: any[]
    total: number
    totalPages: number
  }> {
    const offset = (page - 1) * limit

    try {
      // 获取总数
      const [countResult] = await pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as count
         FROM conversations
         WHERE (user_id1 = ? OR user_id2 = ?) AND deleted_at IS NULL`,
        [userId, userId]
      )
      const total = countResult[0]?.count || 0

      // 获取对话列表
      const [conversations] = await pool.query<RowDataPacket[]>(
        `SELECT
          c.id,
          c.user_id1 as userId1,
          c.user_id2 as userId2,
          c.last_message_content as lastMessageContent,
          c.last_message_at as lastMessageAt,
          c.user1_unread_count as user1UnreadCount,
          c.user2_unread_count as user2UnreadCount,
          c.created_at as createdAt,
          c.updated_at as updatedAt,
          u1.id as user1_id,
          u1.nickname as user1_nickname,
          u1.avatar_url as user1_avatarUrl,
          u2.id as user2_id,
          u2.nickname as user2_nickname,
          u2.avatar_url as user2_avatarUrl
        FROM conversations c
        LEFT JOIN users u1 ON c.user_id1 = u1.id
        LEFT JOIN users u2 ON c.user_id2 = u2.id
        WHERE (c.user_id1 = ? OR c.user_id2 = ?) AND c.deleted_at IS NULL
        ORDER BY c.last_message_at DESC
        LIMIT ? OFFSET ?`,
        [userId, userId, limit, offset]
      )

      // 格式化数据
      const formattedConversations = conversations.map((row: any) => ({
        id: row.id,
        userId1: row.userId1,
        userId2: row.userId2,
        lastMessageContent: row.lastMessageContent,
        lastMessageAt: row.lastMessageAt,
        user1UnreadCount: row.user1UnreadCount || 0,
        user2UnreadCount: row.user2UnreadCount || 0,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        user1: row.user1_id ? {
          id: row.user1_id,
          nickname: row.user1_nickname,
          avatarUrl: row.user1_avatarUrl,
        } : null,
        user2: row.user2_id ? {
          id: row.user2_id,
          nickname: row.user2_nickname,
          avatarUrl: row.user2_avatarUrl,
        } : null,
      }))

      return {
        conversations: formattedConversations,
        total,
        totalPages: Math.ceil(total / limit),
      }
    } catch (error) {
      console.error('getConversations error:', error)
      throw error
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
    senderId: string,
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
      String(conversation.userId1) !== String(senderId) &&
      String(conversation.userId2) !== String(senderId)
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
    } as any)

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
    userId: string
  ): Promise<void> {
    const conversation = await Conversation.findByPk(conversationId)
    if (!conversation) {
      throw new Error('对话不存在')
    }

    // 检查用户是否是对话参与者
    if (
      String(conversation.userId1) !== String(userId) &&
      String(conversation.userId2) !== String(userId)
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
      content: '',
    })
  }

  /**
   * 获取未读消息数量
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT
          SUM(CASE
            WHEN user_id1 = ? THEN user1_unread_count
            WHEN user_id2 = ? THEN user2_unread_count
            ELSE 0
          END) as totalUnread
        FROM conversations
        WHERE (user_id1 = ? OR user_id2 = ?)`,
        [userId, userId, userId, userId]
      )

      return rows[0]?.totalUnread || 0
    } catch (error) {
      console.error('getUnreadCount error:', error)
      return 0
    }
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
      if (String(conv.userId1) === String(userId)) {
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
