# 项目上下文 - 徒步社交 App

## 项目目的

开发一款**徒步社交应用**，帮助 20-40 岁城市人群发现徒步活动、结识志同道合的伙伴。核心功能包括：

- 徒步活动管理（创建、发现、参加）
- 用户社交发现（搜索、筛选、推荐）
- 个人资料管理（头像、偏好、相册）
- 用户认证和授权系统

## 技术栈

### 前端

- **框架**: Vue 3 (Composition API)
- **跨端**: Lynx (轻量级 Web 运行时)
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **HTTP**: Axios
- **构建**: Vite
- **样式**: Tailwind CSS
- **构建目标**: iOS 13+, Android 8+, Web 浏览器

### 后端

- **运行环境**: Node.js 18+
- **框架**: Express.js 4.x
- **数据库**: MySQL 8.0+
- **ORM**: Sequelize / TypeORM
- **认证**: JWT (JSON Web Token)
- **加密**: Bcrypt (密码), bcryptjs (可选)
- **验证**: Joi / Express-validator
- **日志**: Winston
- **测试**: Jest + Supertest

### DevOps & Tools

- **容器化**: Docker + Docker Compose
- **版本控制**: Git (Git Flow)
- **API 文档**: Swagger/OpenAPI
- **测试工具**: Postman, Jest
- **代码质量**: ESLint, Prettier

## 项目规范

### 代码风格

#### JavaScript/TypeScript 规范

- 使用 ESLint + Prettier 自动格式化
- 缩进: 2 spaces
- 分号: 自动添加
- 引号: 双引号
- 命名:
  - `camelCase`: 变量、函数、方法
  - `PascalCase`: 类、组件、接口
  - `UPPER_SNAKE_CASE`: 常量
  - `kebab-case`: 文件名和文件夹

#### 前端编码规范

- Vue 3 Composition API 优先
- 使用 `<script setup>` 简化组件
- Props 使用 TypeScript 类型
- 响应式数据使用 `ref/reactive`
- 模板绑定事件使用 `@` 简写
- CSS 使用 Tailwind 原子类
- 组件按功能分类（common, pages, layouts）
- 每个文件单一职责

#### 后端编码规范

- 使用 TypeScript 提高类型安全
- 模型使用 PascalCase (User, Activity)
- 函数和变量使用 camelCase
- 异步操作使用 async/await
- 错误通过 try-catch 或 Promise catch 处理
- 日志使用 Winston，分级 (error, warn, info, debug)
- API 响应使用统一格式

### 架构模式

#### 前端架构

```
├── views (页面)
├── components (可复用组件)
├── stores (Pinia 状态管理)
├── api (API 调用层)
├── utils (工具函数)
├── types (TypeScript 类型)
└── styles (全局样式)
```

#### 后端架构

```
├── controllers (HTTP 请求处理)
├── services (业务逻辑)
├── models (数据模型)
├── routes (API 路由)
├── middleware (中间件)
├── utils (工具函数)
├── config (配置文件)
└── database (数据库相关)
```

#### 数据库设计原则

- 使用规范化设计 (3NF)
- 合理设置外键关系
- 关键字段建立索引
- 软删除使用 `deleted_at` 字段
- 版本控制字段 `created_at`, `updated_at`

### 测试策略

#### 后端测试

- **单元测试**: 测试业务逻辑层 (services)，目标覆盖率 > 50%
- **集成测试**: 测试 API 端点 (controllers)，使用 Supertest
- **数据库测试**: 测试数据操作逻辑
- 测试框架: Jest
- 测试数据库: SQLite 或独立 MySQL 实例

#### 前端测试

- **单元测试**: 测试组件和工具函数，目标覆盖率 > 40%
- **集成测试**: 测试页面流程
- 测试框架: Jest + Vue Test Utils
- Mock API 使用 MSW (Mock Service Worker)

#### 测试命令

```bash
# 后端
npm run test              # 运行所有测试
npm run test:watch       # 监听模式
npm run test:coverage    # 覆盖率报告

# 前端
npm run test             # 运行所有测试
npm run test:watch      # 监听模式
```

### Git 工作流

#### 分支策略 (Git Flow)

- **main**: 生产分支，只能通过 Release PR merge
- **develop**: 开发主分支，各功能汇聚处
- **feature/\***: 功能分支 (feature/auth, feature/user-profile)
- **bugfix/\***: Bug 修复分支
- **release/\***: 发布分支 (release/v1.0.0)

#### Commit 规范 (Conventional Commits)

```
<type>(<scope>): <subject>

<body>

<footer>
```

**type**: feat, fix, refactor, style, test, docs, chore
**scope**: auth, user, activity, discovery, api, db
**subject**: 不超过 50 个字符，使用祈使句，首字母大写

例子:

```
feat(auth): implement JWT token validation
fix(activity): correct status transition logic
refactor(api): simplify error handling middleware
```

#### Pull Request 流程

1. 从 develop 创建 feature 分支
2. 定期 commit，写清晰的 message
3. 完成后创建 PR，说明改动内容
4. 至少一人代码审查后 merge
5. 删除 feature 分支

### 测试命令

```bash
# 后端
npm run test              # 所有测试
npm run test:watch       # 监听模式
npm run test:coverage    # 覆盖率
npm run test:e2e         # 端到端测试

# 前端
npm run test             # 所有测试
npm run test:watch      # 监听模式
npm run test:coverage   # 覆盖率
```

## 业务领域知识

### 徒步应用特点

- **活动状态**: 待审核 → 即将开始 → 进行中 → 已完成
- **用户等级**: 新手 (beginner) / 中级 (intermediate) / 资深 (advanced)
- **难度等级**: 简易 (easy) / 中等 (moderate) / 困难 (hard)
- **用户偏好**: 出行时间、徒步类型、特殊需求、距离、兴趣点
- **社交属性**: 通过共同的活动偏好进行推荐和匹配

### 核心业务流程

```
注册登录 → 完善资料 → 浏览/发现 → 参加活动 → 社交互动
```

## 重要约束

### 功能约束

- 活动最大参与人数: 由创建者指定，可为 null (无限制)
- 用户相册: 最多 9 张照片
- 关于我: 最多 200 字
- 密码最小长度: 8 字符，需包含大小字母和数字

### 性能约束

- 首页加载时间: < 3 秒
- API 平均响应: < 500ms
- 数据库查询: < 200ms
- 页面滚动帧率: ≥ 60fps

### 安全约束

- 所有 API 必须使用 HTTPS
- JWT Token 过期时间: 24 小时
- 密码使用 Bcrypt 加密，强度 ≥ 10
- 用户数据隔离和访问控制
- 实现 CSRF、XSS、SQL 注入 防护
- API 限流: 每分钟最多 100 请求 (可配置)

### 兼容性约束

- 前端: iOS 13+, Android 8+, Chrome 90+, Safari 14+, Firefox 88+
- 后端: Node.js 18+
- 数据库: MySQL 8.0+

## 外部依赖

### 前端依赖

```json
{
  "vue": "^3.4.0",
  "vue-router": "^4.2.0",
  "pinia": "^2.1.0",
  "axios": "^1.6.0",
  "tailwindcss": "^3.4.0"
}
```

### 后端依赖

```json
{
  "express": "^4.18.0",
  "sequelize": "^6.35.0",
  "mysql2": "^3.6.0",
  "jsonwebtoken": "^9.1.0",
  "bcryptjs": "^2.4.3",
  "joi": "^17.11.0",
  "winston": "^3.11.0"
}
```

### 可选外部服务

- 文件存储: OSS (阿里云) / S3 (AWS) / CDN
- 邮件服务: SendGrid / SMTP
- 地图服务: 高德地图 / 百度地图 API

## 开发环境

### 需要安装

- Node.js 18+
- npm 9+ 或 yarn
- MySQL 8.0+
- Git
- VSCode (推荐)

### 推荐 VSCode 扩展

- Vue - Official (官方 Vue 扩展)
- ES7+ React/Redux/React-Native snippets
- Thunder Client (API 测试)
- MySQL (数据库浏览)
- Prettier - Code formatter
- ESLint

### 本地开发启动

```bash
# 启动 MySQL (如果本地安装)
# macOS
brew services start mysql

# Windows
net start MySQL80

# 后端启动 (终端1)
cd backend
npm install
npm run dev              # 启动在 localhost:3000

# 前端启动 (终端2)
cd frontend
npm install
npm run dev              # 启动在 localhost:5173
```

## 开发清单

### 项目初始化检查

- [ ] 克隆项目并安装依赖
- [ ] 复制 .env.example 为 .env
- [ ] 配置数据库连接
- [ ] 运行数据库迁移
- [ ] 启动后端和前端服务
- [ ] 验证 API 文档可访问

### 日常开发检查

- [ ] 从 develop 创建 feature 分支
- [ ] 定期 commit，保持代码清洁
- [ ] 编写单元测试
- [ ] 运行 ESLint 和 Prettier
- [ ] 提交 PR 前自测
- [ ] 至少一人审查后 merge

### 发布前检查

- [ ] 所有测试通过
- [ ] 代码审查完成
- [ ] 文档已更新
- [ ] 性能指标达标
- [ ] 安全扫描无警告
- [ ] 部署脚本已验证
