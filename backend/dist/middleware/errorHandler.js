import { serverError, businessError } from '../utils/response';
import { BusinessErrorCode } from '../types/api.types';
/**
 * 全局错误处理中间件
 * 捕获所有未处理的错误并返回统一格式的错误响应
 */
export const errorHandler = (err, req, res, next) => {
    console.error('Error occurred:', err);
    // JWT错误处理
    if (err.name === 'JsonWebTokenError') {
        return businessError(res, BusinessErrorCode.TOKEN_INVALID, '无效的令牌');
    }
    if (err.name === 'TokenExpiredError') {
        return businessError(res, BusinessErrorCode.TOKEN_EXPIRED, '登录已过期，请重新登录');
    }
    // Multer文件上传错误
    if (err.code === 'LIMIT_FILE_SIZE') {
        return businessError(res, BusinessErrorCode.FILE_TOO_LARGE, '文件大小超出限制');
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
        return businessError(res, BusinessErrorCode.MAX_PHOTOS_EXCEEDED, '文件数量超出限制');
    }
    // 数据库错误
    if (err.code === 'ER_DUP_ENTRY') {
        return businessError(res, BusinessErrorCode.USER_ALREADY_EXISTS, '数据已存在');
    }
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        return serverError(res, '关联数据不存在');
    }
    // 业务错误（带有code属性）
    if (err.code && err.message) {
        return businessError(res, err.code, err.message);
    }
    // 默认服务器错误
    return serverError(res, '服务器内部错误', process.env.NODE_ENV === 'development' ? err : undefined);
};
//# sourceMappingURL=errorHandler.js.map