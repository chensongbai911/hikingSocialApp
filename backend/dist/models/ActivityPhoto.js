"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityPhoto = void 0;
const sequelize_1 = require("sequelize");
class ActivityPhoto extends sequelize_1.Model {
    static initialize(sequelize) {
        return ActivityPhoto.init({
            id: {
                type: sequelize_1.DataTypes.STRING(36),
                primaryKey: true,
                comment: '照片ID'
            },
            activityId: {
                type: sequelize_1.DataTypes.STRING(36),
                allowNull: false,
                field: 'activity_id',
                comment: '活动ID'
            },
            photoUrl: {
                type: sequelize_1.DataTypes.TEXT('long'),
                allowNull: false,
                field: 'photo_url',
                comment: '照片URL（支持base64）'
            },
            isCover: {
                type: sequelize_1.DataTypes.BOOLEAN,
                defaultValue: false,
                field: 'is_cover',
                comment: '是否为封面图'
            },
            sortOrder: {
                type: sequelize_1.DataTypes.INTEGER,
                defaultValue: 0,
                field: 'sort_order',
                comment: '排序（0=封面）'
            },
            createdAt: {
                type: sequelize_1.DataTypes.DATE,
                defaultValue: sequelize_1.DataTypes.NOW,
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
exports.ActivityPhoto = ActivityPhoto;
//# sourceMappingURL=ActivityPhoto.js.map