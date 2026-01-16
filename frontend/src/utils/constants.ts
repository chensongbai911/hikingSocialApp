// 常量定义

// API 端点
export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },
  USERS: {
    PROFILE: '/users/profile',
    GET_USER: (id: number) => `/users/${id}`,
    LIST: '/users',
  },
  ACTIVITIES: {
    LIST: '/activities',
    DETAIL: (id: number) => `/activities/${id}`,
    CREATE: '/activities',
    UPDATE: (id: number) => `/activities/${id}`,
    DELETE: (id: number) => `/activities/${id}`,
    JOIN: (id: number) => `/activities/${id}/join`,
    CANCEL: (id: number) => `/activities/${id}/cancel`,
    USER_ACTIVITIES: '/activities/user/activities',
  },
  DISCOVERY: {
    RECOMMENDED_ACTIVITIES: '/discovery/recommended-activities',
    RECOMMENDED_USERS: '/discovery/recommended-users',
    TRENDING: '/discovery/trending',
  },
}

// 本地存储键
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'currentUser',
  LANGUAGE: 'language',
  THEME: 'theme',
}

// 默认配置
export const DEFAULT_CONFIG = {
  AVATAR: 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
  PLACEHOLDER_IMAGE: 'https://via.placeholder.com/400x300?text=No+Image',
}

// 难度等级
export const DIFFICULTY_LEVELS = {
  EASY: 'easy',
  MODERATE: 'moderate',
  HARD: 'hard',
} as const

export const DIFFICULTY_LABELS = {
  easy: '简单',
  moderate: '中等',
  hard: '困难',
}

// 登山等级
export const HIKING_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  EXPERT: 'expert',
} as const

export const HIKING_LEVEL_LABELS = {
  beginner: '初级',
  intermediate: '中级',
  advanced: '高级',
  expert: '专家',
}

// 活动状态
export const ACTIVITY_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

export const ACTIVITY_STATUS_LABELS = {
  pending: '待审核',
  approved: '已通过',
  ongoing: '进行中',
  completed: '已完成',
  cancelled: '已取消',
}

// 参与状态
export const PARTICIPATION_STATUS = {
  JOINED: 'joined',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

export const PARTICIPATION_STATUS_LABELS = {
  joined: '已参加',
  completed: '已完成',
  cancelled: '已取消',
}

// 性别选项
export const GENDER_OPTIONS = [
  { value: 'male', label: '男' },
  { value: 'female', label: '女' },
  { value: 'other', label: '其他' },
]

// 活动类型
export const ACTIVITY_TYPES = [
  { value: 'sunrise', label: '日出' },
  { value: 'sunset', label: '日落' },
  { value: 'classic', label: '经典路线' },
  { value: 'adventure', label: '探险' },
  { value: 'leisure', label: '休闲' },
  { value: 'training', label: '训练' },
  { value: 'other', label: '其他' },
]

// 偏好类型
export const PREFERENCE_TYPES = {
  TIME: 'time',
  TYPE: 'type',
  SPECIAL: 'special',
  DISTANCE: 'distance',
  INTEREST: 'interest',
} as const

// 时间偏好选项
export const TIME_PREFERENCES = [
  { value: 'morning', label: '早晨登山' },
  { value: 'afternoon', label: '下午登山' },
  { value: 'evening', label: '傍晚登山' },
  { value: 'weekend', label: '周末活动' },
  { value: 'weekday', label: '工作日活动' },
]

// 距离偏好选项
export const DISTANCE_PREFERENCES = [
  { value: 'short', label: '短途 (< 5km)' },
  { value: 'medium', label: '中途 (5-15km)' },
  { value: 'long', label: '长途 (> 15km)' },
]

// 分页配置
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
}

// 文件上传配置
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  MAX_PHOTOS: 9, // 生活相册最多9张
}

// 验证规则
export const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  NICKNAME_MIN_LENGTH: 2,
  NICKNAME_MAX_LENGTH: 20,
  BIO_MAX_LENGTH: 200,
  ACTIVITY_TITLE_MAX_LENGTH: 100,
  ACTIVITY_DESCRIPTION_MAX_LENGTH: 2000,
}

// 错误消息
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络错误，请检查您的网络连接',
  SERVER_ERROR: '服务器错误，请稍后重试',
  UNAUTHORIZED: '未授权，请先登录',
  FORBIDDEN: '无权限访问',
  NOT_FOUND: '资源不存在',
  VALIDATION_ERROR: '输入验证失败',
  UNKNOWN_ERROR: '未知错误',
}

// 成功消息
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: '登录成功',
  REGISTER_SUCCESS: '注册成功',
  LOGOUT_SUCCESS: '登出成功',
  PROFILE_UPDATED: '个人资料更新成功',
  ACTIVITY_CREATED: '活动创建成功',
  ACTIVITY_UPDATED: '活动更新成功',
  ACTIVITY_DELETED: '活动删除成功',
  JOINED_ACTIVITY: '参加活动成功',
  CANCELLED_ACTIVITY: '取消参加成功',
}

// 路由名称
export const ROUTE_NAMES = {
  HOME: 'Home',
  LOGIN: 'Login',
  REGISTER: 'Register',
  DISCOVER: 'Discover',
  MY_HIKING: 'MyHiking',
  PROFILE: 'Profile',
  EDIT_PROFILE: 'EditProfile',
  ACTIVITY_DETAIL: 'ActivityDetail',
  CREATE_ACTIVITY: 'CreateActivity',
  MESSAGES: 'Messages',
}

// 导航栏图标
export const TAB_BAR_ICONS = {
  HOME: '🏠',
  DISCOVER: '🔍',
  CREATE: '➕',
  MESSAGES: '💬',
  MY_HIKING: '⛰️',
  PROFILE: '👤',
}

// 开发环境配置
export const DEV_CONFIG = {
  ENABLE_LOGGER: true,
  ENABLE_MOCK: false,
  API_DELAY: 500, // 模拟API延迟（毫秒）
}
