"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Activity = void 0;
const sequelize_1 = require("sequelize");
const User_1 = require("./User");
class Activity extends sequelize_1.Model {
    static initialize(sequelize) {
        return Activity.init({
            id: {
                type: sequelize_1.DataTypes.STRING(36),
                primaryKey: true,
                allowNull: false,
            },
            creatorId: {
                type: sequelize_1.DataTypes.STRING(36),
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                },
            },
            title: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
            },
            description: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: false,
            },
            coverImageUrl: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true,
            },
            location: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
            },
            latitude: {
                type: sequelize_1.DataTypes.DECIMAL(10, 8),
                allowNull: true,
            },
            longitude: {
                type: sequelize_1.DataTypes.DECIMAL(11, 8),
                allowNull: true,
            },
            startTime: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
            },
            endTime: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
            },
            // distance: {
            //   type: DataTypes.DECIMAL(10, 2),
            //   allowNull: true,
            // },
            difficulty: {
                type: sequelize_1.DataTypes.ENUM('easy', 'moderate', 'hard'),
                allowNull: false,
                defaultValue: 'moderate',
            },
            // type: {
            //   type: DataTypes.STRING,
            //   allowNull: true,
            // },
            status: {
                type: sequelize_1.DataTypes.ENUM('pending', 'approved', 'ongoing', 'completed', 'cancelled'),
                allowNull: false,
                defaultValue: 'pending',
            },
            routeDescription: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true,
            },
            equipmentRequired: {
                type: sequelize_1.DataTypes.TEXT,
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
            deletedAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
            },
        }, {
            sequelize,
            tableName: 'activities',
            timestamps: true,
            paranoid: true,
            underscored: true, // 自动将驼峰转为下划线
            indexes: [
                { fields: ['status'] },
                { fields: ['start_time'] },
                { fields: ['creator_id'] },
            ],
        });
    }
    static associate() {
        Activity.belongsTo(User_1.User, { foreignKey: 'creatorId', as: 'creator' });
    }
}
exports.Activity = Activity;
exports.default = Activity;
//# sourceMappingURL=Activity.js.map