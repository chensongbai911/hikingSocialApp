"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const sequelize_1 = require("sequelize");
class User extends sequelize_1.Model {
    static initialize(sequelize) {
        return User.init({
            id: {
                type: sequelize_1.DataTypes.STRING(36),
                primaryKey: true,
                allowNull: false,
            },
            email: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
                unique: true,
                validate: {
                    isEmail: true,
                },
            },
            passwordHash: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
            },
            nickname: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
            },
            avatarUrl: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true,
            },
            gender: {
                type: sequelize_1.DataTypes.ENUM('male', 'female', 'other'),
                allowNull: true,
            },
            age: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
            },
            bio: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true,
            },
            hikingLevel: {
                type: sequelize_1.DataTypes.ENUM('beginner', 'intermediate', 'advanced', 'expert'),
                allowNull: true,
                defaultValue: 'beginner',
            },
            isActive: {
                type: sequelize_1.DataTypes.BOOLEAN,
                defaultValue: true,
                allowNull: false,
            },
            isVerified: {
                type: sequelize_1.DataTypes.BOOLEAN,
                defaultValue: false,
                allowNull: false,
            },
            createdAt: {
                type: sequelize_1.DataTypes.DATE,
                defaultValue: sequelize_1.DataTypes.NOW,
            },
            updatedAt: {
                type: sequelize_1.DataTypes.DATE,
                defaultValue: sequelize_1.DataTypes.NOW,
            },
            deletedAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
            },
        }, {
            sequelize,
            tableName: 'users',
            timestamps: true,
            paranoid: true, // 启用软删除
            underscored: true, // 自动将驼峰转为下划线
            indexes: [
                { fields: ['email'] },
                { fields: ['created_at'] },
                { fields: ['hiking_level'] },
            ],
        });
    }
}
exports.User = User;
exports.default = User;
//# sourceMappingURL=User.js.map