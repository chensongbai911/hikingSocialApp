"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Friendship = void 0;
const sequelize_1 = require("sequelize");
const User_1 = require("./User");
class Friendship extends sequelize_1.Model {
    static initialize(sequelize) {
        return Friendship.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            userId: {
                type: sequelize_1.DataTypes.STRING(36),
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            friendId: {
                type: sequelize_1.DataTypes.STRING(36),
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            status: {
                type: sequelize_1.DataTypes.ENUM('pending', 'accepted', 'rejected', 'blocked'),
                allowNull: false,
                defaultValue: 'pending',
            },
            initiatedBy: {
                type: sequelize_1.DataTypes.STRING(36),
                allowNull: false,
                comment: '发起请求的用户ID',
            },
            message: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true,
                comment: '好友请求附言',
            },
            acceptedAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
                comment: '接受时间',
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
            tableName: 'friendships',
            timestamps: true,
            indexes: [
                { fields: ['userId'] },
                { fields: ['friendId'] },
                { fields: ['status'] },
                {
                    fields: ['userId', 'friendId'],
                    unique: true,
                    name: 'unique_friendship',
                },
            ],
        });
    }
    static associate() {
        Friendship.belongsTo(User_1.User, { foreignKey: 'userId', as: 'user' });
        Friendship.belongsTo(User_1.User, { foreignKey: 'friendId', as: 'friend' });
    }
}
exports.Friendship = Friendship;
exports.default = Friendship;
//# sourceMappingURL=Friendship.js.map