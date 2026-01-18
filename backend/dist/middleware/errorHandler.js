"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const response_1 = require("../utils/response");
const api_types_1 = require("../types/api.types");
/**
 * 全局错误处理中间件
 * 捕获所有未处理的错误并返回统一格式的错误响应
 */
const errorHandler = (err, req, res, next) => {
    console.error('Error occurred:', err);
    // JWT错误处理
    if (err.name === 'JsonWebTokenError') {
        return (0, response_1.businessError)(res, api_types_1.BusinessErrorCode.TOKEN_INVALID, '无效的令牌');
    }
    if (err.name === 'TokenExpiredError') {
        return (0, response_1.businessError)(res, api_types_1.BusinessErrorCode.TOKEN_EXPIRED, '登录已过期，请重新登录');
    }
    // Multer文件上传错误
    if (err.code === 'LIMIT_FILE_SIZE') {
        return (0, response_1.businessError)(res, api_types_1.BusinessErrorCode.FILE_TOO_LARGE, '文件大小超出限制');
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
        return (0, response_1.businessError)(res, api_types_1.BusinessErrorCode.MAX_PHOTOS_EXCEEDED, '文件数量超出限制');
    }
    // 数据库错误
    if (err.code === 'ER_DUP_ENTRY') {
        return (0, response_1.businessError)(res, api_types_1.BusinessErrorCode.USER_ALREADY_EXISTS, '数据已存在');
    }
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        return (0, response_1.serverError)(res, '关联数据不存在');
    }
    // 业务错误（带有code属性）
    if (err.code && err.message) {
        return (0, response_1.businessError)(res, err.code, err.message);
    }
    // 默认服务器错误
    return (0, response_1.serverError)(res, '服务器内部错误', process.env.NODE_ENV === 'development' ? err : undefined);
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map