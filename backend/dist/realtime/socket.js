"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocket = initSocket;
exports.emitToUser = emitToUser;
exports.getIO = getIO;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ChatPolicyService_1 = require("../services/ChatPolicyService");
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
function initSocket(server) {
    io = new socket_io_1.Server(server, {
        cors: { origin: process.env.CORS_ORIGIN?.split(',') || '*', credentials: true },
    });
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.token || socket.handshake.query?.token;
            if (!token)
                return next(new Error('unauthorized'));
            const secret = process.env.JWT_SECRET || 'dev-secret';
            const payload = jsonwebtoken_1.default.verify(token.replace(/^Bearer\s+/i, ''), secret);
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
                const participants = await ChatPolicyService_1.chatPolicyService.getConversationParticipants(conversationId);
                const other = participants.user1 === userId ? participants.user2 : participants.user1;
                emitToUser(other, 'typing', { conversationId, fromUserId: userId, isTyping });
            }
            catch { }
        });
    });
}
function emitToUser(userId, event, data) {
    if (!io)
        return;
    const set = userSockets.get(String(userId));
    if (!set)
        return;
    for (const sid of set)
        io.to(sid).emit(event, data);
}
function getIO() {
    return io;
}
//# sourceMappingURL=socket.js.map