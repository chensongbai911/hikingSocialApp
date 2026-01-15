/**
 * API响应工具函数
 * API Response Utility Functions
 */
import { Response } from 'express';
import { BusinessErrorCode } from '../types/api.types';
/**
 * 成功响应
 * @param res Express Response对象
 * @param data 响应数据
 * @param message 响应消息
 * @param statusCode HTTP状态码
 */
export declare function success<T>(res: Response, data: T, message?: string, statusCode?: number): void;
/**
 * 创建成功响应（201）
 * @param res Express Response对象
 * @param data 响应数据
 * @param message 响应消息
 */
export declare function created<T>(res: Response, data: T, message?: string): void;
/**
 * 无内容响应（204）
 * @param res Express Response对象
 */
export declare function noContent(res: Response): void;
/**
 * 错误响应
 * @param res Express Response对象
 * @param message 错误消息
 * @param statusCode HTTP状态码
 * @param error 错误详情
 * @param details 额外的错误细节
 */
export declare function error(res: Response, message: string, statusCode?: number, error?: string, details?: any): void;
/**
 * 业务错误响应
 * @param res Express Response对象
 * @param businessCode 业务错误码
 * @param customMessage 自定义错误消息（可选）
 * @param details 错误详情（可选）
 */
export declare function businessError(res: Response, businessCode: BusinessErrorCode, customMessage?: string, details?: any): void;
/**
 * 分页响应
 * @param res Express Response对象
 * @param items 数据列表
 * @param page 当前页码
 * @param pageSize 每页条数
 * @param total 总记录数
 * @param message 响应消息
 */
export declare function paginated<T>(res: Response, items: T[], page: number, pageSize: number, total: number, message?: string): void;
/**
 * 验证错误响应
 * @param res Express Response对象
 * @param errors 验证错误详情
 */
export declare function validationError(res: Response, errors: any): void;
/**
 * 未授权错误响应
 * @param res Express Response对象
 * @param message 错误消息
 */
export declare function unauthorized(res: Response, message?: string): void;
/**
 * 禁止访问错误响应
 * @param res Express Response对象
 * @param message 错误消息
 */
export declare function forbidden(res: Response, message?: string): void;
/**
 * 资源未找到错误响应
 * @param res Express Response对象
 * @param message 错误消息
 */
export declare function notFound(res: Response, message?: string): void;
/**
 * 服务器错误响应
 * @param res Express Response对象
 * @param message 错误消息
 * @param errorDetails 错误详情
 */
export declare function serverError(res: Response, message?: string, errorDetails?: any): void;
//# sourceMappingURL=response.d.ts.map