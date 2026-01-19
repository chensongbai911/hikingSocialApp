# Stage 0 实施指南

**项目**: 徒步社交 App vNext
**阶段**: Stage 0 - 代码质量优化
**时间**: Week 1-2 (2026-01-19 至 2026-02-01)
**目标**: 建立高质量代码基础

---

## 📋 任务概览

| 任务 | 描述                | 人日 | 负责人      | 截止日期 |
| ---- | ------------------- | ---- | ----------- | -------- |
| T0.1 | TypeScript 严格模式 | 4    | 后端 Senior | 01-25    |
| T0.2 | 统一 API 响应格式   | 2    | 后端 Mid    | 01-23    |
| T0.3 | 清理 console.log    | 1    | Junior      | 01-22    |
| T0.4 | Socket.io 安全      | 1    | 后端 Senior | 01-25    |
| T0.5 | 前端 API 层重构     | 5    | 前端 Senior | 02-01    |

**总计**: 13 人日，2 周完成

---

## ✅ T0.1: TypeScript 严格模式

### 目标

启用 TypeScript 严格类型检查，消除所有隐式 any 和类型错误

### 步骤

#### 1. 更新 tsconfig.json

**后端** (`backend/tsconfig.json`):

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true
  }
}
```

**前端** (`frontend/tsconfig.json`):

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
    // ... 同后端
  }
}
```

#### 2. 修复类型错误

```bash
# 后端
cd backend
npm run build

# 查看错误列表
tsc --noEmit

# 逐个修复
```

**常见错误修复**:

```typescript
// ❌ 错误: 隐式 any
function getUser(id) {
  return users[id]
}

// ✅ 正确: 显式类型
function getUser(id: number): User | undefined {
  return users[id]
}

// ❌ 错误: 可能为 null
const user = getUserById(1)
console.log(user.name) // Error: Object is possibly 'null'

// ✅ 正确: 空值检查
const user = getUserById(1)
if (user) {
  console.log(user.name)
}

// 或使用可选链
console.log(user?.name)
```

#### 3. 验证

```bash
# 后端编译通过
cd backend
npm run build
# 应该 0 错误

# 前端编译通过
cd frontend
npm run build
# 应该 0 错误
```

### 验收标准

- ✅ `tsc --noEmit` 0 错误
- ✅ 所有函数参数有明确类型
- ✅ 所有函数返回值有明确类型
- ✅ 无隐式 any

---

## ✅ T0.2: 统一 API 响应格式

### 目标

所有 API 使用统一的响应格式，消除前端数据解包混乱

### 步骤

#### 1. 使用 apiResponse.ts

**已创建**: `backend/src/utils/apiResponse.ts`

**所有控制器必须使用**:

```typescript
import {
  createSuccessResponse,
  createErrorResponse,
  createPaginatedResponse,
  ResponseCode,
} from '../utils/apiResponse'

// ✅ 成功响应
export const getUser = async (req: Request, res: Response) => {
  const user = await findUser(req.params.id)
  res.json(createSuccessResponse(user))
}

// ✅ 错误响应
export const getUser = async (req: Request, res: Response) => {
  const user = await findUser(req.params.id)
  if (!user) {
    return res.json(createErrorResponse(ResponseCode.NOT_FOUND, '用户不存在'))
  }
  res.json(createSuccessResponse(user))
}

// ✅ 分页响应
export const getUsers = async (req: Request, res: Response) => {
  const { page, pageSize } = req.query
  const [users, total] = await findUsers(page, pageSize)
  res.json(createPaginatedResponse(users, Number(page), Number(pageSize), total))
}
```

#### 2. 检查所有控制器

```bash
# 搜索所有控制器文件
find backend/src/controllers -name "*.ts"

# 检查每个文件是否使用了统一响应格式
grep -r "res.json" backend/src/controllers
```

#### 3. 禁止直接 res.json()

**在 ESLint 中添加规则** (可选):

```javascript
// backend/.eslintrc.js
rules: {
  // 禁止直接使用 res.json()，必须使用 apiResponse 工具
  'no-restricted-syntax': [
    'error',
    {
      selector: 'CallExpression[callee.property.name="json"]',
      message: 'Use createSuccessResponse/createErrorResponse instead of res.json()',
    },
  ],
}
```

### 验收标准

- ✅ 所有 API 响应格式统一
- ✅ 所有响应包含 `code`, `message`, `data`, `timestamp`
- ✅ 分页响应包含 `pagination`
- ✅ 前端无需手动解包 `response.data.data`

---

## ✅ T0.3: 清理 console.log

### 目标

移除所有调试用的 console.log，改用正式日志系统

### 步骤

#### 1. 搜索所有 console.log

```bash
# 后端
cd backend
grep -rn "console.log" src/

# 前端
cd frontend
grep -rn "console.log" src/
```

#### 2. 分类处理

**保留 (允许的)**:

- `console.error()` - 错误日志
- `console.warn()` - 警告日志

**删除 (不允许的)**:

- `console.log()` - 调试日志
- `console.info()` - 信息日志
- `console.debug()` - 调试日志

**替换为 Winston (后端)**:

```typescript
// ❌ 删除
console.log('User created:', user)

// ✅ 使用 Winston
import logger from '../utils/logger'
logger.info('User created', { userId: user.id, username: user.name })
```

**替换为条件日志 (前端)**:

```typescript
// ❌ 删除
console.log('API response:', data)

// ✅ 仅开发环境
if (import.meta.env.DEV) {
  console.log('API response:', data)
}
```

#### 3. 启用 ESLint 规则

**已配置**: `backend/.eslintrc.js`

```javascript
rules: {
  'no-console': ['warn', { allow: ['warn', 'error'] }],
}
```

```bash
# 运行 ESLint 检查
npm run lint

# 自动修复部分问题
npm run lint:fix
```

### 验收标准

- ✅ 后端 `grep -r "console.log" src/` 返回 0 结果
- ✅ 前端仅开发环境使用 console.log
- ✅ ESLint 检查通过

---

## ✅ T0.4: Socket.io 安全加固

### 目标

确保 WebSocket 连接安全，防止未授权访问

### 步骤

#### 1. 添加 JWT 认证中间件

```typescript
// backend/src/socket/auth.ts
import { Server, Socket } from 'socket.io'
import jwt from 'jsonwebtoken'

export function setupSocketAuth(io: Server): void {
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token

    if (!token) {
      return next(new Error('Authentication error: No token provided'))
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!)
      socket.data.user = decoded
      next()
    } catch (error) {
      next(new Error('Authentication error: Invalid token'))
    }
  })
}
```

#### 2. 限流保护

```typescript
// backend/src/socket/rateLimit.ts
import { Socket } from 'socket.io'

const MESSAGE_LIMIT = 10 // 每秒最多 10 条消息
const userMessageCounts = new Map<string, number>()

export function rateLimitMiddleware(socket: Socket, next: () => void): void {
  const userId = socket.data.user?.id

  if (!userId) {
    return next()
  }

  const count = userMessageCounts.get(userId) || 0

  if (count >= MESSAGE_LIMIT) {
    socket.emit('error', { message: 'Rate limit exceeded' })
    return
  }

  userMessageCounts.set(userId, count + 1)

  setTimeout(() => {
    userMessageCounts.set(userId, Math.max(0, (userMessageCounts.get(userId) || 0) - 1))
  }, 1000)

  next()
}
```

#### 3. 命名空间隔离

```typescript
// backend/src/socket/index.ts
import { Server } from 'socket.io'
import { setupSocketAuth } from './auth'

export function setupSocket(server: any): Server {
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    },
    // 启用心跳检测
    pingTimeout: 60000,
    pingInterval: 25000,
  })

  // 全局认证
  setupSocketAuth(io)

  // 命名空间: 队伍定位
  const teamNamespace = io.of('/team')
  teamNamespace.on('connection', (socket) => {
    // 只处理队伍相关事件
  })

  // 命名空间: 聊天
  const chatNamespace = io.of('/chat')
  chatNamespace.on('connection', (socket) => {
    // 只处理聊天相关事件
  })

  return io
}
```

### 验收标准

- ✅ Socket 连接必须提供有效 JWT token
- ✅ 限流保护已启用
- ✅ 不同功能使用独立命名空间

---

## ✅ T0.5: 前端 API 层重构

### 目标

使用已创建的 API 架构替换现有的混乱调用

### 步骤

#### 1. 使用新的 API 架构

**已创建的文件**:

- `frontend/src/api/base/types.ts` - 类型定义
- `frontend/src/api/base/apiService.ts` - HTTP 客户端
- `frontend/src/api/hooks/useApiRequest.ts` - Vue Hook
- `frontend/src/api/modules/route.ts` - 路线 API

#### 2. 组件中使用

**旧代码 (❌ 删除)**:

```typescript
import axios from 'axios'

const { data } = await axios.get('/api/v1/routes')
const routes = data.data // 手动解包
```

**新代码 (✅ 使用)**:

```typescript
import { useApiRequest } from '@/api/hooks/useApiRequest'
import { routeApi } from '@/api/modules/route'

// 方式 1: 使用 Hook (推荐)
const {
  data: routes,
  loading,
  error,
} = useApiRequest(() => routeApi.getList({ page: 1, pageSize: 20 }))

// 方式 2: 直接调用
const routes = await routeApi.getList({ page: 1, pageSize: 20 })
// 已自动解包，直接是 Route[]
```

#### 3. 创建其他 API 模块

参考 `route.ts`，创建其他模块:

```bash
frontend/src/api/modules/
├── route.ts      # ✅ 已创建
├── user.ts       # 待创建
├── track.ts      # 待创建
├── team.ts       # 待创建
├── message.ts    # 待创建
└── report.ts     # 待创建
```

**模板** (`user.ts`):

```typescript
import apiService from '../base/apiService'
import type { User, UserProfile } from '../base/types'

export const userApi = {
  // 获取用户信息
  getProfile: (userId: number) => apiService.get<User>(`/users/${userId}`),

  // 更新用户信息
  updateProfile: (userId: number, data: Partial<UserProfile>) =>
    apiService.put<User>(`/users/${userId}`, data),

  // 上传头像
  uploadAvatar: (file: File) => apiService.upload<{ url: string }>('/users/avatar', file, 'avatar'),
}
```

#### 4. 删除旧的 API 调用

```bash
# 搜索旧的 axios 调用
grep -rn "axios.get\|axios.post" frontend/src/

# 逐个替换为新的 API 模块
```

### 验收标准

- ✅ 所有 API 调用通过 `api/modules/*` 进行
- ✅ 组件中使用 `useApiRequest` Hook
- ✅ 无直接 axios 调用
- ✅ API 响应自动解包，无需 `.data.data`

---

## 📊 Stage 0 每日检查清单

### 每日提交前

- [ ] 运行 `npm run lint` - 无错误
- [ ] 运行 `npm run build` - 编译成功
- [ ] 运行 `npm test` - 测试通过
- [ ] Git commit 遵循规范
- [ ] 更新任务状态到 vNext_EXECUTION_TRACKER.md

### 每日站会 (15 分钟)

1. **昨天完成了什么**?
2. **今天计划做什么**?
3. **遇到了什么阻碍**?

---

## 🎯 Stage 0 验收标准

### 代码质量

- ✅ TypeScript 编译 0 错误
- ✅ ESLint 检查 0 错误
- ✅ 测试覆盖率 > 60%

### API 规范

- ✅ 所有 API 响应格式统一
- ✅ 所有 API 包含错误处理
- ✅ 所有 API 文档完整

### 安全性

- ✅ Socket.io JWT 认证启用
- ✅ 限流保护启用
- ✅ 输入验证完整

### 性能

- ✅ API 响应时间 < 500ms
- ✅ 前端首屏加载 < 3s
- ✅ Redis 缓存命中率 > 80%

---

## 📞 遇到问题?

- 技术讨论: [团队群]
- Bug 反馈: GitHub Issues
- 文档更新: 提交 PR

---

**完成 Stage 0 后，我们将拥有一个高质量、可维护的代码基础！**
