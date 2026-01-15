import { Request, Response } from 'express';
import { discoveryService } from '../services/DiscoveryService';
import {
  success,
  businessError,
  validationError,
  serverError,
  paginated
} from '../utils/response';
import { BusinessErrorCode } from '../types/api.types';

export class DiscoveryController {
  /**
   * 获取推荐活动
   * GET /api/v1/discovery/activities
   */
  static async getRecommendedActivities(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return businessError(res, BusinessErrorCode.UNAUTHORIZED, '未授权访问');
      }

      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.page_size as string) || 20;

      const { activities, total } = await discoveryService.getRecommendedActivities(
        userId,
        page,
        pageSize
      );

      return paginated(res, activities, page, pageSize, total, '获取推荐活动成功');
    } catch (error: any) {
      console.error('Get recommended activities error:', error);
      return serverError(res, '获取推荐活动失败', error);
    }
  }

  /**
   * 获取推荐用户
   * GET /api/v1/discovery/users
   */
  static async getRecommendedUsers(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return businessError(res, BusinessErrorCode.UNAUTHORIZED, '未授权访问');
      }

      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.page_size as string) || 20;

      const { users, total } = await discoveryService.getRecommendedUsers(
        userId,
        page,
        pageSize
      );

      return paginated(res, users, page, pageSize, total, '获取推荐用户成功');
    } catch (error: any) {
      console.error('Get recommended users error:', error);
      return serverError(res, '获取推荐用户失败', error);
    }
  }

  /**
   * 搜索活动
   * GET /api/v1/discovery/search/activities
   */
  static async searchActivities(req: Request, res: Response): Promise<void> {
    try {
      const keyword = (req.query.keyword as string) || '';
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.page_size as string) || 20;
      const userId = req.user?.id;

      const filters: any = {};
      if (req.query.difficulty) filters.difficulty = req.query.difficulty;
      if (req.query.location) filters.location = req.query.location;
      if (req.query.start_date) filters.start_date = new Date(req.query.start_date as string);
      if (req.query.end_date) filters.end_date = new Date(req.query.end_date as string);

      const { activities, total } = await discoveryService.searchActivities(
        keyword,
        filters,
        page,
        pageSize,
        userId
      );

      return paginated(res, activities, page, pageSize, total, '搜索活动成功');
    } catch (error: any) {
      console.error('Search activities error:', error);
      return serverError(res, '搜索活动失败', error);
    }
  }

  /**
   * 搜索用户
   * GET /api/v1/discovery/search/users
   */
  static async searchUsers(req: Request, res: Response): Promise<void> {
    try {
      const keyword = (req.query.keyword as string) || '';
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.page_size as string) || 20;

      const filters: any = {};
      if (req.query.gender) filters.gender = req.query.gender;
      if (req.query.hiking_level) filters.hiking_level = req.query.hiking_level;

      const { users, total } = await discoveryService.searchUsers(
        keyword,
        filters,
        page,
        pageSize
      );

      return paginated(res, users, page, pageSize, total, '搜索用户成功');
    } catch (error: any) {
      console.error('Search users error:', error);
      return serverError(res, '搜索用户失败', error);
    }
  }
}
