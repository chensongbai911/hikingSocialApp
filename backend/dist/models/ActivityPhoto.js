import { DataTypes, Model } from 'sequelize';
export class ActivityPhoto extends Model {
    static initialize(sequelize) {
        return ActivityPhoto.init({
            id: {
                type: DataTypes.STRING(36),
                primaryKey: true,
                comment: '照片ID'
            },
            activityId: {
                type: DataTypes.STRING(36),
                allowNull: false,
                field: 'activity_id',
                comment: '活动ID'
            },
            photoUrl: {
                type: DataTypes.STRING(500),
                allowNull: false,
                field: 'photo_url',
                comment: '照片URL'
            },
            isCover: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
                field: 'is_cover',
                comment: '是否为封面图'
            },
            sortOrder: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
                field: 'sort_order',
                comment: '排序（0=封面）'
            },
            createdAt: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
                field: 'created_at',
                comment: '创建时间'
            }
        }, {
            sequelize,
            tableName: 'activity_photos',
            timestamps: false,
            underscored: true
        });
    }
}
//# sourceMappingURL=ActivityPhoto.js.map