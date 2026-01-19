"use strict";
/**
 * JWT 认证中间件
 * 创建日期: 2026-01-19
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRefreshToken = exports.generateToken = exports.optionalAuth = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const apiResponse_1 = require("../utils/apiResponse");
/**
 * JWT 认证中间件
 */
const authenticateToken = (req, res, next) => {
    try {
        // 从 Authorization header 获取 token
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
        if (!token) {
            res.json((0, apiResponse_1.createErrorResponse)('未提供认证令牌，请先登录', apiResponse_1.ResponseCode.UNAUTHORIZED));
            return;
        }
        // 验证 token
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET not configured');
        }
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        // 将用户信息附加到 request
        req.user = decoded;
        next();
    }
    catch (error) {
        if (error.name === 'TokenExpiredError') {
            res.json((0, apiResponse_1.createErrorResponse)('认证令牌已过期，请重新登录', apiResponse_1.ResponseCode.UNAUTHORIZED));
            return;
        }
        if (error.name === 'JsonWebTokenError') {
            res.json((0, apiResponse_1.createErrorResponse)('无效的认证令牌', apiResponse_1.ResponseCode.UNAUTHORIZED));
            return;
        }
        res.json((0, apiResponse_1.createErrorResponse)('认证失败', apiResponse_1.ResponseCode.INTERNAL_SERVER_ERROR));
    }
};
exports.authenticateToken = authenticateToken;
/**
 * 可选认证中间件（不强制登录，但会尝试解析 token）
 */
const optionalAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (token) {
            const secret = process.env.JWT_SECRET;
            if (secret) {
                const decoded = jsonwebtoken_1.default.verify(token, secret);
                req.user = decoded;
            }
        }
        next();
    }
    catch (error) {
        // 忽略错误，继续执行
        next();
    }
};
exports.optionalAuth = optionalAuth;
/**
 * 生成 JWT token
 */
const generateToken = (payload) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET not configured');
    }
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    return jsonwebtoken_1.default.sign(payload, secret, { expiresIn });
};
exports.generateToken = generateToken;
/**
 * 生成刷新 token
 */
const generateRefreshToken = (payload) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET not configured');
    }
    const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '30d';
    return jsonwebtoken_1.default.sign({ id: payload.id }, secret, { expiresIn });
};
exports.generateRefreshToken = generateRefreshToken;
//# sourceMappingURL=auth.js.map