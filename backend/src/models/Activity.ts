import { DataTypes, Model, Sequelize, ForeignKey } from 'sequelize'
import { User } from './User'

export interface ActivityAttributes {
  id: string
  creatorId: ForeignKey<User['id']>
  title: string
  description: string
  coverImageUrl?: string
  location: string
  latitude?: number
  longitude?: number
  startTime: Date
  endTime: Date
  distance?: number
  difficulty: 'easy' | 'moderate' | 'hard'
  type?: string
  status: 'pending' | 'approved' | 'ongoing' | 'completed' | 'cancelled'
  routeDescription?: string
  equipmentRequired?: string
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}

export class Activity extends Model<ActivityAttributes> implements ActivityAttributes {
  declare id: string
  declare creatorId: ForeignKey<User['id']>
  declare title: string
  declare description: string
  declare coverImageUrl: string | undefined
  declare location: string
  declare latitude: number | undefined
  declare longitude: number | undefined
  declare startTime: Date
  declare endTime: Date
  declare distance: number | undefined
  declare difficulty: 'easy' | 'moderate' | 'hard'
  declare type: string | undefined
  declare status: 'pending' | 'approved' | 'ongoing' | 'completed' | 'cancelled'
  declare routeDescription: string | undefined
  declare equipmentRequired: string | undefined
  declare readonly createdAt: Date
  declare readonly updatedAt: Date
  declare deletedAt: Date | undefined

  public static initialize(sequelize: Sequelize) {
    return Activity.init(
      {
        id: {
          type: DataTypes.STRING(36),
          primaryKey: true,
          allowNull: false,
        },
        creatorId: {
          type: DataTypes.STRING(36),
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
      },
      {
        sequelize,
        tableName: 'activities',
        timestamps: true,
        paranoid: true,
        indexes: [
          { fields: ['status'] },
          { fields: ['startTime'] },
          { fields: ['creatorId'] },
        ],
      }
    )
  }

  public static associate() {
    Activity.belongsTo(User, { foreignKey: 'creatorId', as: 'creator' })
  }
}

export default Activity
