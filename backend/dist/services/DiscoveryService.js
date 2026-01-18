"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.discoveryService = exports.DiscoveryService = void 0;
const database_1 = require("../config/database");
class DiscoveryService {
    /**
     * 获取推荐活动列表
     * 基于用户偏好、历史参与等推荐合适的活动
     */
    async getRecommendedActivities(userId, page = 1, pageSize = 20) {
        // 获取用户偏好
        const [userPrefs] = await database_1.pool.query('SELECT preference_type, preference_value FROM user_preferences WHERE user_id = ?', [userId]);
        // 构建推荐查询
        // 1. 排除用户已创建的活动
        // 2. 排除用户已加入的活动
        // 3. 只显示待审批和已审批的活动
        // 4. 按开始时间倒序
        const offset = (page - 1) * pageSize;
        const [countResult] = await database_1.pool.query(`SELECT COUNT(*) as total
       FROM activities a
       WHERE a.deleted_at IS NULL
       AND a.status IN ('pending', 'approved')
       AND a.creator_id != ?
       AND a.id NOT IN (
         SELECT activity_id FROM participations
         WHERE user_id = ? AND status = 'joined'
       )
       AND a.start_time > NOW()`, [userId, userId]);
        const total = countResult[0].total;
        const [activities] = await database_1.pool.query(`SELECT
        a.*,
        u.id as creator_id,
        u.nickname as creator_nickname,
        u.avatar_url as creator_avatar_url,
        u.hiking_level as creator_hiking_level,
        (SELECT COUNT(*) FROM participations WHERE activity_id = a.id AND status = 'joined') as participant_count
       FROM activities a
       JOIN users u ON a.creator_id = u.id
       WHERE a.deleted_at IS NULL
       AND a.status IN ('pending', 'approved')
       AND a.creator_id != ?
       AND a.id NOT IN (
         SELECT activity_id FROM participations
         WHERE user_id = ? AND status = 'joined'
       )
       AND a.start_time > NOW()
       ORDER BY a.start_time DESC
       LIMIT ? OFFSET ?`, [userId, userId, pageSize, offset]);
        const formattedActivities = activities.map((activity) => ({
            id: activity.id,
            creator_id: activity.creator_id,
            title: activity.title,
            description: activity.description,
            cover_image_url: activity.cover_image_url,
            location: activity.location,
            latitude: activity.latitude,
            longitude: activity.longitude,
            start_time: activity.start_time,
            end_time: activity.end_time,
            difficulty: activity.difficulty,
            max_participants: activity.max_participants,
            status: activity.status,
            route_description: activity.route_description,
            equipment_required: activity.equipment_required,
            created_at: activity.created_at,
            updated_at: activity.updated_at,
            deleted_at: activity.deleted_at,
            creator: {
                id: activity.creator_id,
                nickname: activity.creator_nickname,
                avatar_url: activity.creator_avatar_url,
                hiking_level: activity.creator_hiking_level
            },
            participant_count: activity.participant_count,
            is_joined: false
        }));
        return { activities: formattedActivities, total };
    }
    /**
     * 获取推荐用户列表
     * 基于共同偏好、徒步等级等推荐用户
     */
    async getRecommendedUsers(userId, page = 1, pageSize = 20) {
        const offset = (page - 1) * pageSize;
        // 获取当前用户的偏好
        const [userPrefs] = await database_1.pool.query('SELECT preference_type, preference_value FROM user_preferences WHERE user_id = ?', [userId]);
        // 查询其他用户，按共同偏好数量排序
        const [countResult] = await database_1.pool.query(`SELECT COUNT(DISTINCT u.id) as total
       FROM users u
       WHERE u.id != ? AND u.deleted_at IS NULL`, [userId]);
        const total = countResult[0].total;
        const [users] = await database_1.pool.query(`SELECT
        u.id,
        u.nickname,
        u.avatar_url,
        u.gender,
        u.age,
        u.bio,
        u.hiking_level,
        (SELECT COUNT(*) FROM user_photos WHERE user_id = u.id) as photo_count,
        (
          SELECT COUNT(*)
          FROM user_preferences up1
          JOIN user_preferences up2 ON up1.preference_type = up2.preference_type
            AND up1.preference_value = up2.preference_value
          WHERE up1.user_id = ? AND up2.user_id = u.id
        ) as common_preferences
       FROM users u
       WHERE u.id != ? AND u.deleted_at IS NULL
       ORDER BY common_preferences DESC, u.created_at DESC
       LIMIT ? OFFSET ?`, [userId, userId, pageSize, offset]);
        return {
            users: users.map((user) => ({
                id: user.id,
                nickname: user.nickname,
                avatar_url: user.avatar_url,
                gender: user.gender,
                age: user.age,
                bio: user.bio,
                hiking_level: user.hiking_level,
                common_preferences: user.common_preferences,
                photo_count: user.photo_count
            })),
            total
        };
    }
    /**
     * 搜索活动
     * 支持按关键词、地点、难度等搜索
     */
    async searchActivities(keyword, filters, page = 1, pageSize = 20, currentUserId) {
        let whereConditions = ['a.deleted_at IS NULL', 'a.status IN ("pending", "approved")'];
        let params = [];
        // 关键词搜索（标题或描述）
        if (keyword && keyword.trim().length > 0) {
            whereConditions.push('(a.title LIKE ? OR a.description LIKE ?)');
            const searchTerm = `%${keyword}%`;
            params.push(searchTerm, searchTerm);
        }
        // 难度筛选
        if (filters?.difficulty) {
            whereConditions.push('a.difficulty = ?');
            params.push(filters.difficulty);
        }
        // 地点筛选
        if (filters?.location) {
            whereConditions.push('a.location LIKE ?');
            params.push(`%${filters.location}%`);
        }
        // 时间范围筛选
        if (filters?.start_date) {
            whereConditions.push('a.start_time >= ?');
            params.push(filters.start_date);
        }
        if (filters?.end_date) {
            whereConditions.push('a.start_time <= ?');
            params.push(filters.end_date);
        }
        const whereClause = whereConditions.join(' AND ');
        // 获取总数
        const [countResult] = await database_1.pool.query(`SELECT COUNT(*) as total FROM activities a WHERE ${whereClause}`, params);
        const total = countResult[0].total;
        // 获取列表
        const offset = (page - 1) * pageSize;
        const [activities] = await database_1.pool.query(`SELECT
        a.*,
        u.id as creator_id,
        u.nickname as creator_nickname,
        u.avatar_url as creator_avatar_url,
        u.hiking_level as creator_hiking_level,
        (SELECT COUNT(*) FROM participations WHERE activity_id = a.id AND status = 'joined') as participant_count
       FROM activities a
       JOIN users u ON a.creator_id = u.id
       WHERE ${whereClause}
       ORDER BY a.start_time DESC
       LIMIT ? OFFSET ?`, [...params, pageSize, offset]);
        const formattedActivities = activities.map((activity) => ({
            id: activity.id,
            creator_id: activity.creator_id,
            title: activity.title,
            description: activity.description,
            cover_image_url: activity.cover_image_url,
            location: activity.location,
            latitude: activity.latitude,
            longitude: activity.longitude,
            start_time: activity.start_time,
            end_time: activity.end_time,
            difficulty: activity.difficulty,
            max_participants: activity.max_participants,
            status: activity.status,
            route_description: activity.route_description,
            equipment_required: activity.equipment_required,
            created_at: activity.created_at,
            updated_at: activity.updated_at,
            deleted_at: activity.deleted_at,
            creator: {
                id: activity.creator_id,
                nickname: activity.creator_nickname,
                avatar_url: activity.creator_avatar_url,
                hiking_level: activity.creator_hiking_level
            },
            participant_count: activity.participant_count
        }));
        return { activities: formattedActivities, total };
    }
    /**
     * 搜索用户
     * 支持按昵称、偏好等搜索
     */
    async searchUsers(keyword, filters, page = 1, pageSize = 20) {
        let whereConditions = ['u.deleted_at IS NULL'];
        let params = [];
        // 关键词搜索（昵称或简介）
        if (keyword && keyword.trim().length > 0) {
            whereConditions.push('(u.nickname LIKE ? OR u.bio LIKE ?)');
            const searchTerm = `%${keyword}%`;
            params.push(searchTerm, searchTerm);
        }
        // 性别筛选
        if (filters?.gender) {
            whereConditions.push('u.gender = ?');
            params.push(filters.gender);
        }
        // 徒步等级筛选
        if (filters?.hiking_level) {
            whereConditions.push('u.hiking_level = ?');
            params.push(filters.hiking_level);
        }
        const whereClause = whereConditions.join(' AND ');
        // 获取总数
        const [countResult] = await database_1.pool.query(`SELECT COUNT(*) as total FROM users u WHERE ${whereClause}`, params);
        const total = countResult[0].total;
        // 获取列表
        const offset = (page - 1) * pageSize;
        const [users] = await database_1.pool.query(`SELECT
        u.id,
        u.nickname,
        u.avatar_url,
        u.gender,
        u.age,
        u.bio,
        u.hiking_level,
        (SELECT COUNT(*) FROM user_photos WHERE user_id = u.id) as photo_count
       FROM users u
       WHERE ${whereClause}
       ORDER BY u.created_at DESC
       LIMIT ? OFFSET ?`, [...params, pageSize, offset]);
        return {
            users: users.map((user) => ({
                id: user.id,
                nickname: user.nickname,
                avatar_url: user.avatar_url,
                gender: user.gender,
                age: user.age,
                bio: user.bio,
                hiking_level: user.hiking_level,
                common_preferences: 0,
                photo_count: user.photo_count
            })),
            total
        };
    }
}
exports.DiscoveryService = DiscoveryService;
exports.discoveryService = new DiscoveryService();
//# sourceMappingURL=DiscoveryService.js.map