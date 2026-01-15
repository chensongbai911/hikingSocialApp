// 格式化日期时间
export function formatDate(dateString: string | Date, format: 'date' | 'datetime' | 'time' = 'datetime'): string {
  const date = new Date(dateString)

  if (isNaN(date.getTime())) {
    return '无效日期'
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  switch (format) {
    case 'date':
      return `${year}-${month}-${day}`
    case 'time':
      return `${hours}:${minutes}`
    case 'datetime':
      return `${year}-${month}-${day} ${hours}:${minutes}`
    default:
      return `${year}-${month}-${day} ${hours}:${minutes}`
  }
}

// 格式化相对时间
export function formatRelativeTime(dateString: string | Date): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSeconds < 60) {
    return '刚刚'
  } else if (diffMinutes < 60) {
    return `${diffMinutes}分钟前`
  } else if (diffHours < 24) {
    return `${diffHours}小时前`
  } else if (diffDays < 7) {
    return `${diffDays}天前`
  } else {
    return formatDate(dateString, 'date')
  }
}

// 防抖函数
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return function (this: any, ...args: Parameters<T>) {
    const context = this

    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      func.apply(context, args)
    }, wait)
  }
}

// 节流函数
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  let previous = 0

  return function (this: any, ...args: Parameters<T>) {
    const context = this
    const now = Date.now()

    if (!previous) previous = now

    const remaining = wait - (now - previous)

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      previous = now
      func.apply(context, args)
    } else if (!timeout) {
      timeout = setTimeout(() => {
        previous = Date.now()
        timeout = null
        func.apply(context, args)
      }, remaining)
    }
  }
}

// 存储到 localStorage
export function setStorage(key: string, value: any): void {
  try {
    const serializedValue = JSON.stringify(value)
    localStorage.setItem(key, serializedValue)
  } catch (error) {
    console.error('Error saving to localStorage:', error)
  }
}

// 从 localStorage 获取
export function getStorage<T>(key: string, defaultValue?: T): T | null {
  try {
    const item = localStorage.getItem(key)
    if (item) {
      return JSON.parse(item) as T
    }
    return defaultValue || null
  } catch (error) {
    console.error('Error reading from localStorage:', error)
    return defaultValue || null
  }
}

// 从 localStorage 删除
export function removeStorage(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error('Error removing from localStorage:', error)
  }
}

// 验证邮箱格式
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 验证密码强度
export function validatePassword(password: string): {
  valid: boolean
  message: string
} {
  if (password.length < 8) {
    return { valid: false, message: '密码长度至少为8位' }
  }
  if (!/[a-zA-Z]/.test(password)) {
    return { valid: false, message: '密码必须包含字母' }
  }
  if (!/\d/.test(password)) {
    return { valid: false, message: '密码必须包含数字' }
  }
  return { valid: true, message: '密码强度良好' }
}

// 深拷贝
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any
  }

  if (obj instanceof Array) {
    const clonedArr: any[] = []
    obj.forEach((item) => {
      clonedArr.push(deepClone(item))
    })
    return clonedArr as any
  }

  if (obj instanceof Object) {
    const clonedObj: any = {}
    Object.keys(obj).forEach((key) => {
      clonedObj[key] = deepClone((obj as any)[key])
    })
    return clonedObj
  }

  return obj
}

// 生成随机字符串
export function randomString(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// 格式化文件大小
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// 截断字符串
export function truncate(str: string, length: number, suffix: string = '...'): string {
  if (str.length <= length) {
    return str
  }
  return str.substring(0, length) + suffix
}

// 获取难度等级颜色
export function getDifficultyColor(difficulty: string): string {
  const colorMap: Record<string, string> = {
    easy: 'text-green-600 bg-green-100',
    moderate: 'text-yellow-600 bg-yellow-100',
    hard: 'text-red-600 bg-red-100',
    简单: 'text-green-600 bg-green-100',
    中等: 'text-yellow-600 bg-yellow-100',
    困难: 'text-red-600 bg-red-100',
  }
  return colorMap[difficulty] || 'text-gray-600 bg-gray-100'
}

// 获取难度等级标签
export function getDifficultyLabel(difficulty: string): string {
  const labelMap: Record<string, string> = {
    easy: '简单',
    moderate: '中等',
    hard: '困难',
  }
  return labelMap[difficulty] || difficulty
}

// 计算两个坐标之间的距离（单位：公里）
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // 地球半径（公里）
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
    Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

// 高亮搜索关键词
export function highlightKeyword(text: string, keyword: string): string {
  if (!keyword || !text) return text

  const regex = new RegExp(`(${keyword})`, 'gi')
  return text.replace(regex, '<mark class="highlight">$1</mark>')
}

// LocalStorage缓存工具（带过期时间）
export const cache = {
  /**
   * 设置缓存
   * @param key 缓存键
   * @param value 缓存值
   * @param ttl 过期时间(毫秒)，默认5分钟
   */
  set<T>(key: string, value: T, ttl: number = 5 * 60 * 1000): void {
    const item = {
      value,
      timestamp: Date.now(),
      ttl
    }
    localStorage.setItem(key, JSON.stringify(item))
  },

  /**
   * 获取缓存
   * @param key 缓存键
   * @returns 缓存值或null
   */
  get<T>(key: string): T | null {
    const item = localStorage.getItem(key)
    if (!item) return null

    try {
      const parsed = JSON.parse(item)

      // 检查是否过期
      if (parsed.ttl && Date.now() - parsed.timestamp > parsed.ttl) {
        localStorage.removeItem(key)
        return null
      }

      return parsed.value as T
    } catch {
      return null
    }
  },

  /**
   * 删除缓存
   */
  remove(key: string): void {
    localStorage.removeItem(key)
  },

  /**
   * 清空所有缓存
   */
  clear(): void {
    localStorage.clear()
  }
}
