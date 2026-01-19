import { DataTypes, Model, Sequelize, ForeignKey } from 'sequelize'
import { User } from './User'
import { Activity } from './Activity'

export interface ApplicationAttributes {
  id: number
  userId: string
  activityId: string
  status: 'pending' | 'approved' | 'rejected'
  message: string | null
  reviewedAt: Date | null
  reviewedBy: string | null
  createdAt: Date
  updatedAt: Date
}

export class Application extends Model<ApplicationAttributes> implements ApplicationAttributes {
  declare id: number
  declare userId: string
  declare activityId: string
  declare status: 'pending' | 'approved' | 'rejected'
  declare message: string | null
  declare reviewedAt: Date | null
  declare reviewedBy: string | null
  declare readonly createdAt: Date
  declare readonly updatedAt: Date

  public static initialize(sequelize: Sequelize) {
    return Application.init(
      {
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
      },
      {
        sequelize,
        tableName: 'applications',
        timestamps: true,
        indexes: [
          { fields: ['userId'] },
          { fields: ['activityId'] },
          { fields: ['status'] },
          { fields: ['userId', 'activityId'], unique: true },
        ],
      }
    )
  }

  public static associate() {
    Application.belongsTo(User, { foreignKey: 'userId', as: 'applicant' })
    Application.belongsTo(User, { foreignKey: 'reviewedBy', as: 'reviewer' })
    Application.belongsTo(Activity, { foreignKey: 'activityId' })
  }
}

export default Application
