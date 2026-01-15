import {
  DataTypes,
  Model,
  Sequelize,
} from 'sequelize'

/**
 * 消息模型
 * 存储用户之间的聊天消息记录
 */
export interface MessageAttributes {
  id: number
  conversationId: number
  senderId: string
  content: string
  contentType: 'text' | 'image' | 'file'
  imageUrl: string | null
  fileUrl: string | null
  isRead: boolean
  readAt: Date | null
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

export class Message extends Model<MessageAttributes> implements MessageAttributes {
  declare id: number
  declare conversationId: number
  declare senderId: string
  declare content: string
  declare contentType: 'text' | 'image' | 'file'
  declare imageUrl: string | null
  declare fileUrl: string | null
  declare isRead: boolean
  declare readAt: Date | null
  declare readonly createdAt: Date
  declare readonly updatedAt: Date
  declare deletedAt: Date | null

  public static initialize(sequelize: Sequelize) {
    return Message.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        conversationId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        senderId: {
          type: DataTypes.STRING(36),
          allowNull: false,
        },
        content: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        contentType: {
          type: DataTypes.ENUM('text', 'image', 'file'),
          defaultValue: 'text',
        },
        imageUrl: {
          type: DataTypes.STRING(500),
          allowNull: true,
        },
        fileUrl: {
          type: DataTypes.STRING(500),
          allowNull: true,
        },
        isRead: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        readAt: {
          type: DataTypes.DATE,
          allowNull: true,
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
        tableName: 'messages',
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

export default Message
