/**
 * 统一 API 响应格式工具
 * 创建日期: 2026-01-19
 * 任务编号: T0.2
 */

export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T | null
  timestamp: number
  requestId?: string
}

export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface ApiResponseWithPagination<T = any> extends ApiResponse<T> {
  pagination: PaginationMeta
}

/**
 * 创建成功响应
 */
export const createSuccessResponse = <T>(
  data: T,
  message = '操作成功',
  code = 200
): ApiResponse<T> => ({
  code,
  message,
  data,
  timestamp: Date.now(),
})

/**
 * 创建错误响应
 */
export const createErrorResponse = (
  message: string,
  code = 500,
  details?: any
): ApiResponse<null> => ({
  code,
  message,
  data: null,
  timestamp: Date.now(),
  ...(details && { details }),
})

/**
 * 创建分页响应
 */
export const createPaginatedResponse = <T>(
  data: T[],
  pagination: PaginationMeta,
  message = '查询成功'
): ApiResponseWithPagination<T[]> => ({
  code: 200,
  message,
  data,
  pagination,
  timestamp: Date.now(),
})

/**
 * 计算分页元数据
 */
export const calculatePagination = (
  page: number,
  pageSize: number,
  total: number
): PaginationMeta => ({
  page,
  pageSize,
  total,
  totalPages: Math.ceil(total / pageSize),
})

/**
 * 常用响应码
 */
export enum ResponseCode {
  SUCCESS = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}
