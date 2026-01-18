"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Participation = void 0;
const sequelize_1 = require("sequelize");
const User_1 = require("./User");
const Activity_1 = require("./Activity");
class Participation extends sequelize_1.Model {
    static initialize(sequelize) {
        return Participation.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            userId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            activityId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'activities',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            status: {
                type: sequelize_1.DataTypes.ENUM('joined', 'completed', 'cancelled'),
                allowNull: false,
                defaultValue: 'joined',
            },
            joinedAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
                defaultValue: sequelize_1.DataTypes.NOW,
            },
            completedAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
            },
            cancelledAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
            },
            feedback: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true,
            },
            rating: {
                type: sequelize_1.DataTypes.DECIMAL(2, 1),
                allowNull: true,
                validate: {
                    min: 0,
                    max: 5,
                },
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
            tableName: 'participations',
            timestamps: true,
            indexes: [
                { fields: ['userId'] },
                { fields: ['activityId'] },
                { fields: ['userId', 'activityId'], unique: true },
            ],
        });
    }
    static associate() {
        Participation.belongsTo(User_1.User, { foreignKey: 'userId' });
        Participation.belongsTo(Activity_1.Activity, { foreignKey: 'activityId' });
    }
}
exports.Participation = Participation;
exports.default = Participation;
//# sourceMappingURL=Participation.js.map