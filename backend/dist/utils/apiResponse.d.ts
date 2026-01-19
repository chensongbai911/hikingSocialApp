/**
 * 统一 API 响应格式工具
 * 创建日期: 2026-01-19
 * 任务编号: T0.2
 */
export interface ApiResponse<T = any> {
    code: number;
    message: string;
    data: T | null;
    timestamp: number;
    requestId?: string;
}
export interface PaginationMeta {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
}
export interface ApiResponseWithPagination<T = any> extends ApiResponse<T> {
    pagination: PaginationMeta;
}
/**
 * 创建成功响应
 */
export declare const createSuccessResponse: <T>(data: T, message?: string, code?: number) => ApiResponse<T>;
/**
 * 创建错误响应
 */
export declare const createErrorResponse: (message: string, code?: number, details?: any) => ApiResponse<null>;
/**
 * 创建分页响应
 */
export declare const createPaginatedResponse: <T>(data: T[], pagination: PaginationMeta, message?: string) => ApiResponseWithPagination<T[]>;
/**
 * 计算分页元数据
 */
export declare const calculatePagination: (page: number, pageSize: number, total: number) => PaginationMeta;
/**
 * 常用响应码
 */
export declare enum ResponseCode {
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
    SERVICE_UNAVAILABLE = 503
}
//# sourceMappingURL=apiResponse.d.ts.map