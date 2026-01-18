"use strict";
/**
 * 统一API响应类型定义
 * API Response Type Definitions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorMessages = exports.BusinessErrorCode = exports.HttpStatusCode = void 0;
// HTTP状态码枚举
var HttpStatusCode;
(function (HttpStatusCode) {
    HttpStatusCode[HttpStatusCode["OK"] = 200] = "OK";
    HttpStatusCode[HttpStatusCode["CREATED"] = 201] = "CREATED";
    HttpStatusCode[HttpStatusCode["NO_CONTENT"] = 204] = "NO_CONTENT";
    HttpStatusCode[HttpStatusCode["BAD_REQUEST"] = 400] = "BAD_REQUEST";
    HttpStatusCode[HttpStatusCode["UNAUTHORIZED"] = 401] = "UNAUTHORIZED";
    HttpStatusCode[HttpStatusCode["FORBIDDEN"] = 403] = "FORBIDDEN";
    HttpStatusCode[HttpStatusCode["NOT_FOUND"] = 404] = "NOT_FOUND";
    HttpStatusCode[HttpStatusCode["CONFLICT"] = 409] = "CONFLICT";
    HttpStatusCode[HttpStatusCode["UNPROCESSABLE_ENTITY"] = 422] = "UNPROCESSABLE_ENTITY";
    HttpStatusCode[HttpStatusCode["INTERNAL_SERVER_ERROR"] = 500] = "INTERNAL_SERVER_ERROR";
    HttpStatusCode[HttpStatusCode["SERVICE_UNAVAILABLE"] = 503] = "SERVICE_UNAVAILABLE";
})(HttpStatusCode || (exports.HttpStatusCode = HttpStatusCode = {}));
// 业务错误码
var BusinessErrorCode;
(function (BusinessErrorCode) {
    // 认证相关 (1xxx) - 仅用于token/登录认证失败
    BusinessErrorCode[BusinessErrorCode["INVALID_CREDENTIALS"] = 1001] = "INVALID_CREDENTIALS";
    BusinessErrorCode[BusinessErrorCode["TOKEN_EXPIRED"] = 1002] = "TOKEN_EXPIRED";
    BusinessErrorCode[BusinessErrorCode["TOKEN_INVALID"] = 1003] = "TOKEN_INVALID";
    BusinessErrorCode[BusinessErrorCode["USER_ALREADY_EXISTS"] = 1005] = "USER_ALREADY_EXISTS";
    BusinessErrorCode[BusinessErrorCode["UNAUTHORIZED"] = 1006] = "UNAUTHORIZED";
    // 参数验证 (2xxx)
    BusinessErrorCode[BusinessErrorCode["VALIDATION_ERROR"] = 2001] = "VALIDATION_ERROR";
    BusinessErrorCode[BusinessErrorCode["MISSING_REQUIRED_FIELD"] = 2002] = "MISSING_REQUIRED_FIELD";
    BusinessErrorCode[BusinessErrorCode["INVALID_FIELD_VALUE"] = 2003] = "INVALID_FIELD_VALUE";
    BusinessErrorCode[BusinessErrorCode["INVALID_FILE_TYPE"] = 2004] = "INVALID_FILE_TYPE";
    BusinessErrorCode[BusinessErrorCode["FILE_TOO_LARGE"] = 2005] = "FILE_TOO_LARGE";
    // 业务逻辑 (3xxx)
    BusinessErrorCode[BusinessErrorCode["ACTIVITY_NOT_FOUND"] = 3001] = "ACTIVITY_NOT_FOUND";
    BusinessErrorCode[BusinessErrorCode["ACTIVITY_FULL"] = 3002] = "ACTIVITY_FULL";
    BusinessErrorCode[BusinessErrorCode["ALREADY_JOINED"] = 3003] = "ALREADY_JOINED";
    BusinessErrorCode[BusinessErrorCode["NOT_JOINED"] = 3004] = "NOT_JOINED";
    BusinessErrorCode[BusinessErrorCode["CANNOT_LEAVE"] = 3005] = "CANNOT_LEAVE";
    BusinessErrorCode[BusinessErrorCode["PERMISSION_DENIED"] = 3006] = "PERMISSION_DENIED";
    BusinessErrorCode[BusinessErrorCode["ACTIVITY_CANCELLED"] = 3007] = "ACTIVITY_CANCELLED";
    BusinessErrorCode[BusinessErrorCode["ACTIVITY_COMPLETED"] = 3008] = "ACTIVITY_COMPLETED";
    BusinessErrorCode[BusinessErrorCode["PREFERENCE_NOT_FOUND"] = 3009] = "PREFERENCE_NOT_FOUND";
    BusinessErrorCode[BusinessErrorCode["PHOTO_NOT_FOUND"] = 3010] = "PHOTO_NOT_FOUND";
    BusinessErrorCode[BusinessErrorCode["MAX_PHOTOS_EXCEEDED"] = 3011] = "MAX_PHOTOS_EXCEEDED";
    BusinessErrorCode[BusinessErrorCode["RESOURCE_NOT_FOUND"] = 3012] = "RESOURCE_NOT_FOUND";
    BusinessErrorCode[BusinessErrorCode["FORBIDDEN"] = 3013] = "FORBIDDEN";
    // 资源不存在 (4xxx) - 返回404
    BusinessErrorCode[BusinessErrorCode["USER_NOT_FOUND"] = 4001] = "USER_NOT_FOUND";
    // 资源限制 (4xxx) - 返回429或422
    BusinessErrorCode[BusinessErrorCode["RATE_LIMIT_EXCEEDED"] = 4101] = "RATE_LIMIT_EXCEEDED";
    BusinessErrorCode[BusinessErrorCode["QUOTA_EXCEEDED"] = 4102] = "QUOTA_EXCEEDED";
    // 系统错误 (5xxx)
    BusinessErrorCode[BusinessErrorCode["DATABASE_ERROR"] = 5001] = "DATABASE_ERROR";
    BusinessErrorCode[BusinessErrorCode["NETWORK_ERROR"] = 5002] = "NETWORK_ERROR";
    BusinessErrorCode[BusinessErrorCode["UNKNOWN_ERROR"] = 5999] = "UNKNOWN_ERROR";
})(BusinessErrorCode || (exports.BusinessErrorCode = BusinessErrorCode = {}));
// 错误信息映射
exports.ErrorMessages = {
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
//# sourceMappingURL=api.types.js.map