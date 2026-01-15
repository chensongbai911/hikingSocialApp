# API响应标准文档

## 📋 目录

1. [响应格式规范](#响应格式规范)
2. [状态码设计](#状态码设计)
3. [错误码规范](#错误码规范)
4. [分页规范](#分页规范)
5. [工具函数使用](#工具函数使用)
6. [最佳实践](#最佳实践)

---

## 响应格式规范

### 基础响应结构

所有API响应均采用统一的JSON格式：

```typescript
{
  code: number;        // 状态码（HTTP状态码或业务错误码）
  message: string;     // 响应消息
  data?: any;          // 响应数据（可选）
  timestamp?: number;  // 时间戳（可选）
}
```

### 成功响应示例

**简单数据响应**

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "id": "user-001",
    "nickname": "张三",
    "email": "zhangsan@test.com"
  },
  "timestamp": 1705233600000
}
```

**创建资源响应（201）**

```json
{
  "code": 201,
  "message": "创建成功",
  "data": {
    "id": "act-001",
    "title": "周末爬山",
    "status": "pending"
  },
  "timestamp": 1705233600000
}
```

**无内容响应（204）**

```
HTTP 204 No Content
（无响应体）
```

### 错误响应示例

**参数验证错误**

```json
{
  "code": 2001,
  "message": "参数验证失败",
  "details": {
    "email": "邮箱格式不正确",
    "password": "密码长度至少6位"
  },
  "timestamp": 1705233600000
}
```

**业务逻辑错误**

```json
{
  "code": 3002,
  "message": "活动人数已满",
  "timestamp": 1705233600000
}
```

**认证错误**

```json
{
  "code": 401,
  "message": "登录已过期，请重新登录",
  "error": "Token expired",
  "timestamp": 1705233600000
}
```

**服务器错误**

```json
{
  "code": 500,
  "message": "服务器内部错误",
  "timestamp": 1705233600000
}
```

### 分页响应示例

```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "items": [
      {
        "id": "act-001",
        "title": "螺髻山徒步",
        "difficulty": "moderate"
      },
      {
        "id": "act-002",
        "title": "香山赏秋",
        "difficulty": "easy"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 25,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
    }
  },
  "timestamp": 1705233600000
}
```

---

## 状态码设计

### HTTP状态码

| 状态码 | 含义                  | 使用场景                    |
| ------ | --------------------- | --------------------------- |
| 200    | OK                    | 请求成功（查询、更新）      |
| 201    | Created               | 资源创建成功                |
| 204    | No Content            | 删除成功，无返回内容        |
| 400    | Bad Request           | 请求参数错误                |
| 401    | Unauthorized          | 未授权（未登录或Token失效） |
| 403    | Forbidden             | 已登录但权限不足            |
| 404    | Not Found             | 资源不存在                  |
| 409    | Conflict              | 资源冲突（如重复创建）      |
| 422    | Unprocessable Entity  | 业务逻辑错误                |
| 500    | Internal Server Error | 服务器内部错误              |
| 503    | Service Unavailable   | 服务不可用                  |

---

## 错误码规范

### 业务错误码分类

业务错误码采用4位数字，按范围划分：

| 范围 | 类别     | 说明                   |
| ---- | -------- | ---------------------- |
| 1xxx | 认证相关 | 登录、注册、Token等    |
| 2xxx | 参数验证 | 请求参数校验失败       |
| 3xxx | 业务逻辑 | 活动、用户等业务错误   |
| 4xxx | 资源限制 | 配额、频率限制等       |
| 5xxx | 系统错误 | 数据库、网络等系统错误 |

### 常用错误码列表

**认证相关（1xxx）**

- `1001` - 用户名或密码错误
- `1002` - 登录已过期，请重新登录
- `1003` - 无效的令牌
- `1004` - 用户不存在
- `1005` - 用户已存在
- `1006` - 未授权访问

**参数验证（2xxx）**

- `2001` - 参数验证失败
- `2002` - 缺少必填字段
- `2003` - 字段值不合法
- `2004` - 不支持的文件类型
- `2005` - 文件大小超出限制

**业务逻辑（3xxx）**

- `3001` - 活动不存在
- `3002` - 活动人数已满
- `3003` - 已加入该活动
- `3004` - 未加入该活动
- `3005` - 无法退出活动
- `3006` - 权限不足
- `3007` - 活动已取消
- `3008` - 活动已结束

**资源限制（4xxx）**

- `4001` - 请求过于频繁
- `4002` - 超出配额限制
- `4003` - 相册照片数量超出限制

**系统错误（5xxx）**

- `5001` - 数据库错误
- `5002` - 网络错误
- `5999` - 未知错误

---

## 分页规范

### 分页请求参数

| 参数     | 类型   | 必填 | 默认值 | 说明              |
| -------- | ------ | ---- | ------ | ----------------- |
| page     | number | 否   | 1      | 当前页码，从1开始 |
| pageSize | number | 否   | 10     | 每页条数（1-100） |

### 分页响应结构

```typescript
{
  items: T[];           // 数据列表
  pagination: {
    page: number;       // 当前页码
    pageSize: number;   // 每页条数
    total: number;      // 总记录数
    totalPages: number; // 总页数
    hasNext: boolean;   // 是否有下一页
    hasPrev: boolean;   // 是否有上一页
  }
}
```

### 分页计算逻辑

```typescript
const totalPages = Math.ceil(total / pageSize)
const hasNext = page < totalPages
const hasPrev = page > 1
```

---

## 工具函数使用

### 引入工具函数

```typescript
import {
  success,
  created,
  noContent,
  error,
  businessError,
  paginated,
  validationError,
  unauthorized,
  forbidden,
  notFound,
  serverError,
} from '../utils/response'
import { BusinessErrorCode } from '../types/api.types'
```

### 成功响应

```typescript
// 简单成功响应
success(res, userData, '获取用户信息成功')

// 创建成功响应
created(res, newActivity, '活动创建成功')

// 无内容响应
noContent(res)
```

### 错误响应

```typescript
// 业务错误（推荐）
businessError(res, BusinessErrorCode.ACTIVITY_FULL)

// 自定义业务错误消息
businessError(res, BusinessErrorCode.ACTIVITY_FULL, '该活动已满员，请选择其他活动')

// 通用错误
error(res, '请求参数错误', 400)

// 验证错误
validationError(res, { email: '邮箱格式不正确' })

// 未授权
unauthorized(res, '请先登录')

// 权限不足
forbidden(res, '您没有权限执行此操作')

// 资源未找到
notFound(res, '活动不存在')

// 服务器错误
serverError(res, '数据库连接失败', error)
```

### 分页响应

```typescript
// 分页查询
const activities = await ActivityService.findAll(page, pageSize)
const total = await ActivityService.count()

paginated(res, activities, page, pageSize, total, '活动列表查询成功')
```

---

## 最佳实践

### 1. Controller中的错误处理

```typescript
export class ActivityController {
  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const activity = await ActivityService.findById(id)

      if (!activity) {
        return businessError(res, BusinessErrorCode.ACTIVITY_NOT_FOUND)
      }

      return success(res, activity, '活动详情获取成功')
    } catch (error) {
      console.error('Get activity error:', error)
      return serverError(res, '获取活动详情失败', error)
    }
  }

  static async join(req: Request, res: Response) {
    try {
      const { id } = req.params
      const userId = req.user!.id

      const activity = await ActivityService.findById(id)
      if (!activity) {
        return businessError(res, BusinessErrorCode.ACTIVITY_NOT_FOUND)
      }

      // 检查是否已加入
      const hasJoined = await ParticipationService.hasJoined(id, userId)
      if (hasJoined) {
        return businessError(res, BusinessErrorCode.ALREADY_JOINED)
      }

      // 检查人数限制
      const currentCount = await ParticipationService.countByActivity(id)
      if (currentCount >= activity.max_participants) {
        return businessError(res, BusinessErrorCode.ACTIVITY_FULL)
      }

      const participation = await ParticipationService.create(id, userId)
      return created(res, participation, '加入活动成功')
    } catch (error) {
      console.error('Join activity error:', error)
      return serverError(res, '加入活动失败', error)
    }
  }
}
```

### 2. 参数验证

```typescript
// 使用中间件进行参数验证
import { body, validationResult } from 'express-validator'

export const validateLogin = [
  body('email').isEmail().withMessage('邮箱格式不正确'),
  body('password').isLength({ min: 6 }).withMessage('密码长度至少6位'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return validationError(res, errors.array())
    }
    next()
  },
]
```

### 3. 统一错误处理中间件

```typescript
// middleware/errorHandler.ts
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('Error:', err)

  // JWT错误
  if (err.name === 'JsonWebTokenError') {
    return unauthorized(res, '无效的令牌')
  }

  if (err.name === 'TokenExpiredError') {
    return businessError(res, BusinessErrorCode.TOKEN_EXPIRED)
  }

  // Multer文件上传错误
  if (err.code === 'LIMIT_FILE_SIZE') {
    return businessError(res, BusinessErrorCode.FILE_TOO_LARGE)
  }

  // 数据库错误
  if (err.code === 'ER_DUP_ENTRY') {
    return businessError(res, BusinessErrorCode.USER_ALREADY_EXISTS)
  }

  // 默认服务器错误
  return serverError(res, '服务器内部错误', err)
}
```

### 4. 响应一致性检查清单

- ✅ 所有成功响应都使用 `success()` 或 `created()`
- ✅ 所有错误响应都使用 `businessError()` 或其他错误工具函数
- ✅ 分页查询使用 `paginated()`
- ✅ 删除操作成功后返回 `noContent()` 或 `success()`
- ✅ 所有响应包含 `code` 和 `message` 字段
- ✅ 错误响应使用合适的业务错误码
- ✅ HTTP状态码与业务错误码匹配
- ✅ 生产环境不返回敏感错误详情

---

## 示例API文档

### 用户登录

**接口地址**

```
POST /api/v1/auth/login
```

**请求参数**

```json
{
  "email": "zhangsan@test.com",
  "password": "password123"
}
```

**成功响应（200）**

```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-001",
      "nickname": "张三",
      "email": "zhangsan@test.com",
      "avatar_url": "/uploads/avatars/user-001.jpg"
    }
  },
  "timestamp": 1705233600000
}
```

**错误响应（401）**

```json
{
  "code": 1001,
  "message": "用户名或密码错误",
  "timestamp": 1705233600000
}
```

### 活动列表

**接口地址**

```
GET /api/v1/activities?page=1&pageSize=10&status=approved&difficulty=moderate
```

**成功响应（200）**

```json
{
  "code": 200,
  "message": "活动列表查询成功",
  "data": {
    "items": [
      {
        "id": "act-001",
        "title": "螺髻山徒步",
        "difficulty": "moderate",
        "status": "approved",
        "creator": {
          "id": "user-001",
          "nickname": "张三",
          "avatar_url": "/uploads/avatars/user-001.jpg"
        },
        "current_participants": 5,
        "max_participants": 10
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 25,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
    }
  },
  "timestamp": 1705233600000
}
```

---

## 总结

遵循本标准可以确保：

1. **一致性** - 所有API响应格式统一
2. **可预测** - 前端可以统一处理响应
3. **可维护** - 错误码和消息集中管理
4. **可扩展** - 易于添加新的错误类型
5. **用户友好** - 清晰的错误消息提示

所有Controller实现都应严格遵循本标准。
