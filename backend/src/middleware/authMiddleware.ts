import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/AuthService';
import { unauthorized, businessError } from '../utils/response';
import { BusinessErrorCode } from '../types/api.types';

// 扩展Express Request类型
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

/**
 * JWT认证中间件
 * 验证请求中的JWT token,并将用户信息添加到req.user
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // 从Authorization header获取token
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return unauthorized(res, '缺少认证令牌');
    }

    const token = authHeader.substring(7); // 移除 "Bearer " 前缀

    if (!token) {
      return unauthorized(res, '缺少认证令牌');
    }

    // 验证token
    try {
      const decoded = authService.verifyToken(token);
      req.user = {
        id: decoded.id,
        email: decoded.email
      };
      next();
    } catch (error: any) {
      if (error.code === BusinessErrorCode.TOKEN_EXPIRED) {
        return businessError(res, BusinessErrorCode.TOKEN_EXPIRED);
      }
      if (error.code === BusinessErrorCode.TOKEN_INVALID) {
        return businessError(res, BusinessErrorCode.TOKEN_INVALID);
      }
      return unauthorized(res, '认证失败');
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return unauthorized(res, '认证失败');
  }
};

/**
 * 可选认证中间件
 * 如果有token则验证，没有token则继续执行（不抛出错误）
 */
export const optionalAuthMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);

    if (!token) {
      return next();
    }

    try {
      const decoded = authService.verifyToken(token);
      req.user = {
        id: decoded.id,
        email: decoded.email
      };
    } catch (error) {
      // 忽略token验证错误，继续执行
    }

    next();
  } catch (error) {
    next();
  }
};

export default authMiddleware;
