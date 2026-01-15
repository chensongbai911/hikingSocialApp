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
 * JWT认证中间件
 * 验证请求中的JWT token,并将用户信息添加到req.user
 */
export declare const authMiddleware: (req: Request, res: Response, next: NextFunction) => void;
/**
 * 可选认证中间件
 * 如果有token则验证，没有token则继续执行（不抛出错误）
 */
export declare const optionalAuthMiddleware: (req: Request, res: Response, next: NextFunction) => void;
export default authMiddleware;
//# sourceMappingURL=authMiddleware.d.ts.map