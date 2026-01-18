"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserDetailController = void 0;
const UserDetailService_1 = require("../services/UserDetailService");
const response_1 = require("../utils/response");
const api_types_1 = require("../types/api.types");
// 简单的内存缓存（关注状态缓存，5秒过期）
const followStatusCache = new Map();
const CACHE_TTL = 5000; // 5秒
class UserDetailController {
    /**
     * 获取用户详情
     * GET /api/v1/users/:userId/detail
     */
    static async getUserDetail(req, res) {
        try {
            const { userId } = req.params;
            if (!userId) {
                return (0, response_1.validationError)(res, '缺少用户ID参数');
            }
            const userDetail = await UserDetailService_1.userDetailService.getUserDetail(userId);
            return (0, response_1.success)(res, userDetail, '获取用户详情成功');
        }
        catch (error) {
            console.error('Get user detail error:', error);
            if (error.code === api_types_1.BusinessErrorCode.USER_NOT_FOUND) {
                return (0, response_1.businessError)(res, error.code, error.message);
            }
            return (0, response_1.serverError)(res, '获取用户详情失败', error);
        }
    }
    /**
     * 关注用户
     * POST /api/v1/users/:userId/follow
     */
    static async followUser(req, res) {
        try {
            const currentUserId = req.user?.id;
            const { userId } = req.params;
            if (!currentUserId) {
                return (0, response_1.businessError)(res, api_types_1.BusinessErrorCode.UNAUTHORIZED, '未授权访问');
            }
            if (!userId) {
                return (0, response_1.validationError)(res, '缺少用户ID参数');
            }
            await UserDetailService_1.userDetailService.followUser(currentUserId, userId);
            // 清除关注状态缓存
            const cacheKey = `${currentUserId}:${userId}`;
            followStatusCache.delete(cacheKey);
            return (0, response_1.success)(res, { following: true }, '关注成功');
        }
        catch (error) {
            console.error('Follow user error:', error);
            if (error.code === api_types_1.BusinessErrorCode.USER_NOT_FOUND || error.code === 2001) {
                return (0, response_1.businessError)(res, error.code, error.message);
            }
            return (0, response_1.serverError)(res, '关注失败', error);
        }
    }
    /**
     * 取消关注用户
     * DELETE /api/v1/users/:userId/follow
     */
    static async unfollowUser(req, res) {
        try {
            const currentUserId = req.user?.id;
            const { userId } = req.params;
            if (!currentUserId) {
                return (0, response_1.businessError)(res, api_types_1.BusinessErrorCode.UNAUTHORIZED, '未授权访问');
            }
            if (!userId) {
                return (0, response_1.validationError)(res, '缺少用户ID参数');
            }
            await UserDetailService_1.userDetailService.unfollowUser(currentUserId, userId);
            // 清除关注状态缓存
            const cacheKey = `${currentUserId}:${userId}`;
            followStatusCache.delete(cacheKey);
            return (0, response_1.success)(res, { following: false }, '取消关注成功');
        }
        catch (error) {
            console.error('Unfollow user error:', error);
            if (error.code === 2001) {
                return (0, response_1.businessError)(res, error.code, error.message);
            }
            return (0, response_1.serverError)(res, '取消关注失败', error);
        }
    }
    /**
     * 检查关注状态
     * GET /api/v1/users/:userId/follow-status
     */
    static async getFollowStatus(req, res) {
        try {
            const currentUserId = req.user?.id;
            const { userId } = req.params;
            if (!currentUserId) {
                return (0, response_1.businessError)(res, api_types_1.BusinessErrorCode.UNAUTHORIZED, '未授权访问');
            }
            if (!userId) {
                return (0, response_1.validationError)(res, '缺少用户ID参数');
            }
            // 构建缓存键
            const cacheKey = `${currentUserId}:${userId}`;
            const now = Date.now();
            // 检查缓存
            const cached = followStatusCache.get(cacheKey);
            if (cached && (now - cached.timestamp) < CACHE_TTL) {
                return (0, response_1.success)(res, { is_following: cached.isFollowing }, '获取关注状态成功(缓存)');
            }
            // 查询数据库
            const isFollowing = await UserDetailService_1.userDetailService.isFollowing(currentUserId, userId);
            // 更新缓存
            followStatusCache.set(cacheKey, { isFollowing, timestamp: now });
            // 定期清理过期缓存（防止内存泄漏）
            if (followStatusCache.size > 1000) {
                for (const [key, value] of followStatusCache.entries()) {
                    if (now - value.timestamp > CACHE_TTL) {
                        followStatusCache.delete(key);
                    }
                }
            }
            return (0, response_1.success)(res, { is_following: isFollowing }, '获取关注状态成功');
        }
        catch (error) {
            console.error('Get follow status error:', error);
            return (0, response_1.serverError)(res, '获取关注状态失败', error);
        }
    }
}
exports.UserDetailController = UserDetailController;
//# sourceMappingURL=UserDetailController.js.map