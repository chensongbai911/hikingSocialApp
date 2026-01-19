"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendController = void 0;
const FriendService_1 = __importDefault(require("../services/FriendService"));
const asyncHandler_1 = require("../utils/asyncHandler");
const response_1 = require("../utils/response");
class FriendController {
    constructor() {
        /**
         * 发送好友请求
         * POST /api/v1/friends/request
         */
        this.sendFriendRequest = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const userId = req.user.id;
            const { friend_id, message } = req.body;
            const friendship = await FriendService_1.default.sendFriendRequest(userId, friend_id, message);
            (0, response_1.success)(res, {
                friendship_id: friendship.id,
                status: friendship.status,
                created_at: friendship.createdAt,
            });
        });
        /**
         * 接受好友请求
         * PUT /api/v1/friends/:friendId/accept
         */
        this.acceptFriendRequest = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const userId = req.user.id;
            const friendId = req.params.friendId;
            await FriendService_1.default.acceptFriendRequest(userId, friendId);
            (0, response_1.success)(res, { message: '已接受好友请求' });
        });
        /**
         * 拒绝好友请求
         * PUT /api/v1/friends/:friendId/reject
         */
        this.rejectFriendRequest = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const userId = req.user.id;
            const friendId = req.params.friendId;
            await FriendService_1.default.rejectFriendRequest(userId, friendId);
            (0, response_1.success)(res, { message: '已拒绝好友请求' });
        });
        /**
         * 删除好友
         * DELETE /api/v1/friends/:friendId
         */
        this.removeFriend = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const userId = req.user.id;
            const friendId = req.params.friendId;
            await FriendService_1.default.removeFriend(userId, friendId);
            (0, response_1.success)(res, { message: '已删除好友' });
        });
        /**
         * 获取好友列表
         * GET /api/v1/friends
         */
        this.getFriends = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const userId = req.user.id;
            const friends = await FriendService_1.default.getFriends(userId);
            const data = friends.map((friend) => ({
                user_id: friend.id,
                nickname: friend.nickname,
                avatar_url: friend.avatarUrl,
                age: friend.age,
                gender: friend.gender,
                hiking_level: friend.hikingLevel,
                bio: friend.bio,
            }));
            (0, response_1.success)(res, data);
        });
        /**
         * 获取待处理的好友请求
         * GET /api/v1/friends/requests/pending
         */
        this.getPendingRequests = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const userId = req.user.id;
            const requests = await FriendService_1.default.getPendingRequests(userId);
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
            (0, response_1.success)(res, data);
        });
        /**
         * 搜索用户
         * GET /api/v1/friends/search
         */
        this.searchUsers = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const userId = req.user.id;
            const keyword = req.query.keyword;
            if (!keyword || keyword.trim().length === 0) {
                return (0, response_1.success)(res, []);
            }
            const users = await FriendService_1.default.searchUsers(keyword.trim(), userId);
            const data = users.map((user) => ({
                user_id: user.id,
                nickname: user.nickname,
                avatar_url: user.avatarUrl,
                age: user.age,
                gender: user.gender,
                hiking_level: user.hikingLevel,
                bio: user.bio,
            }));
            (0, response_1.success)(res, data);
        });
        /**
         * 获取推荐用户
         * GET /api/v1/friends/recommendations
         */
        this.getRecommendedUsers = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const userId = req.user.id;
            const limit = parseInt(req.query.limit) || 10;
            const users = await FriendService_1.default.getRecommendedUsers(userId, limit);
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
            (0, response_1.success)(res, data);
        });
        /**
         * 检查好友关系状态
         * GET /api/v1/friends/:friendId/status
         */
        this.getFriendshipStatus = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const userId = req.user.id;
            const friendId = req.params.friendId;
            const status = await FriendService_1.default.getFriendshipStatus(userId, friendId);
            (0, response_1.success)(res, {
                friend_id: friendId,
                status: status || 'none',
            });
        });
    }
}
exports.FriendController = FriendController;
exports.default = new FriendController();
//# sourceMappingURL=FriendController.js.map