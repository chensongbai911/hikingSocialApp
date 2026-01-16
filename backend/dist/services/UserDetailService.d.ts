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
    followers_count: number;
    activities_count: number;
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
export declare class UserDetailService {
    /**
     * 获取用户完整详情（用于用户详情页面）
     */
    getUserDetail(userId: string): Promise<UserDetail>;
    /**
     * 关注用户
     */
    followUser(followerId: string, followingId: string): Promise<void>;
    /**
     * 取消关注用户
     */
    unfollowUser(followerId: string, followingId: string): Promise<void>;
    /**
     * 检查是否已关注
     */
    isFollowing(followerId: string, followingId: string): Promise<boolean>;
}
export declare const userDetailService: UserDetailService;
export {};
//# sourceMappingURL=UserDetailService.d.ts.map