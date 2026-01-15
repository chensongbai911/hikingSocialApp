import { DataTypes, Model, Sequelize, ForeignKey } from 'sequelize'
import { Activity } from './Activity'

export interface ActivityPhotoAttributes {
  id: string
  activityId: ForeignKey<Activity['id']>
  photoUrl: string
  isCover: boolean
  sortOrder: number
  createdAt: Date
}

export class ActivityPhoto extends Model<ActivityPhotoAttributes> implements ActivityPhotoAttributes {
  declare id: string
  declare activityId: ForeignKey<Activity['id']>
  declare photoUrl: string
  declare isCover: boolean
  declare sortOrder: number
  declare readonly createdAt: Date

  public static initialize(sequelize: Sequelize) {
    return ActivityPhoto.init(
      {
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
          type: DataTypes.TEXT('long'),
          allowNull: false,
          field: 'photo_url',
          comment: '照片URL（支持base64）'
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
      },
      {
        sequelize,
        tableName: 'activity_photos',
        timestamps: false,
        underscored: true
      }
    )
  }
}
