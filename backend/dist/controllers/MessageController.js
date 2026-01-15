import { MessageService } from '../services/MessageService';
import { AppError } from '../middleware/errorHandler';
const messageService = new MessageService();
/**
 * 消息控制器 - 处理聊天相关的 REST API 请求
 */
export class MessageController {
    /**
     * 获取用户的对话列表
     * GET /api/v1/messages/conversations
     */
    static async getConversations(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new AppError('未授权访问', 401);
            }
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            if (page < 1 || limit < 1 || limit > 100) {
                throw new AppError('分页参数无效', 400);
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
     * 获取对话的消息列表
     * GET /api/v1/messages/conversations/:conversationId
     */
    static async getMessages(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new AppError('未授权访问', 401);
            }
            const conversationId = parseInt(req.params.conversationId);
            if (!conversationId || isNaN(conversationId)) {
                throw new AppError('无效的对话ID', 400);
            }
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 50;
            if (page < 1 || limit < 1 || limit > 100) {
                throw new AppError('分页参数无效', 400);
            }
            const result = await messageService.getMessages(conversationId, page, limit);
            // 自动标记为已读
            await messageService.markConversationAsRead(conversationId, userId);
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
     * 获取或创建对话
     * POST /api/v1/messages/conversations
     */
    static async createConversation(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new AppError('未授权访问', 401);
            }
            const { targetUserId } = req.body;
            if (!targetUserId || isNaN(targetUserId)) {
                throw new AppError('缺少目标用户ID', 400);
            }
            if (userId === targetUserId) {
                throw new AppError('不能与自己创建对话', 400);
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
     * 发送消息
     * POST /api/v1/messages/conversations/:conversationId/messages
     */
    static async sendMessage(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new AppError('未授权访问', 401);
            }
            const conversationId = parseInt(req.params.conversationId);
            if (!conversationId || isNaN(conversationId)) {
                throw new AppError('无效的对话ID', 400);
            }
            const { content, contentType = 'text', imageUrl, fileUrl, } = req.body;
            if (!content || content.trim().length === 0) {
                throw new AppError('消息内容不能为空', 400);
            }
            if (!['text', 'image', 'file'].includes(contentType)) {
                throw new AppError('无效的消息类型', 400);
            }
            if (contentType === 'text' && content.length > 5000) {
                throw new AppError('文本消息长度不能超过5000字符', 400);
            }
            const message = await messageService.sendMessage(conversationId, userId, content, contentType, imageUrl, fileUrl);
            res.json({
                code: 0,
                message: '发送消息成功',
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
     * 标记消息为已读
     * PUT /api/v1/messages/:messageId/read
     */
    static async markAsRead(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new AppError('未授权访问', 401);
            }
            const messageId = parseInt(req.params.messageId);
            if (!messageId || isNaN(messageId)) {
                throw new AppError('无效的消息ID', 400);
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
                throw new AppError('未授权访问', 401);
            }
            const conversationId = parseInt(req.params.conversationId);
            if (!conversationId || isNaN(conversationId)) {
                throw new AppError('无效的对话ID', 400);
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
                throw new AppError('未授权访问', 401);
            }
            const messageId = parseInt(req.params.messageId);
            if (!messageId || isNaN(messageId)) {
                throw new AppError('无效的消息ID', 400);
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
     * 获取未读消息数
     * GET /api/v1/messages/unread-count
     */
    static async getUnreadCount(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new AppError('未授权访问', 401);
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
                throw new AppError('未授权访问', 401);
            }
            const conversationId = parseInt(req.params.conversationId);
            if (!conversationId || isNaN(conversationId)) {
                throw new AppError('无效的对话ID', 400);
            }
            const keyword = req.query.keyword;
            if (!keyword || keyword.trim().length === 0) {
                throw new AppError('缺少搜索关键词', 400);
            }
            if (keyword.length > 100) {
                throw new AppError('搜索关键词长度不能超过100个字符', 400);
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
                throw new AppError('未授权访问', 401);
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