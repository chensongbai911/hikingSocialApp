"use strict";
/**
 * Redis 配置
 * 创建日期: 2026-01-19
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CACHE_PREFIX = exports.CACHE_TTL = exports.redis = void 0;
exports.setCache = setCache;
exports.getCache = getCache;
exports.delCache = delCache;
exports.delCacheByPattern = delCacheByPattern;
exports.hasCache = hasCache;
exports.closeRedis = closeRedis;
const ioredis_1 = __importDefault(require("ioredis"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0'),
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: false,
};
exports.redis = new ioredis_1.default(redisConfig);
exports.redis.on('connect', () => {
    console.log('✅ Redis connected successfully');
    console.log(`   Host: ${redisConfig.host}:${redisConfig.port}`);
    console.log(`   Database: ${redisConfig.db}`);
});
exports.redis.on('ready', () => {
    console.log('✅ Redis is ready to use');
});
exports.redis.on('error', (err) => {
    console.error('❌ Redis connection error:', err.message);
});
exports.redis.on('reconnecting', () => {
    console.log('🔄 Redis reconnecting...');
});
/**
 * 缓存 TTL 配置（秒）
 */
exports.CACHE_TTL = {
    SHORT: 60, // 1 分钟
    DEFAULT: 300, // 5 分钟
    LONG: 1800, // 30 分钟
    ROUTE: 600, // 10 分钟（路线）
    MESSAGE: 180, // 3 分钟（消息）
    USER: 900, // 15 分钟（用户信息）
    HOT_ROUTES: 300, // 5 分钟（热门路线）
};
/**
 * 缓存键前缀
 */
exports.CACHE_PREFIX = {
    ROUTE: 'route:',
    ROUTE_LIST: 'routes:list:',
    HOT_ROUTES: 'routes:hot',
    USER: 'user:',
    MESSAGE: 'message:',
    TRACK: 'track:',
    TRACK_ACTIVE: 'track:active:',
    TRACK_POINTS: 'track:points:',
    TEAM: 'team:',
    TEAM_MEMBERS: 'team:members:',
    TEAM_LOCATIONS: 'team:locations:',
    ONLINE_USERS: 'online:users',
};
/**
 * 设置缓存
 */
async function setCache(key, value, ttl = exports.CACHE_TTL.DEFAULT) {
    try {
        const serialized = JSON.stringify(value);
        await exports.redis.setex(key, ttl, serialized);
    }
    catch (error) {
        console.error('Cache set error:', error.message);
    }
}
/**
 * 获取缓存
 */
async function getCache(key) {
    try {
        const data = await exports.redis.get(key);
        if (!data)
            return null;
        return JSON.parse(data);
    }
    catch (error) {
        console.error('Cache get error:', error.message);
        return null;
    }
}
/**
 * 删除缓存
 */
async function delCache(key) {
    try {
        if (Array.isArray(key)) {
            if (key.length > 0) {
                await exports.redis.del(...key);
            }
        }
        else {
            await exports.redis.del(key);
        }
    }
    catch (error) {
        console.error('Cache delete error:', error.message);
    }
}
/**
 * 批量删除缓存（按模式）
 */
async function delCacheByPattern(pattern) {
    try {
        const keys = await exports.redis.keys(pattern);
        if (keys.length > 0) {
            await exports.redis.del(...keys);
        }
    }
    catch (error) {
        console.error('Cache delete by pattern error:', error.message);
    }
}
/**
 * 检查缓存是否存在
 */
async function hasCache(key) {
    try {
        const exists = await exports.redis.exists(key);
        return exists === 1;
    }
    catch (error) {
        console.error('Cache exists check error:', error.message);
        return false;
    }
}
/**
 * 关闭 Redis 连接
 */
async function closeRedis() {
    await exports.redis.quit();
    console.log('✅ Redis connection closed');
}
// 进程退出时关闭连接
process.on('SIGINT', async () => {
    await closeRedis();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    await closeRedis();
    process.exit(0);
});
exports.default = exports.redis;
//# sourceMappingURL=redis.js.map