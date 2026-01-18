"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const FriendController_1 = __importDefault(require("../controllers/FriendController"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// 所有路由都需要认证
router.use(authMiddleware_1.authMiddleware);
// 发送好友请求
router.post('/request', FriendController_1.default.sendFriendRequest);
// 获取好友列表
router.get('/', FriendController_1.default.getFriends);
// 获取待处理的好友请求
router.get('/requests/pending', FriendController_1.default.getPendingRequests);
// 搜索用户
router.get('/search', FriendController_1.default.searchUsers);
// 获取推荐用户
router.get('/recommendations', FriendController_1.default.getRecommendedUsers);
// 检查好友关系状态
router.get('/:friendId/status', FriendController_1.default.getFriendshipStatus);
// 接受好友请求
router.put('/:friendId/accept', FriendController_1.default.acceptFriendRequest);
// 拒绝好友请求
router.put('/:friendId/reject', FriendController_1.default.rejectFriendRequest);
// 删除好友
router.delete('/:friendId', FriendController_1.default.removeFriend);
exports.default = router;
//# sourceMappingURL=friendRoutes.js.map