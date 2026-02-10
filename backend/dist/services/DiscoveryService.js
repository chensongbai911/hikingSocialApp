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
                title: '泰山日出登顶之旅',
                description: '五岳之首，感受中国第一山的壮阔风景。凌晨出发，在天街迎接日出，体验泰山的雄伟与磅礴。',
                cover_image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&auto=format&fit=crop&q=80',
                location: '山东省泰安市·泰山',
                latitude: 36.2534,
                longitude: 117.1205,
                start_time: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
                end_time: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
                difficulty: 'hard',
                max_participants: 15,
                status: 'approved',
                route_description: '红门出发→中天门→南天门→玉皇顶，全程约7小时，海拔上升约1544米。',
                equipment_required: '登山鞋、登山杖、防晒霜、充足饮水、能量补给、手电筒',
                created_at: now,
                updated_at: now,
                deleted_at: null,
                creator: {
                    id: 'preset-user-1',
                    nickname: '小禾',
                    avatar_url: 'https://picsum.photos/200/200?random=preset-user-1',
                    hiking_level: 'advanced'
                },
                participant_count: 8,
                is_joined: false
            },
            {
                id: 'preset-activity-2',
                creator_id: 'preset-user-2',
                title: '华山险峰挑战赛',
                description: '西岳华山，以险峻著称。走过千尺幢、百尺峡，俯瞰秦岭壮观景色，感受刀锋上的冒险。',
                cover_image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&auto=format&fit=crop&q=80',
                location: '陕西省渭南市华阴·华山',
                latitude: 34.4853,
                longitude: 110.0840,
                start_time: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
                end_time: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
                difficulty: 'hard',
                max_participants: 10,
                status: 'approved',
                route_description: '玉泉院→五里关→千尺幢→百尺峡→北峰→东峰，全程约8小时，需具备一定攀爬能力。',
                equipment_required: '专业登山鞋、安全绳、头盔、手套、充足补给',
                created_at: now,
                updated_at: now,
                deleted_at: null,
                creator: {
                    id: 'preset-user-2',
                    nickname: '阿柒',
                    avatar_url: 'https://picsum.photos/200/200?random=preset-user-2',
                    hiking_level: 'advanced'
                },
                participant_count: 6,
                is_joined: false
            },
            {
                id: 'preset-activity-3',
                creator_id: 'preset-user-3',
                title: '黄山云海探秘',
                description: '奇松怪石云海温泉，黄山四绝尽收眼底。徒步经过莲花峰、光明顶，享受最壮观的日出和云海景观。',
                cover_image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&auto=format&fit=crop&q=80',
                location: '安徽省黄山市·黄山',
                latitude: 30.1165,
                longitude: 118.2329,
                start_time: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
                end_time: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
                difficulty: 'moderate',
                max_participants: 12,
                status: 'approved',
                route_description: '温泉景区→玉屏楼→莲花峰→光明顶→排云亭，全程约10公里，海拔起伏1200米。',
                equipment_required: '登山鞋、防晒、防风衣、充足饮水、相机',
                created_at: now,
                updated_at: now,
                deleted_at: null,
                creator: {
                    id: 'preset-user-3',
                    nickname: '暮山',
                    avatar_url: 'https://picsum.photos/200/200?random=preset-user-3',
                    hiking_level: 'intermediate'
                },
                participant_count: 9,
                is_joined: false
            },
            {
                id: 'preset-activity-4',
                creator_id: 'preset-user-4',
                title: '珠峰大本营高山之旅',
                description: '挑战世界之巅，徒步珠峰大本营。在海拔5200米俯瞰珠穆朗玛峰，感受高原的壮阔与神圣。',
                cover_image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&auto=format&fit=crop&q=80',
                location: '西藏·珠穆朗玛峰',
                latitude: 28.0081,
                longitude: 86.8644,
                start_time: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
                end_time: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
                difficulty: 'hard',
                max_participants: 8,
                status: 'approved',
                route_description: '拉萨→日喀则→定日→珠峰大本营，全程需5-7天，需提前适应高原环境。',
                equipment_required: '专业高山登山装备、防寒衣物、氧气罐、防晒霜、水补给、高原反应药物',
                created_at: now,
                updated_at: now,
                deleted_at: null,
                creator: {
                    id: 'preset-user-4',
                    nickname: '远行',
                    avatar_url: 'https://picsum.photos/200/200?random=preset-user-4',
                    hiking_level: 'advanced'
                },
                participant_count: 4,
                is_joined: false
            },
            {
                id: 'preset-activity-5',
                creator_id: 'preset-user-5',
                title: '峨眉山金顶之光',
                description: '普贤菩萨道场，佛教名山。登上金顶欣赏日出、云海、佛光三景，感受宗教与自然的完美融合。',
                cover_image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&auto=format&fit=crop&q=80',
                location: '四川省乐山市·峨眉山',
                latitude: 29.5428,
                longitude: 103.3372,
                start_time: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
                end_time: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
                difficulty: 'moderate',
                max_participants: 14,
                status: 'approved',
                route_description: '报国寺→清音阁→万年寺→洪椿坪→金顶，全程约18公里，可选择搭乘缆车。',
                equipment_required: '登山鞋、防滑装备、防寒衣物、充足饮水、驱虫剂',
                created_at: now,
                updated_at: now,
                deleted_at: null,
                creator: {
                    id: 'preset-user-5',
                    nickname: '北冥',
                    avatar_url: 'https://picsum.photos/200/200?random=preset-user-5',
                    hiking_level: 'intermediate'
                },
                participant_count: 10,
                is_joined: false
            }
        ];
    }
    getPresetUsers() {
        return [
            {
                id: 'preset-user-1',
                nickname: '小禾',
                avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
                gender: 'female',
                age: 24,
                bio: '五岳登顶者，专注高山徒步，追求极致风景。摄影爱好者，有3次国外登山经验。',
                hiking_level: 'advanced',
                common_preferences: 8,
                photo_count: 42
            },
            {
                id: 'preset-user-2',
                nickname: '阿柒',
                avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
                gender: 'male',
                age: 27,
                bio: '野山野岭探险家，热爱未开发徒步路线。装备技术控，擅长路线规划和安全教学。',
                hiking_level: 'advanced',
                common_preferences: 9,
                photo_count: 58
            },
            {
                id: 'preset-user-3',
                nickname: '暮山',
                avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
                gender: 'female',
                age: 22,
                bio: '登山新人，已完成泰山、华山登顶。希望挑战更多名山，记录每次登山的故事。',
                hiking_level: 'intermediate',
                common_preferences: 5,
                photo_count: 31
            },
            {
                id: 'preset-user-4',
                nickname: '远行',
                avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
                gender: 'male',
                age: 30,
                bio: '资深山友，徒步足迹遍布大江南北。善于发现冷门徒步线路，周末活跃度最高。',
                hiking_level: 'advanced',
                common_preferences: 10,
                photo_count: 87
            },
            {
                id: 'preset-user-5',
                nickname: '北冥',
                avatar_url: 'https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&w=200&q=80',
                gender: 'other',
                age: 31,
                bio: '专业登山队员，雪山高山探险经验丰富。致力于推广登山安全文化和户外技能培训。',
                hiking_level: 'advanced',
                common_preferences: 12,
                photo_count: 124
            }
        ];
    }
    /**
     * 获取推荐活动列表
     * 基于用户偏好、历史参与等推荐合适的活动
     */
    async getRecommendedActivities(userId, page = 1, pageSize = 20) {
        // 首先返回精心策划的 preset 活动（真实名山大川）
        if (page === 1) {
            const presetActivities = this.getPresetActivities();
            // 如果 preset 活动足够，直接返回
            if (presetActivities.length >= pageSize) {
                return { activities: presetActivities.slice(0, pageSize), total: presetActivities.length };
            }
            // 否则返回 preset 活动
            return { activities: presetActivities, total: presetActivities.length };
        }
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