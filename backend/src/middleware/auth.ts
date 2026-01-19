/**
 * JWT 认证中间件
 * 创建日期: 2026-01-19
 */

import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import {
  createErrorResponse,
  ResponseCode,
} from '../utils/apiResponse'

// 扩展 Express Request 类型
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        email: string
      }
    }
  }
}

/**
 * JWT 认证中间件
 */
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // 从 Authorization header 获取 token
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

    if (!token) {
      res.json(
        createErrorResponse(
          '未提供认证令牌，请先登录',
          ResponseCode.UNAUTHORIZED
        )
      )
      return
    }

    // 验证 token
    const secret = process.env.JWT_SECRET
    if (!secret) {
      throw new Error('JWT_SECRET not configured')
    }

    const decoded = jwt.verify(token, secret) as {
      id: string
      email: string
    }

    // 将用户信息附加到 request
    req.user = decoded

    next()
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.json(
        createErrorResponse(
          '认证令牌已过期，请重新登录',
          ResponseCode.UNAUTHORIZED
        )
      )
      return
    }

    if (error.name === 'JsonWebTokenError') {
      res.json(
        createErrorResponse(
          '无效的认证令牌',
          ResponseCode.UNAUTHORIZED
        )
      )
      return
    }

    res.json(
      createErrorResponse(
        '认证失败',
        ResponseCode.INTERNAL_SERVER_ERROR
      )
    )
  }
}

/**
 * 可选认证中间件（不强制登录，但会尝试解析 token）
 */
export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]

    if (token) {
      const secret = process.env.JWT_SECRET
      if (secret) {
        const decoded = jwt.verify(token, secret) as {
          id: string
          email: string
        }
        req.user = decoded
      }
    }

    next()
  } catch (error) {
    // 忽略错误，继续执行
    next()
  }
}

/**
 * 生成 JWT token
 */
export const generateToken = (payload: {
  id: string
  email: string
}): string => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET not configured')
  }

  const expiresIn = process.env.JWT_EXPIRES_IN || '7d'

  return jwt.sign(payload, secret, { expiresIn })
}

/**
 * 生成刷新 token
 */
export const generateRefreshToken = (payload: {
  id: string
}): string => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET not configured')
  }

  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '30d'

  return jwt.sign({ id: payload.id }, secret, { expiresIn })
}
