"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuthMiddleware = exports.authMiddleware = void 0;
const AuthService_1 = require("../services/AuthService");
const response_1 = require("../utils/response");
const api_types_1 = require("../types/api.types");
/**
 * JWT认证中间件
 * 验证请求中的JWT token,并将用户信息添加到req.user
 */
const authMiddleware = (req, res, next) => {
    try {
        // 从Authorization header获取token
        const authHeader = req.headers.authorization;
        console.log('[Auth] 请求路径:', req.method, req.path);
        console.log('[Auth] Authorization header:', authHeader ? `${authHeader.substring(0, 30)}...` : '无');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.warn('[Auth] 缺少或格式错误的Authorization header');
            return (0, response_1.unauthorized)(res, '缺少认证令牌');
        }
        const token = authHeader.substring(7); // 移除 "Bearer " 前缀
        if (!token) {
            console.warn('[Auth] Token为空');
            return (0, response_1.unauthorized)(res, '缺少认证令牌');
        }
        // 验证token
        try {
            const decoded = AuthService_1.authService.verifyToken(token);
            console.log('[Auth] Token验证成功, userId:', decoded.id);
            req.user = {
                id: decoded.id,
                email: decoded.email
            };
            next();
        }
        catch (error) {
            console.error('[Auth] Token验证失败:', error.message, error.code);
            if (error.code === api_types_1.BusinessErrorCode.TOKEN_EXPIRED) {
                return (0, response_1.businessError)(res, api_types_1.BusinessErrorCode.TOKEN_EXPIRED);
            }
            if (error.code === api_types_1.BusinessErrorCode.TOKEN_INVALID) {
                return (0, response_1.businessError)(res, api_types_1.BusinessErrorCode.TOKEN_INVALID);
            }
            return (0, response_1.unauthorized)(res, '认证失败');
        }
    }
    catch (error) {
        console.error('Auth middleware error:', error);
        return (0, response_1.unauthorized)(res, '认证失败');
    }
};
exports.authMiddleware = authMiddleware;
/**
 * 可选认证中间件
 * 如果有token则验证，没有token则继续执行（不抛出错误）
 */
const optionalAuthMiddleware = (req, res, next) => {
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
            const decoded = AuthService_1.authService.verifyToken(token);
            req.user = {
                id: decoded.id,
                email: decoded.email
            };
        }
        catch (error) {
            // 忽略token验证错误，继续执行
        }
        next();
    }
    catch (error) {
        next();
    }
};
exports.optionalAuthMiddleware = optionalAuthMiddleware;
exports.default = exports.authMiddleware;
//# sourceMappingURL=authMiddleware.js.map