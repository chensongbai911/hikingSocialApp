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
  ): Promise<any> {
    // 确保 userId1 < userId2 以保证唯一性
    const [minId, maxId] =
      userId1 < userId2 ? [userId1, userId2] : [userId2, userId1]

    try {
      // 先查询是否存在
      const [existingConversation] = await pool.query<RowDataPacket[]>(
        `SELECT id, user_id1 as userId1, user_id2 as userId2,
                last_message_content as lastMessageContent,
                last_message_at as lastMessageAt,
                user1_unread_count as user1UnreadCount,
                user2_unread_count as user2UnreadCount,
                created_at as createdAt,
                updated_at as updatedAt
         FROM conversations
         WHERE user_id1 = ? AND user_id2 = ? AND deleted_at IS NULL`,
        [minId, maxId]
      )

      if (existingConversation.length > 0) {
        return existingConversation[0]
      }

      // 如果不存在，创建新对话（让数据库自动生成 ID）
      const insertResult = await pool.query<ResultSetHeader>(
        `INSERT INTO conversations (user_id1, user_id2, user1_unread_count, user2_unread_count, created_at, updated_at)
         VALUES (?, ?, 0, 0, NOW(), NOW())`,
        [minId, maxId]
      )

      const conversationId = insertResult[0].insertId

      // 返回新创建的对话
      const [newConversation] = await pool.query<RowDataPacket[]>(
        `SELECT id, user_id1 as userId1, user_id2 as userId2,
                last_message_content as lastMessageContent,
                last_message_at as lastMessageAt,
                user1_unread_count as user1UnreadCount,
                user2_unread_count as user2UnreadCount,
                created_at as createdAt,
                updated_at as updatedAt
         FROM conversations
         WHERE id = ?`,
        [conversationId]
      )

      return newConversation[0]
    } catch (error) {
      console.error('获取或创建对话失败:', error)
      throw error
    }
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
    messages: any[]
    total: number
    totalPages: number
  }> {
    const offset = (page - 1) * limit

    // 获取总数
    const [countResult] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM messages
       WHERE conversation_id = ? AND deleted_at IS NULL`,
      [conversationId]
    )
    const total = countResult[0].total

    // 获取消息列表（带用户信息）
    const [messages] = await pool.query<RowDataPacket[]>(
      `SELECT
        m.id,
        m.conversation_id as conversationId,
        m.sender_id as senderId,
        m.content,
        m.content_type as contentType,
        m.image_url as imageUrl,
        m.file_url as fileUrl,
        m.is_read as isRead,
        m.read_at as readAt,
        m.created_at as createdAt,
        m.updated_at as updatedAt,
        u.id as 'sender_id',
        u.nickname as 'sender_nickname',
        u.avatar_url as 'sender_avatarUrl'
       FROM messages m
       LEFT JOIN users u ON m.sender_id = u.id
       WHERE m.conversation_id = ? AND m.deleted_at IS NULL
       ORDER BY m.created_at DESC
       LIMIT ? OFFSET ?`,
      [conversationId, limit, offset]
    )

    // 转换嵌套对象结构
    const formattedMessages = messages.map((msg: any) => ({
      id: msg.id,
      conversationId: msg.conversationId,
      senderId: msg.senderId,
      content: msg.content,
      contentType: msg.contentType,
      imageUrl: msg.imageUrl,
      fileUrl: msg.fileUrl,
      isRead: msg.isRead,
      readAt: msg.readAt,
      createdAt: msg.createdAt,
      updatedAt: msg.updatedAt,
      sender: {
        id: msg.sender_id,
        nickname: msg.sender_nickname,
        avatarUrl: msg.sender_avatarUrl
      }
    }))

    // 反向排序以显示最新消息在底部
    return {
      messages: formattedMessages.reverse(),
      total,
      totalPages: Math.ceil(total / limit),
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
  ): Promise<any> {
    // 验证对话存在且用户是参与者
    const [conversations] = await pool.query<RowDataPacket[]>(
      'SELECT id, user_id1, user_id2, user1_unread_count, user2_unread_count FROM conversations WHERE id = ? AND deleted_at IS NULL',
      [conversationId]
    )

    if (conversations.length === 0) {
      throw new Error('对话不存在')
    }

    const conversation = conversations[0]

    if (
      String(conversation.user_id1) !== String(senderId) &&
      String(conversation.user_id2) !== String(senderId)
    ) {
      throw new Error('用户不是对话的参与者')
    }

    // 创建消息
    const [insertResult] = await pool.query<ResultSetHeader>(
      `INSERT INTO messages (conversation_id, sender_id, content, content_type, image_url, file_url, is_read, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, false, NOW(), NOW())`,
      [conversationId, senderId, content || '', contentType, imageUrl || null, fileUrl || null]
    )

    const messageId = insertResult.insertId

    // 更新对话的最后消息信息
    const otherUserId =
      conversation.user_id1 === senderId
        ? conversation.user_id2
        : conversation.user_id1

    const unreadCountField = conversation.user_id1 === senderId ? 'user2_unread_count' : 'user1_unread_count'
    const currentUnreadCount = conversation.user_id1 === senderId ? conversation.user2_unread_count : conversation.user1_unread_count

    const lastMessageContent =
      contentType === 'text'
        ? (content || '').substring(0, 100)
        : `[${contentType === 'image' ? '图片' : '文件'}]`

    await pool.query(
      `UPDATE conversations
       SET last_message_id = ?,
           last_message_at = NOW(),
           last_message_content = ?,
           ${unreadCountField} = ?
       WHERE id = ?`,
      [messageId, lastMessageContent, (currentUnreadCount || 0) + 1, conversationId]
    )

    // 返回完整消息对象（包括发送者信息）
    const [messages] = await pool.query<RowDataPacket[]>(
      `SELECT
        m.id, m.conversation_id as conversationId, m.sender_id as senderId,
        m.content, m.content_type as contentType, m.image_url as imageUrl,
        m.file_url as fileUrl, m.is_read as isRead, m.read_at as readAt,
        m.created_at as createdAt, m.updated_at as updatedAt,
        u.id as sender_id, u.nickname as sender_nickname, u.avatar_url as sender_avatarUrl
       FROM messages m
       LEFT JOIN users u ON m.sender_id = u.id
       WHERE m.id = ?`,
      [messageId]
    )

    if (messages.length === 0) {
      throw new Error('消息创建失败')
    }

    const msg = messages[0]
    return {
      id: msg.id,
      conversationId: msg.conversationId,
      senderId: msg.senderId,
      content: msg.content,
      contentType: msg.contentType,
      imageUrl: msg.imageUrl,
      fileUrl: msg.fileUrl,
      isRead: msg.isRead,
      readAt: msg.readAt,
      createdAt: msg.createdAt,
      updatedAt: msg.updatedAt,
      sender: {
        id: msg.sender_id,
        nickname: msg.sender_nickname,
        avatarUrl: msg.sender_avatarUrl
      }
    }
  }

  /**
   * 标记消息为已读
   */
  async markMessageAsRead(messageId: number): Promise<any> {
    const [messages] = await pool.query<RowDataPacket[]>(
      'SELECT id, is_read FROM messages WHERE id = ?',
      [messageId]
    )

    if (messages.length === 0) {
      throw new Error('消息不存在')
    }

    const message = messages[0]

    if (!message.is_read) {
      await pool.query(
        'UPDATE messages SET is_read = true, read_at = NOW(), updated_at = NOW() WHERE id = ?',
        [messageId]
      )
    }

    // 返回更新后的消息
    const [updated] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM messages WHERE id = ?',
      [messageId]
    )

    return updated[0]
  }

  /**
   * 标记对话的所有消息为已读
   */
  async markConversationAsRead(
    conversationId: number,
    userId: string
  ): Promise<void> {
    // 获取对话信息
    const [conversations] = await pool.query<RowDataPacket[]>(
      `SELECT id, user_id1, user_id2 FROM conversations
       WHERE id = ? AND deleted_at IS NULL`,
      [conversationId]
    )

    if (conversations.length === 0) {
      throw new Error('对话不存在')
    }

    const conversation = conversations[0]

    // 检查用户是否是对话参与者
    if (
      String(conversation.user_id1) !== String(userId) &&
      String(conversation.user_id2) !== String(userId)
    ) {
      throw new Error('用户不是对话的参与者')
    }

    // 标记该用户的所有未读消息为已读
    await pool.query(
      `UPDATE messages
       SET is_read = 1, read_at = NOW()
       WHERE conversation_id = ?
         AND is_read = 0
         AND sender_id != ?
         AND deleted_at IS NULL`,
      [conversationId, userId]
    )

    // 重置对话中该用户的未读计数
    const unreadCountField =
      conversation.user_id1 === userId ? 'user1_unread_count' : 'user2_unread_count'

    await pool.query(
      `UPDATE conversations
       SET ${unreadCountField} = 0, updated_at = NOW()
       WHERE id = ?`,
      [conversationId]
    )
  }

  /**
   * 删除消息（软删除）
   */
  async deleteMessage(messageId: number): Promise<void> {
    const [messages] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM messages WHERE id = ?',
      [messageId]
    )

    if (messages.length === 0) {
      throw new Error('消息不存在')
    }

    await pool.query(
      'UPDATE messages SET deleted_at = NOW(), content = \'\', updated_at = NOW() WHERE id = ?',
      [messageId]
    )
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
