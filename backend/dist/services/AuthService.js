"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../config/database");
const api_types_1 = require("../types/api.types");
const urlHelper_1 = require("../utils/urlHelper");
class AuthService {
    constructor() {
        this.jwtSecret = process.env.JWT_SECRET || 'hiking-app-secret-key-2024';
        this.jwtExpiration = process.env.JWT_EXPIRATION || '7d';
    }
    /**
     * 生成用户ID
     */
    async generateUserId() {
        const [rows] = await database_1.pool.query('SELECT id FROM users ORDER BY created_at DESC LIMIT 1');
        if (rows.length === 0) {
            return 'user-001';
        }
        const lastId = rows[0].id;
        const num = parseInt(lastId.split('-')[1]) + 1;
        return `user-${num.toString().padStart(3, '0')}`;
    }
    /**
     * 用户注册
     */
    async register(data) {
        const connection = await database_1.pool.getConnection();
        try {
            // 检查邮箱是否已存在
            const [existingUsers] = await connection.query('SELECT id FROM users WHERE email = ? AND deleted_at IS NULL', [data.email]);
            if (existingUsers.length > 0) {
                throw {
                    code: api_types_1.BusinessErrorCode.USER_ALREADY_EXISTS,
                    message: '该邮箱已被注册'
                };
            }
            // 生成用户ID
            const userId = await this.generateUserId();
            // 加密密码
            const passwordHash = await bcryptjs_1.default.hash(data.password, 10);
            // 生成默认头像URL
            const defaultAvatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=user${userId}`;
            // 创建用户（包含默认头像）
            await connection.query(`INSERT INTO users (id, email, password_hash, nickname, gender, age, avatar_url, hiking_level, is_verified, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'beginner', false, NOW(), NOW())`, [userId, data.email, passwordHash, data.nickname, data.gender || null, data.age || null, defaultAvatarUrl]);
            // 获取创建的用户信息
            const [users] = await connection.query(`SELECT id, email, nickname, gender, age, avatar_url, hiking_level, created_at
         FROM users WHERE id = ?`, [userId]);
            const user = users[0];
            // 生成JWT token
            const token = this.generateToken({ id: user.id, email: user.email });
            return { user, token };
        }
        finally {
            connection.release();
        }
    }
    /**
     * 用户登录
     */
    async login(data) {
        // 查询用户
        const [users] = await database_1.pool.query(`SELECT id, email, password_hash, nickname, gender, age, avatar_url, hiking_level, created_at
       FROM users WHERE email = ? AND deleted_at IS NULL`, [data.email]);
        if (users.length === 0) {
            throw {
                code: api_types_1.BusinessErrorCode.INVALID_CREDENTIALS,
                message: '用户名或密码错误'
            };
        }
        const user = users[0];
        // 验证密码
        const isPasswordValid = await bcryptjs_1.default.compare(data.password, user.password_hash);
        if (!isPasswordValid) {
            throw {
                code: api_types_1.BusinessErrorCode.INVALID_CREDENTIALS,
                message: '用户名或密码错误'
            };
        }
        // 生成JWT token
        const token = this.generateToken({ id: user.id, email: user.email });
        // 移除密码字段
        const { password_hash, ...userInfo } = user;
        return { user: userInfo, token };
    }
    /**
     * 刷新Token
     */
    async refreshToken(oldToken) {
        try {
            // 验证旧token（允许过期）
            const decoded = jsonwebtoken_1.default.verify(oldToken, this.jwtSecret, {
                ignoreExpiration: true
            });
            // 检查用户是否存在
            const [users] = await database_1.pool.query('SELECT id, email FROM users WHERE id = ? AND deleted_at IS NULL', [decoded.id]);
            if (users.length === 0) {
                throw {
                    code: api_types_1.BusinessErrorCode.USER_NOT_FOUND,
                    message: '用户不存在'
                };
            }
            // 生成新token
            const token = this.generateToken({
                id: decoded.id,
                email: decoded.email
            });
            return { token };
        }
        catch (error) {
            if (error.name === 'JsonWebTokenError') {
                throw {
                    code: api_types_1.BusinessErrorCode.TOKEN_INVALID,
                    message: '无效的令牌'
                };
            }
            throw error;
        }
    }
    /**
     * 获取当前用户信息（优化版本 - 使用并行查询）
     */
    async getCurrentUser(userId) {
        // 使用 Promise.all 并行查询，大幅提升性能
        const [[users], [preferences], [photos]] = await Promise.all([
            database_1.pool.query(`SELECT id, email, nickname, gender, age, avatar_url, bio, hiking_level, province, city, region, created_at
         FROM users WHERE id = ? AND deleted_at IS NULL`, [userId]),
            database_1.pool.query(`SELECT id, preference_type, preference_value, created_at
         FROM user_preferences
         WHERE user_id = ?
         ORDER BY created_at DESC`, [userId]),
            database_1.pool.query(`SELECT id, photo_url, sort_order, created_at
         FROM user_photos
         WHERE user_id = ?
         ORDER BY sort_order ASC, created_at DESC`, [userId])
        ]);
        if (users.length === 0) {
            throw {
                code: api_types_1.BusinessErrorCode.USER_NOT_FOUND,
                message: '用户不存在'
            };
        }
        const user = users[0];
        // 使用统一的 URL 工具函数处理头像和照片 URL
        user.avatar_url = (0, urlHelper_1.getFullUrl)(user.avatar_url);
        // 批量处理照片 URL
        const photosWithFullUrl = photos.map((photo) => ({
            ...photo,
            photo_url: (0, urlHelper_1.getFullUrl)(photo.photo_url)
        }));
        // 返回包含偏好和照片的完整用户信息
        return {
            ...user,
            preferences: preferences,
            photos: photosWithFullUrl
        };
    }
    /**
     * 验证Token
     */
    verifyToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, this.jwtSecret);
        }
        catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw {
                    code: api_types_1.BusinessErrorCode.TOKEN_EXPIRED,
                    message: '登录已过期，请重新登录'
                };
            }
            throw {
                code: api_types_1.BusinessErrorCode.TOKEN_INVALID,
                message: '无效的令牌'
            };
        }
    }
    /**
     * 生成JWT Token
     */
    generateToken(payload) {
        return jsonwebtoken_1.default.sign(payload, this.jwtSecret, {
            expiresIn: this.jwtExpiration
        });
    }
    /**
     * 用户登出（客户端处理）
     */
    async logout() {
        // JWT是无状态的，登出由客户端删除token实现
        // 这里可以添加token黑名单逻辑（如果需要）
        return;
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
//# sourceMappingURL=AuthService.js.map