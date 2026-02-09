/**
 * 用户控制器
 * 创建日期: 2026-01-19
 */

import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import {
  createSuccessResponse,
  createErrorResponse,
  ResponseCode,
} from '../utils/apiResponse'
import { query, queryOne, insert, execute } from '../config/database'
import { generateToken, generateRefreshToken } from '../middleware/auth'
import {
  setCache,
  getCache,
  delCache,
  CACHE_PREFIX,
  CACHE_TTL,
} from '../config/redis'

/**
 * 用户注册
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password, nickname } = req.body

    // 验证输入
    if (!username || !email || !password) {
      return res.json(
        createErrorResponse(
          ResponseCode.BAD_REQUEST,
          '用户名、邮箱和密码不能为空'
        )
      )
    }

    // 检查用户名是否已存在
    const existingUser = await queryOne(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    )

    if (existingUser) {
      return res.json(
        createErrorResponse(
          ResponseCode.BAD_REQUEST,
          '用户名或邮箱已被注册'
        )
      )
    }

    // 密码加密
    const passwordHash = await bcrypt.hash(password, 10)

    // 创建用户
    const userId = await insert(
      `INSERT INTO users (username, email, password_hash, nickname, status)
       VALUES (?, ?, ?, ?, 'active')`,
      [username, email, passwordHash, nickname || username]
    )

    // 创建默认设置
    await insert('INSERT INTO user_settings (user_id) VALUES (?)', [userId])

    // 生成 token
    const token = generateToken({
      id: userId,
      username,
      email,
    })

    const refreshToken = generateRefreshToken({ id: userId })

    // 保存刷新令牌
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30) // 30天后过期

    await insert(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [userId, refreshToken, expiresAt]
    )

    res.json(
      createSuccessResponse(
        {
          user: {
            id: userId,
            username,
            email,
            nickname: nickname || username,
          },
          token,
          refreshToken,
        },
        ResponseCode.CREATED,
        '注册成功'
      )
    )
  } catch (error: any) {
    console.error('Register error:', error)
    res.json(
      createErrorResponse(
        ResponseCode.INTERNAL_SERVER_ERROR,
        '注册失败，请稍后重试'
      )
    )
  }
}

/**
 * 用户登录
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.json(
        createErrorResponse(
          ResponseCode.BAD_REQUEST,
          '用户名和密码不能为空'
        )
      )
    }

    // 查询用户
    const user = await queryOne<any>(
      `SELECT id, username, email, password_hash, nickname, avatar_url, status
       FROM users
       WHERE username = ? OR email = ?`,
      [username, username]
    )

    if (!user) {
      return res.json(
        createErrorResponse(
          ResponseCode.UNAUTHORIZED,
          '用户名或密码错误'
        )
      )
    }

    // 检查账号状态
    if (user.status !== 'active') {
      return res.json(
        createErrorResponse(
          ResponseCode.FORBIDDEN,
          '账号已被禁用，请联系管理员'
        )
      )
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password_hash)

    if (!isPasswordValid) {
      return res.json(
        createErrorResponse(
          ResponseCode.UNAUTHORIZED,
          '用户名或密码错误'
        )
      )
    }

    // 更新最后登录时间
    await execute('UPDATE users SET last_login_at = NOW() WHERE id = ?', [
      user.id,
    ])

    // 生成 token
    const token = generateToken({
      id: user.id,
      username: user.username,
      email: user.email,
    })

    const refreshToken = generateRefreshToken({ id: user.id })

    // 保存刷新令牌
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    await insert(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.id, refreshToken, expiresAt]
    )

    // 缓存用户信息
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      nickname: user.nickname,
      avatar_url: user.avatar_url,
    }

    await setCache(`${CACHE_PREFIX.USER}${user.id}`, userData, CACHE_TTL.USER)

    res.json(
      createSuccessResponse({
        user: userData,
        token,
        refreshToken,
      })
    )
  } catch (error: any) {
    console.error('Login error:', error)
    res.json(
      createErrorResponse(
        ResponseCode.INTERNAL_SERVER_ERROR,
        '登录失败，请稍后重试'
      )
    )
  }
}

/**
 * 获取当前用户信息
 */
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id

    if (!userId) {
      return res.json(
        createErrorResponse(ResponseCode.UNAUTHORIZED, '未登录')
      )
    }

    // 尝试从缓存获取
    const cacheKey = `${CACHE_PREFIX.USER}${userId}`
    const cached = await getCache(cacheKey)

    if (cached) {
      return res.json(createSuccessResponse(cached))
    }

    // 从数据库查询
    const user = await queryOne<any>(
      `SELECT
        id, username, email, nickname, avatar_url, gender, birthday, bio,
        hiking_level, total_distance, total_elevation, total_hikes,
        total_routes_created, followers_count, following_count,
        emergency_contact_name, emergency_contact_phone,
        status, email_verified, phone_verified, created_at
       FROM users
       WHERE id = ?`,
      [userId]
    )

    if (!user) {
      return res.json(
        createErrorResponse(ResponseCode.NOT_FOUND, '用户不存在')
      )
    }

    // 缓存用户信息
    await setCache(cacheKey, user, CACHE_TTL.USER)

    res.json(createSuccessResponse(user))
  } catch (error: any) {
    console.error('Get current user error:', error)
    res.json(
      createErrorResponse(
        ResponseCode.INTERNAL_SERVER_ERROR,
        '获取用户信息失败'
      )
    )
  }
}

/**
 * 获取用户信息（公开）
 */
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    // 尝试从缓存获取
    const cacheKey = `${CACHE_PREFIX.USER}${id}:profile`
    const cached = await getCache(cacheKey)

    if (cached) {
      return res.json(createSuccessResponse(cached))
    }

    // 从数据库查询
    const user = await queryOne<any>(
      `SELECT
        id, username, nickname, avatar_url, gender, bio,
        hiking_level, total_distance, total_elevation, total_hikes,
        total_routes_created, followers_count, following_count,
        created_at
       FROM users
       WHERE id = ? AND status = 'active'`,
      [id]
    )

    if (!user) {
      return res.json(
        createErrorResponse(ResponseCode.NOT_FOUND, '用户不存在')
      )
    }

    // 缓存用户信息
    await setCache(cacheKey, user, CACHE_TTL.USER)

    res.json(createSuccessResponse(user))
  } catch (error: any) {
    console.error('Get user profile error:', error)
    res.json(
      createErrorResponse(
        ResponseCode.INTERNAL_SERVER_ERROR,
        '获取用户信息失败'
      )
    )
  }
}

/**
 * 更新用户信息
 */
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id

    if (!userId) {
      return res.json(
        createErrorResponse(ResponseCode.UNAUTHORIZED, '未登录')
      )
    }

    const {
      nickname,
      gender,
      birthday,
      bio,
      emergency_contact_name,
      emergency_contact_phone,
    } = req.body

    // 构建更新语句
    const updates: string[] = []
    const params: any[] = []

    if (nickname !== undefined) {
      updates.push('nickname = ?')
      params.push(nickname)
    }
    if (gender !== undefined) {
      updates.push('gender = ?')
      params.push(gender)
    }
    if (birthday !== undefined) {
      updates.push('birthday = ?')
      params.push(birthday)
    }
    if (bio !== undefined) {
      updates.push('bio = ?')
      params.push(bio)
    }
    if (emergency_contact_name !== undefined) {
      updates.push('emergency_contact_name = ?')
      params.push(emergency_contact_name)
    }
    if (emergency_contact_phone !== undefined) {
      updates.push('emergency_contact_phone = ?')
      params.push(emergency_contact_phone)
    }

    if (updates.length === 0) {
      return res.json(
        createErrorResponse(ResponseCode.BAD_REQUEST, '没有需要更新的字段')
      )
    }

    params.push(userId)

    await execute(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      params
    )

    // 清除缓存
    await delCache([
      `${CACHE_PREFIX.USER}${userId}`,
      `${CACHE_PREFIX.USER}${userId}:profile`,
    ])

    res.json(createSuccessResponse(null, ResponseCode.SUCCESS, '更新成功'))
  } catch (error: any) {
    console.error('Update profile error:', error)
    res.json(
      createErrorResponse(
        ResponseCode.INTERNAL_SERVER_ERROR,
        '更新失败，请稍后重试'
      )
    )
  }
}

/**
 * 上传头像
 */
export const uploadAvatar = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id

    if (!userId) {
      return res.json(
        createErrorResponse(ResponseCode.UNAUTHORIZED, '未登录')
      )
    }

    // 这里应该处理文件上传
    // 暂时返回占位响应
    res.json(
      createErrorResponse(
        ResponseCode.NOT_IMPLEMENTED,
        '文件上传功能待实现'
      )
    )
  } catch (error: any) {
    console.error('Upload avatar error:', error)
    res.json(
      createErrorResponse(
        ResponseCode.INTERNAL_SERVER_ERROR,
        '上传失败，请稍后重试'
      )
    )
  }
}
