import { Application } from '../models/Application'
import { User } from '../models/User'
import { Activity } from '../models/Activity'
import { Participation } from '../models/Participation'
import { BusinessError, BusinessErrorCode } from '../utils/errors'

export class ApplicationService {
  /**
   * 申请加入活动
   */
  async applyToActivity(userId: string, activityId: string, message?: string): Promise<Application> {
    // 检查活动是否存在
    const activity = await Activity.findByPk(activityId)
    if (!activity) {
      throw new BusinessError(BusinessErrorCode.ACTIVITY_NOT_FOUND, '活动不存在')
    }

    // 检查是否已经是参与者
    const existingParticipation = await Participation.findOne({
      where: { userId, activityId },
    })
    if (existingParticipation) {
      throw new BusinessError(BusinessErrorCode.ALREADY_PARTICIPATED, '您已经是该活动的参与者')
    }

    // 检查是否已经申请过
    const existingApplication = await Application.findOne({
      where: { userId, activityId },
    })
    if (existingApplication) {
      if (existingApplication.status === 'pending') {
        throw new BusinessError(BusinessErrorCode.APPLICATION_PENDING, '您的申请正在审核中')
      }
      if (existingApplication.status === 'approved') {
        throw new BusinessError(BusinessErrorCode.ALREADY_PARTICIPATED, '您的申请已通过')
      }
      // 如果之前被拒绝,可以重新申请
      existingApplication.status = 'pending'
      existingApplication.message = message || null
      existingApplication.reviewedAt = null
      existingApplication.reviewedBy = null
      await existingApplication.save()
      return existingApplication
    }

    // 创建新申请
    const application = await Application.create({
      userId,
      activityId,
      message: message || null,
      status: 'pending',
    } as any)

    return application
  }

  /**
   * 获取活动的待审核申请列表
   */
  async getPendingApplications(activityId: string, organizerId: string) {
    // 验证是否是组织者
    const activity = await Activity.findByPk(activityId)
    if (!activity) {
      throw new BusinessError(BusinessErrorCode.ACTIVITY_NOT_FOUND, '活动不存在')
    }
    if (activity.creatorId !== organizerId) {
      throw new BusinessError(BusinessErrorCode.PERMISSION_DENIED, '只有活动组织者可以查看申请')
    }

    const applications = await Application.findAll({
      where: {
        activityId,
        status: 'pending',
      },
      include: [
        {
          model: User,
          as: 'applicant',
          attributes: ['id', 'nickname', 'avatarUrl', 'age', 'gender', 'hikingLevel', 'bio'],
        },
      ],
      order: [['createdAt', 'ASC']],
    })

    return applications
  }

  /**
   * 审核申请(通过或拒绝)
   */
  async reviewApplication(
    applicationId: number,
    reviewerId: string,
    action: 'approve' | 'reject'
  ): Promise<Application> {
    const application = await Application.findByPk(applicationId, {
      include: [{ model: Activity }],
    })

    if (!application) {
      throw new BusinessError(BusinessErrorCode.APPLICATION_NOT_FOUND, '申请不存在')
    }

    const activity = await Activity.findByPk(application.activityId)
    if (!activity || activity.creatorId !== reviewerId) {
      throw new BusinessError(BusinessErrorCode.PERMISSION_DENIED, '只有活动组织者可以审核申请')
    }

    if (application.status !== 'pending') {
      throw new BusinessError(BusinessErrorCode.APPLICATION_ALREADY_REVIEWED, '该申请已被审核')
    }

    // 更新申请状态
    application.status = action === 'approve' ? 'approved' : 'rejected'
    application.reviewedAt = new Date()
    application.reviewedBy = reviewerId
    await application.save()

    // 如果通过,创建参与记录
    if (action === 'approve') {
      await Participation.create({
        userId: application.userId,
        activityId: application.activityId,
        status: 'joined',
        joinedAt: new Date(),
      } as any)
    }

    return application
  }

  /**
   * 获取用户的申请记录
   */
  async getUserApplications(userId: string, status?: 'pending' | 'approved' | 'rejected') {
    const where: any = { userId }
    if (status) {
      where.status = status
    }

    const applications = await Application.findAll({
      where,
      include: [
        {
          model: Activity,
          attributes: ['id', 'title', 'location', 'startTime', 'coverImage', 'status'],
        },
      ],
      order: [['createdAt', 'DESC']],
    })

    return applications
  }

  /**
   * 获取活动的已通过成员列表
   */
  async getApprovedParticipants(activityId: string) {
    const participants = await Participation.findAll({
      where: {
        activityId,
        status: 'joined',
      },
      include: [
        {
          model: User,
          attributes: ['id', 'nickname', 'avatarUrl', 'hikingLevel'],
        },
      ],
      order: [['joinedAt', 'ASC']],
    })

    return participants
  }
}

export default new ApplicationService()
