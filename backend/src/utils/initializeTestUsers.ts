/**
 * 初始化脚本 - 创建测试账户
 * 用于开发测试，在生产环境中应删除
 */

import { User } from '@/models/User'
import bcrypt from 'bcrypt'

export async function initializeTestUsers() {
  try {
    // 检查是否已有测试账户
    const existingUser = await User.findOne({ where: { email: 'user1@test.com' } })

    if (existingUser) {
      console.log('✅ 测试账户已存在，跳过初始化')
      return
    }

    // 创建测试账户1
    const passwordHash1 = await bcrypt.hash('password123', 10)
    await User.create({
      email: 'user1@test.com',
      nickname: 'TestUser1',
      passwordHash: passwordHash1,
      gender: 'male',
      age: 28,
      bio: '热爱徒步的测试用户',
      hikingLevel: 'intermediate',
      isActive: true,
      isVerified: true,
    } as any)
    console.log('✅ 创建测试账户: user1@test.com')

    // 创建测试账户2
    const passwordHash2 = await bcrypt.hash('password123', 10)
    await User.create({
      email: 'user2@test.com',
      nickname: 'TestUser2',
      passwordHash: passwordHash2,
      gender: 'female',
      age: 26,
      bio: '户外运动爱好者',
      hikingLevel: 'beginner',
      isActive: true,
      isVerified: true,
    } as any)
    console.log('✅ 创建测试账户: user2@test.com')

    console.log('✅ 测试账户初始化完成')
  } catch (error) {
    console.error('❌ 初始化测试账户失败:', error)
  }
}
