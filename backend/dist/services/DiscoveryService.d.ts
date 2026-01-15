import { ActivityWithCreator } from './ActivityService';
export interface UserRecommendation {
    id: string;
    nickname: string;
    avatar_url: string | null;
    gender: 'male' | 'female' | 'other';
    age: number | null;
    bio: string | null;
    hiking_level: 'beginner' | 'intermediate' | 'advanced';
    common_preferences: number;
    photo_count: number;
}
export declare class DiscoveryService {
    /**
     * 获取推荐活动列表
     * 基于用户偏好、历史参与等推荐合适的活动
     */
    getRecommendedActivities(userId: string, page?: number, pageSize?: number): Promise<{
        activities: ActivityWithCreator[];
        total: number;
    }>;
    /**
     * 获取推荐用户列表
     * 基于共同偏好、徒步等级等推荐用户
     */
    getRecommendedUsers(userId: string, page?: number, pageSize?: number): Promise<{
        users: UserRecommendation[];
        total: number;
    }>;
    /**
     * 搜索活动
     * 支持按关键词、地点、难度等搜索
     */
    searchActivities(keyword: string, filters?: {
        difficulty?: string;
        location?: string;
        start_date?: Date;
        end_date?: Date;
    }, page?: number, pageSize?: number, currentUserId?: string): Promise<{
        activities: ActivityWithCreator[];
        total: number;
    }>;
    /**
     * 搜索用户
     * 支持按昵称、偏好等搜索
     */
    searchUsers(keyword: string, filters?: {
        gender?: string;
        hiking_level?: string;
    }, page?: number, pageSize?: number): Promise<{
        users: UserRecommendation[];
        total: number;
    }>;
}
export declare const discoveryService: DiscoveryService;
//# sourceMappingURL=DiscoveryService.d.ts.map