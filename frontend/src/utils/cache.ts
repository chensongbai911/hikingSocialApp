// 本地缓存管理器，用于优化API性能
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number // 生存时间（毫秒）
}

class CacheManager {
  private cache = new Map<string, CacheEntry<any>>()
  private maxSize = 50 // 最大缓存条数

  /**
   * 获取缓存数据
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    // 检查是否过期
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  /**
   * 设置缓存数据
   */
  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    // 如果缓存已满，删除最旧的
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) this.cache.delete(firstKey)
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  /**
   * 清除缓存
   */
  clear(key?: string): void {
    if (key) {
      this.cache.delete(key)
    } else {
      this.cache.clear()
    }
  }

  /**
   * 获取缓存统计
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
    }
  }
}

export const cacheManager = new CacheManager()

// 为特定API设置缓存TTL（毫秒）
export const CACHE_TTL = {
  USER_INFO: 10 * 60 * 1000, // 用户信息缓存10分钟
  ACTIVITIES: 5 * 60 * 1000, // 活动列表缓存5分钟
  PROFILE: 15 * 60 * 1000, // 个人资料缓存15分钟
  DEFAULT: 3 * 60 * 1000, // 默认缓存3分钟
}

// 缓存键常量
export const CACHE_KEYS = {
  CURRENT_USER: 'current_user',
  ACTIVITIES_LIST: 'activities_list',
  PROFILE: 'user_profile',
}
