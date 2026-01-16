import express from 'express';
import { UserController } from '../controllers/UserController';
import { UserDetailController } from '../controllers/UserDetailController';
import { authMiddleware } from '../middleware/authMiddleware';
const router = express.Router();
/**
 * 用户路由
 * 基础路径: /api/v1/users
 * 所有路由都需要认证
 */
// 用户资料管理
router.get('/profile', authMiddleware, UserController.getProfile);
router.get('/:userId/profile', authMiddleware, UserController.getUserProfile);
router.put('/profile', authMiddleware, UserController.updateProfile);
// 用户详情（包含关注者、徒步次数等）
router.get('/:userId/detail', authMiddleware, UserDetailController.getUserDetail);
// 关注功能
router.post('/:userId/follow', authMiddleware, UserDetailController.followUser);
router.delete('/:userId/follow', authMiddleware, UserDetailController.unfollowUser);
router.get('/:userId/follow-status', authMiddleware, UserDetailController.getFollowStatus);
// 头像管理
router.post('/avatar', authMiddleware, UserController.updateAvatar);
// 相册管理
router.get('/photos', authMiddleware, UserController.getPhotos);
router.post('/photos', authMiddleware, UserController.addPhoto);
router.delete('/photos/:photoId', authMiddleware, UserController.deletePhoto);
// 用户偏好管理
router.get('/preferences', authMiddleware, UserController.getPreferences);
router.put('/preferences', authMiddleware, UserController.updatePreferences);
export default router;
//# sourceMappingURL=userRoutes.js.map