import { DataTypes, Model, } from 'sequelize';
export class Conversation extends Model {
    static initialize(sequelize) {
        return Conversation.init({
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            userId1: {
                type: DataTypes.STRING(36),
                allowNull: false,
            },
            userId2: {
                type: DataTypes.STRING(36),
                allowNull: false,
            },
            lastMessageId: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            lastMessageAt: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            lastMessageContent: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            user1UnreadCount: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
            },
            user2UnreadCount: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
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
            tableName: 'conversations',
            timestamps: true,
            underscored: true,
            paranoid: false,
        });
    }
    static associate() {
        // 关联关系将在 database.ts 中配置
    }
}
export default Conversation;
//# sourceMappingURL=Conversation.js.map