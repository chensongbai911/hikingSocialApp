export declare enum BusinessErrorCode {
    INVALID_REQUEST = 1001,
    PERMISSION_DENIED = 1003,
    USER_NOT_FOUND = 2001,
    USER_ALREADY_EXISTS = 2002,
    INVALID_CREDENTIALS = 2003,
    USER_BLOCKED = 2004,
    ACTIVITY_NOT_FOUND = 3001,
    ACTIVITY_FULL = 3002,
    ALREADY_PARTICIPATED = 3003,
    APPLICATION_NOT_FOUND = 4001,
    APPLICATION_PENDING = 4002,
    APPLICATION_ALREADY_REVIEWED = 4003,
    ALREADY_FRIENDS = 5001,
    FRIEND_REQUEST_PENDING = 5002,
    FRIEND_REQUEST_NOT_FOUND = 5003
}
export declare class BusinessError extends Error {
    code: BusinessErrorCode;
    statusCode: number;
    constructor(code: BusinessErrorCode, message: string, statusCode?: number);
}
//# sourceMappingURL=errors.d.ts.map