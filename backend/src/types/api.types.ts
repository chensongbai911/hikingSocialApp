/**
 * 统一API响应类型定义
 * API Response Type Definitions
 */

// 基础响应接口
export interface BaseResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  timestamp?: number;
}

// 成功响应
export interface SuccessResponse<T = any> extends BaseResponse<T> {
  code: 200 | 201;
  message: string;
  data: T;
}

// 错误响应
export interface ErrorResponse extends BaseResponse {
  code: number;
  message: string;
  error?: string;
  details?: any;
}

// 分页参数
export interface PaginationParams {
  page: number;      // 当前页码，从1开始
  pageSize: number;  // 每页条数
  total?: number;    // 总记录数
  totalPages?: number; // 总页数
}

// 分页数据
export interface PaginatedData<T> {
  items: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// 分页响应
export interface PaginatedResponse<T> extends BaseResponse<PaginatedData<T>> {
  code: 200;
  message: string;
  data: PaginatedData<T>;
}

// HTTP状态码枚举
export enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503
}

// 业务错误码
export enum BusinessErrorCode {
  // 认证相关 (1xxx)
  INVALID_CREDENTIALS = 1001,
  TOKEN_EXPIRED = 1002,
  TOKEN_INVALID = 1003,
  USER_NOT_FOUND = 1004,
  USER_ALREADY_EXISTS = 1005,
  UNAUTHORIZED = 1006,

  // 参数验证 (2xxx)
  VALIDATION_ERROR = 2001,
  MISSING_REQUIRED_FIELD = 2002,
  INVALID_FIELD_VALUE = 2003,
  INVALID_FILE_TYPE = 2004,
  FILE_TOO_LARGE = 2005,

  // 业务逻辑 (3xxx)
  ACTIVITY_NOT_FOUND = 3001,
  ACTIVITY_FULL = 3002,
  ALREADY_JOINED = 3003,
  NOT_JOINED = 3004,
  CANNOT_LEAVE = 3005,
  PERMISSION_DENIED = 3006,
  ACTIVITY_CANCELLED = 3007,
  ACTIVITY_COMPLETED = 3008,
  PREFERENCE_NOT_FOUND = 3009,
  PHOTO_NOT_FOUND = 3010,
  MAX_PHOTOS_EXCEEDED = 3011,
  RESOURCE_NOT_FOUND = 3012,
  FORBIDDEN = 3013,

  // 资源限制 (4xxx)
  RATE_LIMIT_EXCEEDED = 4001,
  QUOTA_EXCEEDED = 4002,

  // 系统错误 (5xxx)
  DATABASE_ERROR = 5001,
  NETWORK_ERROR = 5002,
  UNKNOWN_ERROR = 5999
}

// 错误信息映射
export const ErrorMessages: Record<BusinessErrorCode, string> = {
  [BusinessErrorCode.INVALID_CREDENTIALS]: '用户名或密码错误',
  [BusinessErrorCode.TOKEN_EXPIRED]: '登录已过期，请重新登录',
  [BusinessErrorCode.TOKEN_INVALID]: '无效的令牌',
  [BusinessErrorCode.USER_NOT_FOUND]: '用户不存在',
  [BusinessErrorCode.USER_ALREADY_EXISTS]: '用户已存在',
  [BusinessErrorCode.UNAUTHORIZED]: '未授权访问',

  [BusinessErrorCode.VALIDATION_ERROR]: '参数验证失败',
  [BusinessErrorCode.MISSING_REQUIRED_FIELD]: '缺少必填字段',
  [BusinessErrorCode.INVALID_FIELD_VALUE]: '字段值不合法',
  [BusinessErrorCode.INVALID_FILE_TYPE]: '不支持的文件类型',
  [BusinessErrorCode.FILE_TOO_LARGE]: '文件大小超出限制',

  [BusinessErrorCode.ACTIVITY_NOT_FOUND]: '活动不存在',
  [BusinessErrorCode.ACTIVITY_FULL]: '活动人数已满',
  [BusinessErrorCode.ALREADY_JOINED]: '已加入该活动',
  [BusinessErrorCode.NOT_JOINED]: '未加入该活动',
  [BusinessErrorCode.CANNOT_LEAVE]: '无法退出活动',
  [BusinessErrorCode.PERMISSION_DENIED]: '权限不足',
  [BusinessErrorCode.ACTIVITY_CANCELLED]: '活动已取消',
  [BusinessErrorCode.ACTIVITY_COMPLETED]: '活动已结束',
  [BusinessErrorCode.PREFERENCE_NOT_FOUND]: '偏好设置不存在',
  [BusinessErrorCode.PHOTO_NOT_FOUND]: '照片不存在',
  [BusinessErrorCode.MAX_PHOTOS_EXCEEDED]: '照片数量已达上限',
  [BusinessErrorCode.RESOURCE_NOT_FOUND]: '资源不存在',
  [BusinessErrorCode.FORBIDDEN]: '无权限操作',

  [BusinessErrorCode.RATE_LIMIT_EXCEEDED]: '请求过于频繁',
  [BusinessErrorCode.QUOTA_EXCEEDED]: '超出配额限制',

  [BusinessErrorCode.DATABASE_ERROR]: '数据库错误',
  [BusinessErrorCode.NETWORK_ERROR]: '网络错误',
  [BusinessErrorCode.UNKNOWN_ERROR]: '未知错误'
};
