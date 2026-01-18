"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserPreference = void 0;
const sequelize_1 = require("sequelize");
const User_1 = require("./User");
class UserPreference extends sequelize_1.Model {
    static initialize(sequelize) {
        return UserPreference.init({
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
            preferenceType: {
                type: sequelize_1.DataTypes.ENUM('time', 'type', 'special', 'distance', 'interest'),
                allowNull: false,
            },
            preferenceValue: {
                type: sequelize_1.DataTypes.STRING,
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
        }, {
            sequelize,
            tableName: 'user_preferences',
            timestamps: true,
            indexes: [
                { fields: ['userId'] },
                { fields: ['preferenceType'] },
                { fields: ['userId', 'preferenceType', 'preferenceValue'], unique: true },
            ],
        });
    }
    static associate() {
        UserPreference.belongsTo(User_1.User, { foreignKey: 'userId' });
    }
}
exports.UserPreference = UserPreference;
exports.default = UserPreference;
//# sourceMappingURL=UserPreference.js.map