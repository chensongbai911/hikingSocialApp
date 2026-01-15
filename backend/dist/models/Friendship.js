import { DataTypes, Model } from 'sequelize';
import { User } from './User';
export class Friendship extends Model {
    static initialize(sequelize) {
        return Friendship.init({
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            userId: {
                type: DataTypes.STRING(36),
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            friendId: {
                type: DataTypes.STRING(36),
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            status: {
                type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'blocked'),
                allowNull: false,
                defaultValue: 'pending',
            },
            initiatedBy: {
                type: DataTypes.STRING(36),
                allowNull: false,
                comment: '发起请求的用户ID',
            },
            message: {
                type: DataTypes.TEXT,
                allowNull: true,
                comment: '好友请求附言',
            },
            acceptedAt: {
                type: DataTypes.DATE,
                allowNull: true,
                comment: '接受时间',
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
        Friendship.belongsTo(User, { foreignKey: 'userId', as: 'user' });
        Friendship.belongsTo(User, { foreignKey: 'friendId', as: 'friend' });
    }
}
export default Friendship;
//# sourceMappingURL=Friendship.js.map