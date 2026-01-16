import { DataTypes, Model } from 'sequelize';
import { User } from './User';
import { Activity } from './Activity';
export class Application extends Model {
    static initialize(sequelize) {
        return Application.init({
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
            activityId: {
                type: DataTypes.STRING(36),
                allowNull: false,
                references: {
                    model: 'activities',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            status: {
                type: DataTypes.ENUM('pending', 'approved', 'rejected'),
                allowNull: false,
                defaultValue: 'pending',
            },
            message: {
                type: DataTypes.TEXT,
                allowNull: true,
                comment: '申请留言',
            },
            reviewedAt: {
                type: DataTypes.DATE,
                allowNull: true,
                comment: '审核时间',
            },
            reviewedBy: {
                type: DataTypes.STRING(36),
                allowNull: true,
                references: {
                    model: 'users',
                    key: 'id',
                },
                comment: '审核人ID',
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
            tableName: 'applications',
            timestamps: true,
            indexes: [
                { fields: ['userId'] },
                { fields: ['activityId'] },
                { fields: ['status'] },
                { fields: ['userId', 'activityId'], unique: true },
            ],
        });
    }
    static associate() {
        Application.belongsTo(User, { foreignKey: 'userId', as: 'applicant' });
        Application.belongsTo(User, { foreignKey: 'reviewedBy', as: 'reviewer' });
        Application.belongsTo(Activity, { foreignKey: 'activityId' });
    }
}
export default Application;
//# sourceMappingURL=Application.js.map