import { Application } from '../models/Application';
export declare class ApplicationService {
    /**
     * 申请加入活动
     */
    applyToActivity(userId: string, activityId: string, message?: string): Promise<Application>;
    /**
     * 获取活动的待审核申请列表
     */
    getPendingApplications(activityId: string, organizerId: string): Promise<Application[]>;
    /**
     * 审核申请(通过或拒绝)
     */
    reviewApplication(applicationId: number, reviewerId: string, action: 'approve' | 'reject'): Promise<Application>;
    /**
     * 获取用户的申请记录
     */
    getUserApplications(userId: string, status?: 'pending' | 'approved' | 'rejected'): Promise<Application[]>;
    /**
     * 获取活动的已通过成员列表
     */
    getApprovedParticipants(activityId: string): Promise<Application[]>;
}
declare const _default: ApplicationService;
export default _default;
//# sourceMappingURL=ApplicationService.d.ts.map