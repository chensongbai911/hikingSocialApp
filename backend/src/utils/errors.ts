export enum BusinessErrorCode {
  // 通用错误 1xxx
  INVALID_REQUEST = 1001,
  PERMISSION_DENIED = 1003,

  // 用户相关 2xxx
  USER_NOT_FOUND = 2001,
  USER_ALREADY_EXISTS = 2002,
  INVALID_CREDENTIALS = 2003,
  USER_BLOCKED = 2004,

  // 活动相关 3xxx
  ACTIVITY_NOT_FOUND = 3001,
  ACTIVITY_FULL = 3002,
  ALREADY_PARTICIPATED = 3003,

  // 申请相关 4xxx
  APPLICATION_NOT_FOUND = 4001,
  APPLICATION_PENDING = 4002,
  APPLICATION_ALREADY_REVIEWED = 4003,

  // 好友相关 5xxx
  ALREADY_FRIENDS = 5001,
  FRIEND_REQUEST_PENDING = 5002,
  FRIEND_REQUEST_NOT_FOUND = 5003,
}

export class BusinessError extends Error {
  code: BusinessErrorCode
  statusCode: number

  constructor(code: BusinessErrorCode, message: string, statusCode: number = 400) {
    super(message)
    this.code = code
    this.statusCode = statusCode
    this.name = 'BusinessError'
  }
}
