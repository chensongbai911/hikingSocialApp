/**
 * JWT 认证中间件
 * 创建日期: 2026-01-19
 */
import { Request, Response, NextFunction } from 'express';
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
 * JWT 认证中间件
 */
export declare const authenticateToken: (req: Request, res: Response, next: NextFunction) => void;
/**
 * 可选认证中间件（不强制登录，但会尝试解析 token）
 */
export declare const optionalAuth: (req: Request, res: Response, next: NextFunction) => void;
/**
 * 生成 JWT token
 */
export declare const generateToken: (payload: {
    id: string;
    email: string;
}) => string;
/**
 * 生成刷新 token
 */
export declare const generateRefreshToken: (payload: {
    id: string;
}) => string;
//# sourceMappingURL=auth.d.ts.map