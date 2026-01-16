import { Server } from 'socket.io'
import type { Server as HttpServer } from 'http'
import jwt from 'jsonwebtoken'
import { chatPolicyService } from '../services/ChatPolicyService'

let io: Server | null = null
const userSockets = new Map<string, Set<string>>()

function addUserSocket(userId: string, socketId: string) {
  if (!userSockets.has(userId)) userSockets.set(userId, new Set())
  userSockets.get(userId)!.add(socketId)
}

function removeUserSocket(userId: string, socketId: string) {
  const set = userSockets.get(userId)
  if (!set) return
  set.delete(socketId)
  if (set.size === 0) userSockets.delete(userId)
}

export function initSocket(server: HttpServer) {
  io = new Server(server, {
    cors: { origin: process.env.CORS_ORIGIN?.split(',') || '*', credentials: true },
  })

  io.use((socket, next) => {
    try {
      const token = (socket.handshake.auth?.token as string) || (socket.handshake.query?.token as string)
      if (!token) return next(new Error('unauthorized'))
      const secret = process.env.JWT_SECRET || 'dev-secret'
      const payload: any = jwt.verify(token.replace(/^Bearer\s+/i, ''), secret)
      socket.data.userId = String(payload.id || payload.userId || payload.sub)
      if (!socket.data.userId) return next(new Error('unauthorized'))
      next()
    } catch (e) {
      next(new Error('unauthorized'))
    }
  })

  io.on('connection', (socket) => {
    const userId: string = socket.data.userId
    addUserSocket(userId, socket.id)

    socket.on('disconnect', () => {
      removeUserSocket(userId, socket.id)
    })

    // 前端打字状态透传
    socket.on('typing', async (payload: { conversationId: number; isTyping: boolean }) => {
      try {
        const { conversationId, isTyping } = payload || ({} as any)
        if (!conversationId) return
        const participants = await chatPolicyService.getConversationParticipants(conversationId)
        const other = participants.user1 === userId ? participants.user2 : participants.user1
        emitToUser(other, 'typing', { conversationId, fromUserId: userId, isTyping })
      } catch { }
    })
  })
}

export function emitToUser(userId: string, event: string, data: any) {
  if (!io) return
  const set = userSockets.get(String(userId))
  if (!set) return
  for (const sid of set) io.to(sid).emit(event, data)
}

export function getIO(): Server | null {
  return io
}
