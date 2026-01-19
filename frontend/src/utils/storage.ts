/**
 * 本地存储工具
 * 创建日期: 2026-01-19
 * 封装 localStorage 和 sessionStorage
 */

interface StorageOptions {
  ttl?: number // 过期时间（毫秒）
  encrypt?: boolean // 是否加密（预留）
}

interface StorageItem<T> {
  value: T
  timestamp: number
  ttl?: number
}

class Storage {
  private storage: globalThis.Storage

  constructor(storage: globalThis.Storage) {
    this.storage = storage
  }

  /**
   * 设置存储
   */
  set<T = any>(key: string, value: T, options?: StorageOptions): void {
    try {
      const item: StorageItem<T> = {
        value,
        timestamp: Date.now(),
        ttl: options?.ttl,
      }

      this.storage.setItem(key, JSON.stringify(item))
    } catch (error) {
      console.error('Storage set error:', error)
    }
  }

  /**
   * 获取存储
   */
  get<T = any>(key: string): T | null {
    try {
      const itemStr = this.storage.getItem(key)

      if (!itemStr) {
        return null
      }

      const item: StorageItem<T> = JSON.parse(itemStr)

      // 检查是否过期
      if (item.ttl && Date.now() - item.timestamp > item.ttl) {
        this.remove(key)
        return null
      }

      return item.value
    } catch (error) {
      console.error('Storage get error:', error)
      return null
    }
  }

  /**
   * 删除存储
   */
  remove(key: string): void {
    try {
      this.storage.removeItem(key)
    } catch (error) {
      console.error('Storage remove error:', error)
    }
  }

  /**
   * 清空存储
   */
  clear(): void {
    try {
      this.storage.clear()
    } catch (error) {
      console.error('Storage clear error:', error)
    }
  }

  /**
   * 检查键是否存在
   */
  has(key: string): boolean {
    return this.get(key) !== null
  }

  /**
   * 获取所有键
   */
  keys(): string[] {
    const keys: string[] = []
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i)
      if (key) {
        keys.push(key)
      }
    }
    return keys
  }

  /**
   * 获取存储大小（字节）
   */
  size(): number {
    let size = 0
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i)
      if (key) {
        const value = this.storage.getItem(key)
        if (value) {
          size += key.length + value.length
        }
      }
    }
    return size
  }

  /**
   * 清理过期项
   */
  prune(): number {
    let count = 0
    const keys = this.keys()

    for (const key of keys) {
      const itemStr = this.storage.getItem(key)
      if (!itemStr) continue

      try {
        const item: StorageItem<any> = JSON.parse(itemStr)
        if (item.ttl && Date.now() - item.timestamp > item.ttl) {
          this.remove(key)
          count++
        }
      } catch (error) {
        // 解析失败的项也删除
        this.remove(key)
        count++
      }
    }

    return count
  }
}

// 导出实例
export const localStorage = new Storage(window.localStorage)
export const sessionStorage = new Storage(window.sessionStorage)

// 定期清理过期数据
setInterval(() => {
  const localPruned = localStorage.prune()
  const sessionPruned = sessionStorage.prune()

  if (localPruned > 0 || sessionPruned > 0) {
    console.log(
      `[Storage] Pruned ${localPruned} localStorage items, ${sessionPruned} sessionStorage items`
    )
  }
}, 300000) // 每 5 分钟清理一次

export default { localStorage, sessionStorage }
