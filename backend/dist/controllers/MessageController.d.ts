import { Request, Response, NextFunction } from 'express';
/**
 * 消息控制�?- 处理聊天相关�?REST API 请求
 */
export declare class MessageController {
    /**
     * 获取用户的对话列�?   * GET /api/v1/messages/conversations
     */
    static getConversations(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * 获取对话的消息列�?   * GET /api/v1/messages/conversations/:conversationId
     */
    static getMessages(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * 获取对话信息与限制状态
     * GET /api/v1/messages/conversations/:conversationId/info
     */
    static getConversationInfo(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * 获取或创建对�?   * POST /api/v1/messages/conversations
     */
    static createConversation(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * 发送消�?   * POST /api/v1/messages/conversations/:conversationId/messages
     */
    static sendMessage(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * 撤回消息（2分钟内）
     * POST /api/v1/messages/:messageId/recall
     */
    static recallMessage(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * 举报消息
     * POST /api/v1/messages/:messageId/report
     */
    static reportMessage(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * 加入黑名单
     * POST /api/v1/messages/blacklist/:targetUserId
     */
    static addToBlacklist(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * 移出黑名单
     * DELETE /api/v1/messages/blacklist/:targetUserId
     */
    static removeFromBlacklist(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * 获取黑名单
     * GET /api/v1/messages/blacklist
     */
    static getBlacklist(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * 标记消息为已�?   * PUT /api/v1/messages/:messageId/read
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
     * 清空对话（归档后删除消息，重置未读与最后消息）
     * DELETE /api/v1/messages/conversations/:conversationId
     */
    static clearConversation(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * 获取未读消息�?   * GET /api/v1/messages/unread-count
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