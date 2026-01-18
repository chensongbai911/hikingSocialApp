"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = void 0;
const sequelize_1 = require("sequelize");
class Message extends sequelize_1.Model {
    static initialize(sequelize) {
        return Message.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            conversationId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
            },
            senderId: {
                type: sequelize_1.DataTypes.STRING(36),
                allowNull: false,
            },
            content: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true,
            },
            contentType: {
                type: sequelize_1.DataTypes.ENUM('text', 'image', 'file'),
                defaultValue: 'text',
            },
            imageUrl: {
                type: sequelize_1.DataTypes.STRING(500),
                allowNull: true,
            },
            fileUrl: {
                type: sequelize_1.DataTypes.STRING(500),
                allowNull: true,
            },
            isRead: {
                type: sequelize_1.DataTypes.BOOLEAN,
                defaultValue: false,
            },
            readAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
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
exports.Message = Message;
exports.default = Message;
//# sourceMappingURL=Message.js.map