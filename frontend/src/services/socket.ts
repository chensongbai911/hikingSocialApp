import { io, Socket } from 'socket.io-client'

/**
 * Socket.io 客户端配置
 * 管理与后端 WebSocket 服务器的连接
 */

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:3000'

interface SocketMessage {
  id: string
  conversationId: string
  senderId: string
  senderNickname: string
  senderAvatar: string
  content: string
  contentType: 'text' | 'image' | 'file'
  createdAt: string
  isOwn: boolean
}

interface ConversationUser {
  id: string
  nickname: string
  avatarUrl: string
  hikingLevel: string
}

export class SocketService {
  private socket: Socket | null = null
  private userId: string | null = null
  private messageCallbacks: Set<(message: SocketMessage) => void> = new Set()
  private recallCallbacks: Set<(data: any) => void> = new Set()
  private typingCallbacks: Set<(data: any) => void> = new Set()
  private blacklistCallbacks: Set<(data: any) => void> = new Set()
  private readReceiptCallbacks: Set<(data: any) => void> = new Set()
  private onlineStatusCallbacks: Set<(data: any) => void> = new Set()

  /**
   * 初始化 Socket 连接
   */
  connect(userId: string, token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.userId = userId

        this.socket = io(SOCKET_URL, {
          auth: {
            token,
          },
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
          transports: ['websocket', 'polling'],
        })

        // 连接成功
        this.socket.on('connect', () => {
          console.log('✅ Socket connected:', this.socket?.id)
          // 通知服务器用户已连接
          this.socket?.emit('user:join', userId)
          resolve()
        })

        // 连接失败
        this.socket.on('connect_error', (error) => {
          console.error('❌ Socket connection error:', error)
          reject(error)
        })

        // 断开连接
        this.socket.on('disconnect', (reason) => {
          console.log('Socket disconnected:', reason)
        })

        // 监听消息接收（旧命名）
        // 标准化：新消息
        this.socket.on('new_message', (data: any) => {
          this.messageCallbacks.forEach((cb) => cb(data))
        })

        // 正在输入
        this.socket.on('typing', (data) => {
          this.typingCallbacks.forEach((cb) => cb(data))
        })

        // 消息撤回
        this.socket.on('message_recalled', (data) => {
          this.recallCallbacks.forEach((cb) => cb(data))
        })

        // 黑名单更新
        this.socket.on('blacklist_updated', (data) => {
          this.blacklistCallbacks.forEach((cb) => cb(data))
        })

        // 监听已读回执
        this.socket.on('message:read-receipt', (data) => {
          this.readReceiptCallbacks.forEach((cb) => cb(data))
        })

        // 监听用户在线状态
        this.socket.on('user:online', (data) => {
          this.onlineStatusCallbacks.forEach((cb) => cb(data))
        })

        this.socket.on('user:offline', (data) => {
          this.onlineStatusCallbacks.forEach((cb) => cb(data))
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  /**
   * 发送消息
   */
  /**
   * 发送正在输入状态（后端事件名：typing）
   */
  sendTyping(conversationId: string, isTyping: boolean): void {
    if (!this.socket) return
    this.socket.emit('typing', { conversationId, isTyping })
  }

  /**
   * 监听消息接收
   */
  onMessageReceived(callback: (message: SocketMessage) => void): () => void {
    this.messageCallbacks.add(callback)

    // 返回取消监听函数
    return () => {
      this.messageCallbacks.delete(callback)
    }
  }

  /**
   * 监听撤回
   */
  onRecall(callback: (data: any) => void): () => void {
    this.recallCallbacks.add(callback)
    return () => this.recallCallbacks.delete(callback)
  }

  /**
   * 监听用户正在输入
   */
  onUserTyping(callback: (data: any) => void): () => void {
    this.typingCallbacks.add(callback)

    return () => {
      this.typingCallbacks.delete(callback)
    }
  }

  /**
   * 监听黑名单更新
   */
  onBlacklist(callback: (data: any) => void): () => void {
    this.blacklistCallbacks.add(callback)
    return () => this.blacklistCallbacks.delete(callback)
  }

  /**
   * 监听已读回执
   */
  onReadReceipt(callback: (data: any) => void): () => void {
    this.readReceiptCallbacks.add(callback)

    return () => {
      this.readReceiptCallbacks.delete(callback)
    }
  }

  /**
   * 监听用户在线状态
   */
  onOnlineStatusChange(callback: (data: any) => void): () => void {
    this.onlineStatusCallbacks.add(callback)

    return () => {
      this.onlineStatusCallbacks.delete(callback)
    }
  }

  /**
   * 检查连接状态
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false
  }

  /**
   * 获取 Socket ID
   */
  getSocketId(): string | undefined {
    return this.socket?.id
  }
}

// 导出单例
export const socketService = new SocketService()
