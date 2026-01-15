import express, { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authMiddleware } from '../middleware/authMiddleware';

const router: Router = express.Router();

/**
 * 用户路由
 * 基础路径: /api/v1/users
 * 所有路由都需要认证
 */

// 用户资料管理
router.get('/profile', authMiddleware, UserController.getProfile);
router.get('/:userId/profile', authMiddleware, UserController.getUserProfile);
router.put('/profile', authMiddleware, UserController.updateProfile);

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
