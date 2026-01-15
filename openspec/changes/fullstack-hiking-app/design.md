# Technical Design: 徒步社交 App 全栈架构

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      User Devices                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Web App    │  │  Mobile App  │  │  Tablet App  │      │
│  │(Vue 3 + SPA) │  │(Vue + Lynx)  │  │ (Vue + Lynx) │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │ HTTP/HTTPS  │
                    │   REST API  │
                    └──────┬──────┘
                           │
┌─────────────────────────────────────────────────────────────┐
│                    Backend Services                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Node.js + Express Server                            │  │
│  │  ┌────────────────────────────────────────────────┐ │  │
│  │  │ Routes & Controllers                           │ │  │
│  │  │ ├── Auth (注册、登录、Token管理)              │ │  │
│  │  │ ├── Users (资料、头像、偏好)                  │ │  │
│  │  │ ├── Activities (创建、列表、详情)            │ │  │
│  │  │ ├── Participations (报名、取消)              │ │  │
│  │  │ └── Discovery (搜索、筛选)                   │ │  │
│  │  └────────────────────────────────────────────────┘ │  │
│  │  ┌────────────────────────────────────────────────┐ │  │
│  │  │ Middleware                                     │ │  │
│  │  │ ├── Authentication (JWT验证)                  │ │  │
│  │  │ ├── Authorization (权限检查)                  │ │  │
│  │  │ ├── Logging (日志记录)                       │ │  │
│  │  │ ├── Error Handling (错误处理)                │ │  │
│  │  │ └── Rate Limiting (限流)                     │ │  │
│  │  └────────────────────────────────────────────────┘ │  │
│  │  ┌────────────────────────────────────────────────┐ │  │
│  │  │ Services & Business Logic                      │ │  │
│  │  │ ├── UserService (用户管理业务逻辑)           │ │  │
│  │  │ ├── ActivityService (活动管理业务逻辑)        │ │  │
│  │  │ ├── MatchingService (推荐匹配算法)            │ │  │
│  │  │ ├── FileService (文件上传处理)               │ │  │
│  │  │ └── EmailService (邮件通知)                  │ │  │
│  │  └────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────┘  │
│           │                  │                               │
│     ┌─────▼─────┐      ┌─────▼──────┐                      │
│     │   MySQL   │      │ File Store  │                      │
│     │  Database │      │  (Local/CDN)│                      │
│     └───────────┘      └─────────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Tech Stack

- **Framework**: Vue 3 (Composition API)
- **Cross-platform**: Lynx (Lightweight Web-like Runtime)
- **State Management**: Pinia
- **Routing**: Vue Router 4
- **HTTP Client**: Axios
- **UI Components**: Custom Components + Tailwind CSS
- **Build Tool**: Vite

### Directory Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── TabBar.vue              # 底部导航栏
│   │   │   ├── TopBar.vue              # 顶部导航栏
│   │   │   ├── ActivityCard.vue        # 活动卡片组件
│   │   │   ├── UserCard.vue            # 用户卡片组件
│   │   │   └── Filter.vue              # 筛选组件
│   │   └── pages/
│   │       ├── Home.vue                # 首页
│   │       ├── Discover.vue            # 发现页
│   │       ├── MyHiking.vue            # 我的徒步
│   │       ├── Profile.vue             # 我的（个人资料）
│   │       ├── Messages.vue            # 消息页
│   │       ├── ActivityDetail.vue      # 活动详情
│   │       ├── CreateActivity.vue      # 创建活动
│   │       ├── EditProfile.vue         # 编辑资料
│   │       ├── Login.vue               # 登录
│   │       └── Register.vue            # 注册
│   ├── stores/
│   │   ├── user.ts                     # 用户状态管理
│   │   ├── activities.ts               # 活动状态管理
│   │   ├── discovery.ts                # 发现页状态
│   │   └── auth.ts                     # 认证状态
│   ├── api/
│   │   ├── auth.ts                     # 认证接口
│   │   ├── users.ts                    # 用户接口
│   │   ├── activities.ts               # 活动接口
│   │   ├── discovery.ts                # 发现接口
│   │   └── http.ts                     # Axios 实例配置
│   ├── router/
│   │   └── index.ts                    # 路由配置
│   ├── utils/
│   │   ├── request.ts                  # 请求工具函数
│   │   ├── storage.ts                  # 本地存储
│   │   ├── date.ts                     # 日期处理
│   │   └── validators.ts               # 数据验证
│   ├── styles/
│   │   ├── tailwind.css               # Tailwind CSS 配置
│   │   ├── variables.css              # CSS变量（主色调等）
│   │   └── global.css                 # 全局样式
│   ├── App.vue                         # 根组件
│   └── main.ts                         # 入口文件
├── public/
│   └── assets/
│       ├── images/
│       └── icons/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

### State Management (Pinia)

```typescript
// stores/user.ts
export const useUserStore = defineStore("user", {
  state: () => ({
    currentUser: null,
    token: localStorage.getItem("token"),
    preferences: {},
    photos: [],
    loading: false,
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
    userLevel: (state) => state.currentUser?.level || "beginner",
  },
  actions: {
    async login(email: string, password: string) {},
    async register(data: RegisterForm) {},
    async updateProfile(data: ProfileUpdate) {},
    async logout() {},
  },
});

// stores/activities.ts
export const useActivityStore = defineStore("activities", {
  state: () => ({
    joinedActivities: [],
    publishedActivities: [],
    activityDetail: null,
    loading: false,
  }),
  actions: {
    async fetchJoinedActivities() {},
    async fetchPublishedActivities() {},
    async createActivity(data: ActivityForm) {},
    async updateActivity(id: string, data: ActivityForm) {},
    async deleteActivity(id: string) {},
    async joinActivity(id: string) {},
    async leaveActivity(id: string) {},
  },
});
```

## Backend Architecture

### Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express 4.x
- **Database**: MySQL 8.0+
- **ORM**: Sequelize (or TypeORM)
- **Authentication**: JWT + Bcrypt
- **Validation**: Joi
- **Logging**: Winston
- **Testing**: Jest + Supertest

### Directory Structure

```
backend/
├── src/
│   ├── controllers/
│   │   ├── authController.ts           # 认证控制器
│   │   ├── userController.ts           # 用户管理
│   │   ├── activityController.ts       # 活动管理
│   │   ├── participationController.ts  # 参与管理
│   │   ├── discoveryController.ts      # 发现功能
│   │   └── fileController.ts           # 文件上传
│   ├── services/
│   │   ├── authService.ts              # 认证逻辑
│   │   ├── userService.ts              # 用户业务逻辑
│   │   ├── activityService.ts          # 活动业务逻辑
│   │   ├── matchingService.ts          # 推荐算法
│   │   ├── emailService.ts             # 邮件服务
│   │   └── fileService.ts              # 文件处理
│   ├── models/
│   │   ├── User.ts                     # 用户模型
│   │   ├── Activity.ts                 # 活动模型
│   │   ├── Participation.ts            # 参与关系模型
│   │   ├── UserPreference.ts           # 用户偏好
│   │   └── UserPhoto.ts                # 用户相片
│   ├── routes/
│   │   ├── authRoutes.ts               # 认证路由
│   │   ├── userRoutes.ts               # 用户路由
│   │   ├── activityRoutes.ts           # 活动路由
│   │   ├── participationRoutes.ts      # 参与路由
│   │   ├── discoveryRoutes.ts          # 发现路由
│   │   └── index.ts                    # 路由聚合
│   ├── middleware/
│   │   ├── authMiddleware.ts           # JWT验证
│   │   ├── errorHandler.ts             # 错误处理
│   │   ├── logger.ts                   # 日志记录
│   │   ├── validation.ts               # 数据验证
│   │   └── requestLogger.ts            # 请求日志
│   ├── config/
│   │   ├── database.ts                 # 数据库配置
│   │   ├── jwt.ts                      # JWT配置
│   │   ├── server.ts                   # 服务器配置
│   │   └── constants.ts                # 常量定义
│   ├── utils/
│   │   ├── logger.ts                   # 日志工具
│   │   ├── validators.ts               # 验证工具
│   │   ├── crypto.ts                   # 加密工具
│   │   ├── file.ts                     # 文件工具
│   │   └── response.ts                 # 统一响应格式
│   ├── types/
│   │   ├── index.ts                    # TypeScript类型定义
│   │   └── errors.ts                   # 自定义错误类
│   ├── database/
│   │   ├── migrations/                 # 数据库迁移文件
│   │   ├── seeders/                    # 数据库种子文件
│   │   └── init.sql                    # 初始化脚本
│   ├── app.ts                          # Express应用配置
│   └── server.ts                       # 服务器入口
├── tests/
│   ├── auth.test.ts
│   ├── users.test.ts
│   ├── activities.test.ts
│   └── discovery.test.ts
├── .env.example
├── .env.test
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

## Database Schema

### 核心表设计

#### 1. users 表（用户表）

```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nickname VARCHAR(100) NOT NULL,
  avatar_url VARCHAR(500),
  gender ENUM('male', 'female', 'other'),
  age INT,
  bio TEXT,
  hiking_level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  INDEX idx_email (email),
  INDEX idx_created_at (created_at)
);
```

#### 2. user_preferences 表（用户偏好）

```sql
CREATE TABLE user_preferences (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  preference_type ENUM('time', 'type', 'special', 'distance', 'interest'),
  preference_value VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE KEY unique_preference (user_id, preference_type, preference_value)
);
```

#### 3. user_photos 表（生活相册）

```sql
CREATE TABLE user_photos (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  photo_url VARCHAR(500) NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_id (user_id)
);
```

#### 4. activities 表（活动表）

```sql
CREATE TABLE activities (
  id VARCHAR(36) PRIMARY KEY,
  creator_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  cover_image_url VARCHAR(500),
  location VARCHAR(255) NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  start_time DATETIME NOT NULL,
  end_time DATETIME,
  difficulty ENUM('easy', 'moderate', 'hard') DEFAULT 'easy',
  max_participants INT,
  status ENUM('pending', 'approved', 'ongoing', 'completed', 'cancelled') DEFAULT 'pending',
  route_description TEXT,
  equipment_required TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY (creator_id) REFERENCES users(id),
  INDEX idx_status (status),
  INDEX idx_start_time (start_time),
  INDEX idx_creator_id (creator_id)
);
```

#### 5. participations 表（参与关系）

```sql
CREATE TABLE participations (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  activity_id VARCHAR(36) NOT NULL,
  status ENUM('joined', 'completed', 'cancelled') DEFAULT 'joined',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  cancelled_at TIMESTAMP NULL,
  feedback TEXT,
  rating INT,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (activity_id) REFERENCES activities(id),
  UNIQUE KEY unique_participation (user_id, activity_id),
  INDEX idx_user_id (user_id),
  INDEX idx_activity_id (activity_id)
);
```

## API Design

### 认证相关 API

```
POST   /api/v1/auth/register          # 用户注册
POST   /api/v1/auth/login             # 用户登录
POST   /api/v1/auth/logout            # 用户登出
POST   /api/v1/auth/refresh-token     # 刷新Token
POST   /api/v1/auth/password-reset    # 重置密码
```

### 用户相关 API

```
GET    /api/v1/users/me               # 获取当前用户信息
PUT    /api/v1/users/me               # 更新用户信息
POST   /api/v1/users/avatar           # 上传头像
GET    /api/v1/users/:id              # 获取用户详情
PUT    /api/v1/users/preferences      # 更新用户偏好
GET    /api/v1/users/me/photos        # 获取用户相册
POST   /api/v1/users/me/photos        # 上传相册照片
DELETE /api/v1/users/me/photos/:id    # 删除相册照片
```

### 活动相关 API

```
GET    /api/v1/activities             # 获取活动列表
GET    /api/v1/activities/:id         # 获取活动详情
POST   /api/v1/activities             # 创建活动
PUT    /api/v1/activities/:id         # 编辑活动
DELETE /api/v1/activities/:id         # 删除活动
GET    /api/v1/activities/me/joined   # 获取我加入的活动
GET    /api/v1/activities/me/created  # 获取我发布的活动
POST   /api/v1/activities/:id/join    # 参加活动
POST   /api/v1/activities/:id/leave   # 退出活动
```

### 发现相关 API

```
GET    /api/v1/discovery/users        # 搜索用户
GET    /api/v1/discovery/users/filter # 筛选用户
```

## Security Design

1. **认证**: JWT Token (过期时间: 24 小时)
2. **授权**: 基于角色的访问控制 (RBAC)
3. **密码**: Bcrypt 加密存储
4. **HTTPS**: 所有 API 端点必须使用 HTTPS
5. **CORS**: 严格配置 CORS 策略
6. **SQL 注入**: 使用参数化查询 (ORM)
7. **XSS 防护**: 输入验证和输出转义
8. **Rate Limiting**: API 请求限流

## Performance Optimization

### Frontend

- Vue 3 Composition API 优化
- 图片懒加载
- 路由懒加载
- 状态管理优化

### Backend

- 数据库索引优化
- 查询优化（N+1 问题）
- 缓存策略（Redis）
- 分页处理

### Database

- 合理的索引设计
- 字段类型优化
- 分区策略（大表）
- 定期维护和清理

## Deployment Architecture

### Development

```
Local Dev Machine
├── Frontend: npm run dev (Port 5173)
└── Backend: npm run dev (Port 3000)
```

### Staging

```
Cloud Server
├── Frontend: Docker + Nginx (Port 80/443)
├── Backend: Docker + Node.js (Port 3000)
└── Database: MySQL (Port 3306)
```

### Production

```
Production Environment
├── Frontend: CDN + Nginx (Port 80/443)
├── Backend: Load Balanced (Multiple instances)
├── Database: MySQL Cluster / RDS
└── Storage: S3 / Cloud Storage
```
