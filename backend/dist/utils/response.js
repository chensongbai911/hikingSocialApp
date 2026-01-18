"use strict";
/**
 * API响应工具函数
 * API Response Utility Functions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.success = success;
exports.created = created;
exports.noContent = noContent;
exports.error = error;
exports.businessError = businessError;
exports.paginated = paginated;
exports.validationError = validationError;
exports.unauthorized = unauthorized;
exports.forbidden = forbidden;
exports.notFound = notFound;
exports.serverError = serverError;
const api_types_1 = require("../types/api.types");
/**
 * 成功响应
 * @param res Express Response对象
 * @param data 响应数据
 * @param message 响应消息
 * @param statusCode HTTP状态码
 */
function success(res, data, message = '操作成功', statusCode = api_types_1.HttpStatusCode.OK) {
    const response = {
        code: statusCode,
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
function created(res, data, message = '创建成功') {
    success(res, data, message, api_types_1.HttpStatusCode.CREATED);
}
/**
 * 无内容响应（204）
 * @param res Express Response对象
 */
function noContent(res) {
    res.status(api_types_1.HttpStatusCode.NO_CONTENT).send();
}
/**
 * 错误响应
 * @param res Express Response对象
 * @param message 错误消息
 * @param statusCode HTTP状态码
 * @param error 错误详情
 * @param details 额外的错误细节
 */
function error(res, message, statusCode = api_types_1.HttpStatusCode.BAD_REQUEST, error, details) {
    const response = {
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
function businessError(res, businessCode, customMessage, details) {
    const message = customMessage || api_types_1.ErrorMessages[businessCode] || '业务处理失败';
    const statusCode = getHttpStatusFromBusinessCode(businessCode);
    const response = {
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
function paginated(res, items, page, pageSize, total, message = '查询成功') {
    const totalPages = Math.ceil(total / pageSize);
    const paginatedData = {
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
    const response = {
        code: api_types_1.HttpStatusCode.OK,
        message,
        data: paginatedData,
        timestamp: Date.now()
    };
    res.status(api_types_1.HttpStatusCode.OK).json(response);
}
/**
 * 验证错误响应
 * @param res Express Response对象
 * @param errors 验证错误详情
 */
function validationError(res, errors) {
    businessError(res, api_types_1.BusinessErrorCode.VALIDATION_ERROR, '参数验证失败', errors);
}
/**
 * 未授权错误响应
 * @param res Express Response对象
 * @param message 错误消息
 */
function unauthorized(res, message = '未授权访问') {
    error(res, message, api_types_1.HttpStatusCode.UNAUTHORIZED);
}
/**
 * 禁止访问错误响应
 * @param res Express Response对象
 * @param message 错误消息
 */
function forbidden(res, message = '权限不足') {
    error(res, message, api_types_1.HttpStatusCode.FORBIDDEN);
}
/**
 * 资源未找到错误响应
 * @param res Express Response对象
 * @param message 错误消息
 */
function notFound(res, message = '资源不存在') {
    error(res, message, api_types_1.HttpStatusCode.NOT_FOUND);
}
/**
 * 服务器错误响应
 * @param res Express Response对象
 * @param message 错误消息
 * @param errorDetails 错误详情
 */
function serverError(res, message = '服务器内部错误', errorDetails) {
    // 生产环境不返回错误详情
    const details = process.env.NODE_ENV === 'development' ? errorDetails : undefined;
    error(res, message, api_types_1.HttpStatusCode.INTERNAL_SERVER_ERROR, undefined, details);
}
/**
 * 根据业务错误码获取HTTP状态码
 * @param businessCode 业务错误码
 * @returns HTTP状态码
 */
function getHttpStatusFromBusinessCode(businessCode) {
    // 认证相关 (1xxx) -> 401
    if (businessCode >= 1001 && businessCode <= 1999) {
        return api_types_1.HttpStatusCode.UNAUTHORIZED;
    }
    // 参数验证 (2xxx) -> 400
    if (businessCode >= 2001 && businessCode <= 2999) {
        return api_types_1.HttpStatusCode.BAD_REQUEST;
    }
    // 业务逻辑 (3xxx) -> 422
    if (businessCode >= 3001 && businessCode <= 3999) {
        return api_types_1.HttpStatusCode.UNPROCESSABLE_ENTITY;
    }
    // 资源不存在 (4001-4099) -> 404
    if (businessCode >= 4001 && businessCode <= 4099) {
        return api_types_1.HttpStatusCode.NOT_FOUND;
    }
    // 资源限制 (4100-4999) -> 429
    if (businessCode >= 4100 && businessCode <= 4999) {
        return api_types_1.HttpStatusCode.UNPROCESSABLE_ENTITY;
    }
    // 系统错误 (5xxx) -> 500
    if (businessCode >= 5001 && businessCode <= 5999) {
        return api_types_1.HttpStatusCode.INTERNAL_SERVER_ERROR;
    }
    return api_types_1.HttpStatusCode.BAD_REQUEST;
}
//# sourceMappingURL=response.js.map