"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Conversation = void 0;
const sequelize_1 = require("sequelize");
class Conversation extends sequelize_1.Model {
    static initialize(sequelize) {
        return Conversation.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            userId1: {
                type: sequelize_1.DataTypes.STRING(36),
                allowNull: false,
            },
            userId2: {
                type: sequelize_1.DataTypes.STRING(36),
                allowNull: false,
            },
            lastMessageId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
            },
            lastMessageAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
            },
            lastMessageContent: {
                type: sequelize_1.DataTypes.STRING(255),
                allowNull: true,
            },
            user1UnreadCount: {
                type: sequelize_1.DataTypes.INTEGER,
                defaultValue: 0,
            },
            user2UnreadCount: {
                type: sequelize_1.DataTypes.INTEGER,
                defaultValue: 0,
            },
            deletedAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
            },
            createdAt: {
                type: sequelize_1.DataTypes.DATE,
                defaultValue: sequelize_1.DataTypes.NOW,
            },
            updatedAt: {
                type: sequelize_1.DataTypes.DATE,
                defaultValue: sequelize_1.DataTypes.NOW,
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
exports.Conversation = Conversation;
exports.default = Conversation;
//# sourceMappingURL=Conversation.js.map