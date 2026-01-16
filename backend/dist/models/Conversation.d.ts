import { Model, Sequelize } from 'sequelize';
/**
 * 对话模型
 * 存储用户之间的对话关系和最后消息信息
 */
export interface ConversationAttributes {
    id: number;
    userId1: string;
    userId2: string;
    lastMessageId: number | null;
    lastMessageAt: Date | null;
    lastMessageContent: string | null;
    user1UnreadCount: number;
    user2UnreadCount: number;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}
export declare class Conversation extends Model<ConversationAttributes> implements ConversationAttributes {
    id: number;
    userId1: string;
    userId2: string;
    lastMessageId: number | null;
    lastMessageAt: Date | null;
    lastMessageContent: string | null;
    user1UnreadCount: number;
    user2UnreadCount: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    deletedAt: Date | null;
    static initialize(sequelize: Sequelize): typeof Conversation;
    static associate(): void;
}
export default Conversation;
//# sourceMappingURL=Conversation.d.ts.map