import { Message } from '../models/Message';
import { Conversation } from '../models/Conversation';
/**
 * 消息服务 - 处理聊天消息的业务逻辑
 */
export declare class MessageService {
    /**
     * 获取或创建对话
     */
    getOrCreateConversation(userId1: number, userId2: number): Promise<Conversation>;
    /**
     * 获取用户的对话列表
     */
    getConversations(userId: number, page?: number, limit?: number): Promise<{
        conversations: Conversation[];
        total: number;
        totalPages: number;
    }>;
    /**
     * 获取对话的消息列表
     */
    getMessages(conversationId: number, page?: number, limit?: number): Promise<{
        messages: Message[];
        total: number;
        totalPages: number;
    }>;
    /**
     * 发送消息
     */
    sendMessage(conversationId: number, senderId: number, content: string, contentType?: 'text' | 'image' | 'file', imageUrl?: string, fileUrl?: string): Promise<Message>;
    /**
     * 标记消息为已读
     */
    markMessageAsRead(messageId: number): Promise<Message>;
    /**
     * 标记对话的所有消息为已读
     */
    markConversationAsRead(conversationId: number, userId: number): Promise<void>;
    /**
     * 删除消息（软删除）
     */
    deleteMessage(messageId: number): Promise<void>;
    /**
     * 获取未读消息数量
     */
    getUnreadCount(userId: number): Promise<number>;
    /**
     * 搜索消息
     */
    searchMessages(conversationId: number, keyword: string, limit?: number): Promise<Message[]>;
    /**
     * 获取用户的所有对话统计信息
     */
    getConversationStats(userId: number): Promise<{
        totalConversations: number;
        totalUnreadMessages: number;
        onlineConversations: number;
    }>;
}
//# sourceMappingURL=MessageService.d.ts.map