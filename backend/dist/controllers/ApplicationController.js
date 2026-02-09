"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationController = void 0;
const ApplicationService_1 = __importDefault(require("../services/ApplicationService"));
const asyncHandler_1 = require("../utils/asyncHandler");
const response_1 = require("../utils/response");
class ApplicationController {
    constructor() {
        /**
         * 申请加入活动
         * POST /api/v1/applications
         */
        this.applyToActivity = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const userId = req.user.id;
            const { activity_id, message } = req.body;
            const application = await ApplicationService_1.default.applyToActivity(userId, activity_id, message);
            (0, response_1.success)(res, {
                application_id: application.id,
                status: application.status,
                created_at: application.createdAt,
            });
        });
        /**
         * 获取活动的待审核申请列表
         * GET /api/v1/activities/:id/applications/pending
         */
        this.getPendingApplications = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const activityId = req.params.id;
            const organizerId = req.user.id;
            const applications = await ApplicationService_1.default.getPendingApplications(activityId, organizerId);
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
            (0, response_1.success)(res, data);
        });
        /**
         * 审核申请
         * PUT /api/v1/applications/:id/review
         */
        this.reviewApplication = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const applicationId = parseInt(req.params.id); // applicationId 是 Application 表的 INTEGER 自增 ID
            const reviewerId = req.user.id; // reviewerId 是用户字符串 ID
            const { action } = req.body; // 'approve' or 'reject'
            if (!['approve', 'reject'].includes(action)) {
                return (0, response_1.businessError)(res, 4001, 'action必须是approve或reject');
            }
            const application = await ApplicationService_1.default.reviewApplication(applicationId, reviewerId, action);
            (0, response_1.success)(res, {
                application_id: application.id,
                status: application.status,
                reviewed_at: application.reviewedAt,
            });
        });
        /**
         * 获取用户的申请记录
         * GET /api/v1/applications/my
         */
        this.getMyApplications = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const userId = req.user.id;
            const status = req.query.status;
            const applications = await ApplicationService_1.default.getUserApplications(userId, status);
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
                        cover_image: app.Activity.coverImageUrl,
                        status: app.Activity.status,
                    }
                    : null,
            }));
            (0, response_1.success)(res, data);
        });
        /**
         * 获取活动的已通过成员列表
         * GET /api/v1/activities/:id/participants
         */
        this.getApprovedParticipants = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const activityId = req.params.id;
            const participants = await ApplicationService_1.default.getApprovedParticipants(activityId);
            const data = participants.map((app) => ({
                application_id: app.id,
                user_id: app.userId,
                approved_at: app.reviewedAt,
                user: app.applicant
                    ? {
                        user_id: app.applicant.id,
                        nickname: app.applicant.nickname,
                        avatar_url: app.applicant.avatarUrl,
                        hiking_level: app.applicant.hikingLevel,
                    }
                    : null,
            }));
            (0, response_1.success)(res, {
                count: data.length,
                participants: data,
            });
        });
    }
}
exports.ApplicationController = ApplicationController;
exports.default = new ApplicationController();
//# sourceMappingURL=ApplicationController.js.map