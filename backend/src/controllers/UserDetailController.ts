import { Request, Response } from 'express';
import { userDetailService } from '../services/UserDetailService';
import { success, businessError, validationError, serverError } from '../utils/response';
import { BusinessErrorCode } from '../types/api.types';

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

      const isFollowing = await userDetailService.isFollowing(currentUserId, userId);

      return success(res, { is_following: isFollowing }, '获取关注状态成功');
    } catch (error: any) {
      console.error('Get follow status error:', error);
      return serverError(res, '获取关注状态失败', error);
    }
  }
}
