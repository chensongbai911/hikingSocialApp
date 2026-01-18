import { Request, Response } from 'express';
export declare class AuthController {
    /**
     * 用户注册
     * POST /api/v1/auth/register
     */
    static register(req: Request, res: Response): Promise<void>;
    /**
     * 用户登录
     * POST /api/v1/auth/login
     */
    static login(req: Request, res: Response): Promise<void>;
    /**
     * 用户登出
     * POST /api/v1/auth/logout
     */
    static logout(req: Request, res: Response): Promise<void>;
    /**
     * 刷新Token
     * POST /api/v1/auth/refresh
     */
    static refreshToken(req: Request, res: Response): Promise<void>;
    /**
     * 获取当前用户信息
     * GET /api/v1/auth/me?includePhotos=true&includePreferences=true
     * 支持查询参数控制返回数据：
     * - includePhotos: 是否包含用户照片（默认false）
     * - includePreferences: 是否包含用户偏好（默认false）
     */
    static getCurrentUser(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=AuthController.d.ts.map