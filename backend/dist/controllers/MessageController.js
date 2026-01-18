"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageController = void 0;
const MessageService_1 = require("../services/MessageService");
const ChatPolicyService_1 = require("../services/ChatPolicyService");
const database_1 = require("../config/database");
const socket_1 = require("../realtime/socket");
const response_1 = require("../utils/response");
const api_types_1 = require("../types/api.types");
const messageService = new MessageService_1.MessageService();
/**
 * 消息控制�?- 处理聊天相关�?REST API 请求
 */
class MessageController {
    /**
     * 获取用户的对话列�?   * GET /api/v1/messages/conversations
     */
    static async getConversations(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return (0, response_1.businessError)(res, api_types_1.BusinessErrorCode.UNAUTHORIZED, '未授权访问');
            }
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            if (page < 1 || limit < 1 || limit > 100) {
                return (0, response_1.validationError)(res, '分页参数无效');
            }
            const result = await messageService.getConversations(userId, page, limit);
            res.json({
                code: 0,
                message: '获取对话列表成功',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * 获取对话的消息列�?   * GET /api/v1/messages/conversations/:conversationId
     */
    static async getMessages(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return (0, response_1.businessError)(res, api_types_1.BusinessErrorCode.UNAUTHORIZED, '未授权访问');
            }
            const conversationId = parseInt(req.params.conversationId);
            if (!conversationId || isNaN(conversationId)) {
                return (0, response_1.validationError)(res, '无效的对话ID');
            }
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 50;
            if (page < 1 || limit < 1 || limit > 100) {
                return (0, response_1.validationError)(res, '分页参数无效');
            }
            const result = await messageService.getMessages(conversationId, page, limit);
            // 自动标记为已�?      await messageService.markConversationAsRead(conversationId, userId)
            res.json({
                code: 0,
                message: '获取消息列表成功',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * 获取对话信息与限制状态
     * GET /api/v1/messages/conversations/:conversationId/info
     */
    static async getConversationInfo(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return (0, response_1.businessError)(res, api_types_1.BusinessErrorCode.UNAUTHORIZED, '未授权访问');
            }
            const conversationId = parseInt(req.params.conversationId);
            if (!conversationId || isNaN(conversationId)) {
                return (0, response_1.validationError)(res, '无效的对话ID');
            }
            // 取参与者 & 预检查
            const precheck = await ChatPolicyService_1.chatPolicyService.precheckSend(conversationId, String(userId));
            const isBlack = await ChatPolicyService_1.chatPolicyService.isBlacklisted(String(userId), String(precheck.receiverId));
            res.json({
                code: 0,
                data: {
                    conversationId,
                    otherUserId: precheck.receiverId,
                    isLimited: !precheck.isMutualFollow && (precheck.remainingMessages ?? 3) < 3,
                    limitReason: precheck.isMutualFollow ? null : 'not_mutual_follow',
                    messageCount: precheck.remainingMessages !== undefined ? 3 - (precheck.remainingMessages || 0) : 0,
                    remainingMessages: precheck.remainingMessages,
                    canSend: precheck.canSend,
                    relationshipType: precheck.isMutualFollow ? 'mutual' : (precheck.canSend ? 'one_way' : 'none'),
                    isBlacklisted: isBlack,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * 获取或创建对�?   * POST /api/v1/messages/conversations
     */
    static async createConversation(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return (0, response_1.businessError)(res, api_types_1.BusinessErrorCode.UNAUTHORIZED, '未授权访问');
            }
            const { targetUserId } = req.body;
            // 修复：targetUserId 是字符串格式（如 "user-004"），不应该用 isNaN 验证
            if (!targetUserId || typeof targetUserId !== 'string' || targetUserId.trim() === '') {
                return (0, response_1.validationError)(res, '缺少目标用户ID');
            }
            if (userId === targetUserId) {
                return (0, response_1.validationError)(res, '不能与自己创建对话');
            }
            try {
                const conversation = await messageService.getOrCreateConversation(userId, targetUserId);
                res.json({
                    code: 0,
                    message: '获取或创建对话成功',
                    data: {
                        conversation,
                    },
                });
            }
            catch (error) {
                console.error('创建对话失败:', error);
                return (0, response_1.businessError)(res, 2001, '创建对话失败: ' + (error.message || '未知错误'));
            }
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * 发送消�?   * POST /api/v1/messages/conversations/:conversationId/messages
     */
    static async sendMessage(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return (0, response_1.businessError)(res, api_types_1.BusinessErrorCode.UNAUTHORIZED, '未授权访问');
            }
            const conversationId = parseInt(req.params.conversationId);
            if (!conversationId || isNaN(conversationId)) {
                return (0, response_1.validationError)(res, '无效的对话ID');
            }
            const { content, contentType = 'text', imageUrl, fileUrl, } = req.body;
            if (!['text', 'image', 'file'].includes(contentType)) {
                return (0, response_1.validationError)(res, '无效的消息类型');
            }
            // 校验消息内容/附件：
            // - 文本消息: 必须有非空 content，且不超过 200 字符
            // - 图片/文件消息: 允许 content 为空，但必须提供对应的 URL
            if (contentType === 'text') {
                if (!content || content.trim().length === 0) {
                    return (0, response_1.validationError)(res, '消息内容不能为空');
                }
                if (content.length > 200) {
                    return (0, response_1.validationError)(res, '文本消息长度不能超过200字符');
                }
            }
            else if (contentType === 'image') {
                if (!imageUrl || typeof imageUrl !== 'string') {
                    return (0, response_1.validationError)(res, '图片消息缺少图片地址');
                }
                if (content && content.length > 200) {
                    return (0, response_1.validationError)(res, '图片说明文本长度不能超过200字符');
                }
            }
            else if (contentType === 'file') {
                if (!fileUrl || typeof fileUrl !== 'string') {
                    return (0, response_1.validationError)(res, '文件消息缺少文件地址');
                }
                if (content && content.length > 200) {
                    return (0, response_1.validationError)(res, '文件说明文本长度不能超过200字符');
                }
            }
            // 发送前策略校验：黑名单、关注关系、3条限制
            let precheck;
            try {
                precheck = await ChatPolicyService_1.chatPolicyService.precheckSend(conversationId, String(userId));
            }
            catch (err) {
                const msg = err?.message || '';
                if (msg.includes('对话不存在')) {
                    return (0, response_1.businessError)(res, api_types_1.BusinessErrorCode.RESOURCE_NOT_FOUND, '对话不存在或已被删除');
                }
                console.error('precheckSend error:', err);
                return (0, response_1.businessError)(res, api_types_1.BusinessErrorCode.FORBIDDEN, '无权发送此对话的消息');
            }
            if (!precheck || !precheck.canSend) {
                const reason = precheck?.reason || 'cannot_send';
                return (0, response_1.businessError)(res, api_types_1.BusinessErrorCode.FORBIDDEN, reason);
            }
            let message;
            try {
                message = await messageService.sendMessage(conversationId, userId, content, contentType, imageUrl, fileUrl);
            }
            catch (err) {
                const msg = err?.message || '';
                if (msg.includes('对话不存在')) {
                    return (0, response_1.businessError)(res, api_types_1.BusinessErrorCode.RESOURCE_NOT_FOUND, '对话不存在或已被删除');
                }
                if (msg.includes('用户不是对话的参与者')) {
                    return (0, response_1.businessError)(res, api_types_1.BusinessErrorCode.FORBIDDEN, '无权发送此对话的消息');
                }
                console.error('sendMessage error:', err);
                throw err;
            }
            // 单向关注限制：计数+1
            if (!precheck.isMutualFollow && precheck.remainingMessages !== undefined) {
                await ChatPolicyService_1.chatPolicyService.incrementLimit(conversationId, String(userId));
            }
            // 推送新消息给对方
            if (precheck.receiverId) {
                (0, socket_1.emitToUser)(String(precheck.receiverId), 'new_message', {
                    conversationId,
                    message,
                });
            }
            res.json({
                code: 0,
                message: '发送消息成功',
                data: {
                    message,
                    remainingMessages: precheck.remainingMessages !== undefined ? Math.max((precheck.remainingMessages || 0) - 1, 0) : undefined,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * 撤回消息（2分钟内）
     * POST /api/v1/messages/:messageId/recall
     */
    static async recallMessage(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return (0, response_1.businessError)(res, api_types_1.BusinessErrorCode.UNAUTHORIZED, '未授权访问');
            }
            const messageId = parseInt(req.params.messageId);
            if (!messageId || isNaN(messageId)) {
                return (0, response_1.validationError)(res, '无效的消息ID');
            }
            const [rows] = await database_1.pool.query('SELECT id, sender_id, created_at, is_recalled FROM messages WHERE id = ? LIMIT 1', [messageId]);
            if (!rows || rows.length === 0) {
                return (0, response_1.businessError)(res, api_types_1.BusinessErrorCode.RESOURCE_NOT_FOUND, '消息不存在');
            }
            const msg = rows[0];
            if (String(msg.sender_id) !== String(userId)) {
                return (0, response_1.businessError)(res, api_types_1.BusinessErrorCode.FORBIDDEN, '只能撤回自己发送的消息');
            }
            if (msg.is_recalled) {
                return (0, response_1.validationError)(res, '消息已撤回');
            }
            const createdAt = new Date(msg.created_at).getTime();
            const now = Date.now();
            if (now - createdAt > 120000) {
                return (0, response_1.businessError)(res, api_types_1.BusinessErrorCode.FORBIDDEN, 'recall_window_closed');
            }
            await database_1.pool.query('UPDATE messages SET is_recalled = TRUE, recalled_at = NOW(), recalled_by = ? WHERE id = ?', [userId, messageId]);
            // 推送撤回事件给双方
            const [convRows] = await database_1.pool.query('SELECT conversation_id FROM messages WHERE id = ? LIMIT 1', [messageId]);
            const conversationId = convRows?.[0]?.conversation_id;
            if (conversationId) {
                const { user1, user2 } = await ChatPolicyService_1.chatPolicyService.getConversationParticipants(conversationId);
                (0, socket_1.emitToUser)(String(user1), 'message_recalled', { messageId, conversationId, recalledAt: new Date().toISOString() });
                (0, socket_1.emitToUser)(String(user2), 'message_recalled', { messageId, conversationId, recalledAt: new Date().toISOString() });
            }
            res.json({ code: 0, message: '撤回成功', data: { messageId, recalledAt: new Date().toISOString() } });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * 举报消息
     * POST /api/v1/messages/:messageId/report
     */
    static async reportMessage(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return (0, response_1.businessError)(res, api_types_1.BusinessErrorCode.UNAUTHORIZED, '未授权访问');
            }
            const messageId = parseInt(req.params.messageId);
            if (!messageId || isNaN(messageId)) {
                return (0, response_1.validationError)(res, '无效的消息ID');
            }
            const { reason, extra } = req.body || {};
            if (!reason || typeof reason !== 'string') {
                return (0, response_1.validationError)(res, '缺少举报原因');
            }
            await database_1.pool.query('INSERT INTO message_reports (message_id, reporter_id, reason, extra) VALUES (?, ?, ?, ?)', [messageId, String(userId), reason, extra ? JSON.stringify(extra) : null]);
            res.json({ code: 0, message: '已接收举报' });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * 加入黑名单
     * POST /api/v1/messages/blacklist/:targetUserId
     */
    static async addToBlacklist(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId)
                return (0, response_1.businessError)(res, api_types_1.BusinessErrorCode.UNAUTHORIZED, '未授权访问');
            const targetUserId = req.params.targetUserId;
            if (!targetUserId)
                return (0, response_1.validationError)(res, '缺少目标用户');
            // 确保黑名单/限制表存在，避免本地开发缺表导致 500
            await ChatPolicyService_1.chatPolicyService.ensureTablesReady();
            await database_1.pool.query('INSERT INTO user_blacklist (user_id, blocked_user_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE user_id = user_id', [String(userId), String(targetUserId)]);
            // 推送黑名单更新给双方
            (0, socket_1.emitToUser)(String(userId), 'blacklist_updated', { userId: String(userId), targetUserId: String(targetUserId), action: 'added' });
            (0, socket_1.emitToUser)(String(targetUserId), 'blacklist_updated', { userId: String(userId), targetUserId: String(targetUserId), action: 'added' });
            res.json({ code: 0, message: '已加入黑名单' });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * 移出黑名单
     * DELETE /api/v1/messages/blacklist/:targetUserId
     */
    static async removeFromBlacklist(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId)
                return (0, response_1.businessError)(res, api_types_1.BusinessErrorCode.UNAUTHORIZED, '未授权访问');
            const targetUserId = req.params.targetUserId;
            if (!targetUserId)
                return (0, response_1.validationError)(res, '缺少目标用户');
            // 确保黑名单/限制表存在，避免本地开发缺表导致 500
            await ChatPolicyService_1.chatPolicyService.ensureTablesReady();
            await database_1.pool.query('DELETE FROM user_blacklist WHERE user_id = ? AND blocked_user_id = ?', [String(userId), String(targetUserId)]);
            // 推送黑名单更新给双方
            (0, socket_1.emitToUser)(String(userId), 'blacklist_updated', { userId: String(userId), targetUserId: String(targetUserId), action: 'removed' });
            (0, socket_1.emitToUser)(String(targetUserId), 'blacklist_updated', { userId: String(userId), targetUserId: String(targetUserId), action: 'removed' });
            res.json({ code: 0, message: '已移出黑名单' });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * 获取黑名单
     * GET /api/v1/messages/blacklist
     */
    static async getBlacklist(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId)
                return (0, response_1.businessError)(res, api_types_1.BusinessErrorCode.UNAUTHORIZED, '未授权访问');
            // 确保黑名单/限制表存在，避免本地开发缺表导致 500
            await ChatPolicyService_1.chatPolicyService.ensureTablesReady();
            const [rows] = await database_1.pool.query('SELECT blocked_user_id FROM user_blacklist WHERE user_id = ?', [String(userId)]);
            res.json({ code: 0, data: rows.map(r => r.blocked_user_id) });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * 标记消息为已�?   * PUT /api/v1/messages/:messageId/read
     */
    static async markAsRead(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return (0, response_1.businessError)(res, api_types_1.BusinessErrorCode.UNAUTHORIZED, '未授权访问');
            }
            const messageId = parseInt(req.params.messageId);
            if (!messageId || isNaN(messageId)) {
                return (0, response_1.validationError)(res, '无效的消息ID');
            }
            const message = await messageService.markMessageAsRead(messageId);
            res.json({
                code: 0,
                message: '标记为已读成功',
                data: {
                    message,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * 标记对话的所有消息为已读
     * PUT /api/v1/messages/conversations/:conversationId/read-all
     */
    static async markConversationAsRead(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return (0, response_1.businessError)(res, api_types_1.BusinessErrorCode.UNAUTHORIZED, '未授权访问');
            }
            const conversationId = parseInt(req.params.conversationId);
            if (!conversationId || isNaN(conversationId)) {
                return (0, response_1.validationError)(res, '无效的对话ID');
            }
            await messageService.markConversationAsRead(conversationId, userId);
            res.json({
                code: 0,
                message: '标记对话为已读成功',
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * 删除消息
     * DELETE /api/v1/messages/:messageId
     */
    static async deleteMessage(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return (0, response_1.businessError)(res, api_types_1.BusinessErrorCode.UNAUTHORIZED, '未授权访问');
            }
            const messageId = parseInt(req.params.messageId);
            if (!messageId || isNaN(messageId)) {
                return (0, response_1.validationError)(res, '无效的消息ID');
            }
            await messageService.deleteMessage(messageId);
            res.json({
                code: 0,
                message: '删除消息成功',
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * 清空对话（归档后删除消息，重置未读与最后消息）
     * DELETE /api/v1/messages/conversations/:conversationId
     */
    static async clearConversation(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return (0, response_1.businessError)(res, api_types_1.BusinessErrorCode.UNAUTHORIZED, '未授权访问');
            }
            const conversationId = parseInt(req.params.conversationId);
            if (!conversationId || isNaN(conversationId)) {
                return (0, response_1.validationError)(res, '无效的对话ID');
            }
            // 确保限制表存在，避免清空对话时缺表
            await ChatPolicyService_1.chatPolicyService.ensureTablesReady();
            // 校验参与者
            const [convRows] = await database_1.pool.query('SELECT id, user_id1, user_id2 FROM conversations WHERE id = ? LIMIT 1', [conversationId]);
            if (!convRows || convRows.length === 0) {
                return (0, response_1.businessError)(res, api_types_1.BusinessErrorCode.RESOURCE_NOT_FOUND, '对话不存在');
            }
            const conv = convRows[0];
            if (String(conv.user_id1) !== String(userId) && String(conv.user_id2) !== String(userId)) {
                return (0, response_1.businessError)(res, api_types_1.BusinessErrorCode.FORBIDDEN, '用户不是对话的参与者');
            }
            // 事务：归档 -> 删除消息 -> 重置对话 -> 清理限制
            const conn = await database_1.pool.getConnection();
            try {
                await conn.beginTransaction();
                // 将现有消息归档（逐条快照）
                await conn.query(`INSERT INTO messages_archive (conversation_id, original_message_id, snapshot, archived_reason)
           SELECT m.conversation_id, m.id,
                  JSON_OBJECT(
                    'id', m.id,
                    'sender_id', m.sender_id,
                    'receiver_id', m.receiver_id,
                    'content', m.content,
                    'message_type', m.message_type,
                    'is_read', m.is_read,
                    'created_at', DATE_FORMAT(m.created_at,'%Y-%m-%dT%H:%i:%sZ')
                  ) AS snapshot,
                  'conversation_cleared'
             FROM messages m WHERE m.conversation_id = ?`, [conversationId]);
                // 删除消息
                await conn.query('DELETE FROM messages WHERE conversation_id = ?', [conversationId]);
                // 重置对话统计
                await conn.query(`UPDATE conversations
             SET last_message_id = NULL,
                 last_message_at = NULL,
                 last_message_content = NULL,
                 user1_unread_count = 0,
                 user2_unread_count = 0
           WHERE id = ?`, [conversationId]);
                // 清理单向限制计数
                await conn.query('DELETE FROM message_limits WHERE conversation_id = ?', [conversationId]);
                await conn.commit();
            }
            catch (e) {
                await conn.rollback();
                throw e;
            }
            finally {
                conn.release();
            }
            res.json({ code: 0, message: '对话历史已清空并归档' });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * 获取未读消息�?   * GET /api/v1/messages/unread-count
     */
    static async getUnreadCount(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return (0, response_1.businessError)(res, api_types_1.BusinessErrorCode.UNAUTHORIZED, '未授权访问');
            }
            const count = await messageService.getUnreadCount(userId);
            res.json({
                code: 0,
                message: '获取未读消息数成功',
                data: {
                    count,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * 搜索消息
     * GET /api/v1/messages/conversations/:conversationId/search
     */
    static async searchMessages(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return (0, response_1.businessError)(res, api_types_1.BusinessErrorCode.UNAUTHORIZED, '未授权访问');
            }
            const conversationId = parseInt(req.params.conversationId);
            if (!conversationId || isNaN(conversationId)) {
                return (0, response_1.validationError)(res, '无效的对话ID');
            }
            const keyword = req.query.keyword;
            if (!keyword || keyword.trim().length === 0) {
                return (0, response_1.validationError)(res, '缺少搜索关键词');
            }
            if (keyword.length > 100) {
                return (0, response_1.validationError)(res, '搜索关键词长度不能超过100个字符');
            }
            const limit = parseInt(req.query.limit) || 20;
            const messages = await messageService.searchMessages(conversationId, keyword, limit);
            res.json({
                code: 0,
                message: '搜索消息成功',
                data: {
                    messages,
                    total: messages.length,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * 获取对话统计信息
     * GET /api/v1/messages/stats
     */
    static async getStats(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return (0, response_1.businessError)(res, api_types_1.BusinessErrorCode.UNAUTHORIZED, '未授权访问');
            }
            const stats = await messageService.getConversationStats(userId);
            res.json({
                code: 0,
                message: '获取对话统计信息成功',
                data: stats,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.MessageController = MessageController;
//# sourceMappingURL=MessageController.js.map