// 验证工具函数

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

/**
 * 验证邮箱格式
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 验证密码强度
 */
export function validatePassword(password: string): {
  valid: boolean
  message?: string
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

  return { valid: true }
}

/**
 * 验证昵称
 */
export function validateNickname(nickname: string): boolean {
  return nickname.length >= 2 && nickname.length <= 20
}

/**
 * 验证年龄
 */
export function validateAge(age: number): boolean {
  return age >= 18 && age <= 100
}

/**
 * 验证手机号（中国大陆）
 */
export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}

/**
 * 验证日期范围
 */
export function validateDateRange(startDate: Date, endDate: Date): boolean {
  return startDate < endDate
}

/**
 * 清理和转义 HTML
 */
export function sanitizeHtml(html: string): string {
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * 验证经纬度
 */
export function validateCoordinates(latitude: number, longitude: number): boolean {
  return (
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  )
}

/**
 * 验证评分
 */
export function validateRating(rating: number): boolean {
  return rating >= 0 && rating <= 5
}
