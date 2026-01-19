# vNext 快速启动指南

**更新日期**: 2026-01-19
**适用角色**: 全体团队成员
**预计阅读时间**: 5 分钟

---

## 🚀 立即开始 (3 步)

### Step 1: 了解你的任务

**查看执行看板**:

```bash
打开: vNext_EXECUTION_TRACKER.md
找到: 团队分工 → 你的角色 → 当前任务
```

**查看任务详情**:

```bash
打开: vNext_TASK_BREAKDOWN.md
搜索: 你的任务编号 (如 T0.1)
```

---

### Step 2: 设置开发环境

#### 后端开发者

```powershell
# 1. 进入后端目录
cd backend

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev

# 4. 验证启动成功
# 访问: http://localhost:3000/api/health
```

**TypeScript strict 模式启用** (T0.1):

```powershell
# 1. 备份 tsconfig.json
cp tsconfig.json tsconfig.json.backup

# 2. 编辑 backend/tsconfig.json
# 添加或修改:
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "alwaysStrict": true
  }
}

# 3. 编译检查错误
npm run build 2>&1 | tee ts-errors.log

# 4. 查看错误列表
cat ts-errors.log | grep "error TS"
```

**统一 API 响应格式** (T0.2):

```powershell
# 1. 创建工具文件
New-Item -Path "src/utils/apiResponse.ts" -ItemType File

# 2. 复制以下代码到 apiResponse.ts:
```

```typescript
// backend/src/utils/apiResponse.ts
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T | null
  timestamp: number
  requestId?: string
}

export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface ApiResponseWithPagination<T = any> extends ApiResponse<T> {
  pagination: PaginationMeta
}

export const createSuccessResponse = <T>(
  data: T,
  message = '操作成功',
  code = 200
): ApiResponse<T> => ({
  code,
  message,
  data,
  timestamp: Date.now(),
})

export const createErrorResponse = (
  message: string,
  code = 500,
  details?: any
): ApiResponse<null> => ({
  code,
  message,
  data: null,
  timestamp: Date.now(),
  ...(details && { details }),
})

export const createPaginatedResponse = <T>(
  data: T[],
  pagination: PaginationMeta,
  message = '查询成功'
): ApiResponseWithPagination<T[]> => ({
  code: 200,
  message,
  data,
  pagination,
  timestamp: Date.now(),
})
```

**清理 console.log** (T0.3):

```powershell
# 1. 扫描所有 console
grep -r "console\\.log" src/ > console-list.txt
grep -r "console\\.warn" src/ >> console-list.txt
grep -r "console\\.error" src/ >> console-list.txt

# 2. 查看列表
cat console-list.txt

# 3. 逐个审核并删除/迁移
# 保留: console.error (关键错误)
# 删除: console.log, console.warn
# 迁移: 使用 logger.info(), logger.warn()

# 4. 添加 ESLint rule
# 编辑 .eslintrc.json:
{
  "rules": {
    "no-console": ["error", { "allow": ["error"] }]
  }
}

# 5. 验证
npm run lint
```

---

#### 前端开发者

```powershell
# 1. 进入前端目录
cd frontend

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev

# 4. 验证启动成功
# 访问: http://localhost:5173
```

**前端 API 数据层重构** (T0.5):

**第 1 步**: 创建目录结构

```powershell
# 创建目录
New-Item -Path "src/api/base" -ItemType Directory
New-Item -Path "src/api/hooks" -ItemType Directory
New-Item -Path "src/api/modules" -ItemType Directory

# 创建文件
New-Item -Path "src/api/base/apiService.ts" -ItemType File
New-Item -Path "src/api/base/types.ts" -ItemType File
New-Item -Path "src/api/hooks/useApiRequest.ts" -ItemType File
```

**第 2 步**: 创建 types.ts

```typescript
// frontend/src/api/base/types.ts
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T | null
  timestamp: number
  requestId?: string
}

export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface ApiResponseWithPagination<T = any> extends ApiResponse<T> {
  pagination: PaginationMeta
}

export interface ApiOptions {
  cache?: boolean | number // true = 默认 TTL, number = 毫秒
  retry?: number // 重试次数
  timeout?: number // 超时时间
  onError?: (error: Error) => void
}

export enum CACHE_TTL {
  NONE = 0,
  SHORT = 60000, // 1 分钟
  DEFAULT = 300000, // 5 分钟
  LONG = 1800000, // 30 分钟
  ROUTE = 600000, // 10 分钟
  MESSAGE = 180000, // 3 分钟
}
```

**第 3 步**: 创建 apiService.ts

```typescript
// frontend/src/api/base/apiService.ts
import { request } from '../http'
import type { ApiResponse, ApiOptions } from './types'

class ApiService {
  /**
   * GET 请求
   */
  async get<T>(url: string, params?: any, options?: ApiOptions): Promise<T> {
    const response = await request.get<ApiResponse<T>>(url, { params })
    return response.data as T
  }

  /**
   * POST 请求
   */
  async post<T>(url: string, data?: any, options?: ApiOptions): Promise<T> {
    const response = await request.post<ApiResponse<T>>(url, data)
    return response.data as T
  }

  /**
   * PUT 请求
   */
  async put<T>(url: string, data?: any, options?: ApiOptions): Promise<T> {
    const response = await request.put<ApiResponse<T>>(url, data)
    return response.data as T
  }

  /**
   * DELETE 请求
   */
  async delete<T>(url: string, options?: ApiOptions): Promise<T> {
    const response = await request.delete<ApiResponse<T>>(url)
    return response.data as T
  }
}

export const apiService = new ApiService()
export default apiService
```

**第 4 步**: 创建 useApiRequest.ts

```typescript
// frontend/src/api/hooks/useApiRequest.ts
import { ref, type Ref } from 'vue'
import type { ApiOptions } from '../base/types'

export interface UseApiRequestReturn<T> {
  data: Ref<T | null>
  loading: Ref<boolean>
  error: Ref<Error | null>
  execute: (forceRefresh?: boolean) => Promise<T>
  refresh: () => Promise<T>
}

export function useApiRequest<T>(
  apiCall: () => Promise<T>,
  options: ApiOptions = {}
): UseApiRequestReturn<T> {
  const data = ref<T | null>(null) as Ref<T | null>
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const execute = async (forceRefresh = false): Promise<T> => {
    loading.value = true
    error.value = null

    try {
      const result = await apiCall()
      data.value = result
      loading.value = false
      return result
    } catch (e) {
      error.value = e as Error
      loading.value = false
      options.onError?.(error.value)
      throw error.value
    }
  }

  const refresh = () => execute(true)

  return {
    data,
    loading,
    error,
    execute,
    refresh,
  }
}
```

**第 5 步**: 改造 message.ts (示范)

```typescript
// frontend/src/api/modules/message.ts
import apiService from '../base/apiService'
import type { Conversation, Message } from '@/types/message'

export const messageApi = {
  /**
   * 获取对话列表
   */
  async getConversations(page = 1, limit = 20) {
    return apiService.get<Conversation[]>('/messages/conversations', {
      page,
      limit,
    })
  },

  /**
   * 发送消息
   */
  async sendMessage(conversationId: string, content: string, type = 'text') {
    return apiService.post<Message>(`/messages/conversations/${conversationId}/messages`, {
      content,
      type,
    })
  },

  /**
   * 获取未读消息数
   */
  async getUnreadCount() {
    return apiService.get<number>('/messages/unread-count')
  },
}

export default messageApi
```

**清理 console.log** (T0.3):

```powershell
# 前端清理步骤同后端
grep -r "console\\.log" src/ > console-list-fe.txt

# 编辑 .eslintrc.cjs 添加规则
{
  "rules": {
    "no-console": ["error", { "allow": ["error", "warn"] }]
  }
}

# 验证
npm run lint
```

---

#### UI/UX 设计师

**本周交付清单**:

- [ ] 路线列表页 (Wireframe + 高保真)
- [ ] 路线详情页 (Wireframe + 高保真)
- [ ] 路线创建表单 (Wireframe + 高保真)

**设计规范**:

```
尺寸: 375×667 (移动端) / 1440×900 (桌面)
工具: Figma (推荐)
格式: Figma 链接 + PNG/SVG 切图
参考: design_images/ 文件夹
```

**交付位置**:

```
设计文件放置:
- Figma 链接: 发送给 PM
- 切图资源: design_images/vNext/ 文件夹
```

---

#### QA 工程师

**本周任务**:

- [ ] 制定 Sprint 1-4 测试计划
- [ ] 准备自动化测试框架 (Cypress/Playwright)
- [ ] 设计性能测试脚本 (JMeter/Artillery)

**测试计划模板**:

```markdown
# Sprint X 测试计划

## 功能测试

- 测试用例数: XX
- 覆盖率目标: 100%

## 性能测试

- API 响应时间: < 500ms
- 并发用户数: 500+

## 安全测试

- SQL 注入
- XSS 攻击
- CSRF 防护
```

---

### Step 3: 提交你的工作

#### Git 工作流

```powershell
# 1. 创建功能分支
git checkout -b feature/T0.X-task-name

# 2. 提交代码
git add .
git commit -m "feat: [T0.X] 任务描述"

# 3. 推送到远程
git push origin feature/T0.X-task-name

# 4. 创建 Pull Request
# 访问 GitHub/GitLab 创建 PR
# 指定 Reviewer: Tech Lead
```

#### Commit 规范

```
格式: <type>: [TaskID] <subject>

type:
- feat: 新功能
- fix: Bug 修复
- refactor: 重构
- docs: 文档
- test: 测试
- chore: 构建/工具

示例:
feat: [T0.1] 启用 TypeScript strict 模式
fix: [T0.2] 修复 API 响应格式不统一问题
refactor: [T0.5] 重构前端 API 数据层
```

---

## 📞 获取帮助

### 遇到问题?

**技术问题**:

- Slack: #dev-support
- 后端: @backend-lead
- 前端: @frontend-lead

**产品问题**:

- Slack: #product
- 联系: @product-manager

**设计问题**:

- Slack: #design
- 联系: @design-lead

---

## 📚 必读文档

### 新成员必读 (30 分钟)

1. [执行跟踪看板](./vNext_EXECUTION_TRACKER.md) - 了解当前进度
2. [任务拆分计划](./vNext_TASK_BREAKDOWN.md) - 了解所有任务
3. [PRD 综合分析](./vNext_PRD_ANALYSIS_COMPREHENSIVE.md) - 了解需求

### 按角色阅读

- **后端**: [数据库设计 Checklist](./vNext_DATABASE_REVIEW_CHECKLIST.md)
- **前端**: [前端架构 Checklist](./vNext_FRONTEND_REVIEW_CHECKLIST.md)
- **产品**: [决策清单](./vNext_PM_DECISION_CHECKLIST.md)
- **设计**: [设计需求](./vNext_DESIGN_REQUIREMENTS.md)

---

## ✅ 每日检查清单

### 早上 (9:00 AM)

- [ ] 查看 [执行看板](./vNext_EXECUTION_TRACKER.md) 今日任务
- [ ] 参加每日站会 (10 分钟)
- [ ] 更新自己的任务状态

### 下午 (3:00 PM)

- [ ] 检查是否有阻塞问题
- [ ] 及时沟通寻求帮助

### 晚上 (6:00 PM)

- [ ] 提交今日代码
- [ ] 更新任务进度
- [ ] 记录明天计划

---

## 🎯 本周目标

**团队目标**:

- ✅ 完成阶段 0 代码优化 (60% → 100%)
- ✅ TypeScript strict 模式 100% 启用
- ✅ console.log 100% 清理
- ✅ API 响应格式 100% 统一
- ✅ 前端数据层架构重构完成

**个人目标**:

- 完成分配给你的任务
- 代码通过 Code Review
- 无阻塞性问题

---

## 📊 进度报告

**每周五 5:00 PM**:

- 填写本周工作总结
- 提交下周工作计划
- 更新 [执行看板](./vNext_EXECUTION_TRACKER.md)

---

**祝开发顺利! 🚀**

**有问题随时在 Slack 提问!**
