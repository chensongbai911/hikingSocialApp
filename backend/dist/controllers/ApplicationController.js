import ApplicationService from '../services/ApplicationService';
import { asyncHandler } from '../utils/asyncHandler';
import { success, businessError } from '../utils/response';
export class ApplicationController {
    constructor() {
        /**
         * 申请加入活动
         * POST /api/v1/applications
         */
        this.applyToActivity = asyncHandler(async (req, res) => {
            const userId = typeof req.user.id === 'string' ? parseInt(req.user.id) : req.user.id;
            const { activity_id, message } = req.body;
            const application = await ApplicationService.applyToActivity(userId, activity_id, message);
            success(res, {
                application_id: application.id,
                status: application.status,
                created_at: application.createdAt,
            });
        });
        /**
         * 获取活动的待审核申请列表
         * GET /api/v1/activities/:id/applications/pending
         */
        this.getPendingApplications = asyncHandler(async (req, res) => {
            const activityId = parseInt(req.params.id);
            const organizerId = typeof req.user.id === 'string' ? parseInt(req.user.id) : req.user.id;
            const applications = await ApplicationService.getPendingApplications(activityId, organizerId);
            const data = applications.map((app) => ({
                application_id: app.id,
                user_id: app.userId,
                activity_id: app.activityId,
                status: app.status,
                message: app.message,
                created_at: app.createdAt,
                applicant: app.applicant
                    ? {
                        user_id: app.applicant.id,
                        nickname: app.applicant.nickname,
                        avatar_url: app.applicant.avatarUrl,
                        age: app.applicant.age,
                        gender: app.applicant.gender,
                        hiking_level: app.applicant.hikingLevel,
                        bio: app.applicant.bio,
                    }
                    : null,
            }));
            success(res, data);
        });
        /**
         * 审核申请
         * PUT /api/v1/applications/:id/review
         */
        this.reviewApplication = asyncHandler(async (req, res) => {
            const applicationId = parseInt(req.params.id);
            const reviewerId = typeof req.user.id === 'string' ? parseInt(req.user.id) : req.user.id;
            const { action } = req.body; // 'approve' or 'reject'
            if (!['approve', 'reject'].includes(action)) {
                return businessError(res, 4001, 'action必须是approve或reject');
            }
            const application = await ApplicationService.reviewApplication(applicationId, reviewerId, action);
            success(res, {
                application_id: application.id,
                status: application.status,
                reviewed_at: application.reviewedAt,
            });
        });
        /**
         * 获取用户的申请记录
         * GET /api/v1/applications/my
         */
        this.getMyApplications = asyncHandler(async (req, res) => {
            const userId = typeof req.user.id === 'string' ? parseInt(req.user.id) : req.user.id;
            const status = req.query.status;
            const applications = await ApplicationService.getUserApplications(userId, status);
            const data = applications.map((app) => ({
                application_id: app.id,
                activity_id: app.activityId,
                status: app.status,
                message: app.message,
                reviewed_at: app.reviewedAt,
                created_at: app.createdAt,
                activity: app.Activity
                    ? {
                        activity_id: app.Activity.id,
                        title: app.Activity.title,
                        location: app.Activity.location,
                        start_time: app.Activity.startTime,
                        cover_image: app.Activity.coverImage,
                        status: app.Activity.status,
                    }
                    : null,
            }));
            success(res, data);
        });
        /**
         * 获取活动的已通过成员列表
         * GET /api/v1/activities/:id/participants
         */
        this.getApprovedParticipants = asyncHandler(async (req, res) => {
            const activityId = parseInt(req.params.id);
            const participants = await ApplicationService.getApprovedParticipants(activityId);
            const data = participants.map((p) => ({
                participation_id: p.id,
                user_id: p.userId,
                joined_at: p.joinedAt,
                user: p.User
                    ? {
                        user_id: p.User.id,
                        nickname: p.User.nickname,
                        avatar_url: p.User.avatarUrl,
                        hiking_level: p.User.hikingLevel,
                    }
                    : null,
            }));
            success(res, {
                count: data.length,
                participants: data,
            });
        });
    }
}
export default new ApplicationController();
//# sourceMappingURL=ApplicationController.js.map