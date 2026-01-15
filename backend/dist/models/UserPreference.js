import { DataTypes, Model } from 'sequelize';
import { User } from './User';
export class UserPreference extends Model {
    static initialize(sequelize) {
        return UserPreference.init({
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            preferenceType: {
                type: DataTypes.ENUM('time', 'type', 'special', 'distance', 'interest'),
                allowNull: false,
            },
            preferenceValue: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            createdAt: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
            updatedAt: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
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
        UserPreference.belongsTo(User, { foreignKey: 'userId' });
    }
}
export default UserPreference;
//# sourceMappingURL=UserPreference.js.map