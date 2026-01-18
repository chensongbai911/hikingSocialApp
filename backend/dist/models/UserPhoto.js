"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserPhoto = void 0;
const sequelize_1 = require("sequelize");
const User_1 = require("./User");
class UserPhoto extends sequelize_1.Model {
    static initialize(sequelize) {
        return UserPhoto.init({
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
            photoUrl: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
            },
            sortOrder: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
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
            tableName: 'user_photos',
            timestamps: true,
            indexes: [
                { fields: ['userId'] },
                { fields: ['userId', 'sortOrder'] },
            ],
        });
    }
    static associate() {
        UserPhoto.belongsTo(User_1.User, { foreignKey: 'userId' });
    }
}
exports.UserPhoto = UserPhoto;
exports.default = UserPhoto;
//# sourceMappingURL=UserPhoto.js.map