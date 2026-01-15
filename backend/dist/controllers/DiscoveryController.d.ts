import { Request, Response } from 'express';
export declare class DiscoveryController {
    /**
     * 获取推荐活动
     * GET /api/v1/discovery/activities
     */
    static getRecommendedActivities(req: Request, res: Response): Promise<void>;
    /**
     * 获取推荐用户
     * GET /api/v1/discovery/users
     */
    static getRecommendedUsers(req: Request, res: Response): Promise<void>;
    /**
     * 搜索活动
     * GET /api/v1/discovery/search/activities
     */
    static searchActivities(req: Request, res: Response): Promise<void>;
    /**
     * 搜索用户
     * GET /api/v1/discovery/search/users
     */
    static searchUsers(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=DiscoveryController.d.ts.map