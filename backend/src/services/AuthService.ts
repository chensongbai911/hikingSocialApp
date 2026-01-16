import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { BusinessErrorCode } from '../types/api.types';

interface RegisterPayload {
  email: string;
  nickname: string;
  password: string;
  gender?: 'male' | 'female' | 'other';
  age?: number;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface TokenPayload {
  id: string;
  email: string;
}

interface UserInfo {
  id: string;
  email: string;
  nickname: string;
  gender: string | null;
  age: number | null;
  avatar_url: string | null;
  hiking_level: string;
  province: string | null;
  city: string | null;
  region: string | null;
  created_at: Date;
}

export class AuthService {
  private jwtSecret = process.env.JWT_SECRET || 'hiking-app-secret-key-2024';
  private jwtExpiration = process.env.JWT_EXPIRATION || '7d';

  /**
   * 生成用户ID
   */
  private async generateUserId(): Promise<string> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM users ORDER BY created_at DESC LIMIT 1'
    );

    if (rows.length === 0) {
      return 'user-001';
    }

    const lastId = rows[0].id as string;
    const num = parseInt(lastId.split('-')[1]) + 1;
    return `user-${num.toString().padStart(3, '0')}`;
  }

  /**
   * 用户注册
   */
  async register(data: RegisterPayload): Promise<{ user: UserInfo; token: string }> {
    const connection = await pool.getConnection();

    try {
      // 检查邮箱是否已存在
      const [existingUsers] = await connection.query<RowDataPacket[]>(
        'SELECT id FROM users WHERE email = ? AND deleted_at IS NULL',
        [data.email]
      );

      if (existingUsers.length > 0) {
        throw {
          code: BusinessErrorCode.USER_ALREADY_EXISTS,
          message: '该邮箱已被注册'
        };
      }

      // 生成用户ID
      const userId = await this.generateUserId();

      // 加密密码
      const passwordHash = await bcrypt.hash(data.password, 10);

      // 创建用户
      await connection.query<ResultSetHeader>(
        `INSERT INTO users (id, email, password_hash, nickname, gender, age, hiking_level, is_verified, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, 'beginner', false, NOW(), NOW())`,
        [userId, data.email, passwordHash, data.nickname, data.gender || null, data.age || null]
      );

      // 获取创建的用户信息
      const [users] = await connection.query<RowDataPacket[]>(
        `SELECT id, email, nickname, gender, age, avatar_url, hiking_level, created_at
         FROM users WHERE id = ?`,
        [userId]
      );

      const user = users[0] as UserInfo;

      // 生成JWT token
      const token = this.generateToken({ id: user.id, email: user.email });

      return { user, token };
    } finally {
      connection.release();
    }
  }

  /**
   * 用户登录
   */
  async login(data: LoginPayload): Promise<{ user: UserInfo; token: string }> {
    // 查询用户
    const [users] = await pool.query<RowDataPacket[]>(
      `SELECT id, email, password_hash, nickname, gender, age, avatar_url, hiking_level, created_at
       FROM users WHERE email = ? AND deleted_at IS NULL`,
      [data.email]
    );

    if (users.length === 0) {
      throw {
        code: BusinessErrorCode.INVALID_CREDENTIALS,
        message: '用户名或密码错误'
      };
    }

    const user = users[0];

    // 验证密码
    const isPasswordValid = await bcrypt.compare(data.password, user.password_hash);
    if (!isPasswordValid) {
      throw {
        code: BusinessErrorCode.INVALID_CREDENTIALS,
        message: '用户名或密码错误'
      };
    }

    // 生成JWT token
    const token = this.generateToken({ id: user.id, email: user.email });

    // 移除密码字段
    const { password_hash, ...userInfo } = user;

    return { user: userInfo as UserInfo, token };
  }

  /**
   * 刷新Token
   */
  async refreshToken(oldToken: string): Promise<{ token: string }> {
    try {
      // 验证旧token（允许过期）
      const decoded = jwt.verify(oldToken, this.jwtSecret, {
        ignoreExpiration: true
      }) as TokenPayload;

      // 检查用户是否存在
      const [users] = await pool.query<RowDataPacket[]>(
        'SELECT id, email FROM users WHERE id = ? AND deleted_at IS NULL',
        [decoded.id]
      );

      if (users.length === 0) {
        throw {
          code: BusinessErrorCode.USER_NOT_FOUND,
          message: '用户不存在'
        };
      }

      // 生成新token
      const token = this.generateToken({
        id: decoded.id,
        email: decoded.email
      });

      return { token };
    } catch (error: any) {
      if (error.name === 'JsonWebTokenError') {
        throw {
          code: BusinessErrorCode.TOKEN_INVALID,
          message: '无效的令牌'
        };
      }
      throw error;
    }
  }

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(userId: string): Promise<UserInfo> {
    const [users] = await pool.query<RowDataPacket[]>(
      `SELECT id, email, nickname, gender, age, avatar_url, bio, hiking_level, province, city, region, created_at
       FROM users WHERE id = ? AND deleted_at IS NULL`,
      [userId]
    );

    if (users.length === 0) {
      throw {
        code: BusinessErrorCode.USER_NOT_FOUND,
        message: '用户不存在'
      };
    }

    const user = users[0] as UserInfo;

    // 获取用户偏好
    const [preferences] = await pool.query<RowDataPacket[]>(
      `SELECT preference_type, preference_value
       FROM user_preferences
       WHERE user_id = ?`,
      [userId]
    );

    // 获取用户照片
    const [photos] = await pool.query<RowDataPacket[]>(
      `SELECT id, photo_url, sort_order, created_at
       FROM user_photos
       WHERE user_id = ?
       ORDER BY sort_order ASC, created_at DESC`,
      [userId]
    );

    return {
      ...user,
      preferences: preferences as any[],
      photos: photos as any[]
    };
  }

  /**
   * 验证Token
   */
  verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.jwtSecret) as TokenPayload;
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw {
          code: BusinessErrorCode.TOKEN_EXPIRED,
          message: '登录已过期，请重新登录'
        };
      }
      throw {
        code: BusinessErrorCode.TOKEN_INVALID,
        message: '无效的令牌'
      };
    }
  }

  /**
   * 生成JWT Token
   */
  private generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiration
    });
  }

  /**
   * 用户登出（客户端处理）
   */
  async logout(): Promise<void> {
    // JWT是无状态的，登出由客户端删除token实现
    // 这里可以添加token黑名单逻辑（如果需要）
    return;
  }
}

export const authService = new AuthService();
