"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Application = void 0;
const sequelize_1 = require("sequelize");
const User_1 = require("./User");
const Activity_1 = require("./Activity");
class Application extends sequelize_1.Model {
    static initialize(sequelize) {
        return Application.init({
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
            activityId: {
                type: sequelize_1.DataTypes.STRING(36),
                allowNull: false,
                references: {
                    model: 'activities',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            status: {
                type: sequelize_1.DataTypes.ENUM('pending', 'approved', 'rejected'),
                allowNull: false,
                defaultValue: 'pending',
            },
            message: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true,
                comment: '申请留言',
            },
            reviewedAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
                comment: '审核时间',
            },
            reviewedBy: {
                type: sequelize_1.DataTypes.STRING(36),
                allowNull: true,
                references: {
                    model: 'users',
                    key: 'id',
                },
                comment: '审核人ID',
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
            tableName: 'applications',
            timestamps: true,
            underscored: true, // 自动将驼峰转为下划线
            indexes: [
                { fields: ['user_id'] },
                { fields: ['activity_id'] },
                { fields: ['status'] },
                { fields: ['user_id', 'activity_id'], unique: true },
            ],
        });
    }
    static associate() {
        Application.belongsTo(User_1.User, { foreignKey: 'userId', as: 'applicant' });
        Application.belongsTo(User_1.User, { foreignKey: 'reviewedBy', as: 'reviewer' });
        Application.belongsTo(Activity_1.Activity, { foreignKey: 'activityId' });
    }
}
exports.Application = Application;
exports.default = Application;
//# sourceMappingURL=Application.js.map