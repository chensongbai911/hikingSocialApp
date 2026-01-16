import { pool } from '../config/database';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { BusinessErrorCode } from '../types/api.types';

interface UserDetail {
  id: string;
  email: string;
  nickname: string;
  avatar_url: string | null;
  gender: string | null;
  age: number | null;
  bio: string | null;
  hiking_level: string;
  province: string | null;
  city: string | null;
  region: string | null;
  is_verified: boolean;
  created_at: Date;
  followers_count: number; // 关注者数量
  activities_count: number; // 徒步次数
  preferences: Array<{
    id: string;
    preference_type: string;
    preference_value: string;
  }>;
  photos: Array<{
    id: string;
    photo_url: string;
    sort_order: number;
  }>;
}

export class UserDetailService {
  /**
   * 获取用户完整详情（用于用户详情页面）
   */
  async getUserDetail(userId: string): Promise<UserDetail> {
    // 1. 获取用户基本信息
    const [users] = await pool.query<RowDataPacket[]>(
      `SELECT id, email, nickname, avatar_url, gender, age, bio, hiking_level, province, city, region, is_verified, created_at
       FROM users WHERE id = ? AND deleted_at IS NULL`,
      [userId]
    );

    if (users.length === 0) {
      throw {
        code: BusinessErrorCode.USER_NOT_FOUND,
        message: '用户不存在'
      };
    }

    const user = users[0];

    // 2. 获取关注者数量
    const [followerCount] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM user_followers WHERE following_id = ?',
      [userId]
    );
    const followers_count = followerCount[0].count || 0;

    // 3. 获取用户发起的活动数（徒步次数）
    const [activitiesCount] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM activities WHERE creator_id = ? AND deleted_at IS NULL',
      [userId]
    );
    const activities_count = activitiesCount[0].count || 0;

    // 4. 获取用户偏好
    const [preferences] = await pool.query<RowDataPacket[]>(
      `SELECT id, preference_type, preference_value
       FROM user_preferences WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    // 5. 获取用户相册
    const [photos] = await pool.query<RowDataPacket[]>(
      `SELECT id, photo_url, sort_order
       FROM user_photos WHERE user_id = ?
       ORDER BY sort_order ASC`,
      [userId]
    );

    return {
      ...user,
      followers_count,
      activities_count,
      preferences: preferences as any[],
      photos: photos as any[]
    } as UserDetail;
  }

  /**
   * 关注用户
   */
  async followUser(followerId: string, followingId: string): Promise<void> {
    // 检查不能自己关注自己
    if (followerId === followingId) {
      throw {
        code: 2001,
        message: '不能关注自己'
      };
    }

    // 检查被关注用户是否存在
    const [targetUser] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM users WHERE id = ? AND deleted_at IS NULL',
      [followingId]
    );

    if (targetUser.length === 0) {
      throw {
        code: BusinessErrorCode.USER_NOT_FOUND,
        message: '被关注用户不存在'
      };
    }

    // 生成关注关系ID
    const followId = `follow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // 插入关注关系
    try {
      await pool.query<ResultSetHeader>(
        'INSERT INTO user_followers (id, follower_id, following_id) VALUES (?, ?, ?)',
        [followId, followerId, followingId]
      );
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw {
          code: 2001,
          message: '已经关注过该用户'
        };
      }
      throw error;
    }
  }

  /**
   * 取消关注用户
   */
  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    const result = await pool.query<ResultSetHeader>(
      'DELETE FROM user_followers WHERE follower_id = ? AND following_id = ?',
      [followerId, followingId]
    );

    if (result[0].affectedRows === 0) {
      throw {
        code: 2001,
        message: '未关注该用户'
      };
    }
  }

  /**
   * 检查是否已关注
   */
  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM user_followers WHERE follower_id = ? AND following_id = ?',
      [followerId, followingId]
    );

    return rows.length > 0;
  }
}

export const userDetailService = new UserDetailService();
