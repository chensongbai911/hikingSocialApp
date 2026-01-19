import { DataTypes, Model, Sequelize } from 'sequelize'

export interface UserAttributes {
  id: string
  email: string
  passwordHash: string
  nickname: string
  avatarUrl?: string
  gender?: 'male' | 'female' | 'other'
  age?: number
  bio?: string
  hikingLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  isActive: boolean
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}

export class User extends Model<UserAttributes> implements UserAttributes {
  declare id: string
  declare email: string
  declare passwordHash: string
  declare nickname: string
  declare avatarUrl: string | undefined
  declare gender: 'male' | 'female' | 'other' | undefined
  declare age: number | undefined
  declare bio: string | undefined
  declare hikingLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert' | undefined
  declare isActive: boolean
  declare isVerified: boolean
  declare readonly createdAt: Date
  declare readonly updatedAt: Date
  declare deletedAt: Date | undefined

  public static initialize(sequelize: Sequelize) {
    return User.init(
      {
        id: {
          type: DataTypes.STRING(36),
          primaryKey: true,
          allowNull: false,
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
          validate: {
            isEmail: true,
          },
        },
        passwordHash: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        nickname: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        avatarUrl: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        gender: {
          type: DataTypes.ENUM('male', 'female', 'other'),
          allowNull: true,
        },
        age: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        bio: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        hikingLevel: {
          type: DataTypes.ENUM('beginner', 'intermediate', 'advanced', 'expert'),
          allowNull: true,
          defaultValue: 'beginner',
        },
        isActive: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
          allowNull: false,
        },
        isVerified: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
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
        deletedAt: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'users',
        timestamps: true,
        paranoid: true, // 启用软删除
        indexes: [
          { fields: ['email'] },
          { fields: ['createdAt'] },
          { fields: ['hikingLevel'] },
        ],
      }
    )
  }
}

export default User
