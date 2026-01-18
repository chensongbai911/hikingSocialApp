"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationService = void 0;
const Application_1 = require("../models/Application");
const User_1 = require("../models/User");
const Activity_1 = require("../models/Activity");
const Participation_1 = require("../models/Participation");
const errors_1 = require("../utils/errors");
class ApplicationService {
    /**
     * 申请加入活动
     */
    async applyToActivity(userId, activityId, message) {
        // 检查活动是否存在
        const activity = await Activity_1.Activity.findByPk(activityId);
        if (!activity) {
            throw new errors_1.BusinessError(errors_1.BusinessErrorCode.ACTIVITY_NOT_FOUND, '活动不存在');
        }
        // 检查是否已经是参与者
        const existingParticipation = await Participation_1.Participation.findOne({
            where: { userId, activityId },
        });
        if (existingParticipation) {
            throw new errors_1.BusinessError(errors_1.BusinessErrorCode.ALREADY_PARTICIPATED, '您已经是该活动的参与者');
        }
        // 检查是否已经申请过
        const existingApplication = await Application_1.Application.findOne({
            where: { userId, activityId },
        });
        if (existingApplication) {
            if (existingApplication.status === 'pending') {
                throw new errors_1.BusinessError(errors_1.BusinessErrorCode.APPLICATION_PENDING, '您的申请正在审核中');
            }
            if (existingApplication.status === 'approved') {
                throw new errors_1.BusinessError(errors_1.BusinessErrorCode.ALREADY_PARTICIPATED, '您的申请已通过');
            }
            // 如果之前被拒绝,可以重新申请
            existingApplication.status = 'pending';
            existingApplication.message = message || null;
            existingApplication.reviewedAt = null;
            existingApplication.reviewedBy = null;
            await existingApplication.save();
            return existingApplication;
        }
        // 创建新申请
        const application = await Application_1.Application.create({
            userId,
            activityId,
            message: message || null,
            status: 'pending',
        });
        return application;
    }
    /**
     * 获取活动的待审核申请列表
     */
    async getPendingApplications(activityId, organizerId) {
        // 验证是否是组织者
        const activity = await Activity_1.Activity.findByPk(activityId);
        if (!activity) {
            throw new errors_1.BusinessError(errors_1.BusinessErrorCode.ACTIVITY_NOT_FOUND, '活动不存在');
        }
        if (activity.creatorId !== organizerId) {
            throw new errors_1.BusinessError(errors_1.BusinessErrorCode.PERMISSION_DENIED, '只有活动组织者可以查看申请');
        }
        const applications = await Application_1.Application.findAll({
            where: {
                activityId,
                status: 'pending',
            },
            include: [
                {
                    model: User_1.User,
                    as: 'applicant',
                    attributes: ['id', 'nickname', 'avatarUrl', 'age', 'gender', 'hikingLevel', 'bio'],
                },
            ],
            order: [['createdAt', 'ASC']],
        });
        return applications;
    }
    /**
     * 审核申请(通过或拒绝)
     */
    async reviewApplication(applicationId, reviewerId, action) {
        const application = await Application_1.Application.findByPk(applicationId, {
            include: [{ model: Activity_1.Activity }],
        });
        if (!application) {
            throw new errors_1.BusinessError(errors_1.BusinessErrorCode.APPLICATION_NOT_FOUND, '申请不存在');
        }
        const activity = await Activity_1.Activity.findByPk(application.activityId);
        if (!activity || activity.creatorId !== reviewerId) {
            throw new errors_1.BusinessError(errors_1.BusinessErrorCode.PERMISSION_DENIED, '只有活动组织者可以审核申请');
        }
        if (application.status !== 'pending') {
            throw new errors_1.BusinessError(errors_1.BusinessErrorCode.APPLICATION_ALREADY_REVIEWED, '该申请已被审核');
        }
        // 更新申请状态
        application.status = action === 'approve' ? 'approved' : 'rejected';
        application.reviewedAt = new Date();
        application.reviewedBy = reviewerId;
        await application.save();
        // 如果通过,创建参与记录
        if (action === 'approve') {
            await Participation_1.Participation.create({
                userId: application.userId,
                activityId: application.activityId,
                status: 'joined',
                joinedAt: new Date(),
            });
        }
        return application;
    }
    /**
     * 获取用户的申请记录
     */
    async getUserApplications(userId, status) {
        const where = { userId };
        if (status) {
            where.status = status;
        }
        const applications = await Application_1.Application.findAll({
            where,
            include: [
                {
                    model: Activity_1.Activity,
                    attributes: ['id', 'title', 'location', 'startTime', 'coverImage', 'status'],
                },
            ],
            order: [['createdAt', 'DESC']],
        });
        return applications;
    }
    /**
     * 获取活动的已通过成员列表
     */
    async getApprovedParticipants(activityId) {
        const participants = await Participation_1.Participation.findAll({
            where: {
                activityId,
                status: 'joined',
            },
            include: [
                {
                    model: User_1.User,
                    attributes: ['id', 'nickname', 'avatarUrl', 'hikingLevel'],
                },
            ],
            order: [['joinedAt', 'ASC']],
        });
        return participants;
    }
}
exports.ApplicationService = ApplicationService;
exports.default = new ApplicationService();
//# sourceMappingURL=ApplicationService.js.map