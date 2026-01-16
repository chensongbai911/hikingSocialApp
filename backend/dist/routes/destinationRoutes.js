import express from 'express';
import DestinationController from '../controllers/DestinationController';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/authMiddleware';
const router = express.Router();
// 公开接口（可选认证，用于判断收藏状态）
router.get('/', optionalAuthMiddleware, DestinationController.getDestinations);
router.get('/popular', optionalAuthMiddleware, DestinationController.getPopularDestinations);
router.get('/nearby', optionalAuthMiddleware, DestinationController.getNearbyDestinations);
router.get('/:id', optionalAuthMiddleware, DestinationController.getDestinationById);
// 需要认证的接口
router.post('/search/record', authMiddleware, DestinationController.recordSearch);
router.get('/search/history', authMiddleware, DestinationController.getSearchHistory);
router.post('/:id/favorite', authMiddleware, DestinationController.toggleFavorite);
router.get('/favorites/list', authMiddleware, DestinationController.getFavorites);
export default router;
//# sourceMappingURL=destinationRoutes.js.map