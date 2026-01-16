import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { chatPolicyService } from '../services/ChatPolicyService';
let io = null;
const userSockets = new Map();
function addUserSocket(userId, socketId) {
    if (!userSockets.has(userId))
        userSockets.set(userId, new Set());
    userSockets.get(userId).add(socketId);
}
function removeUserSocket(userId, socketId) {
    const set = userSockets.get(userId);
    if (!set)
        return;
    set.delete(socketId);
    if (set.size === 0)
        userSockets.delete(userId);
}
export function initSocket(server) {
    io = new Server(server, {
        cors: { origin: process.env.CORS_ORIGIN?.split(',') || '*', credentials: true },
    });
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.token || socket.handshake.query?.token;
            if (!token)
                return next(new Error('unauthorized'));
            const secret = process.env.JWT_SECRET || 'dev-secret';
            const payload = jwt.verify(token.replace(/^Bearer\s+/i, ''), secret);
            socket.data.userId = String(payload.id || payload.userId || payload.sub);
            if (!socket.data.userId)
                return next(new Error('unauthorized'));
            next();
        }
        catch (e) {
            next(new Error('unauthorized'));
        }
    });
    io.on('connection', (socket) => {
        const userId = socket.data.userId;
        addUserSocket(userId, socket.id);
        socket.on('disconnect', () => {
            removeUserSocket(userId, socket.id);
        });
        // 前端打字状态透传
        socket.on('typing', async (payload) => {
            try {
                const { conversationId, isTyping } = payload || {};
                if (!conversationId)
                    return;
                const participants = await chatPolicyService.getConversationParticipants(conversationId);
                const other = participants.user1 === userId ? participants.user2 : participants.user1;
                emitToUser(other, 'typing', { conversationId, fromUserId: userId, isTyping });
            }
            catch { }
        });
    });
}
export function emitToUser(userId, event, data) {
    if (!io)
        return;
    const set = userSockets.get(String(userId));
    if (!set)
        return;
    for (const sid of set)
        io.to(sid).emit(event, data);
}
export function getIO() {
    return io;
}
//# sourceMappingURL=socket.js.map