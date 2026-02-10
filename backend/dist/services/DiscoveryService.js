"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.discoveryService = exports.DiscoveryService = void 0;
const database_1 = require("../config/database");
class DiscoveryService {
    getPresetActivities() {
        const now = new Date();
        return [
            {
                id: 'preset-activity-1',
                creator_id: 'preset-user-1',
                title: '香山轻徒步小队',
                description: '适合新手的轻松路线，沿途拍照打卡。',
                cover_image_url: 'https://picsum.photos/800/600?random=preset-activity-1',
                location: '北京市海淀区·香山',
                latitude: 39.9928,
                longitude: 116.1887,
                start_time: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
                end_time: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
                difficulty: 'easy',
                max_participants: 12,
                status: 'approved',
                route_description: '山脚集合，沿木栈道上山，山顶补给。',
                equipment_required: '轻便登山鞋、饮水、帽子',
                created_at: now,
                updated_at: now,
                deleted_at: null,
                creator: {
                    id: 'preset-user-1',
                    nickname: '小禾',
                    avatar_url: 'https://picsum.photos/200/200?random=preset-user-1',
                    hiking_level: 'beginner'
                },
                participant_count: 5,
                is_joined: false
            },
            {
                id: 'preset-activity-2',
                creator_id: 'preset-user-2',
                title: '龙泉寺日落徒步',
                description: '傍晚出发，拍夕阳与城市夜景。',
                cover_image_url: 'https://picsum.photos/800/600?random=preset-activity-2',
                location: '北京市海淀区·龙泉寺',
                latitude: 40.0321,
                longitude: 116.1389,
                start_time: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
                end_time: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
                difficulty: 'moderate',
                max_participants: 10,
                status: 'approved',
                route_description: '寺庙集合，环线徒步约6公里。',
                equipment_required: '登山鞋、头灯、饮水',
                created_at: now,
                updated_at: now,
                deleted_at: null,
                creator: {
                    id: 'preset-user-2',
                    nickname: '阿柒',
                    avatar_url: 'https://picsum.photos/200/200?random=preset-user-2',
                    hiking_level: 'intermediate'
                },
                participant_count: 7,
                is_joined: false
            },
            {
                id: 'preset-activity-3',
                creator_id: 'preset-user-3',
                title: '百望山晨练',
                description: '清晨出发，轻松爬升。',
                cover_image_url: 'https://picsum.photos/800/600?random=preset-activity-3',
                location: '北京市海淀区·百望山',
                latitude: 40.0155,
                longitude: 116.2884,
                start_time: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
                end_time: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
                difficulty: 'easy',
                max_participants: 8,
                status: 'approved',
                route_description: '山脚集合，缓坡上山，山顶休息。',
                equipment_required: '运动鞋、饮水',
                created_at: now,
                updated_at: now,
                deleted_at: null,
                creator: {
                    id: 'preset-user-3',
                    nickname: '暮山',
                    avatar_url: 'https://picsum.photos/200/200?random=preset-user-3',
                    hiking_level: 'beginner'
                },
                participant_count: 3,
                is_joined: false
            },
            {
                id: 'preset-activity-4',
                creator_id: 'preset-user-4',
                title: '西山林道挑战',
                description: '中等强度，适合有基础的伙伴。',
                cover_image_url: 'https://picsum.photos/800/600?random=preset-activity-4',
                location: '北京市海淀区·西山森林公园',
                latitude: 39.9665,
                longitude: 116.2493,
                start_time: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
                end_time: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
                difficulty: 'moderate',
                max_participants: 15,
                status: 'approved',
                route_description: '林道环线约10公里，补给点较少。',
                equipment_required: '登山鞋、补给、雨具',
                created_at: now,
                updated_at: now,
                deleted_at: null,
                creator: {
                    id: 'preset-user-4',
                    nickname: '远行',
                    avatar_url: 'https://picsum.photos/200/200?random=preset-user-4',
                    hiking_level: 'intermediate'
                },
                participant_count: 9,
                is_joined: false
            },
            {
                id: 'preset-activity-5',
                creator_id: 'preset-user-5',
                title: '妙峰山进阶线',
                description: '进阶路线，爬升较大，风景绝佳。',
                cover_image_url: 'https://picsum.photos/800/600?random=preset-activity-5',
                location: '北京市门头沟·妙峰山',
                latitude: 39.9972,
                longitude: 116.0653,
                start_time: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
                end_time: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000),
                difficulty: 'hard',
                max_participants: 6,
                status: 'approved',
                route_description: '高爬升路线，注意节奏与补给。',
                equipment_required: '登山鞋、登山杖、能量补给',
                created_at: now,
                updated_at: now,
                deleted_at: null,
                creator: {
                    id: 'preset-user-5',
                    nickname: '北冥',
                    avatar_url: 'https://picsum.photos/200/200?random=preset-user-5',
                    hiking_level: 'advanced'
                },
                participant_count: 2,
                is_joined: false
            }
        ];
    }
    getPresetUsers() {
        return [
            {
                id: 'preset-user-1',
                nickname: '小禾',
                avatar_url: 'https://picsum.photos/200/200?random=preset-user-1',
                gender: 'female',
                age: 24,
                bio: '周末徒步爱好者，喜欢轻松路线。',
                hiking_level: 'beginner',
                common_preferences: 3,
                photo_count: 4
            },
            {
                id: 'preset-user-2',
                nickname: '阿柒',
                avatar_url: 'https://picsum.photos/200/200?random=preset-user-2',
                gender: 'male',
                age: 27,
                bio: '喜欢日落徒步和摄影。',
                hiking_level: 'intermediate',
                common_preferences: 4,
                photo_count: 6
            },
            {
                id: 'preset-user-3',
                nickname: '暮山',
                avatar_url: 'https://picsum.photos/200/200?random=preset-user-3',
                gender: 'female',
                age: 22,
                bio: '清晨徒步，路线不长但风景好。',
                hiking_level: 'beginner',
                common_preferences: 2,
                photo_count: 3
            },
            {
                id: 'preset-user-4',
                nickname: '远行',
                avatar_url: 'https://picsum.photos/200/200?random=preset-user-4',
                gender: 'male',
                age: 30,
                bio: '中强度徒步爱好者，擅长路线规划。',
                hiking_level: 'intermediate',
                common_preferences: 5,
                photo_count: 7
            },
            {
                id: 'preset-user-5',
                nickname: '北冥',
                avatar_url: 'https://picsum.photos/200/200?random=preset-user-5',
                gender: 'other',
                age: 31,
                bio: '进阶路线，注重安全与装备。',
                hiking_level: 'advanced',
                common_preferences: 3,
                photo_count: 5
            }
        ];
    }
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
        if (formattedActivities.length === 0 && page === 1) {
            const presetActivities = this.getPresetActivities();
            return { activities: presetActivities, total: presetActivities.length };
        }
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
        const formattedUsers = users.map((user) => ({
            id: user.id,
            nickname: user.nickname,
            avatar_url: user.avatar_url,
            gender: user.gender,
            age: user.age,
            bio: user.bio,
            hiking_level: user.hiking_level,
            common_preferences: user.common_preferences,
            photo_count: user.photo_count
        }));
        if (formattedUsers.length === 0 && page === 1) {
            const presetUsers = this.getPresetUsers();
            return { users: presetUsers, total: presetUsers.length };
        }
        return { users: formattedUsers, total };
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