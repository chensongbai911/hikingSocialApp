import { Request, Response } from 'express';
import { userDetailService } from '../services/UserDetailService';
import { success, businessError, validationError, serverError } from '../utils/response';
import { BusinessErrorCode } from '../types/api.types';

// 简单的内存缓存（关注状态缓存，5秒过期）
const followStatusCache = new Map<string, { isFollowing: boolean; timestamp: number }>();
const CACHE_TTL = 5000; // 5秒

export class UserDetailController {
  /**
   * 获取用户详情
   * GET /api/v1/users/:userId/detail
   */
  static async getUserDetail(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      if (!userId) {
        return validationError(res, '缺少用户ID参数');
      }

      const userDetail = await userDetailService.getUserDetail(userId);

      return success(res, userDetail, '获取用户详情成功');
    } catch (error: any) {
      console.error('Get user detail error:', error);

      if (error.code === BusinessErrorCode.USER_NOT_FOUND) {
        return businessError(res, error.code, error.message);
      }

      return serverError(res, '获取用户详情失败', error);
    }
  }

  /**
   * 关注用户
   * POST /api/v1/users/:userId/follow
   */
  static async followUser(req: Request, res: Response): Promise<void> {
    try {
      const currentUserId = req.user?.id;
      const { userId } = req.params;

      if (!currentUserId) {
        return businessError(res, BusinessErrorCode.UNAUTHORIZED, '未授权访问');
      }

      if (!userId) {
        return validationError(res, '缺少用户ID参数');
      }

      await userDetailService.followUser(currentUserId, userId);

      // 清除关注状态缓存
      const cacheKey = `${currentUserId}:${userId}`;
      followStatusCache.delete(cacheKey);

      return success(res, { following: true }, '关注成功');
    } catch (error: any) {
      console.error('Follow user error:', error);

      if (error.code === BusinessErrorCode.USER_NOT_FOUND || error.code === 2001) {
        return businessError(res, error.code, error.message);
      }

      return serverError(res, '关注失败', error);
    }
  }

  /**
   * 取消关注用户
   * DELETE /api/v1/users/:userId/follow
   */
  static async unfollowUser(req: Request, res: Response): Promise<void> {
    try {
      const currentUserId = req.user?.id;
      const { userId } = req.params;

      if (!currentUserId) {
        return businessError(res, BusinessErrorCode.UNAUTHORIZED, '未授权访问');
      }

      if (!userId) {
        return validationError(res, '缺少用户ID参数');
      }

      await userDetailService.unfollowUser(currentUserId, userId);

      // 清除关注状态缓存
      const cacheKey = `${currentUserId}:${userId}`;
      followStatusCache.delete(cacheKey);

      return success(res, { following: false }, '取消关注成功');
    } catch (error: any) {
      console.error('Unfollow user error:', error);

      if (error.code === 2001) {
        return businessError(res, error.code, error.message);
      }

      return serverError(res, '取消关注失败', error);
    }
  }

  /**
   * 检查关注状态
   * GET /api/v1/users/:userId/follow-status
   */
  static async getFollowStatus(req: Request, res: Response): Promise<void> {
    try {
      const currentUserId = req.user?.id;
      const { userId } = req.params;

      if (!currentUserId) {
        return businessError(res, BusinessErrorCode.UNAUTHORIZED, '未授权访问');
      }

      if (!userId) {
        return validationError(res, '缺少用户ID参数');
      }

      // 构建缓存键
      const cacheKey = `${currentUserId}:${userId}`;
      const now = Date.now();

      // 检查缓存
      const cached = followStatusCache.get(cacheKey);
      if (cached && (now - cached.timestamp) < CACHE_TTL) {
        return success(res, { is_following: cached.isFollowing }, '获取关注状态成功(缓存)');
      }

      // 查询数据库
      const isFollowing = await userDetailService.isFollowing(currentUserId, userId);

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

      return success(res, { is_following: isFollowing }, '获取关注状态成功');
    } catch (error: any) {
      console.error('Get follow status error:', error);
      return serverError(res, '获取关注状态失败', error);
    }
  }
}
