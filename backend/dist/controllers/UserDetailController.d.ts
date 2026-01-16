import { Request, Response } from 'express';
export declare class UserDetailController {
    /**
     * 获取用户详情
     * GET /api/v1/users/:userId/detail
     */
    static getUserDetail(req: Request, res: Response): Promise<void>;
    /**
     * 关注用户
     * POST /api/v1/users/:userId/follow
     */
    static followUser(req: Request, res: Response): Promise<void>;
    /**
     * 取消关注用户
     * DELETE /api/v1/users/:userId/follow
     */
    static unfollowUser(req: Request, res: Response): Promise<void>;
    /**
     * 检查关注状态
     * GET /api/v1/users/:userId/follow-status
     */
    static getFollowStatus(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=UserDetailController.d.ts.map