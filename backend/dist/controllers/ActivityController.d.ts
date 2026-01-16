import { Request, Response } from 'express';
export declare class ActivityController {
    /**
     * 创建活动
     * POST /api/v1/activities
     */
    static createActivity(req: Request, res: Response): Promise<void>;
    /**
     * 获取活动详情
     * GET /api/v1/activities/:id
     */
    static getActivity(req: Request, res: Response): Promise<void>;
    /**
     * 获取活动列表
     * GET /api/v1/activities
     */
    static getActivities(req: Request, res: Response): Promise<void>;
    /**
     * 更新活动
     * PUT /api/v1/activities/:id
     */
    static updateActivity(req: Request, res: Response): Promise<void>;
    /**
     * 删除活动
     * DELETE /api/v1/activities/:id
     */
    static deleteActivity(req: Request, res: Response): Promise<void>;
    /**
     * 加入活动
     * POST /api/v1/activities/:id/join
     */
    static joinActivity(req: Request, res: Response): Promise<void>;
    /**
     * 退出活动
     * POST /api/v1/activities/:id/leave
     */
    static leaveActivity(req: Request, res: Response): Promise<void>;
    /**
     * 获取指定用户参与的活动列表
     * GET /api/v1/activities/user/:userId/joined
     */
    static getUserJoinedActivities(req: Request, res: Response): Promise<void>;
    /**
     * 获取我参与的活动列表
     * GET /api/v1/activities/my-joined
     */
    static getMyJoinedActivities(req: Request, res: Response): Promise<void>;
    /**
     * 获取我创建的活动列表
     * GET /api/v1/activities/my-created
     */
    static getMyCreatedActivities(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=ActivityController.d.ts.map