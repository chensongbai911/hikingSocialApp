import { MessageService } from '../services/MessageService';
import { chatPolicyService } from '../services/ChatPolicyService';
import { pool } from '../config/database';
import { emitToUser } from '../realtime/socket';
import { businessError, validationError } from '../utils/response';
import { BusinessErrorCode } from '../types/api.types';
const messageService = new MessageService();
/**
 * 消息控制�?- 处理聊天相关�?REST API 请求
 */
export class MessageController {
    /**
     * 获取用户的对话列�?   * GET /api/v1/messages/conversations
     */
    static async getConversations(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return businessError(res, BusinessErrorCode.UNAUTHORIZED, '未授权访问');
            }
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            if (page < 1 || limit < 1 || limit > 100) {
                return validationError(res, '分页参数无效');
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
                return businessError(res, BusinessErrorCode.UNAUTHORIZED, '未授权访问');
            }
            const conversationId = parseInt(req.params.conversationId);
            if (!conversationId || isNaN(conversationId)) {
                return validationError(res, '无效的对话ID');
            }
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 50;
            if (page < 1 || limit < 1 || limit > 100) {
                return validationError(res, '分页参数无效');
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
     * 获取或创建对�?   * POST /api/v1/messages/conversations
     */
    static async createConversation(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return businessError(res, BusinessErrorCode.UNAUTHORIZED, '未授权访问');
            }
            const { targetUserId } = req.body;
            if (!targetUserId || isNaN(targetUserId)) {
                return validationError(res, '缺少目标用户ID');
            }
            if (userId === targetUserId) {
                return validationError(res, '不能与自己创建对话');
            }
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
                return businessError(res, BusinessErrorCode.UNAUTHORIZED, '未授权访问');
            }
            const conversationId = parseInt(req.params.conversationId);
            if (!conversationId || isNaN(conversationId)) {
                return validationError(res, '无效的对话ID');
            }
            const { content, contentType = 'text', imageUrl, fileUrl, } = req.body;
            if (!['text', 'image', 'file'].includes(contentType)) {
                return validationError(res, '无效的消息类型');
            }
            // 校验消息内容/附件：
            // - 文本消息: 必须有非空 content，且不超过 200 字符
            // - 图片/文件消息: 允许 content 为空，但必须提供对应的 URL
            if (contentType === 'text') {
                if (!content || content.trim().length === 0) {
                    return validationError(res, '消息内容不能为空');
                }
                if (content.length > 200) {
                    return validationError(res, '文本消息长度不能超过200字符');
                }
            }
            else if (contentType === 'image') {
                if (!imageUrl || typeof imageUrl !== 'string') {
                    return validationError(res, '图片消息缺少图片地址');
                }
                if (content && content.length > 200) {
                    return validationError(res, '图片说明文本长度不能超过200字符');
                }
            }
            else if (contentType === 'file') {
                if (!fileUrl || typeof fileUrl !== 'string') {
                    return validationError(res, '文件消息缺少文件地址');
                }
                if (content && content.length > 200) {
                    return validationError(res, '文件说明文本长度不能超过200字符');
                }
            }
            // 发送前策略校验：黑名单、关注关系、3条限制
            const precheck = await chatPolicyService.precheckSend(conversationId, String(userId));
            if (!precheck.canSend) {
                const reason = precheck.reason || 'cannot_send';
                return businessError(res, BusinessErrorCode.FORBIDDEN, reason);
            }
            const message = await messageService.sendMessage(conversationId, userId, content, contentType, imageUrl, fileUrl);
            // 单向关注限制：计数+1
            if (!precheck.isMutualFollow && precheck.remainingMessages !== undefined) {
                await chatPolicyService.incrementLimit(conversationId, String(userId));
            }
            // 推送新消息给对方
            if (precheck.receiverId) {
                emitToUser(String(precheck.receiverId), 'new_message', {
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
                return businessError(res, BusinessErrorCode.UNAUTHORIZED, '未授权访问');
            }
            const messageId = parseInt(req.params.messageId);
            if (!messageId || isNaN(messageId)) {
                return validationError(res, '无效的消息ID');
            }
            const [rows] = await pool.query('SELECT id, sender_id, created_at, is_recalled FROM messages WHERE id = ? LIMIT 1', [messageId]);
            if (!rows || rows.length === 0) {
                return businessError(res, BusinessErrorCode.RESOURCE_NOT_FOUND, '消息不存在');
            }
            const msg = rows[0];
            if (String(msg.sender_id) !== String(userId)) {
                return businessError(res, BusinessErrorCode.FORBIDDEN, '只能撤回自己发送的消息');
            }
            if (msg.is_recalled) {
                return validationError(res, '消息已撤回');
            }
            const createdAt = new Date(msg.created_at).getTime();
            const now = Date.now();
            if (now - createdAt > 120000) {
                return businessError(res, BusinessErrorCode.FORBIDDEN, 'recall_window_closed');
            }
            await pool.query('UPDATE messages SET is_recalled = TRUE, recalled_at = NOW(), recalled_by = ? WHERE id = ?', [userId, messageId]);
            // 推送撤回事件给双方
            const [convRows] = await pool.query('SELECT conversation_id FROM messages WHERE id = ? LIMIT 1', [messageId]);
            const conversationId = convRows?.[0]?.conversation_id;
            if (conversationId) {
                const { user1, user2 } = await chatPolicyService.getConversationParticipants(conversationId);
                emitToUser(String(user1), 'message_recalled', { messageId, conversationId, recalledAt: new Date().toISOString() });
                emitToUser(String(user2), 'message_recalled', { messageId, conversationId, recalledAt: new Date().toISOString() });
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
                return businessError(res, BusinessErrorCode.UNAUTHORIZED, '未授权访问');
            }
            const messageId = parseInt(req.params.messageId);
            if (!messageId || isNaN(messageId)) {
                return validationError(res, '无效的消息ID');
            }
            const { reason, extra } = req.body || {};
            if (!reason || typeof reason !== 'string') {
                return validationError(res, '缺少举报原因');
            }
            await pool.query('INSERT INTO message_reports (message_id, reporter_id, reason, extra) VALUES (?, ?, ?, ?)', [messageId, String(userId), reason, extra ? JSON.stringify(extra) : null]);
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
                return businessError(res, BusinessErrorCode.UNAUTHORIZED, '未授权访问');
            const targetUserId = req.params.targetUserId;
            if (!targetUserId)
                return validationError(res, '缺少目标用户');
            await pool.query('INSERT INTO user_blacklist (user_id, blocked_user_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE user_id = user_id', [String(userId), String(targetUserId)]);
            // 推送黑名单更新给双方
            emitToUser(String(userId), 'blacklist_updated', { userId: String(userId), targetUserId: String(targetUserId), action: 'added' });
            emitToUser(String(targetUserId), 'blacklist_updated', { userId: String(userId), targetUserId: String(targetUserId), action: 'added' });
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
                return businessError(res, BusinessErrorCode.UNAUTHORIZED, '未授权访问');
            const targetUserId = req.params.targetUserId;
            if (!targetUserId)
                return validationError(res, '缺少目标用户');
            await pool.query('DELETE FROM user_blacklist WHERE user_id = ? AND blocked_user_id = ?', [String(userId), String(targetUserId)]);
            // 推送黑名单更新给双方
            emitToUser(String(userId), 'blacklist_updated', { userId: String(userId), targetUserId: String(targetUserId), action: 'removed' });
            emitToUser(String(targetUserId), 'blacklist_updated', { userId: String(userId), targetUserId: String(targetUserId), action: 'removed' });
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
                return businessError(res, BusinessErrorCode.UNAUTHORIZED, '未授权访问');
            const [rows] = await pool.query('SELECT blocked_user_id FROM user_blacklist WHERE user_id = ?', [String(userId)]);
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
                return businessError(res, BusinessErrorCode.UNAUTHORIZED, '未授权访问');
            }
            const messageId = parseInt(req.params.messageId);
            if (!messageId || isNaN(messageId)) {
                return validationError(res, '无效的消息ID');
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
                return businessError(res, BusinessErrorCode.UNAUTHORIZED, '未授权访问');
            }
            const conversationId = parseInt(req.params.conversationId);
            if (!conversationId || isNaN(conversationId)) {
                return validationError(res, '无效的对话ID');
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
                return businessError(res, BusinessErrorCode.UNAUTHORIZED, '未授权访问');
            }
            const messageId = parseInt(req.params.messageId);
            if (!messageId || isNaN(messageId)) {
                return validationError(res, '无效的消息ID');
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
                return businessError(res, BusinessErrorCode.UNAUTHORIZED, '未授权访问');
            }
            const conversationId = parseInt(req.params.conversationId);
            if (!conversationId || isNaN(conversationId)) {
                return validationError(res, '无效的对话ID');
            }
            // 校验参与者
            const [convRows] = await pool.query('SELECT id, user_id1, user_id2 FROM conversations WHERE id = ? LIMIT 1', [conversationId]);
            if (!convRows || convRows.length === 0) {
                return businessError(res, BusinessErrorCode.RESOURCE_NOT_FOUND, '对话不存在');
            }
            const conv = convRows[0];
            if (String(conv.user_id1) !== String(userId) && String(conv.user_id2) !== String(userId)) {
                return businessError(res, BusinessErrorCode.FORBIDDEN, '用户不是对话的参与者');
            }
            // 事务：归档 -> 删除消息 -> 重置对话 -> 清理限制
            const conn = await pool.getConnection();
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
                return businessError(res, BusinessErrorCode.UNAUTHORIZED, '未授权访问');
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
                return businessError(res, BusinessErrorCode.UNAUTHORIZED, '未授权访问');
            }
            const conversationId = parseInt(req.params.conversationId);
            if (!conversationId || isNaN(conversationId)) {
                return validationError(res, '无效的对话ID');
            }
            const keyword = req.query.keyword;
            if (!keyword || keyword.trim().length === 0) {
                return validationError(res, '缺少搜索关键词');
            }
            if (keyword.length > 100) {
                return validationError(res, '搜索关键词长度不能超过100个字符');
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
                return businessError(res, BusinessErrorCode.UNAUTHORIZED, '未授权访问');
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
//# sourceMappingURL=MessageController.js.map