import express, { Router } from 'express';
import { ActivityController } from '../controllers/ActivityController';
import ApplicationController from '../controllers/ApplicationController';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/authMiddleware';

const router: Router = express.Router();

/**
 * 活动路由
 * 基础路径: /api/v1/activities
 */

// 获取我参与的活动列表（需要放在 /:id 之前，避免被当作 id）
router.get('/my-joined', authMiddleware, ActivityController.getMyJoinedActivities);

// 获取指定用户参与的活动列表
router.get('/user/:userId/joined', authMiddleware, ActivityController.getUserJoinedActivities);

// 获取我创建的活动列表
router.get('/my-created', authMiddleware, ActivityController.getMyCreatedActivities);

// 获取活动列表（可选认证，用于判断是否已加入）
router.get('/', optionalAuthMiddleware, ActivityController.getActivities);

// 创建活动
router.post('/', authMiddleware, ActivityController.createActivity);

// 获取活动详情（可选认证，用于判断是否已加入）
router.get('/:id', optionalAuthMiddleware, ActivityController.getActivity);

// 更新活动
router.put('/:id', authMiddleware, ActivityController.updateActivity);

// 删除活动
router.delete('/:id', authMiddleware, ActivityController.deleteActivity);

// 加入活动
router.post('/:id/join', authMiddleware, ActivityController.joinActivity);

// 退出活动
router.post('/:id/leave', authMiddleware, ActivityController.leaveActivity);

// 获取活动申请者列表（创建者专用）
router.get('/:id/applicants', authMiddleware, ActivityController.getActivityApplicants);

// 同意活动申请（创建者专用）
router.post('/:id/approve', authMiddleware, ActivityController.approveApplication);

// 拒绝活动申请（创建者专用）
router.post('/:id/reject', authMiddleware, ActivityController.rejectApplication);

// 获取活动的待审核申请列表
router.get('/:id/applications/pending', authMiddleware, ApplicationController.getPendingApplications);

// 获取活动的已通过成员列表
router.get('/:id/participants', authMiddleware, ApplicationController.getApprovedParticipants);

export default router;
