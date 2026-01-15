import express, { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authMiddleware } from '../middleware/authMiddleware';

const router: Router = express.Router();

/**
 * 认证路由
 * 基础路径: /api/v1/auth
 */

// 公开路由（不需要认证）
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/refresh', AuthController.refreshToken);

// 受保护路由（需要认证）
router.post('/logout', authMiddleware, AuthController.logout);
router.get('/me', authMiddleware, AuthController.getCurrentUser);

export default router;
