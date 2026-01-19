"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ActivityController_1 = require("../controllers/ActivityController");
const ApplicationController_1 = __importDefault(require("../controllers/ApplicationController"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
/**
 * 活动路由
 * 基础路径: /api/v1/activities
 */
// 获取我参与的活动列表（需要放在 /:id 之前，避免被当作 id）
router.get('/my-joined', authMiddleware_1.authMiddleware, ActivityController_1.ActivityController.getMyJoinedActivities);
// 获取指定用户参与的活动列表
router.get('/user/:userId/joined', authMiddleware_1.authMiddleware, ActivityController_1.ActivityController.getUserJoinedActivities);
// 获取我创建的活动列表
router.get('/my-created', authMiddleware_1.authMiddleware, ActivityController_1.ActivityController.getMyCreatedActivities);
// 获取活动列表（可选认证，用于判断是否已加入）
router.get('/', authMiddleware_1.optionalAuthMiddleware, ActivityController_1.ActivityController.getActivities);
// 创建活动
router.post('/', authMiddleware_1.authMiddleware, ActivityController_1.ActivityController.createActivity);
// 获取活动详情（可选认证，用于判断是否已加入）
router.get('/:id', authMiddleware_1.optionalAuthMiddleware, ActivityController_1.ActivityController.getActivity);
// 更新活动
router.put('/:id', authMiddleware_1.authMiddleware, ActivityController_1.ActivityController.updateActivity);
// 删除活动
router.delete('/:id', authMiddleware_1.authMiddleware, ActivityController_1.ActivityController.deleteActivity);
// 加入活动
router.post('/:id/join', authMiddleware_1.authMiddleware, ActivityController_1.ActivityController.joinActivity);
// 退出活动
router.post('/:id/leave', authMiddleware_1.authMiddleware, ActivityController_1.ActivityController.leaveActivity);
// 获取活动申请者列表（创建者专用）
router.get('/:id/applicants', authMiddleware_1.authMiddleware, ActivityController_1.ActivityController.getActivityApplicants);
// 同意活动申请（创建者专用）
router.post('/:id/approve', authMiddleware_1.authMiddleware, ActivityController_1.ActivityController.approveApplication);
// 拒绝活动申请（创建者专用）
router.post('/:id/reject', authMiddleware_1.authMiddleware, ActivityController_1.ActivityController.rejectApplication);
// 获取活动的待审核申请列表
router.get('/:id/applications/pending', authMiddleware_1.authMiddleware, ApplicationController_1.default.getPendingApplications);
// 获取活动的已通过成员列表
router.get('/:id/participants', authMiddleware_1.authMiddleware, ApplicationController_1.default.getApprovedParticipants);
exports.default = router;
//# sourceMappingURL=activityRoutes.js.map