import { Sequelize } from 'sequelize'
import dotenv from 'dotenv'

// 模型导入
import { User } from '../models/User'
import { Activity } from '../models/Activity'
import { Application } from '../models/Application'
import { Friendship } from '../models/Friendship'
import { Conversation } from '../models/Conversation'
import { Message } from '../models/Message'
import { UserPreference } from '../models/UserPreference'
import { UserPhoto } from '../models/UserPhoto'
import { ActivityPhoto } from '../models/ActivityPhoto'
import { Participation } from '../models/Participation'

dotenv.config()

// 创建Sequelize实例
export const sequelize = new Sequelize({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  database: process.env.DB_NAME || 'hiking_app',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  dialect: 'mysql',
  logging: false, // 设置为console.log可以看到SQL语句
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
})

// 初始化所有模型
export function initializeModels() {
  User.initialize(sequelize)
  Activity.initialize(sequelize)
  Application.initialize(sequelize)
  Friendship.initialize(sequelize)
  Conversation.initialize(sequelize)
  Message.initialize(sequelize)
  UserPreference.initialize(sequelize)
  UserPhoto.initialize(sequelize)
  ActivityPhoto.initialize(sequelize)
  Participation.initialize(sequelize)

  // 设置模型关联
  User.associate?.()
  Activity.associate?.()
  Application.associate?.()
  Friendship.associate?.()
  Conversation.associate?.()
  Message.associate?.()
  UserPreference.associate?.()
  UserPhoto.associate?.()
  ActivityPhoto.associate?.()
  Participation.associate?.()

  console.log('✅ All Sequelize models initialized')
}

// 测试数据库连接
export async function testSequelizeConnection(): Promise<boolean> {
  try {
    await sequelize.authenticate()
    console.log('✅ Sequelize database connected successfully')
    return true
  } catch (error) {
    console.error('❌ Sequelize connection failed:', error)
    return false
  }
}

// 导出初始化后的模型
export {
  User,
  Activity,
  Application,
  Friendship,
  Conversation,
  Message,
  UserPreference,
  UserPhoto,
  ActivityPhoto,
  Participation,
}
