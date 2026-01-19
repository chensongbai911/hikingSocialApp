/**
 * Redis 配置
 * 创建日期: 2026-01-19
 */

import Redis from 'ioredis'
import dotenv from 'dotenv'

dotenv.config()

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000)
    return delay
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: false,
}

export const redis = new Redis(redisConfig)

redis.on('connect', () => {
  console.log('✅ Redis connected successfully')
  console.log(`   Host: ${redisConfig.host}:${redisConfig.port}`)
  console.log(`   Database: ${redisConfig.db}`)
})

redis.on('ready', () => {
  console.log('✅ Redis is ready to use')
})

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err.message)
})

redis.on('reconnecting', () => {
  console.log('🔄 Redis reconnecting...')
})

/**
 * 缓存 TTL 配置（秒）
 */
export const CACHE_TTL = {
  SHORT: 60, // 1 分钟
  DEFAULT: 300, // 5 分钟
  LONG: 1800, // 30 分钟
  ROUTE: 600, // 10 分钟（路线）
  MESSAGE: 180, // 3 分钟（消息）
  USER: 900, // 15 分钟（用户信息）
  HOT_ROUTES: 300, // 5 分钟（热门路线）
}

/**
 * 缓存键前缀
 */
export const CACHE_PREFIX = {
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
}

/**
 * 设置缓存
 */
export async function setCache(
  key: string,
  value: any,
  ttl: number = CACHE_TTL.DEFAULT
): Promise<void> {
  try {
    const serialized = JSON.stringify(value)
    await redis.setex(key, ttl, serialized)
  } catch (error: any) {
    console.error('Cache set error:', error.message)
  }
}

/**
 * 获取缓存
 */
export async function getCache<T = any>(key: string): Promise<T | null> {
  try {
    const data = await redis.get(key)
    if (!data) return null
    return JSON.parse(data) as T
  } catch (error: any) {
    console.error('Cache get error:', error.message)
    return null
  }
}

/**
 * 删除缓存
 */
export async function delCache(key: string | string[]): Promise<void> {
  try {
    if (Array.isArray(key)) {
      if (key.length > 0) {
        await redis.del(...key)
      }
    } else {
      await redis.del(key)
    }
  } catch (error: any) {
    console.error('Cache delete error:', error.message)
  }
}

/**
 * 批量删除缓存（按模式）
 */
export async function delCacheByPattern(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  } catch (error: any) {
    console.error('Cache delete by pattern error:', error.message)
  }
}

/**
 * 检查缓存是否存在
 */
export async function hasCache(key: string): Promise<boolean> {
  try {
    const exists = await redis.exists(key)
    return exists === 1
  } catch (error: any) {
    console.error('Cache exists check error:', error.message)
    return false
  }
}

/**
 * 关闭 Redis 连接
 */
export async function closeRedis(): Promise<void> {
  await redis.quit()
  console.log('✅ Redis connection closed')
}

// 进程退出时关闭连接
process.on('SIGINT', async () => {
  await closeRedis()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await closeRedis()
  process.exit(0)
})

export default redis
