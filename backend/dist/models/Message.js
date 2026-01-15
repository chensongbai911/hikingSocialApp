import { DataTypes, Model, } from 'sequelize';
export class Message extends Model {
    static initialize(sequelize) {
        return Message.init({
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            conversationId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            senderId: {
                type: DataTypes.STRING(36),
                allowNull: false,
            },
            content: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            contentType: {
                type: DataTypes.ENUM('text', 'image', 'file'),
                defaultValue: 'text',
            },
            imageUrl: {
                type: DataTypes.STRING(500),
                allowNull: true,
            },
            fileUrl: {
                type: DataTypes.STRING(500),
                allowNull: true,
            },
            isRead: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            readAt: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            deletedAt: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            createdAt: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
            updatedAt: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
        }, {
            sequelize,
            tableName: 'messages',
            timestamps: true,
            underscored: true,
            paranoid: false,
        });
    }
    static associate() {
        // 关联关系将在 database.ts 中配置
    }
}
export default Message;
//# sourceMappingURL=Message.js.map