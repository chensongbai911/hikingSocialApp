import FriendService from '../services/FriendService';
import { asyncHandler } from '../utils/asyncHandler';
import { success } from '../utils/response';
export class FriendController {
    constructor() {
        /**
         * 发送好友请求
         * POST /api/v1/friends/request
         */
        this.sendFriendRequest = asyncHandler(async (req, res) => {
            const userId = req.user.id;
            const { friend_id, message } = req.body;
            const friendship = await FriendService.sendFriendRequest(userId, friend_id, message);
            success(res, {
                friendship_id: friendship.id,
                status: friendship.status,
                created_at: friendship.createdAt,
            });
        });
        /**
         * 接受好友请求
         * PUT /api/v1/friends/:friendId/accept
         */
        this.acceptFriendRequest = asyncHandler(async (req, res) => {
            const userId = req.user.id;
            const friendId = parseInt(req.params.friendId);
            await FriendService.acceptFriendRequest(userId, friendId);
            success(res, { message: '已接受好友请求' });
        });
        /**
         * 拒绝好友请求
         * PUT /api/v1/friends/:friendId/reject
         */
        this.rejectFriendRequest = asyncHandler(async (req, res) => {
            const userId = req.user.id;
            const friendId = parseInt(req.params.friendId);
            await FriendService.rejectFriendRequest(userId, friendId);
            success(res, { message: '已拒绝好友请求' });
        });
        /**
         * 删除好友
         * DELETE /api/v1/friends/:friendId
         */
        this.removeFriend = asyncHandler(async (req, res) => {
            const userId = req.user.id;
            const friendId = parseInt(req.params.friendId);
            await FriendService.removeFriend(userId, friendId);
            success(res, { message: '已删除好友' });
        });
        /**
         * 获取好友列表
         * GET /api/v1/friends
         */
        this.getFriends = asyncHandler(async (req, res) => {
            const userId = req.user.id;
            const friends = await FriendService.getFriends(userId);
            const data = friends.map((friend) => ({
                user_id: friend.id,
                nickname: friend.nickname,
                avatar_url: friend.avatarUrl,
                age: friend.age,
                gender: friend.gender,
                hiking_level: friend.hikingLevel,
                bio: friend.bio,
            }));
            success(res, data);
        });
        /**
         * 获取待处理的好友请求
         * GET /api/v1/friends/requests/pending
         */
        this.getPendingRequests = asyncHandler(async (req, res) => {
            const userId = req.user.id;
            const requests = await FriendService.getPendingRequests(userId);
            const data = requests.map((request) => ({
                friendship_id: request.id,
                friend_id: request.friendId,
                message: request.message,
                created_at: request.createdAt,
                friend: request.friend
                    ? {
                        user_id: request.friend.id,
                        nickname: request.friend.nickname,
                        avatar_url: request.friend.avatarUrl,
                        age: request.friend.age,
                        gender: request.friend.gender,
                        hiking_level: request.friend.hikingLevel,
                        bio: request.friend.bio,
                    }
                    : null,
            }));
            success(res, data);
        });
        /**
         * 搜索用户
         * GET /api/v1/friends/search
         */
        this.searchUsers = asyncHandler(async (req, res) => {
            const userId = req.user.id;
            const keyword = req.query.keyword;
            if (!keyword || keyword.trim().length === 0) {
                return success(res, []);
            }
            const users = await FriendService.searchUsers(keyword.trim(), userId);
            const data = users.map((user) => ({
                user_id: user.id,
                nickname: user.nickname,
                avatar_url: user.avatarUrl,
                age: user.age,
                gender: user.gender,
                hiking_level: user.hikingLevel,
                bio: user.bio,
            }));
            success(res, data);
        });
        /**
         * 获取推荐用户
         * GET /api/v1/friends/recommendations
         */
        this.getRecommendedUsers = asyncHandler(async (req, res) => {
            const userId = req.user.id;
            const limit = parseInt(req.query.limit) || 10;
            const users = await FriendService.getRecommendedUsers(userId, limit);
            const data = users.map((user) => ({
                user_id: user.id,
                nickname: user.nickname,
                avatar_url: user.avatarUrl,
                age: user.age,
                gender: user.gender,
                hiking_level: user.hikingLevel,
                bio: user.bio,
                tags: [], // TODO: 从 UserPreference生成标签
            }));
            success(res, data);
        });
        /**
         * 检查好友关系状态
         * GET /api/v1/friends/:friendId/status
         */
        this.getFriendshipStatus = asyncHandler(async (req, res) => {
            const userId = req.user.id;
            const friendId = parseInt(req.params.friendId);
            const status = await FriendService.getFriendshipStatus(userId, friendId);
            success(res, {
                friend_id: friendId,
                status: status || 'none',
            });
        });
    }
}
export default new FriendController();
//# sourceMappingURL=FriendController.js.map