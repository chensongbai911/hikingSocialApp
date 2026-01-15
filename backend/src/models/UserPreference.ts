import { DataTypes, Model, Sequelize, ForeignKey } from 'sequelize'
import { User } from './User'

export interface UserPreferenceAttributes {
  id: number
  userId: ForeignKey<User['id']>
  preferenceType: 'time' | 'type' | 'special' | 'distance' | 'interest'
  preferenceValue: string
  createdAt: Date
  updatedAt: Date
}

export class UserPreference extends Model<UserPreferenceAttributes> implements UserPreferenceAttributes {
  declare id: number
  declare userId: ForeignKey<User['id']>
  declare preferenceType: 'time' | 'type' | 'special' | 'distance' | 'interest'
  declare preferenceValue: string
  declare readonly createdAt: Date
  declare readonly updatedAt: Date

  public static initialize(sequelize: Sequelize) {
    return UserPreference.init(
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
      },
      {
        sequelize,
        tableName: 'user_preferences',
        timestamps: true,
        indexes: [
          { fields: ['userId'] },
          { fields: ['preferenceType'] },
          { fields: ['userId', 'preferenceType', 'preferenceValue'], unique: true },
        ],
      }
    )
  }

  public static associate() {
    UserPreference.belongsTo(User, { foreignKey: 'userId' })
  }
}

export default UserPreference
