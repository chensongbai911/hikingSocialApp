# 徒步记录页面 - API 集成指南

## 📌 快速概览

`MyHiking.vue` 组件已完全实现 UI 和交互逻辑，目前使用**模拟数据**演示功能。本指南说明如何启用真实 API 数据。

---

## 🔧 启用 API 集成步骤

### 第一步：取消 API 导入注释

**文件**: `d:\coze\frontend\src\components\pages\MyHiking.vue`

**操作**: 找到第 4 行，取消注释：

```typescript
// 原始（已注释）
// import { activityApi } from '@/api/activity'

// 修改为
import { activityApi } from '@/api/activity'
```

### 第二步：启用 loadActivities 函数中的 API 调用

**文件**: `d:\coze\frontend\src\components\pages\MyHiking.vue`

**操作**: 找到`loadActivities`函数（第 90-106 行），修改为：

```typescript
const loadActivities = async () => {
  loading.value = true
  try {
    // ✅ 启用这些API调用
    const joinedRes = await activityApi.getActivities({ status: 'joined' })
    const createdRes = await activityApi.getActivities({ status: 'created' })

    // 更新数据
    joinedActivities.value = joinedRes.data.items
    createdActivities.value = createdRes.data.items

    console.log('Activities loaded successfully')
  } catch (error) {
    console.error('Failed to load activities:', error)
  } finally {
    loading.value = false
  }
}
```

### 第三步：启动后端服务

确保后端服务运行在正确的端口：

```bash
# 后端服务启动
cd d:\coze\backend
npm start
# 或
npm run dev
```

### 第四步：刷新前端页面

```bash
# 前端开发服务器应该已运行
# 手动刷新浏览器: http://localhost:5174/
```

---

## 📊 API 端点详情

### 获取我加入的活动

**端点**: `GET /api/v1/activities/me/joined`

**参数**:

```typescript
{
  page?: number        // 页码（默认1）
  limit?: number       // 每页数量（默认10）
  status?: string      // 活动状态过滤
}
```

**响应示例**:

```json
{
  "code": 0,
  "data": {
    "items": [
      {
        "id": 1,
        "title": "螺山国家森林公园健行",
        "location": "昌平螺山公园售票处",
        "startTime": "2023-12-15T09:00:00Z",
        "coverImage": "https://...",
        "status": "进行中",
        "difficulty": "3.0",
        "participants": [
          {
            "id": 1,
            "name": "张三",
            "avatar": "https://..."
          }
        ]
      }
    ],
    "total": 5,
    "page": 1,
    "pageSize": 10
  }
}
```

### 获取我发布的活动

**端点**: `GET /api/v1/activities/me/created`

**参数**: 同上

**响应**: 同上

---

## 🔄 数据流向

```
┌─────────────┐
│  MyHiking   │
│   .vue      │
└──────┬──────┘
       │
       │ onMounted()
       │
       ▼
┌─────────────────────────┐
│  loadActivities()       │
└──────┬──────────────────┘
       │
       │ await activityApi.getActivities()
       │
       ▼
┌─────────────────────────┐
│  activity.ts (API)      │
│  ├─ getActivities()     │
│  └─ api.get()           │
└──────┬──────────────────┘
       │
       │ HTTP GET
       │
       ▼
┌─────────────────────────┐
│  后端服务               │
│  /api/v1/activities/...  │
└──────┬──────────────────┘
       │
       │ JSON响应
       │
       ▼
┌─────────────────────────┐
│  更新状态               │
│  joinedActivities.value │
│  createdActivities.value│
└──────┬──────────────────┘
       │
       │ 响应式更新
       │
       ▼
┌─────────────────────────┐
│  重新渲染模板           │
│  显示真实数据           │
└─────────────────────────┘
```

---

## 🧪 测试 API 集成

### 使用浏览器 DevTools 测试

1. **打开 Chrome DevTools** (F12)
2. **切换到 Network 标签**
3. **查看请求**:
   - 应该看到 `/api/v1/activities/me/joined` 请求
   - 应该看到 `/api/v1/activities/me/created` 请求
4. **检查响应**:
   - 状态码应为 200
   - Response 应为有效 JSON

### 使用 console 测试

```javascript
// 在浏览器console中运行
// 查看是否有API相关的错误
console.log('Loading state:', loading.value)
console.log('Joined activities:', joinedActivities.value)
console.log('Created activities:', createdActivities.value)
```

---

## 🐛 常见问题排查

### 问题 1: CORS 错误

**症状**: `Access to XMLHttpRequest blocked by CORS policy`

**解决方案**:

```typescript
// 检查后端 api.ts 配置
// 确保 API 基础URL正确

import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000', // ✅ 检查这里
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})
```

### 问题 2: 404 错误

**症状**: `GET /api/v1/activities/me/joined 404`

**解决方案**:

1. 检查后端路由是否存在
2. 检查 URL 拼写是否正确
3. 确保后端服务正在运行

### 问题 3: 401 未授权

**症状**: `401 Unauthorized`

**解决方案**:

```typescript
// 检查token是否正确存储和发送
// 在 api.ts 中验证

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

---

## 📝 数据模型适配

### 后端返回数据结构

```typescript
interface ApiActivity {
  id: number
  title: string
  description?: string
  location: string
  startTime: string // ISO 8601 格式
  coverImage?: string
  difficulty?: number // 1-5
  status: string // '招募中' | '进行中' | '已结束'
  // ... 其他字段
}
```

### 前端期望的 Activity 接口

```typescript
interface Activity {
  id: number
  title: string
  location: string
  startTime: string
  coverImage?: string
  status: string
  difficulty?: string
  participantCount?: number
  applicantCount?: number
  applicants?: Participant[]
  participants?: Participant[]
}
```

### 数据转换（如果需要）

```typescript
// 在 loadActivities 中进行数据转换
const transformActivity = (apiActivity: any): Activity => {
  return {
    id: apiActivity.id,
    title: apiActivity.title,
    location: apiActivity.location,
    startTime: apiActivity.startTime,
    coverImage: apiActivity.coverImage,
    status: apiActivity.status,
    difficulty: String(apiActivity.difficulty),
    participantCount: apiActivity.participantCount || 0,
    applicantCount: apiActivity.applicantCount || 0,
    participants: apiActivity.participants || [],
    applicants: apiActivity.applicants || [],
  }
}
```

---

## 🚀 性能优化建议

### 1. 添加 Loading 状态显示

```vue
<div v-if="loading" class="text-center py-8">
  <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-teal-500 mx-auto"></div>
  <p class="text-gray-600 mt-2">加载中...</p>
</div>

<div v-else-if="joinedActivities.length > 0">
  <!-- 显示活动列表 -->
</div>
```

### 2. 实现分页加载

```typescript
const currentPage = ref(1)
const pageSize = ref(10)

const loadMore = async () => {
  const res = await activityApi.getActivities({
    page: currentPage.value + 1,
    limit: pageSize.value,
  })
  joinedActivities.value.push(...res.data.items)
  currentPage.value++
}
```

### 3. 实现刷新功能

```typescript
const refresh = async () => {
  currentPage.value = 1
  await loadActivities()
}
```

---

## 📋 检查清单

启用 API 前，确保以下项目已完成：

- [ ] 后端服务已启动
- [ ] API endpoint 已实现
- [ ] 数据库中有测试数据
- [ ] CORS 配置正确
- [ ] 认证 token 处理正确
- [ ] 未取消 API 导入注释
- [ ] loadActivities 函数已启用
- [ ] 前端服务已重启
- [ ] 浏览器已清除缓存

---

## 📚 相关文件

| 文件                 | 说明                   |
| -------------------- | ---------------------- |
| `MyHiking.vue`       | 记录页面组件（已优化） |
| `api/activity.ts`    | 活动 API 定义          |
| `api/http.ts`        | Axios 实例配置         |
| `stores/activity.ts` | 活动状态管理（可选）   |
| `types/index.ts`     | 类型定义               |

---

## 🎯 下一步

1. **完成 API 集成** (本指南)
2. **启用更多 API 端点**:

   - 参加/取消活动
   - 编辑/删除活动
   - 查看申请者列表

3. **添加用户交互反馈**:

   - 加载状态
   - 错误提示
   - 成功提示

4. **优化性能**:
   - 虚拟列表
   - 图片懒加载
   - 缓存策略

---

**最后更新**: 2026-01-14
**版本**: v1.0.0
**作者**: AI Assistant
