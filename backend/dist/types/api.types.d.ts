/**
 * 统一API响应类型定义
 * API Response Type Definitions
 */
export interface BaseResponse<T = any> {
    code: number;
    message: string;
    data?: T;
    timestamp?: number;
}
export interface SuccessResponse<T = any> extends BaseResponse<T> {
    code: 200 | 201;
    message: string;
    data: T;
}
export interface ErrorResponse extends BaseResponse {
    code: number;
    message: string;
    error?: string;
    details?: any;
}
export interface PaginationParams {
    page: number;
    pageSize: number;
    total?: number;
    totalPages?: number;
}
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
export interface PaginatedResponse<T> extends BaseResponse<PaginatedData<T>> {
    code: 200;
    message: string;
    data: PaginatedData<T>;
}
export declare enum HttpStatusCode {
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
export declare enum BusinessErrorCode {
    INVALID_CREDENTIALS = 1001,
    TOKEN_EXPIRED = 1002,
    TOKEN_INVALID = 1003,
    USER_ALREADY_EXISTS = 1005,
    UNAUTHORIZED = 1006,
    VALIDATION_ERROR = 2001,
    MISSING_REQUIRED_FIELD = 2002,
    INVALID_FIELD_VALUE = 2003,
    INVALID_FILE_TYPE = 2004,
    FILE_TOO_LARGE = 2005,
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
    USER_NOT_FOUND = 4001,
    RATE_LIMIT_EXCEEDED = 4101,
    QUOTA_EXCEEDED = 4102,
    DATABASE_ERROR = 5001,
    NETWORK_ERROR = 5002,
    UNKNOWN_ERROR = 5999
}
export declare const ErrorMessages: Record<BusinessErrorCode, string>;
//# sourceMappingURL=api.types.d.ts.map