/**
 * Redis 配置
 * 创建日期: 2026-01-19
 */
export declare const redis: any;
/**
 * 缓存 TTL 配置（秒）
 */
export declare const CACHE_TTL: {
    SHORT: number;
    DEFAULT: number;
    LONG: number;
    ROUTE: number;
    MESSAGE: number;
    USER: number;
    HOT_ROUTES: number;
};
/**
 * 缓存键前缀
 */
export declare const CACHE_PREFIX: {
    ROUTE: string;
    ROUTE_LIST: string;
    HOT_ROUTES: string;
    USER: string;
    MESSAGE: string;
    TRACK: string;
    TRACK_ACTIVE: string;
    TRACK_POINTS: string;
    TEAM: string;
    TEAM_MEMBERS: string;
    TEAM_LOCATIONS: string;
    ONLINE_USERS: string;
};
/**
 * 设置缓存
 */
export declare function setCache(key: string, value: any, ttl?: number): Promise<void>;
/**
 * 获取缓存
 */
export declare function getCache<T = any>(key: string): Promise<T | null>;
/**
 * 删除缓存
 */
export declare function delCache(key: string | string[]): Promise<void>;
/**
 * 批量删除缓存（按模式）
 */
export declare function delCacheByPattern(pattern: string): Promise<void>;
/**
 * 检查缓存是否存在
 */
export declare function hasCache(key: string): Promise<boolean>;
/**
 * 关闭 Redis 连接
 */
export declare function closeRedis(): Promise<void>;
export default redis;
//# sourceMappingURL=redis.d.ts.map