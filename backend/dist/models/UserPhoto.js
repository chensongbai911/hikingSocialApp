import { DataTypes, Model } from 'sequelize';
import { User } from './User';
export class UserPhoto extends Model {
    static initialize(sequelize) {
        return UserPhoto.init({
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
            photoUrl: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            sortOrder: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
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
            tableName: 'user_photos',
            timestamps: true,
            indexes: [
                { fields: ['userId'] },
                { fields: ['userId', 'sortOrder'] },
            ],
        });
    }
    static associate() {
        UserPhoto.belongsTo(User, { foreignKey: 'userId' });
    }
}
export default UserPhoto;
//# sourceMappingURL=UserPhoto.js.map