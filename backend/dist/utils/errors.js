export var BusinessErrorCode;
(function (BusinessErrorCode) {
    // 通用错误 1xxx
    BusinessErrorCode[BusinessErrorCode["INVALID_REQUEST"] = 1001] = "INVALID_REQUEST";
    BusinessErrorCode[BusinessErrorCode["PERMISSION_DENIED"] = 1003] = "PERMISSION_DENIED";
    // 用户相关 2xxx
    BusinessErrorCode[BusinessErrorCode["USER_NOT_FOUND"] = 2001] = "USER_NOT_FOUND";
    BusinessErrorCode[BusinessErrorCode["USER_ALREADY_EXISTS"] = 2002] = "USER_ALREADY_EXISTS";
    BusinessErrorCode[BusinessErrorCode["INVALID_CREDENTIALS"] = 2003] = "INVALID_CREDENTIALS";
    BusinessErrorCode[BusinessErrorCode["USER_BLOCKED"] = 2004] = "USER_BLOCKED";
    // 活动相关 3xxx
    BusinessErrorCode[BusinessErrorCode["ACTIVITY_NOT_FOUND"] = 3001] = "ACTIVITY_NOT_FOUND";
    BusinessErrorCode[BusinessErrorCode["ACTIVITY_FULL"] = 3002] = "ACTIVITY_FULL";
    BusinessErrorCode[BusinessErrorCode["ALREADY_PARTICIPATED"] = 3003] = "ALREADY_PARTICIPATED";
    // 申请相关 4xxx
    BusinessErrorCode[BusinessErrorCode["APPLICATION_NOT_FOUND"] = 4001] = "APPLICATION_NOT_FOUND";
    BusinessErrorCode[BusinessErrorCode["APPLICATION_PENDING"] = 4002] = "APPLICATION_PENDING";
    BusinessErrorCode[BusinessErrorCode["APPLICATION_ALREADY_REVIEWED"] = 4003] = "APPLICATION_ALREADY_REVIEWED";
    // 好友相关 5xxx
    BusinessErrorCode[BusinessErrorCode["ALREADY_FRIENDS"] = 5001] = "ALREADY_FRIENDS";
    BusinessErrorCode[BusinessErrorCode["FRIEND_REQUEST_PENDING"] = 5002] = "FRIEND_REQUEST_PENDING";
    BusinessErrorCode[BusinessErrorCode["FRIEND_REQUEST_NOT_FOUND"] = 5003] = "FRIEND_REQUEST_NOT_FOUND";
})(BusinessErrorCode || (BusinessErrorCode = {}));
export class BusinessError extends Error {
    constructor(code, message, statusCode = 400) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.name = 'BusinessError';
    }
}
//# sourceMappingURL=errors.js.map