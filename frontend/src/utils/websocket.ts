import { useUserStore } from '../stores/user'
import toast from './toast'

export type WebSocketEventType =
  | 'friend_request'      // 好友申请
  | 'friend_accepted'     // 好友通过
  | 'application_approved' // 活动申请通过
  | 'application_rejected' // 活动申请拒绝
  | 'new_message'         // 新消息
  | 'activity_update'     // 活动更新
  | 'activity_cancelled'  // 活动取消

export interface WebSocketMessage {
  type: WebSocketEventType
  data: any
  timestamp: number
}

class WebSocketService {
  private ws: WebSocket | null = null
  private reconnectTimer: NodeJS.Timeout | null = null
  private heartbeatTimer: NodeJS.Timeout | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 3000
  private listeners: Map<WebSocketEventType, Set<(data: any) => void>> = new Map()

  /**
   * 连接WebSocket
   */
  connect(token: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected')
      return
    }

    // 根据当前协议自动选择 ws 或 wss
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = import.meta.env.VITE_WS_URL || `${protocol}//${window.location.host}`
    const url = `${wsUrl}?token=${token}`

    try {
      this.ws = new WebSocket(url)

      this.ws.onopen = () => {
        console.log('WebSocket connected')
        this.reconnectAttempts = 0
        this.startHeartbeat()
        // 静默连接成功，不显示 toast
      }

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          this.handleMessage(message)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        // 静默处理错误，不显示 toast
      }

      this.ws.onclose = () => {
        console.log('WebSocket disconnected')
        this.stopHeartbeat()
        this.attemptReconnect(token)
      }
    } catch (error) {
      console.error('Failed to create WebSocket:', error)
      // 静默处理错误，不显示 toast
    }
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    this.stopHeartbeat()

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }

    this.listeners.clear()
  }

  /**
   * 发送消息
   */
  send(message: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket is not connected')
    }
  }

  /**
   * 监听事件
   */
  on(type: WebSocketEventType, callback: (data: any) => void): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set())
    }
    this.listeners.get(type)!.add(callback)
  }

  /**
   * 移除监听
   */
  off(type: WebSocketEventType, callback: (data: any) => void): void {
    const callbacks = this.listeners.get(type)
    if (callbacks) {
      callbacks.delete(callback)
    }
  }

  /**
   * 处理接收到的消息
   */
  private handleMessage(message: WebSocketMessage): void {
    console.log('WebSocket message received:', message)

    // 触发监听器
    const callbacks = this.listeners.get(message.type)
    if (callbacks) {
      callbacks.forEach(callback => callback(message.data))
    }

    // 显示通知
    this.showNotification(message)
  }

  /**
   * 显示通知
   */
  private showNotification(message: WebSocketMessage): void {
    switch (message.type) {
      case 'friend_request':
        toast.info(`${message.data.username || '新用户'} 向你发送好友申请`)
        break
      case 'friend_accepted':
        toast.success(`${message.data.username || '用户'} 通过了你的好友申请`)
        break
      case 'application_approved':
        toast.success(`你的活动申请已通过`)
        break
      case 'application_rejected':
        toast.warning(`你的活动申请已被拒绝`)
        break
      case 'new_message':
        if (!message.data.isCurrentChat) {
          toast.info(`收到来自 ${message.data.senderName} 的新消息`)
        }
        break
      case 'activity_update':
        toast.info(`活动 "${message.data.title}" 已更新`)
        break
      case 'activity_cancelled':
        toast.warning(`活动 "${message.data.title}" 已取消`)
        break
    }
  }

  /**
   * 尝试重连
   */
  private attemptReconnect(token: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      // 静默失败，不显示 toast，避免影响用户体验
      return
    }

    this.reconnectAttempts++
    console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`)

    this.reconnectTimer = setTimeout(() => {
      this.connect(token)
    }, this.reconnectDelay * this.reconnectAttempts)
  }

  /**
   * 开始心跳
   */
  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }))
      }
    }, 30000) // 每30秒发送一次心跳
  }

  /**
   * 停止心跳
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  /**
   * 获取连接状态
   */
  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }
}

// 导出单例
export const websocketService = new WebSocketService()

// 自动连接（登录后调用）
export function initWebSocket(): void {
  const userStore = useUserStore()
  if (userStore.token) {
    websocketService.connect(userStore.token)
  }
}

// 断开连接（登出时调用）
export function disconnectWebSocket(): void {
  websocketService.disconnect()
}
