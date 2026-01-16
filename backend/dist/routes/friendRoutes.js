import { Router } from 'express';
import FriendController from '../controllers/FriendController';
import { authMiddleware } from '../middleware/authMiddleware';
const router = Router();
// 所有路由都需要认证
router.use(authMiddleware);
// 发送好友请求
router.post('/request', FriendController.sendFriendRequest);
// 获取好友列表
router.get('/', FriendController.getFriends);
// 获取待处理的好友请求
router.get('/requests/pending', FriendController.getPendingRequests);
// 搜索用户
router.get('/search', FriendController.searchUsers);
// 获取推荐用户
router.get('/recommendations', FriendController.getRecommendedUsers);
// 检查好友关系状态
router.get('/:friendId/status', FriendController.getFriendshipStatus);
// 接受好友请求
router.put('/:friendId/accept', FriendController.acceptFriendRequest);
// 拒绝好友请求
router.put('/:friendId/reject', FriendController.rejectFriendRequest);
// 删除好友
router.delete('/:friendId', FriendController.removeFriend);
export default router;
//# sourceMappingURL=friendRoutes.js.map