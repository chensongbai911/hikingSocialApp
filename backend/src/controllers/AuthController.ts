import { Request, Response } from 'express';
import { authService } from '../services/AuthService';
import {
  success,
  created,
  businessError,
  validationError,
  serverError
} from '../utils/response';
import { BusinessErrorCode } from '../types/api.types';

export class AuthController {
  /**
   * 用户注册
   * POST /api/v1/auth/register
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, nickname, password, gender, age } = req.body;

      // 参数验证
      if (!email || !nickname || !password) {
        return validationError(res, {
          email: !email ? '邮箱不能为空' : undefined,
          nickname: !nickname ? '昵称不能为空' : undefined,
          password: !password ? '密码不能为空' : undefined
        });
      }

      // 邮箱格式验证
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return validationError(res, { email: '邮箱格式不正确' });
      }

      // 密码长度验证
      if (password.length < 6) {
        return validationError(res, { password: '密码长度至少6位' });
      }

      // 昵称长度验证
      if (nickname.length < 2 || nickname.length > 20) {
        return validationError(res, { nickname: '昵称长度应在2-20个字符之间' });
      }

      // 年龄验证
      if (age && (age < 1 || age > 120)) {
        return validationError(res, { age: '年龄必须在1-120之间' });
      }

      // 性别验证
      if (gender && !['male', 'female', 'other'].includes(gender)) {
        return validationError(res, { gender: '性别值不合法' });
      }

      const result = await authService.register({
        email,
        nickname,
        password,
        gender,
        age
      });

      return created(res, result, '注册成功');
    } catch (error: any) {
      console.error('Register error:', error);

      if (error.code === BusinessErrorCode.USER_ALREADY_EXISTS) {
        return businessError(res, error.code, error.message);
      }

      return serverError(res, '注册失败', error);
    }
  }

  /**
   * 用户登录
   * POST /api/v1/auth/login
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // 参数验证
      if (!email || !password) {
        return validationError(res, {
          email: !email ? '邮箱不能为空' : undefined,
          password: !password ? '密码不能为空' : undefined
        });
      }

      const result = await authService.login({ email, password });

      return success(res, result, '登录成功');
    } catch (error: any) {
      console.error('Login error:', error);

      if (error.code === BusinessErrorCode.INVALID_CREDENTIALS) {
        return businessError(res, error.code, error.message);
      }

      return serverError(res, '登录失败', error);
    }
  }

  /**
   * 用户登出
   * POST /api/v1/auth/logout
   */
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      await authService.logout();
      return success(res, null, '登出成功');
    } catch (error: any) {
      console.error('Logout error:', error);
      return serverError(res, '登出失败', error);
    }
  }

  /**
   * 刷新Token
   * POST /api/v1/auth/refresh
   */
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.body;

      if (!token) {
        return validationError(res, { token: 'Token不能为空' });
      }

      const result = await authService.refreshToken(token);

      return success(res, result, 'Token刷新成功');
    } catch (error: any) {
      console.error('Refresh token error:', error);

      if (error.code === BusinessErrorCode.TOKEN_INVALID ||
        error.code === BusinessErrorCode.TOKEN_EXPIRED ||
        error.code === BusinessErrorCode.USER_NOT_FOUND) {
        return businessError(res, error.code, error.message);
      }

      return serverError(res, 'Token刷新失败', error);
    }
  }

  /**
   * 获取当前用户信息
   * GET /api/v1/auth/me
   */
  static async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      // 从认证中间件获取用户ID
      const userId = req.user?.id;

      if (!userId) {
        return businessError(res, BusinessErrorCode.UNAUTHORIZED, '未授权访问');
      }

      const user = await authService.getCurrentUser(userId);

      return success(res, user, '获取用户信息成功');
    } catch (error: any) {
      console.error('Get current user error:', error);

      if (error.code === BusinessErrorCode.USER_NOT_FOUND) {
        return businessError(res, error.code, error.message);
      }

      return serverError(res, '获取用户信息失败', error);
    }
  }
}
