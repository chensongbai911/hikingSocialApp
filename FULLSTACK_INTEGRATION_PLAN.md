# 🚀 徒步社交 App - 全栈集成与 Lynx 跨端开发任务规划

**创建时间**: 2026-01-14
**版本**: v2.0
**状态**: 执行中

---

## 📊 项目现状分析

### ✅ 已完成

- ✅ 前端页面 UI 开发（Discover、MyHiking、Profile、EditProfile、PrivacySettings）
- ✅ 后端数据库设计（users, activities, participations 等 7 张表）
- ✅ 后端基础架构（Controllers、Services、Routes）
- ✅ 前端路由配置
- ✅ 基础样式规范（Teal 主题）

### 🔴 待完成

- ❌ 前后端 API 集成（所有接口调用）
- ❌ 登录注册功能实现
- ❌ 图片上传功能
- ❌ 地图组件集成与数据保存
- ❌ 数据库初始化与测试数据
- ❌ Lynx 跨端打包配置
- ❌ 接口规范统一
- ❌ 字段命名统一

---

## 🎯 总体目标

1. **前后端完整对接**：所有页面通过 API 获取真实数据
2. **功能完整性**：登录、注册、上传、地图等核心功能正常运行
3. **跨端支持**：集成 Lynx 框架，支持 Web、iOS、Android 三端
4. **代码规范**：接口风格统一、字段命名一致、可复用性强

---

## 📋 任务拆解

### 阶段一：数据库与测试数据准备（优先级：P0）

#### Task 1.1: 数据库字段规范统一

**时间**: 2 小时
**负责模块**: Database Schema

**目标**：

- 统一字段命名规范（snake_case）
- 确保所有外键关系正确
- 添加必要索引
- 规范 ENUM 类型值

**输出**：

- `backend/src/database/schema_v2.sql` - 规范化的数据库结构
- `backend/src/database/FIELD_NAMING_GUIDE.md` - 字段命名规范文档

**检查清单**：

- [ ] users 表字段完整（id, email, password_hash, nickname, avatar_url 等）
- [ ] activities 表字段完整（id, creator_id, title, description, cover_image_url 等）
- [ ] 所有时间字段统一为 `created_at`, `updated_at`, `deleted_at`
- [ ] 所有外键约束正确设置
- [ ] 枚举类型统一（status, difficulty, gender 等）

---

#### Task 1.2: 创建测试数据 SQL 脚本

**时间**: 1.5 小时
**负责模块**: Test Data

**目标**：

- 创建 5-10 个测试用户
- 创建 10-15 个测试活动
- 创建参与关系数据
- 创建用户偏好数据
- 创建相册照片数据

**输出**：

- `backend/src/database/seed_data.sql` - 测试数据脚本

**测试数据结构**：

```sql
-- 5个用户
INSERT INTO users VALUES
  ('user-001', 'zhangsan@test.com', 'hashed_pwd', '山间清风', 'avatar1.jpg', 'male', 28, ...),
  ('user-002', 'lisi@test.com', 'hashed_pwd', '徒步达人', 'avatar2.jpg', 'female', 25, ...),
  ...

-- 15个活动
INSERT INTO activities VALUES
  ('act-001', 'user-001', '蜈支洲岛徒步', '...", 'cover1.jpg', '海南三亚', ..., 'approved'),
  ('act-002', 'user-002', '香山红叶登山', '...', 'cover2.jpg', '北京香山', ..., 'ongoing'),
  ...

-- 参与关系
INSERT INTO participations VALUES
  ('part-001', 'user-002', 'act-001', 'joined', NOW(), ...),
  ...
```

**检查清单**：

- [ ] 用户数据覆盖不同性别、年龄、等级
- [ ] 活动数据覆盖不同状态（pending, approved, ongoing, completed）
- [ ] 活动数据覆盖不同难度（easy, moderate, hard）
- [ ] 参与关系数据合理
- [ ] 每个用户有 3-5 张相册照片
- [ ] 每个用户有 5-8 个偏好标签

---

### 阶段二：后端 API 规范与实现（优先级：P0）

#### Task 2.1: 定义统一的 API 响应规范

**时间**: 1 小时
**负责模块**: API Standards

**目标**：

- 统一响应格式
- 统一错误码
- 统一分页格式

**输出**：

- `backend/src/types/api.types.ts` - API 类型定义
- `backend/src/utils/response.ts` - 响应工具函数
- `backend/docs/API_STANDARDS.md` - API 规范文档

**响应格式**：

```typescript
// 成功响应
{
  "code": 200,
  "message": "success",
  "data": { ... }
}

// 错误响应
{
  "code": 400,
  "message": "参数错误",
  "error": "Invalid email format"
}

// 分页响应
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

**检查清单**：

- [ ] 定义 ResponseDTO 接口
- [ ] 定义 ErrorDTO 接口
- [ ] 定义 PaginationDTO 接口
- [ ] 创建 success()、error()工具函数
- [ ] 文档化所有 HTTP 状态码使用场景

---

#### Task 2.2: 实现认证相关 API

**时间**: 3 小时
**负责模块**: Auth Module

**接口列表**：

1. `POST /api/v1/auth/register` - 用户注册
2. `POST /api/v1/auth/login` - 用户登录
3. `POST /api/v1/auth/logout` - 用户登出
4. `POST /api/v1/auth/refresh` - 刷新 Token
5. `GET /api/v1/auth/me` - 获取当前用户信息

**输出**：

- 完善 `AuthController.ts`
- 完善 `AuthService.ts`
- 更新 `authRoutes.ts`

**功能细节**：

```typescript
// 注册
POST /api/v1/auth/register
Body: {
  email: string,
  password: string,
  nickname: string,
  gender?: 'male' | 'female' | 'other',
  age?: number
}
Response: {
  code: 200,
  data: {
    user: { id, email, nickname, ... },
    token: "jwt_token",
    refreshToken: "refresh_token"
  }
}

// 登录
POST /api/v1/auth/login
Body: {
  email: string,
  password: string
}
Response: {
  code: 200,
  data: {
    user: { id, email, nickname, avatarUrl, ... },
    token: "jwt_token",
    refreshToken: "refresh_token"
  }
}
```

**检查清单**：

- [ ] 密码加密（bcrypt）
- [ ] JWT Token 生成与验证
- [ ] Refresh Token 机制
- [ ] 邮箱格式验证
- [ ] 密码强度验证（最少 8 位）
- [ ] 昵称重复检查
- [ ] 邮箱重复检查
- [ ] 错误处理完善

---

#### Task 2.3: 实现用户相关 API

**时间**: 4 小时
**负责模块**: User Module

**接口列表**：

1. `GET /api/v1/users/profile` - 获取当前用户资料
2. `PUT /api/v1/users/profile` - 更新用户资料
3. `POST /api/v1/users/avatar` - 上传头像
4. `POST /api/v1/users/photos` - 上传相册照片
5. `DELETE /api/v1/users/photos/:id` - 删除相册照片
6. `GET /api/v1/users/preferences` - 获取用户偏好
7. `PUT /api/v1/users/preferences` - 更新用户偏好
8. `GET /api/v1/users/privacy` - 获取隐私设置
9. `PUT /api/v1/users/privacy` - 更新隐私设置

**输出**：

- 完善 `UserController.ts`
- 完善 `UserService.ts`
- 更新 `userRoutes.ts`

**功能细节**：

```typescript
// 获取用户资料
GET /api/v1/users/profile
Response: {
  code: 200,
  data: {
    id: string,
    email: string,
    nickname: string,
    avatarUrl: string,
    gender: 'male' | 'female' | 'other',
    age: number,
    bio: string,
    hikingLevel: 'beginner' | 'intermediate' | 'advanced',
    preferences: ['周末出发', '休闲徒步', ...],
    photos: ['url1', 'url2', ...],
    privacy: {
      hideRealName: boolean,
      hideExactAge: boolean,
      friendsOnlyActivities: boolean,
      hideLocationFromNonFriends: boolean
    }
  }
}

// 更新用户资料
PUT /api/v1/users/profile
Body: {
  nickname?: string,
  gender?: 'male' | 'female' | 'other',
  age?: number,
  bio?: string,
  hikingLevel?: 'beginner' | 'intermediate' | 'advanced'
}
```

**检查清单**：

- [ ] 获取完整用户资料（包含偏好、相册、隐私设置）
- [ ] 更新用户基本信息
- [ ] 头像上传（文件处理）
- [ ] 相册照片上传（最多 9 张）
- [ ] 相册照片删除
- [ ] 偏好标签 CRUD
- [ ] 隐私设置 CRUD
- [ ] 权限验证（只能修改自己的资料）

---

#### Task 2.4: 实现活动相关 API

**时间**: 5 小时
**负责模块**: Activity Module

**接口列表**：

1. `GET /api/v1/activities` - 获取活动列表（分页、筛选）
2. `GET /api/v1/activities/:id` - 获取活动详情
3. `POST /api/v1/activities` - 创建活动
4. `PUT /api/v1/activities/:id` - 编辑活动
5. `DELETE /api/v1/activities/:id` - 删除/取消活动
6. `POST /api/v1/activities/:id/join` - 加入活动
7. `POST /api/v1/activities/:id/leave` - 退出活动
8. `GET /api/v1/activities/my-joined` - 我加入的活动
9. `GET /api/v1/activities/my-created` - 我发布的活动
10. `GET /api/v1/activities/:id/participants` - 获取参与者列表

**输出**：

- 完善 `ActivityController.ts`
- 完善 `ActivityService.ts`
- 更新 `activityRoutes.ts`

**功能细节**：

```typescript
// 获取活动列表
GET /api/v1/activities?page=1&pageSize=20&status=approved&difficulty=easy
Response: {
  code: 200,
  data: {
    items: [
      {
        id: string,
        title: string,
        description: string,
        coverImageUrl: string,
        location: string,
        startTime: string,
        difficulty: 'easy' | 'moderate' | 'hard',
        maxParticipants: number,
        currentParticipants: number,
        status: 'pending' | 'approved' | 'ongoing' | 'completed',
        creator: {
          id: string,
          nickname: string,
          avatarUrl: string
        }
      },
      ...
    ],
    pagination: { page: 1, pageSize: 20, total: 100, totalPages: 5 }
  }
}

// 创建活动
POST /api/v1/activities
Body: {
  title: string,
  description: string,
  coverImageUrl?: string,
  location: string,
  latitude?: number,
  longitude?: number,
  startTime: string,
  endTime?: string,
  difficulty: 'easy' | 'moderate' | 'hard',
  maxParticipants?: number,
  routeDescription?: string,
  equipmentRequired?: string
}
```

**检查清单**：

- [ ] 活动列表分页
- [ ] 活动列表筛选（状态、难度、时间）
- [ ] 活动详情（包含创建者、参与者列表）
- [ ] 创建活动（默认 status=pending）
- [ ] 编辑活动（仅创建者）
- [ ] 取消活动（仅创建者）
- [ ] 加入活动（检查人数上限）
- [ ] 退出活动
- [ ] 我加入的活动列表
- [ ] 我发布的活动列表
- [ ] 参与者列表

---

#### Task 2.5: 实现发现页面 API

**时间**: 3 小时
**负责模块**: Discovery Module

**接口列表**：

1. `GET /api/v1/discovery/users` - 获取推荐用户列表
2. `GET /api/v1/discovery/search` - 搜索用户
3. `POST /api/v1/discovery/like` - 喜欢用户
4. `POST /api/v1/discovery/skip` - 跳过用户

**输出**：

- 完善 `DiscoveryController.ts`
- 完善 `DiscoveryService.ts`
- 更新 `discoveryRoutes.ts`

**功能细节**：

```typescript
// 获取推荐用户
GET /api/v1/discovery/users?page=1&pageSize=20
Response: {
  code: 200,
  data: {
    items: [
      {
        id: string,
        nickname: string,
        avatarUrl: string,
        age: number,
        gender: 'male' | 'female' | 'other',
        bio: string,
        hikingLevel: 'beginner' | 'intermediate' | 'advanced',
        preferences: ['周末出发', ...],
        photos: ['url1', 'url2', ...],
        distance?: number  // 距离（km）
      },
      ...
    ],
    pagination: { ... }
  }
}
```

**检查清单**：

- [ ] 推荐用户列表（基于偏好匹配）
- [ ] 搜索用户（昵称、简介）
- [ ] 喜欢用户记录
- [ ] 跳过用户记录
- [ ] 排除已喜欢/已跳过的用户

---

#### Task 2.6: 实现图片上传服务

**时间**: 3 小时
**负责模块**: Upload Service

**接口列表**：

1. `POST /api/v1/upload/image` - 通用图片上传
2. `POST /api/v1/upload/avatar` - 头像上传（带裁剪）
3. `POST /api/v1/upload/activity-cover` - 活动封面上传

**输出**：

- 完善 `UploadService.ts`
- 创建 `uploadRoutes.ts`
- 创建 `uploadHandler.ts` middleware

**功能细节**：

```typescript
// 图片上传
POST /api/v1/upload/image
Content-Type: multipart/form-data
Body: {
  file: File
}
Response: {
  code: 200,
  data: {
    url: "https://cdn.example.com/uploads/xxx.jpg",
    filename: "xxx.jpg",
    size: 102400,
    mimeType: "image/jpeg"
  }
}
```

**技术方案**：

- 使用 `multer` 处理文件上传
- 图片存储：本地 `uploads/` 目录（后期可迁移 OSS）
- 文件命名：UUID + 时间戳 + 原扩展名
- 图片处理：使用 `sharp` 压缩、裁剪
- 文件类型限制：jpg, jpeg, png, webp
- 文件大小限制：5MB

**检查清单**：

- [ ] 文件上传中间件配置
- [ ] 文件类型验证
- [ ] 文件大小验证
- [ ] 图片压缩（质量 80%）
- [ ] 头像裁剪（200x200）
- [ ] 生成缩略图
- [ ] 返回 CDN URL
- [ ] 错误处理

---

### 阶段三：前端 API 集成（优先级：P0）

#### Task 3.1: 创建统一的 API Service 层

**时间**: 2 小时
**负责模块**: Frontend API Layer

**目标**：

- 创建所有 API 调用函数
- 统一错误处理
- 统一 Loading 状态管理
- 统一 Token 管理

**输出**：

- `frontend/src/api/auth.ts` - 认证 API
- `frontend/src/api/user.ts` - 用户 API
- `frontend/src/api/activity.ts` - 活动 API
- `frontend/src/api/discovery.ts` - 发现 API
- `frontend/src/api/upload.ts` - 上传 API
- `frontend/src/utils/request.ts` - 请求工具

**代码结构**：

```typescript
// frontend/src/api/auth.ts
import request from '@/utils/request'

export interface LoginParams {
  email: string
  password: string
}

export interface RegisterParams {
  email: string
  password: string
  nickname: string
  gender?: 'male' | 'female' | 'other'
  age?: number
}

export const authAPI = {
  // 登录
  login: (params: LoginParams) => {
    return request.post('/auth/login', params)
  },

  // 注册
  register: (params: RegisterParams) => {
    return request.post('/auth/register', params)
  },

  // 获取当前用户
  getCurrentUser: () => {
    return request.get('/auth/me')
  },

  // 登出
  logout: () => {
    return request.post('/auth/logout')
  },

  // 刷新Token
  refreshToken: (refreshToken: string) => {
    return request.post('/auth/refresh', { refreshToken })
  },
}
```

**检查清单**：

- [ ] 所有 API 函数定义完整
- [ ] TypeScript 类型定义完整
- [ ] 请求拦截器（添加 Token）
- [ ] 响应拦截器（统一错误处理）
- [ ] Token 过期自动刷新
- [ ] Loading 状态管理
- [ ] 错误 Toast 提示

---

#### Task 3.2: 集成 Pinia 状态管理

**时间**: 3 小时
**负责模块**: State Management

**目标**：

- 完善 userStore
- 创建 activityStore
- 创建 discoveryStore
- 统一状态管理模式

**输出**：

- 完善 `frontend/src/stores/user.ts`
- 创建 `frontend/src/stores/activity.ts`
- 创建 `frontend/src/stores/discovery.ts`
- 创建 `frontend/src/stores/app.ts`

**userStore 功能**：

```typescript
// frontend/src/stores/user.ts
import { defineStore } from 'pinia'
import { authAPI, userAPI } from '@/api'

export const useUserStore = defineStore('user', {
  state: () => ({
    currentUser: null as User | null,
    token: localStorage.getItem('token') || '',
    isLoggedIn: false,
    profile: null as UserProfile | null,
  }),

  actions: {
    // 登录
    async login(email: string, password: string) {
      const res = await authAPI.login({ email, password })
      this.token = res.data.token
      this.currentUser = res.data.user
      this.isLoggedIn = true
      localStorage.setItem('token', res.data.token)
    },

    // 登出
    async logout() {
      await authAPI.logout()
      this.token = ''
      this.currentUser = null
      this.isLoggedIn = false
      localStorage.removeItem('token')
    },

    // 获取用户资料
    async fetchProfile() {
      const res = await userAPI.getProfile()
      this.profile = res.data
    },

    // 更新用户资料
    async updateProfile(data: Partial<UserProfile>) {
      const res = await userAPI.updateProfile(data)
      this.profile = res.data
    },
  },
})
```

**检查清单**：

- [ ] userStore 完整（登录、登出、资料 CRUD）
- [ ] activityStore 完整（活动列表、详情、CRUD、参与）
- [ ] discoveryStore 完整（推荐用户、搜索、喜欢/跳过）
- [ ] 持久化存储（token、用户信息）
- [ ] 状态重置（logout 时）

---

#### Task 3.3: 实现登录注册页面

**时间**: 4 小时
**负责模块**: Auth Pages

**目标**：

- 实现 Login.vue 功能
- 实现 Register.vue 功能
- 表单验证
- 错误提示

**输出**：

- 完善 `frontend/src/components/pages/Login.vue`
- 完善 `frontend/src/components/pages/Register.vue`

**Login.vue 功能**：

```vue
<template>
  <div class="login-page">
    <form @submit.prevent="handleLogin">
      <input v-model="form.email" type="email" placeholder="邮箱" />
      <input v-model="form.password" type="password" placeholder="密码" />
      <button type="submit" :disabled="loading">
        {{ loading ? '登录中...' : '登录' }}
      </button>
    </form>
    <router-link to="/register">还没有账号？立即注册</router-link>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)

const form = ref({
  email: '',
  password: '',
})

const handleLogin = async () => {
  loading.value = true
  try {
    await userStore.login(form.value.email, form.value.password)
    router.push('/discover')
  } catch (error) {
    console.error('登录失败:', error)
    // TODO: 显示错误提示
  } finally {
    loading.value = false
  }
}
</script>
```

**检查清单**：

- [ ] 登录表单 UI
- [ ] 注册表单 UI
- [ ] 表单验证（邮箱格式、密码长度）
- [ ] Loading 状态
- [ ] 错误提示（Toast）
- [ ] 登录成功跳转
- [ ] 记住我功能（可选）
- [ ] 密码显示/隐藏切换

---

#### Task 3.4: 集成所有页面 API

**时间**: 6 小时
**负责模块**: All Pages

**目标**：

- Profile.vue API 集成
- EditProfile.vue API 集成
- MyHiking.vue API 集成
- Discover.vue API 集成
- ActivityDetail.vue API 集成

**Profile.vue 改造**：

```typescript
// 原代码（模拟数据）
const userProfile = ref({
  avatar: 'https://via.placeholder.com/112',
  nickname: '山间清风',
  // ...
})

// 改造后（真实API）
const userProfile = ref<UserProfile | null>(null)
const loading = ref(true)

const loadUserProfile = async () => {
  loading.value = true
  try {
    const res = await userAPI.getProfile()
    userProfile.value = res.data
  } catch (error) {
    console.error('加载用户资料失败:', error)
    // TODO: 显示错误提示
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadUserProfile()
})
```

**检查清单**：

- [ ] Profile.vue - 加载真实用户资料
- [ ] EditProfile.vue - 更新用户资料、上传头像
- [ ] MyHiking.vue - 加载我加入的/我发布的活动
- [ ] Discover.vue - 加载推荐用户、搜索用户
- [ ] ActivityDetail.vue - 加载活动详情、加入/退出活动
- [ ] PrivacySettings.vue - 加载/更新隐私设置
- [ ] 所有页面添加 Loading 状态
- [ ] 所有页面添加错误处理
- [ ] 所有页面添加空状态提示

---

#### Task 3.5: 实现图片上传组件

**时间**: 3 小时
**负责模块**: Upload Component

**目标**：

- 创建通用图片上传组件
- 支持头像上传
- 支持相册上传
- 支持活动封面上传

**输出**：

- `frontend/src/components/common/ImageUpload.vue`
- `frontend/src/components/common/AvatarUpload.vue`

**ImageUpload 组件**：

```vue
<template>
  <div class="image-upload">
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      @change="handleFileChange"
      style="display: none"
    />
    <div class="upload-trigger" @click="triggerUpload">
      <slot name="trigger">
        <button>上传图片</button>
      </slot>
    </div>
    <div v-if="uploading" class="upload-progress">上传中... {{ progress }}%</div>
    <div v-if="imageUrl" class="image-preview">
      <img :src="imageUrl" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { uploadAPI } from '@/api'

const props = defineProps<{
  modelValue?: string
  maxSize?: number // MB
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  success: [url: string]
  error: [error: Error]
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const uploading = ref(false)
const progress = ref(0)
const imageUrl = ref(props.modelValue || '')

const triggerUpload = () => {
  fileInput.value?.click()
}

const handleFileChange = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  // 验证文件大小
  const maxSize = (props.maxSize || 5) * 1024 * 1024
  if (file.size > maxSize) {
    emit('error', new Error('文件大小超过限制'))
    return
  }

  // 上传
  uploading.value = true
  try {
    const res = await uploadAPI.uploadImage(file, (p) => {
      progress.value = p
    })
    imageUrl.value = res.data.url
    emit('update:modelValue', res.data.url)
    emit('success', res.data.url)
  } catch (error) {
    emit('error', error as Error)
  } finally {
    uploading.value = false
  }
}
</script>
```

**检查清单**：

- [ ] 通用图片上传组件
- [ ] 头像上传组件（带裁剪）
- [ ] 文件大小验证
- [ ] 文件类型验证
- [ ] 上传进度显示
- [ ] 图片预览
- [ ] 错误提示
- [ ] 支持多图上传（相册）

---

### 阶段四：地图组件集成（优先级：P1）

#### Task 4.1: 集成地图 SDK

**时间**: 4 小时
**负责模块**: Map Component

**目标**：

- 选择地图 SDK（高德地图 or 百度地图）
- 集成地图组件
- 实现位置选择
- 实现路线展示

**输出**：

- `frontend/src/components/common/MapPicker.vue` - 位置选择器
- `frontend/src/components/common/MapView.vue` - 地图展示
- `frontend/src/utils/map.ts` - 地图工具函数

**MapPicker 组件**：

```vue
<template>
  <div class="map-picker">
    <div id="map-container" style="width: 100%; height: 400px;"></div>
    <div class="location-info">
      <p>{{ selectedLocation?.name }}</p>
      <p>经纬度: {{ selectedLocation?.lat }}, {{ selectedLocation?.lng }}</p>
    </div>
    <button @click="confirmLocation">确认位置</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AMapLoader from '@amap/amap-jsapi-loader'

const props = defineProps<{
  initialLocation?: { lat: number; lng: number }
}>()

const emit = defineEmits<{
  confirm: [location: { name: string; lat: number; lng: number }]
}>()

const selectedLocation = ref<{ name: string; lat: number; lng: number } | null>(null)
let map: any = null

onMounted(async () => {
  // 初始化地图
  AMapLoader.load({
    key: 'YOUR_AMAP_KEY',
    version: '2.0',
    plugins: ['AMap.Geocoder'],
  }).then((AMap) => {
    map = new AMap.Map('map-container', {
      zoom: 13,
      center: [props.initialLocation?.lng || 116.397428, props.initialLocation?.lat || 39.90923],
    })

    // 添加点击事件
    map.on('click', (e: any) => {
      const { lng, lat } = e.lnglat
      // 逆地理编码
      const geocoder = new AMap.Geocoder()
      geocoder.getAddress([lng, lat], (status: string, result: any) => {
        if (status === 'complete') {
          selectedLocation.value = {
            name: result.regeocode.formattedAddress,
            lat,
            lng,
          }
        }
      })
    })
  })
})

const confirmLocation = () => {
  if (selectedLocation.value) {
    emit('confirm', selectedLocation.value)
  }
}
</script>
```

**检查清单**：

- [ ] 选择地图 SDK（建议高德地图）
- [ ] 地图初始化
- [ ] 位置选择（点击地图）
- [ ] 位置搜索
- [ ] 逆地理编码（坐标转地址）
- [ ] 路线绘制
- [ ] 标记点显示
- [ ] 当前位置获取
- [ ] 移动端手势支持

---

#### Task 4.2: 活动创建页面集成地图

**时间**: 2 小时
**负责模块**: CreateActivity Page

**目标**：

- 在创建活动页面集成地图选择器
- 保存位置信息到数据库

**输出**：

- 完善 `frontend/src/components/pages/CreateActivity.vue`

**功能细节**：

```vue
<template>
  <div class="create-activity">
    <form @submit.prevent="handleSubmit">
      <input v-model="form.title" placeholder="活动标题" />
      <textarea v-model="form.description" placeholder="活动描述" />

      <!-- 地图选择器 -->
      <div class="location-selector">
        <label>活动地点</label>
        <div v-if="form.location" class="selected-location">
          <p>{{ form.location }}</p>
          <button @click="showMapPicker = true">重新选择</button>
        </div>
        <button v-else @click="showMapPicker = true">选择地点</button>
      </div>

      <button type="submit">创建活动</button>
    </form>

    <!-- 地图选择器弹窗 -->
    <MapPicker
      v-if="showMapPicker"
      @confirm="handleLocationConfirm"
      @close="showMapPicker = false"
    />
  </div>
</template>

<script setup lang="ts">
const form = ref({
  title: '',
  description: '',
  location: '',
  latitude: 0,
  longitude: 0,
  // ...
})

const handleLocationConfirm = (location: any) => {
  form.value.location = location.name
  form.value.latitude = location.lat
  form.value.longitude = location.lng
  showMapPicker.value = false
}

const handleSubmit = async () => {
  const res = await activityAPI.create(form.value)
  // ...
}
</script>
```

**检查清单**：

- [ ] 创建活动页面集成地图
- [ ] 编辑活动页面集成地图
- [ ] 活动详情页面展示地图
- [ ] 保存经纬度到数据库
- [ ] 展示活动位置标记

---

### 阶段五：Lynx 跨端打包配置（优先级：P2）

#### Task 5.1: 安装 Lynx 框架

**时间**: 2 小时
**负责模块**: Lynx Setup

**目标**：

- 安装 Lynx CLI
- 初始化 Lynx 项目配置
- 配置跨端打包

**输出**：

- `lynx.config.js` - Lynx 配置文件
- `frontend/src/main.lynx.ts` - Lynx 入口文件
- 更新 `package.json`

**步骤**：

```bash
# 1. 安装Lynx CLI
npm install -g @lynx/cli

# 2. 初始化Lynx配置
lynx init

# 3. 安装依赖
npm install @lynx/vue @lynx/runtime
```

**lynx.config.js**：

```javascript
module.exports = {
  platforms: ['web', 'ios', 'android'],
  web: {
    port: 5174,
    publicPath: '/',
  },
  ios: {
    bundleId: 'com.hiking.app',
    appName: '徒步社交',
  },
  android: {
    packageName: 'com.hiking.app',
    appName: '徒步社交',
  },
  build: {
    outputDir: 'dist',
  },
}
```

**检查清单**：

- [ ] Lynx CLI 安装
- [ ] Lynx 配置文件创建
- [ ] 跨端 API 适配
- [ ] 路由配置适配
- [ ] 状态管理适配

---

#### Task 5.2: 平台差异化处理

**时间**: 3 小时
**负责模块**: Platform Adapter

**目标**：

- 处理 Web/iOS/Android 平台差异
- 适配原生 API（相机、定位、文件选择）

**输出**：

- `frontend/src/utils/platform.ts` - 平台检测工具
- `frontend/src/adapters/camera.ts` - 相机适配器
- `frontend/src/adapters/location.ts` - 定位适配器
- `frontend/src/adapters/file.ts` - 文件选择适配器

**platform.ts**：

```typescript
export const platform = {
  isWeb: () => {
    return typeof window !== 'undefined'
  },

  isIOS: () => {
    return /iPhone|iPad|iPod/.test(navigator.userAgent)
  },

  isAndroid: () => {
    return /Android/.test(navigator.userAgent)
  },

  isNative: () => {
    return platform.isIOS() || platform.isAndroid()
  },
}

// 相机适配器
export const camera = {
  async takePicture(): Promise<string> {
    if (platform.isWeb()) {
      // Web: 使用input file
      return new Promise((resolve) => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'image/*'
        input.capture = 'camera'
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0]
          if (file) {
            const url = URL.createObjectURL(file)
            resolve(url)
          }
        }
        input.click()
      })
    } else {
      // Native: 使用Lynx Camera API
      const result = await Lynx.camera.takePicture()
      return result.uri
    }
  },
}
```

**检查清单**：

- [ ] 平台检测工具
- [ ] 相机 API 适配（Web input vs Native Camera）
- [ ] 定位 API 适配（Web Geolocation vs Native GPS）
- [ ] 文件选择适配（Web input vs Native FilePicker）
- [ ] 网络请求适配（统一 fetch/axios）
- [ ] 存储适配（Web localStorage vs Native Storage）

---

#### Task 5.3: 打包测试

**时间**: 2 小时
**负责模块**: Build & Test

**目标**：

- 打包 Web 版本
- 打包 iOS 版本（需 Mac + Xcode）
- 打包 Android 版本

**打包命令**：

```bash
# Web打包
npm run build:web

# iOS打包
npm run build:ios

# Android打包
npm run build:android
```

**检查清单**：

- [ ] Web 版本打包成功
- [ ] Web 版本功能正常
- [ ] iOS 版本打包成功（可选）
- [ ] iOS 版本功能正常（可选）
- [ ] Android 版本打包成功（可选）
- [ ] Android 版本功能正常（可选）

---

### 阶段六：测试与优化（优先级：P1）

#### Task 6.1: 功能测试

**时间**: 4 小时

**测试清单**：

- [ ] 登录注册流程
- [ ] 个人资料 CRUD
- [ ] 活动 CRUD
- [ ] 活动参与流程
- [ ] 图片上传
- [ ] 地图选择
- [ ] 发现用户
- [ ] 隐私设置

---

#### Task 6.2: 性能优化

**时间**: 3 小时

**优化项**：

- [ ] 图片懒加载
- [ ] 列表虚拟滚动
- [ ] 路由懒加载
- [ ] 代码分割
- [ ] 接口缓存
- [ ] Loading 骨架屏

---

## 📅 时间规划

| 阶段               | 任务数 | 预计时间      | 优先级 |
| ------------------ | ------ | ------------- | ------ |
| 阶段一：数据库准备 | 2      | 3.5 小时      | P0     |
| 阶段二：后端 API   | 6      | 19 小时       | P0     |
| 阶段三：前端集成   | 5      | 18 小时       | P0     |
| 阶段四：地图集成   | 2      | 6 小时        | P1     |
| 阶段五：Lynx 跨端  | 3      | 7 小时        | P2     |
| 阶段六：测试优化   | 2      | 7 小时        | P1     |
| **总计**           | **20** | **60.5 小时** | -      |

---

## 🎯 里程碑

### Milestone 1: 后端 API 完成（Day 1-3）

- ✅ 数据库初始化
- ✅ 测试数据准备
- ✅ 所有 API 接口实现
- ✅ 接口文档完善

### Milestone 2: 前端集成完成（Day 4-6）

- ✅ 登录注册功能
- ✅ 所有页面 API 集成
- ✅ 图片上传功能
- ✅ 状态管理完善

### Milestone 3: 地图功能完成（Day 7）

- ✅ 地图组件集成
- ✅ 位置选择功能
- ✅ 活动地图展示

### Milestone 4: 跨端打包完成（Day 8-9）

- ✅ Lynx 框架集成
- ✅ 平台适配完成
- ✅ 三端打包成功

### Milestone 5: 测试上线（Day 10）

- ✅ 功能测试完成
- ✅ 性能优化完成
- ✅ 部署上线

---

## 📝 执行建议

1. **优先级原则**：P0 > P1 > P2
2. **并行开发**：后端 API 和前端页面可并行开发
3. **增量交付**：每完成一个模块立即测试
4. **文档同步**：边开发边更新文档
5. **代码审查**：关键代码需要审查

---

## 🚨 风险预警

1. **地图 SDK 选择**：需要评估高德/百度地图的跨端支持
2. **Lynx 框架学习曲线**：需要额外学习时间
3. **iOS 打包**：需要 Mac 设备和 Apple Developer 账号
4. **图片存储**：本地存储后期需迁移 OSS
5. **性能问题**：大量图片可能影响加载速度

---

**创建时间**: 2026-01-14
**预计完成时间**: 2026-01-24（10 个工作日）
**状态**: 待执行
