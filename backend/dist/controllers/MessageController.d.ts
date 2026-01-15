import { Request, Response, NextFunction } from 'express';
/**
 * 消息控制器 - 处理聊天相关的 REST API 请求
 */
export declare class MessageController {
    /**
     * 获取用户的对话列表
     * GET /api/v1/messages/conversations
     */
    static getConversations(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * 获取对话的消息列表
     * GET /api/v1/messages/conversations/:conversationId
     */
    static getMessages(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * 获取或创建对话
     * POST /api/v1/messages/conversations
     */
    static createConversation(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * 发送消息
     * POST /api/v1/messages/conversations/:conversationId/messages
     */
    static sendMessage(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * 标记消息为已读
     * PUT /api/v1/messages/:messageId/read
     */
    static markAsRead(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * 标记对话的所有消息为已读
     * PUT /api/v1/messages/conversations/:conversationId/read-all
     */
    static markConversationAsRead(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * 删除消息
     * DELETE /api/v1/messages/:messageId
     */
    static deleteMessage(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * 获取未读消息数
     * GET /api/v1/messages/unread-count
     */
    static getUnreadCount(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * 搜索消息
     * GET /api/v1/messages/conversations/:conversationId/search
     */
    static searchMessages(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * 获取对话统计信息
     * GET /api/v1/messages/stats
     */
    static getStats(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=MessageController.d.ts.map