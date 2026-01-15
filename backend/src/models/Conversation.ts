import {
  DataTypes,
  Model,
  Sequelize,
} from 'sequelize'

/**
 * 对话模型
 * 存储用户之间的对话关系和最后消息信息
 */
export interface ConversationAttributes {
  id: number
  userId1: string
  userId2: string
  lastMessageId: number | null
  lastMessageAt: Date | null
  lastMessageContent: string | null
  user1UnreadCount: number
  user2UnreadCount: number
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

export class Conversation extends Model<ConversationAttributes> implements ConversationAttributes {
  declare id: number
  declare userId1: string
  declare userId2: string
  declare lastMessageId: number | null
  declare lastMessageAt: Date | null
  declare lastMessageContent: string | null
  declare user1UnreadCount: number
  declare user2UnreadCount: number
  declare readonly createdAt: Date
  declare readonly updatedAt: Date
  declare deletedAt: Date | null

  public static initialize(sequelize: Sequelize) {
    return Conversation.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        userId1: {
          type: DataTypes.STRING(36),
          allowNull: false,
        },
        userId2: {
          type: DataTypes.STRING(36),
          allowNull: false,
        },
        lastMessageId: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        lastMessageAt: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        lastMessageContent: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        user1UnreadCount: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        user2UnreadCount: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        deletedAt: {
          type: DataTypes.DATE,
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
      },
      {
        sequelize,
        tableName: 'conversations',
        timestamps: true,
        underscored: true,
        paranoid: false,
      }
    )
  }

  public static associate() {
    // 关联关系将在 database.ts 中配置
  }
}

export default Conversation
