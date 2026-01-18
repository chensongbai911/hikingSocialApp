"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const AuthService_1 = require("../services/AuthService");
const response_1 = require("../utils/response");
const api_types_1 = require("../types/api.types");
class AuthController {
    /**
     * 用户注册
     * POST /api/v1/auth/register
     */
    static async register(req, res) {
        try {
            const { email, nickname, password, gender, age } = req.body;
            // 参数验证
            if (!email || !nickname || !password) {
                return (0, response_1.validationError)(res, {
                    email: !email ? '邮箱不能为空' : undefined,
                    nickname: !nickname ? '昵称不能为空' : undefined,
                    password: !password ? '密码不能为空' : undefined
                });
            }
            // 邮箱格式验证
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return (0, response_1.validationError)(res, { email: '邮箱格式不正确' });
            }
            // 密码长度验证
            if (password.length < 6) {
                return (0, response_1.validationError)(res, { password: '密码长度至少6位' });
            }
            // 昵称长度验证
            if (nickname.length < 2 || nickname.length > 20) {
                return (0, response_1.validationError)(res, { nickname: '昵称长度应在2-20个字符之间' });
            }
            // 年龄验证
            if (age && (age < 1 || age > 120)) {
                return (0, response_1.validationError)(res, { age: '年龄必须在1-120之间' });
            }
            // 性别验证
            if (gender && !['male', 'female', 'other'].includes(gender)) {
                return (0, response_1.validationError)(res, { gender: '性别值不合法' });
            }
            const result = await AuthService_1.authService.register({
                email,
                nickname,
                password,
                gender,
                age
            });
            return (0, response_1.created)(res, result, '注册成功');
        }
        catch (error) {
            console.error('Register error:', error);
            if (error.code === api_types_1.BusinessErrorCode.USER_ALREADY_EXISTS) {
                return (0, response_1.businessError)(res, error.code, error.message);
            }
            return (0, response_1.serverError)(res, '注册失败', error);
        }
    }
    /**
     * 用户登录
     * POST /api/v1/auth/login
     */
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            // 参数验证
            if (!email || !password) {
                return (0, response_1.validationError)(res, {
                    email: !email ? '邮箱不能为空' : undefined,
                    password: !password ? '密码不能为空' : undefined
                });
            }
            const result = await AuthService_1.authService.login({ email, password });
            return (0, response_1.success)(res, result, '登录成功');
        }
        catch (error) {
            console.error('Login error:', error);
            if (error.code === api_types_1.BusinessErrorCode.INVALID_CREDENTIALS) {
                return (0, response_1.businessError)(res, error.code, error.message);
            }
            return (0, response_1.serverError)(res, '登录失败', error);
        }
    }
    /**
     * 用户登出
     * POST /api/v1/auth/logout
     */
    static async logout(req, res) {
        try {
            await AuthService_1.authService.logout();
            return (0, response_1.success)(res, null, '登出成功');
        }
        catch (error) {
            console.error('Logout error:', error);
            return (0, response_1.serverError)(res, '登出失败', error);
        }
    }
    /**
     * 刷新Token
     * POST /api/v1/auth/refresh
     */
    static async refreshToken(req, res) {
        try {
            const { token } = req.body;
            if (!token) {
                return (0, response_1.validationError)(res, { token: 'Token不能为空' });
            }
            const result = await AuthService_1.authService.refreshToken(token);
            return (0, response_1.success)(res, result, 'Token刷新成功');
        }
        catch (error) {
            console.error('Refresh token error:', error);
            if (error.code === api_types_1.BusinessErrorCode.TOKEN_INVALID ||
                error.code === api_types_1.BusinessErrorCode.TOKEN_EXPIRED ||
                error.code === api_types_1.BusinessErrorCode.USER_NOT_FOUND) {
                return (0, response_1.businessError)(res, error.code, error.message);
            }
            return (0, response_1.serverError)(res, 'Token刷新失败', error);
        }
    }
    /**
     * 获取当前用户信息
     * GET /api/v1/auth/me?includePhotos=true&includePreferences=true
     * 支持查询参数控制返回数据：
     * - includePhotos: 是否包含用户照片（默认false）
     * - includePreferences: 是否包含用户偏好（默认false）
     */
    static async getCurrentUser(req, res) {
        try {
            // 从认证中间件获取用户ID
            const userId = req.user?.id;
            if (!userId) {
                return (0, response_1.businessError)(res, api_types_1.BusinessErrorCode.UNAUTHORIZED, '未授权访问');
            }
            // 从查询参数读取选项
            const includePhotos = req.query.includePhotos === 'true';
            const includePreferences = req.query.includePreferences === 'true';
            const user = await AuthService_1.authService.getCurrentUser(userId, includePhotos, includePreferences);
            return (0, response_1.success)(res, user, '获取用户信息成功');
        }
        catch (error) {
            console.error('Get current user error:', error);
            if (error.code === api_types_1.BusinessErrorCode.USER_NOT_FOUND) {
                return (0, response_1.businessError)(res, error.code, error.message);
            }
            return (0, response_1.serverError)(res, '获取用户信息失败', error);
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=AuthController.js.map