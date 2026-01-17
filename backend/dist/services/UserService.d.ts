interface UpdateProfilePayload {
    nickname?: string;
    gender?: 'male' | 'female' | 'other';
    age?: number;
    bio?: string;
    hiking_level?: 'beginner' | 'intermediate' | 'advanced';
    avatar_url?: string;
    province?: string;
    city?: string;
    region?: string;
}
interface UserProfile {
    id: string;
    email: string;
    nickname: string;
    gender: string | null;
    age: number | null;
    avatar_url: string | null;
    bio: string | null;
    hiking_level: string;
    province: string | null;
    city: string | null;
    region: string | null;
    is_verified: boolean;
    created_at: Date;
    preferences: UserPreference[];
    photos: UserPhoto[];
}
interface UserPreference {
    id: string;
    preference_type: string;
    preference_value: string;
    created_at: Date;
}
interface UserPhoto {
    id: string;
    photo_url: string;
    sort_order: number;
    created_at: Date;
}
export declare class UserService {
    /**
     * 获取用户完整资料（优化版 - 使用单次查询）
     */
    getProfile(userId: string): Promise<UserProfile>;
    /**
     * 更新用户资料
     */
    updateProfile(userId: string, data: UpdateProfilePayload): Promise<UserProfile>;
    /**
     * 更新用户头像
     */
    updateAvatar(userId: string, avatarUrl: string): Promise<{
        avatar_url: string;
    }>;
    /**
     * 生成照片ID
     */
    private generatePhotoId;
    /**
     * 添加相册照片
     */
    addPhoto(userId: string, photoUrl: string, sortOrder?: number): Promise<UserPhoto>;
    /**
     * 删除相册照片
     */
    deletePhoto(userId: string, photoId: string): Promise<void>;
    /**
     * 生成偏好ID
     */
    private generatePreferenceId;
    /**
     * 更新用户偏好
     */
    updatePreferences(userId: string, preferences: Array<{
        type: string;
        value: string;
    }>): Promise<UserPreference[]>;
    /**
     * 获取用户偏好
     */
    getPreferences(userId: string): Promise<UserPreference[]>;
    /**
     * 检查用户是否存在
     */
    exists(userId: string): Promise<boolean>;
}
export declare const userService: UserService;
export {};
//# sourceMappingURL=UserService.d.ts.map