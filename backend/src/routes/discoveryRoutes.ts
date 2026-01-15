import express, { Router } from 'express';
import { DiscoveryController } from '../controllers/DiscoveryController';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/authMiddleware';

const router: Router = express.Router();

/**
 * 发现页路由
 * 基础路径: /api/v1/discovery
 */

// 获取推荐活动
router.get('/activities', authMiddleware, DiscoveryController.getRecommendedActivities);

// 获取推荐用户
router.get('/users', authMiddleware, DiscoveryController.getRecommendedUsers);

// 搜索活动
router.get('/search/activities', optionalAuthMiddleware, DiscoveryController.searchActivities);

// 搜索用户
router.get('/search/users', DiscoveryController.searchUsers);

export default router;
