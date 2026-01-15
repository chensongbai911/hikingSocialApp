import { DataTypes, Model } from 'sequelize';
import { User } from './User';
export class Activity extends Model {
    static initialize(sequelize) {
        return Activity.init({
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            creatorId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                },
            },
            title: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            coverImageUrl: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            location: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            latitude: {
                type: DataTypes.DECIMAL(10, 8),
                allowNull: true,
            },
            longitude: {
                type: DataTypes.DECIMAL(11, 8),
                allowNull: true,
            },
            startTime: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            endTime: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            distance: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: true,
            },
            difficulty: {
                type: DataTypes.ENUM('easy', 'moderate', 'hard'),
                allowNull: false,
                defaultValue: 'moderate',
            },
            type: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            status: {
                type: DataTypes.ENUM('pending', 'approved', 'ongoing', 'completed', 'cancelled'),
                allowNull: false,
                defaultValue: 'pending',
            },
            routeDescription: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            equipmentRequired: {
                type: DataTypes.TEXT,
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
            deletedAt: {
                type: DataTypes.DATE,
                allowNull: true,
            },
        }, {
            sequelize,
            tableName: 'activities',
            timestamps: true,
            paranoid: true,
            indexes: [
                { fields: ['status'] },
                { fields: ['startTime'] },
                { fields: ['creatorId'] },
            ],
        });
    }
    static associate() {
        Activity.belongsTo(User, { foreignKey: 'creatorId', as: 'creator' });
    }
}
export default Activity;
//# sourceMappingURL=Activity.js.map