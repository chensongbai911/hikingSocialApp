/**
 * API响应工具函数
 * API Response Utility Functions
 */

import { Response } from 'express';
import {
  SuccessResponse,
  ErrorResponse,
  PaginatedResponse,
  PaginatedData,
  HttpStatusCode,
  BusinessErrorCode,
  ErrorMessages
} from '../types/api.types';

/**
 * 成功响应
 * @param res Express Response对象
 * @param data 响应数据
 * @param message 响应消息
 * @param statusCode HTTP状态码
 */
export function success<T>(
  res: Response,
  data: T,
  message: string = '操作成功',
  statusCode: number = HttpStatusCode.OK
): void {
  const response: SuccessResponse<T> = {
    code: statusCode as 200 | 201,
    message,
    data,
    timestamp: Date.now()
  };
  res.status(statusCode).json(response);
}

/**
 * 创建成功响应（201）
 * @param res Express Response对象
 * @param data 响应数据
 * @param message 响应消息
 */
export function created<T>(
  res: Response,
  data: T,
  message: string = '创建成功'
): void {
  success(res, data, message, HttpStatusCode.CREATED);
}

/**
 * 无内容响应（204）
 * @param res Express Response对象
 */
export function noContent(res: Response): void {
  res.status(HttpStatusCode.NO_CONTENT).send();
}

/**
 * 错误响应
 * @param res Express Response对象
 * @param message 错误消息
 * @param statusCode HTTP状态码
 * @param error 错误详情
 * @param details 额外的错误细节
 */
export function error(
  res: Response,
  message: string,
  statusCode: number = HttpStatusCode.BAD_REQUEST,
  error?: string,
  details?: any
): void {
  const response: ErrorResponse = {
    code: statusCode,
    message,
    error,
    details,
    timestamp: Date.now()
  };
  res.status(statusCode).json(response);
}

/**
 * 业务错误响应
 * @param res Express Response对象
 * @param businessCode 业务错误码
 * @param customMessage 自定义错误消息（可选）
 * @param details 错误详情（可选）
 */
export function businessError(
  res: Response,
  businessCode: BusinessErrorCode,
  customMessage?: string,
  details?: any
): void {
  const message = customMessage || ErrorMessages[businessCode] || '业务处理失败';
  const statusCode = getHttpStatusFromBusinessCode(businessCode);

  const response: ErrorResponse = {
    code: businessCode,
    message,
    details,
    timestamp: Date.now()
  };
  res.status(statusCode).json(response);
}

/**
 * 分页响应
 * @param res Express Response对象
 * @param items 数据列表
 * @param page 当前页码
 * @param pageSize 每页条数
 * @param total 总记录数
 * @param message 响应消息
 */
export function paginated<T>(
  res: Response,
  items: T[],
  page: number,
  pageSize: number,
  total: number,
  message: string = '查询成功'
): void {
  const totalPages = Math.ceil(total / pageSize);

  const paginatedData: PaginatedData<T> = {
    items,
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };

  const response: PaginatedResponse<T> = {
    code: HttpStatusCode.OK,
    message,
    data: paginatedData,
    timestamp: Date.now()
  };

  res.status(HttpStatusCode.OK).json(response);
}

/**
 * 验证错误响应
 * @param res Express Response对象
 * @param errors 验证错误详情
 */
export function validationError(
  res: Response,
  errors: any
): void {
  businessError(
    res,
    BusinessErrorCode.VALIDATION_ERROR,
    '参数验证失败',
    errors
  );
}

/**
 * 未授权错误响应
 * @param res Express Response对象
 * @param message 错误消息
 */
export function unauthorized(
  res: Response,
  message: string = '未授权访问'
): void {
  error(res, message, HttpStatusCode.UNAUTHORIZED);
}

/**
 * 禁止访问错误响应
 * @param res Express Response对象
 * @param message 错误消息
 */
export function forbidden(
  res: Response,
  message: string = '权限不足'
): void {
  error(res, message, HttpStatusCode.FORBIDDEN);
}

/**
 * 资源未找到错误响应
 * @param res Express Response对象
 * @param message 错误消息
 */
export function notFound(
  res: Response,
  message: string = '资源不存在'
): void {
  error(res, message, HttpStatusCode.NOT_FOUND);
}

/**
 * 服务器错误响应
 * @param res Express Response对象
 * @param message 错误消息
 * @param errorDetails 错误详情
 */
export function serverError(
  res: Response,
  message: string = '服务器内部错误',
  errorDetails?: any
): void {
  // 生产环境不返回错误详情
  const details = process.env.NODE_ENV === 'development' ? errorDetails : undefined;
  error(res, message, HttpStatusCode.INTERNAL_SERVER_ERROR, undefined, details);
}

/**
 * 根据业务错误码获取HTTP状态码
 * @param businessCode 业务错误码
 * @returns HTTP状态码
 */
function getHttpStatusFromBusinessCode(businessCode: BusinessErrorCode): number {
  // 认证相关 -> 401
  if (businessCode >= 1001 && businessCode <= 1999) {
    return HttpStatusCode.UNAUTHORIZED;
  }
  // 参数验证 -> 400
  if (businessCode >= 2001 && businessCode <= 2999) {
    return HttpStatusCode.BAD_REQUEST;
  }
  // 业务逻辑 -> 422
  if (businessCode >= 3001 && businessCode <= 3999) {
    return HttpStatusCode.UNPROCESSABLE_ENTITY;
  }
  // 资源限制 -> 429 (Too Many Requests，这里用422代替)
  if (businessCode >= 4001 && businessCode <= 4999) {
    return HttpStatusCode.UNPROCESSABLE_ENTITY;
  }
  // 系统错误 -> 500
  if (businessCode >= 5001 && businessCode <= 5999) {
    return HttpStatusCode.INTERNAL_SERVER_ERROR;
  }
  return HttpStatusCode.BAD_REQUEST;
}
