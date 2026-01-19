"use strict";
/**
 * 统一 API 响应格式工具
 * 创建日期: 2026-01-19
 * 任务编号: T0.2
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseCode = exports.calculatePagination = exports.createPaginatedResponse = exports.createErrorResponse = exports.createSuccessResponse = void 0;
/**
 * 创建成功响应
 */
const createSuccessResponse = (data, message = '操作成功', code = 200) => ({
    code,
    message,
    data,
    timestamp: Date.now(),
});
exports.createSuccessResponse = createSuccessResponse;
/**
 * 创建错误响应
 */
const createErrorResponse = (message, code = 500, details) => ({
    code,
    message,
    data: null,
    timestamp: Date.now(),
    ...(details && { details }),
});
exports.createErrorResponse = createErrorResponse;
/**
 * 创建分页响应
 */
const createPaginatedResponse = (data, pagination, message = '查询成功') => ({
    code: 200,
    message,
    data,
    pagination,
    timestamp: Date.now(),
});
exports.createPaginatedResponse = createPaginatedResponse;
/**
 * 计算分页元数据
 */
const calculatePagination = (page, pageSize, total) => ({
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
});
exports.calculatePagination = calculatePagination;
/**
 * 常用响应码
 */
var ResponseCode;
(function (ResponseCode) {
    ResponseCode[ResponseCode["SUCCESS"] = 200] = "SUCCESS";
    ResponseCode[ResponseCode["CREATED"] = 201] = "CREATED";
    ResponseCode[ResponseCode["NO_CONTENT"] = 204] = "NO_CONTENT";
    ResponseCode[ResponseCode["BAD_REQUEST"] = 400] = "BAD_REQUEST";
    ResponseCode[ResponseCode["UNAUTHORIZED"] = 401] = "UNAUTHORIZED";
    ResponseCode[ResponseCode["FORBIDDEN"] = 403] = "FORBIDDEN";
    ResponseCode[ResponseCode["NOT_FOUND"] = 404] = "NOT_FOUND";
    ResponseCode[ResponseCode["CONFLICT"] = 409] = "CONFLICT";
    ResponseCode[ResponseCode["UNPROCESSABLE_ENTITY"] = 422] = "UNPROCESSABLE_ENTITY";
    ResponseCode[ResponseCode["INTERNAL_SERVER_ERROR"] = 500] = "INTERNAL_SERVER_ERROR";
    ResponseCode[ResponseCode["SERVICE_UNAVAILABLE"] = 503] = "SERVICE_UNAVAILABLE";
})(ResponseCode || (exports.ResponseCode = ResponseCode = {}));
//# sourceMappingURL=apiResponse.js.map