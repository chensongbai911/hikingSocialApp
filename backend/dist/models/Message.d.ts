import { Model, Sequelize } from 'sequelize';
/**
 * 消息模型
 * 存储用户之间的聊天消息记录
 */
export interface MessageAttributes {
    id: number;
    conversationId: number;
    senderId: string;
    content: string;
    contentType: 'text' | 'image' | 'file';
    imageUrl: string | null;
    fileUrl: string | null;
    isRead: boolean;
    readAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}
export declare class Message extends Model<MessageAttributes> implements MessageAttributes {
    id: number;
    conversationId: number;
    senderId: string;
    content: string;
    contentType: 'text' | 'image' | 'file';
    imageUrl: string | null;
    fileUrl: string | null;
    isRead: boolean;
    readAt: Date | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    deletedAt: Date | null;
    static initialize(sequelize: Sequelize): typeof Message;
    static associate(): void;
}
export default Message;
//# sourceMappingURL=Message.d.ts.map