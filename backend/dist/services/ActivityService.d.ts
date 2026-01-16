export interface Activity {
    id: string;
    creator_id: string;
    title: string;
    description: string | null;
    cover_image_url: string | null;
    photos?: string[];
    location: string;
    latitude: number | null;
    longitude: number | null;
    start_time: Date;
    end_time: Date | null;
    difficulty: 'easy' | 'moderate' | 'hard';
    max_participants: number | null;
    status: 'pending' | 'approved' | 'ongoing' | 'completed' | 'cancelled' | 'recruiting';
    route_description: string | null;
    equipment_required: string | null;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
}
export interface ActivityWithCreator extends Activity {
    creator: {
        id: string;
        nickname: string;
        avatar_url: string | null;
        hiking_level: 'beginner' | 'intermediate' | 'advanced';
    };
    participant_count: number;
    is_joined?: boolean;
}
export interface Participation {
    id: string;
    user_id: string;
    activity_id: string;
    status: 'joined' | 'completed' | 'cancelled';
    joined_at: Date;
    completed_at: Date | null;
    cancelled_at: Date | null;
    feedback: string | null;
    rating: number | null;
}
export interface CreateActivityPayload {
    title: string;
    description?: string;
    cover_image_url?: string;
    photos?: string[];
    location: string;
    latitude?: number;
    longitude?: number;
    start_time: Date;
    end_time?: Date;
    difficulty: 'easy' | 'moderate' | 'hard';
    max_participants?: number;
    route_description?: string;
    equipment_required?: string;
}
export interface UpdateActivityPayload {
    title?: string;
    description?: string;
    cover_image_url?: string;
    photos?: string[];
    location?: string;
    latitude?: number;
    longitude?: number;
    start_time?: Date;
    end_time?: Date;
    difficulty?: 'easy' | 'moderate' | 'hard';
    max_participants?: number;
    status?: 'pending' | 'approved' | 'ongoing' | 'completed' | 'cancelled' | 'recruiting';
    route_description?: string;
    equipment_required?: string;
}
export declare class ActivityService {
    /**
     * 生成活动ID
     */
    private generateActivityId;
    /**
     * 生成活动照片ID
     */
    private generatePhotoId;
    /**
     * 保存活动照片
     */
    private saveActivityPhotos;
    /**
     * 获取活动照片
     */
    private getActivityPhotos;
    /**
     * 生成参与记录ID
     */
    private generateParticipationId;
    /**
     * 创建活动
     */
    createActivity(creatorId: string, data: CreateActivityPayload): Promise<ActivityWithCreator>;
    /**
     * 获取活动详情
     */
    getActivityById(activityId: string, currentUserId?: string): Promise<ActivityWithCreator>;
    /**
     * 获取活动列表（带分页）
     */
    getActivities(page?: number, pageSize?: number, filters?: {
        status?: string;
        difficulty?: string;
        creator_id?: string;
        start_date?: Date;
        end_date?: Date;
    }, currentUserId?: string): Promise<{
        activities: ActivityWithCreator[];
        total: number;
    }>;
    /**
     * 更新活动
     */
    updateActivity(activityId: string, creatorId: string, data: UpdateActivityPayload): Promise<ActivityWithCreator>;
    /**
     * 删除活动（软删除）
     */
    deleteActivity(activityId: string, creatorId: string): Promise<void>;
    /**
     * 加入活动
     */
    joinActivity(activityId: string, userId: string): Promise<Participation>;
    /**
     * 退出活动
     */
    leaveActivity(activityId: string, userId: string): Promise<void>;
    /**
     * 获取用户参与的活动列表
     */
    getUserJoinedActivities(userId: string, page?: number, pageSize?: number): Promise<{
        activities: ActivityWithCreator[];
        total: number;
    }>;
    /**
     * 获取用户创建的活动列表
     */
    getUserCreatedActivities(userId: string, page?: number, pageSize?: number): Promise<{
        activities: ActivityWithCreator[];
        total: number;
    }>;
}
export declare const activityService: ActivityService;
//# sourceMappingURL=ActivityService.d.ts.map