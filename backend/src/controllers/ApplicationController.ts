import { Request, Response } from 'express'
import ApplicationService from '../services/ApplicationService'
import { asyncHandler } from '../utils/asyncHandler'
import { success, businessError, serverError } from '../utils/response'

export class ApplicationController {
  /**
   * 申请加入活动
   * POST /api/v1/applications
   */
  applyToActivity = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id
    const { activity_id, message } = req.body

    const application = await ApplicationService.applyToActivity(userId, activity_id, message)

    success(res, {
      application_id: application.id,
      status: application.status,
      created_at: application.createdAt,
    })
  })

  /**
   * 获取活动的待审核申请列表
   * GET /api/v1/activities/:id/applications/pending
   */
  getPendingApplications = asyncHandler(async (req: Request, res: Response) => {
    const activityId = req.params.id
    const organizerId = req.user!.id

    const applications = await ApplicationService.getPendingApplications(activityId, organizerId)

    const data = applications.map((app: any) => ({
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
    }))

    success(res, data)
  })

  /**
   * 审核申请
   * PUT /api/v1/applications/:id/review
   */
  reviewApplication = asyncHandler(async (req: Request, res: Response) => {
    const applicationId = parseInt(req.params.id) // applicationId 是 Application 表的 INTEGER 自增 ID
    const reviewerId = req.user!.id // reviewerId 是用户字符串 ID
    const { action } = req.body // 'approve' or 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return businessError(res, 4001, 'action必须是approve或reject')
    }

    const application = await ApplicationService.reviewApplication(applicationId, reviewerId, action)

    success(res, {
      application_id: application.id,
      status: application.status,
      reviewed_at: application.reviewedAt,
    })
  })

  /**
   * 获取用户的申请记录
   * GET /api/v1/applications/my
   */
  getMyApplications = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id
    const status = req.query.status as 'pending' | 'approved' | 'rejected' | undefined

    const applications = await ApplicationService.getUserApplications(userId, status)

    const data = applications.map((app: any) => ({
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
    }))

    success(res, data)
  })

  /**
   * 获取活动的已通过成员列表
   * GET /api/v1/activities/:id/participants
   */
  getApprovedParticipants = asyncHandler(async (req: Request, res: Response) => {
    const activityId = req.params.id

    const participants = await ApplicationService.getApprovedParticipants(activityId)

    const data = participants.map((app: any) => ({
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
    }))

    success(res, {
      count: data.length,
      participants: data,
    })
  })
}

export default new ApplicationController()
