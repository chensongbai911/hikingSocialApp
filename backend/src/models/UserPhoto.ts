import { DataTypes, Model, Sequelize, ForeignKey } from 'sequelize'
import { User } from './User'

export interface UserPhotoAttributes {
  id: number
  userId: ForeignKey<User['id']>
  photoUrl: string
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

export class UserPhoto extends Model<UserPhotoAttributes> implements UserPhotoAttributes {
  declare id: number
  declare userId: ForeignKey<User['id']>
  declare photoUrl: string
  declare sortOrder: number
  declare readonly createdAt: Date
  declare readonly updatedAt: Date

  public static initialize(sequelize: Sequelize) {
    return UserPhoto.init(
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
      },
      {
        sequelize,
        tableName: 'user_photos',
        timestamps: true,
        indexes: [
          { fields: ['userId'] },
          { fields: ['userId', 'sortOrder'] },
        ],
      }
    )
  }

  public static associate() {
    UserPhoto.belongsTo(User, { foreignKey: 'userId' })
  }
}

export default UserPhoto
