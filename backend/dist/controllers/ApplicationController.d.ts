import { Request, Response } from 'express';
export declare class ApplicationController {
    /**
     * 申请加入活动
     * POST /api/v1/applications
     */
    applyToActivity: (req: Request, res: Response, next: import("express").NextFunction) => void;
    /**
     * 获取活动的待审核申请列表
     * GET /api/v1/activities/:id/applications/pending
     */
    getPendingApplications: (req: Request, res: Response, next: import("express").NextFunction) => void;
    /**
     * 审核申请
     * PUT /api/v1/applications/:id/review
     */
    reviewApplication: (req: Request, res: Response, next: import("express").NextFunction) => void;
    /**
     * 获取用户的申请记录
     * GET /api/v1/applications/my
     */
    getMyApplications: (req: Request, res: Response, next: import("express").NextFunction) => void;
    /**
     * 获取活动的已通过成员列表
     * GET /api/v1/activities/:id/participants
     */
    getApprovedParticipants: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
declare const _default: ApplicationController;
export default _default;
//# sourceMappingURL=ApplicationController.d.ts.map