import { pool } from '../config/database';
import { BusinessErrorCode } from '../types/api.types';
export class UserDetailService {
    /**
     * 获取用户完整详情（用于用户详情页面）
     */
    async getUserDetail(userId) {
        // 1. 获取用户基本信息
        const [users] = await pool.query(`SELECT id, email, nickname, avatar_url, gender, age, bio, hiking_level, province, city, region, is_verified, created_at
       FROM users WHERE id = ? AND deleted_at IS NULL`, [userId]);
        if (users.length === 0) {
            throw {
                code: BusinessErrorCode.USER_NOT_FOUND,
                message: '用户不存在'
            };
        }
        const user = users[0];
        // 2. 获取关注者数量
        const [followerCount] = await pool.query('SELECT COUNT(*) as count FROM user_followers WHERE following_id = ?', [userId]);
        const followers_count = followerCount[0].count || 0;
        // 3. 获取用户发起的活动数（徒步次数）
        const [activitiesCount] = await pool.query('SELECT COUNT(*) as count FROM activities WHERE creator_id = ? AND deleted_at IS NULL', [userId]);
        const activities_count = activitiesCount[0].count || 0;
        // 4. 获取用户偏好
        const [preferences] = await pool.query(`SELECT id, preference_type, preference_value
       FROM user_preferences WHERE user_id = ?
       ORDER BY created_at DESC`, [userId]);
        // 5. 获取用户相册
        const [photos] = await pool.query(`SELECT id, photo_url, sort_order
       FROM user_photos WHERE user_id = ?
       ORDER BY sort_order ASC`, [userId]);
        return {
            ...user,
            followers_count,
            activities_count,
            preferences: preferences,
            photos: photos
        };
    }
    /**
     * 关注用户
     */
    async followUser(followerId, followingId) {
        // 检查不能自己关注自己
        if (followerId === followingId) {
            throw {
                code: 2001,
                message: '不能关注自己'
            };
        }
        // 检查被关注用户是否存在
        const [targetUser] = await pool.query('SELECT id FROM users WHERE id = ? AND deleted_at IS NULL', [followingId]);
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
            await pool.query('INSERT INTO user_followers (id, follower_id, following_id) VALUES (?, ?, ?)', [followId, followerId, followingId]);
        }
        catch (error) {
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
    async unfollowUser(followerId, followingId) {
        const result = await pool.query('DELETE FROM user_followers WHERE follower_id = ? AND following_id = ?', [followerId, followingId]);
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
    async isFollowing(followerId, followingId) {
        const [rows] = await pool.query('SELECT id FROM user_followers WHERE follower_id = ? AND following_id = ?', [followerId, followingId]);
        return rows.length > 0;
    }
}
export const userDetailService = new UserDetailService();
//# sourceMappingURL=UserDetailService.js.map