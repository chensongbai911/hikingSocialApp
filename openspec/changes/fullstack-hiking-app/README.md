# 徒步社交 App 全栈开发 - 快速开始指南

## 📋 项目概览

本项目是一个完整的全栈徒步社交应用，包含：

- ✅ **前端**: Vue 3 + Lynx + Pinia（跨端支持）
- ✅ **后端**: Node.js + Express + MySQL（RESTful API）
- ✅ **设计参考**: PRD 文档 + 设计图完整
- ✅ **规范文档**: OpenSpec 变更管理系统

## 📁 文件结构

```
openspec/changes/fullstack-hiking-app/
├── proposal.md          # 变更提案（项目概览、目标、验收标准）
├── design.md            # 技术设计（架构、数据库、API设计）
├── tasks.md             # 实现任务清单（分阶段、4个阶段、70+个任务）
├── spec.md              # 需求规范（ADDED Requirements + Scenarios）
├── DEVELOPMENT.md       # 开发指南（规范、流程、命令）
└── README.md            # 本文件
```

## 🎯 项目特点

### 产品特性

- 🥾 **徒步活动管理**: 创建、编辑、参加、管理活动
- 👥 **用户发现**: 搜索和筛选潜在的徒步伙伴
- 👤 **个人资料**: 头像、偏好标签、生活相册
- 🔐 **用户认证**: 注册、登录、Token 管理
- 🎛️ **多维度筛选**: 性别、年龄、等级、偏好

### 技术亮点

- 🚀 **现代前端框架**: Vue 3 Composition API
- 📱 **跨端支持**: Lynx 轻量级运行时
- 🔄 **全局状态管理**: Pinia 简洁高效
- 🛡️ **安全认证**: JWT Token + Bcrypt
- 📊 **完整数据库**: MySQL 设计完善
- 🎨 **UI/UX**: Tailwind CSS + 响应式设计
- 📝 **完整文档**: API 文档、架构文档、开发指南

## 🏗️ 核心数据结构

### 用户表 (users)

```sql
id, email (unique), password_hash, nickname, avatar_url,
gender, age, bio, hiking_level, is_active, is_verified,
created_at, updated_at, deleted_at
```

### 活动表 (activities)

```sql
id, creator_id, title, description, cover_image_url,
location, latitude, longitude, start_time, end_time,
difficulty, max_participants, status, route_description,
equipment_required, created_at, updated_at, deleted_at
```

### 参与表 (participations)

```sql
id, user_id, activity_id, status, joined_at,
completed_at, cancelled_at, feedback, rating
```

### 用户偏好表 (user_preferences)

```sql
id, user_id, preference_type, preference_value, created_at
```

### 用户相册表 (user_photos)

```sql
id, user_id, photo_url, sort_order, created_at
```

## 🔌 核心 API 端点

### 认证 (Auth)

```
POST   /api/v1/auth/register          # 用户注册
POST   /api/v1/auth/login             # 用户登录
POST   /api/v1/auth/logout            # 用户登出
POST   /api/v1/auth/refresh-token     # 刷新Token
```

### 用户 (Users)

```
GET    /api/v1/users/me               # 获取当前用户
PUT    /api/v1/users/me               # 更新用户信息
POST   /api/v1/users/avatar           # 上传头像
GET    /api/v1/users/me/photos        # 获取相册
POST   /api/v1/users/me/photos        # 上传相册
DELETE /api/v1/users/me/photos/:id    # 删除相册
PUT    /api/v1/users/preferences      # 更新偏好
```

### 活动 (Activities)

```
GET    /api/v1/activities             # 活动列表
POST   /api/v1/activities             # 创建活动
GET    /api/v1/activities/:id         # 活动详情
PUT    /api/v1/activities/:id         # 编辑活动
DELETE /api/v1/activities/:id         # 删除活动
GET    /api/v1/activities/me/joined   # 我加入的
GET    /api/v1/activities/me/created  # 我发布的
POST   /api/v1/activities/:id/join    # 参加活动
POST   /api/v1/activities/:id/leave   # 退出活动
```

### 发现 (Discovery)

```
GET    /api/v1/discovery/users        # 搜索用户
GET    /api/v1/discovery/users/filter # 筛选用户
```

## 🎬 4 阶段开发计划

### Phase 1: 项目初始化 (Day 1-2) ⚙️

- [ ] 前端项目初始化 (Vue 3 + Vite + Pinia)
- [ ] 后端项目初始化 (Node.js + Express)
- [ ] 数据库设计和初始化
- [ ] 项目文档编写

### Phase 2: 后端开发 (Day 3-4) 🔧

- [ ] 认证系统 (注册、登录、Token)
- [ ] 用户管理 (CRUD、头像、相册、偏好)
- [ ] 活动管理 (CRUD、状态流转、参与)
- [ ] 发现功能 (搜索、筛选、推荐)
- [ ] 错误处理和日志

### Phase 3: 前端开发 (Day 5-6) 🎨

- [ ] 基础组件 (TabBar, Cards, Filter)
- [ ] 认证页面 (Login, Register)
- [ ] 个人资料页面 (Profile, EditProfile)
- [ ] 我的徒步页面 (MyHiking)
- [ ] 发现页面 (Discover, Filter)
- [ ] 活动管理页面 (ActivityDetail, CreateActivity)

### Phase 4: 集成测试与优化 (Day 7) ✅

- [ ] 前端测试 (单元测试、集成测试)
- [ ] 后端测试 (API 测试、端到端)
- [ ] 性能优化 (图片懒加载、缓存)
- [ ] 安全检查 (XSS、SQL 注入、认证)
- [ ] 文档完善和部署

## 📋 完整任务清单

### 关键里程碑

- [ ] 所有数据表创建成功
- [ ] 所有后端 API 开发完成
- [ ] 所有前端页面开发完成
- [ ] 单元测试覆盖率 > 50%
- [ ] API 集成测试通过
- [ ] 性能指标达标
- [ ] 文档完整
- [ ] 可成功部署

## 🚀 快速启动

### 前置要求

```bash
Node.js 18+
npm 9+
MySQL 8.0+
```

### 安装步骤

#### 1. 初始化后端

```bash
cd backend
npm install
cp .env.example .env
# 编辑 .env 配置数据库
npm run migrate
npm run seed
npm run dev
```

#### 2. 初始化前端 (新终端)

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

#### 3. 访问应用

- 前端: http://localhost:5173
- 后端 API: http://localhost:3000
- API 文档: http://localhost:3000/api-docs (Swagger)

## 📚 文档导读

| 文档               | 用途           | 查看时机           |
| ------------------ | -------------- | ------------------ |
| **proposal.md**    | 项目概览和目标 | 项目开始、需求评审 |
| **design.md**      | 技术架构和设计 | 技术讨论、架构设计 |
| **tasks.md**       | 实现任务清单   | 开发开始、任务跟踪 |
| **spec.md**        | 详细需求规范   | 功能开发、测试     |
| **DEVELOPMENT.md** | 开发指南和规范 | 日常开发、代码审查 |

## 🔑 核心要求

### 必须完成

1. ✅ 用户认证系统 (注册、登录)
2. ✅ 个人资料管理 (基本信息、头像、相册、偏好)
3. ✅ 活动管理 (创建、编辑、查看、参加)
4. ✅ 用户发现 (搜索、筛选)
5. ✅ 完整的前端页面
6. ✅ RESTful API (所有功能)
7. ✅ 数据库持久化
8. ✅ 基本的错误处理

### 应该完成

- 📝 API 文档 (Swagger)
- 🧪 单元测试 (后端 >50%, 前端 >40%)
- 🔒 安全防护 (密码加密、HTTPS、CORS)
- 📊 性能优化 (懒加载、缓存)
- 📚 完整文档

### 可以扩展

- 🤖 推荐算法优化
- 💬 消息和通知系统
- 📱 真实 Lynx 跨端编译
- 🗺️ 高级地图功能
- 🎖️ 成就和等级系统

## 🛠️ 常用命令速查

### 后端

```bash
npm run dev              # 开发模式
npm run test             # 运行测试
npm run build            # 构建生产版本
npm run lint             # 代码检查
npm run migrate          # 数据库迁移
npm run seed             # 填充初始数据
```

### 前端

```bash
npm run dev              # 开发服务器
npm run build            # 生产构建
npm run preview          # 预览生产版本
npm run test             # 运行测试
npm run lint             # 代码检查
```

## 💡 技术亮点总结

| 方面     | 技术选择     | 优势                     |
| -------- | ------------ | ------------------------ |
| 前端框架 | Vue 3        | 响应式、简洁、性能好     |
| 跨端支持 | Lynx         | 轻量、Web 兼容、快速开发 |
| 状态管理 | Pinia        | 简洁、类型安全、易维护   |
| 后端框架 | Express      | 灵活、轻量、社区大       |
| 数据库   | MySQL        | 关系清晰、事务支持、可靠 |
| 认证     | JWT          | 无状态、安全、可扩展     |
| 样式框架 | Tailwind CSS | 快速开发、响应式、可定制 |

## 📞 问题反馈

遇到问题？

1. 📖 查看 `DEVELOPMENT.md` 的 "问题排查" 章节
2. 🔍 检查 API 文档是否有说明
3. 🐛 在 GitHub Issues 中提出
4. 💬 与团队讨论或请教

## ✨ 成功标准

项目成功标志：

- ✅ 所有核心功能实现完成
- ✅ 前后端成功联动
- ✅ 数据持久化正常
- ✅ 页面加载快速流畅
- ✅ 错误提示清晰友好
- ✅ 代码规范且有注释
- ✅ 文档完整准确
- ✅ 可以安全部署上线

---

**开发开始前，请先阅读:**

1. `proposal.md` - 了解项目目标
2. `DEVELOPMENT.md` - 了解开发规范
3. `tasks.md` - 了解任务清单

祝开发顺利！🎉
