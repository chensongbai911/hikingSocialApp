interface RegisterPayload {
    email: string;
    nickname: string;
    password: string;
    gender?: 'male' | 'female' | 'other';
    age?: number;
}
interface LoginPayload {
    email: string;
    password: string;
}
interface TokenPayload {
    id: string;
    email: string;
}
interface UserInfo {
    id: string;
    email: string;
    nickname: string;
    gender: string | null;
    age: number | null;
    avatar_url: string | null;
    bio?: string | null;
    hiking_level: string;
    province: string | null;
    city: string | null;
    region: string | null;
    created_at: Date;
    preferences?: any[];
    photos?: any[];
}
export declare class AuthService {
    private jwtSecret;
    private jwtExpiration;
    /**
     * 生成用户ID
     */
    private generateUserId;
    /**
     * 用户注册
     */
    register(data: RegisterPayload): Promise<{
        user: UserInfo;
        token: string;
    }>;
    /**
     * 用户登录
     */
    login(data: LoginPayload): Promise<{
        user: UserInfo;
        token: string;
    }>;
    /**
     * 刷新Token
     */
    refreshToken(oldToken: string): Promise<{
        token: string;
    }>;
    /**
     * 获取当前用户信息（优化版本 - 使用并行查询）
     * @param userId 用户ID
     * @param includePhotos 是否包含照片（默认false以优化性能）
     * @param includePreferences 是否包含偏好（默认false以优化性能）
     */
    getCurrentUser(userId: string, includePhotos?: boolean, includePreferences?: boolean): Promise<UserInfo>;
    /**
     * 验证Token
     */
    verifyToken(token: string): TokenPayload;
    /**
     * 生成JWT Token
     */
    private generateToken;
    /**
     * 用户登出（客户端处理）
     */
    logout(): Promise<void>;
}
export declare const authService: AuthService;
export {};
//# sourceMappingURL=AuthService.d.ts.map