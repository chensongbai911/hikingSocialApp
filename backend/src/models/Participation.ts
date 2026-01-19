import { DataTypes, Model, Sequelize, ForeignKey } from 'sequelize'
import { User } from './User'
import { Activity } from './Activity'

export interface ParticipationAttributes {
  id: number
  userId: ForeignKey<User['id']>
  activityId: ForeignKey<Activity['id']>
  status: 'pending' | 'joined' | 'completed' | 'cancelled' | 'rejected'
  appliedAt?: Date
  approvedAt?: Date
  rejectedAt?: Date
  joinedAt: Date
  completedAt?: Date
  cancelledAt?: Date
  feedback?: string
  rating?: number
  createdAt: Date
  updatedAt: Date
}

export class Participation extends Model<ParticipationAttributes> implements ParticipationAttributes {
  declare id: number
  declare userId: ForeignKey<User['id']>
  declare activityId: ForeignKey<Activity['id']>
  declare status: 'pending' | 'joined' | 'completed' | 'cancelled' | 'rejected'
  declare appliedAt: Date | undefined
  declare approvedAt: Date | undefined
  declare rejectedAt: Date | undefined
  declare joinedAt: Date
  declare completedAt: Date | undefined
  declare cancelledAt: Date | undefined
  declare feedback: string | undefined
  declare rating: number | undefined
  declare readonly createdAt: Date
  declare readonly updatedAt: Date

  public static initialize(sequelize: Sequelize) {
    return Participation.init(
      {
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
        activityId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'activities',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        status: {
          type: DataTypes.ENUM('pending', 'joined', 'completed', 'cancelled', 'rejected'),
          allowNull: false,
          defaultValue: 'pending',
        },
        appliedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          field: 'applied_at',
        },
        approvedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          field: 'approved_at',
        },
        rejectedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          field: 'rejected_at',
        },
        joinedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        completedAt: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        cancelledAt: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        feedback: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        rating: {
          type: DataTypes.DECIMAL(2, 1),
          allowNull: true,
          validate: {
            min: 0,
            max: 5,
          },
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
        tableName: 'participations',
        timestamps: true,
        indexes: [
          { fields: ['userId'] },
          { fields: ['activityId'] },
          { fields: ['userId', 'activityId'], unique: true },
        ],
      }
    )
  }

  public static associate() {
    Participation.belongsTo(User, { foreignKey: 'userId' })
    Participation.belongsTo(Activity, { foreignKey: 'activityId' })
  }
}

export default Participation
