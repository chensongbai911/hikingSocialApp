# 项目上下文与开发指南

## 项目概述

**项目名**: 徒步社交 App
**类型**: 全栈应用 (前端 + 后端 + 数据库)
**版本**: 1.0.0
**开始日期**: 2026-01-14

## 技术栈

### 前端

- **框架**: Vue 3 (Composition API)
- **跨端支持**: Lynx (轻量级运行时)
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **HTTP 客户端**: Axios
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **包管理**: npm

### 后端

- **运行环境**: Node.js 18+
- **框架**: Express.js 4.x
- **数据库**: MySQL 8.0+
- **ORM**: Sequelize (可选 TypeORM)
- **认证**: JWT (JSON Web Token)
- **加密**: Bcrypt
- **验证**: Joi
- **日志**: Winston
- **测试**: Jest + Supertest
- **包管理**: npm

### DevOps

- **容器化**: Docker + Docker Compose
- **版本控制**: Git
- **文档**: OpenAPI/Swagger
- **测试工具**: Postman

## 项目结构

```
徒步社交App/
├── frontend/                 # Vue 3 + Lynx 前端应用
│   ├── src/
│   ├── public/
│   ├── vite.config.ts
│   ├── package.json
│   └── README.md
├── backend/                  # Node.js + Express 后端API
│   ├── src/
│   ├── tests/
│   ├── .env.example
│   ├── package.json
│   └── README.md
├── database/                 # 数据库初始化和迁移
│   ├── init.sql
│   ├── migrations/
│   └── seeders/
├── docs/                     # 项目文档
│   ├── API.md               # API 文档
│   ├── ARCHITECTURE.md      # 架构文档
│   ├── SETUP.md             # 开发环境搭建
│   └── DEPLOYMENT.md        # 部署指南
├── docker-compose.yml        # Docker Compose 配置
└── openspec/                # OpenSpec 变更管理
    └── changes/
        └── fullstack-hiking-app/
            ├── proposal.md
            ├── design.md
            ├── tasks.md
            └── spec.md
```

## 开发规范

### 代码风格

#### JavaScript/TypeScript

- 使用 ESLint 进行代码检查
- 使用 Prettier 进行代码格式化
- 命名规范:
  - 变量和函数: `camelCase`
  - 类和接口: `PascalCase`
  - 常量: `UPPER_SNAKE_CASE`
  - 文件名: `kebab-case` (组件除外，使用 `PascalCase`)

#### 前端文件命名

```
components/
  ├── common/
  │   ├── TabBar.vue         # Vue 组件使用 PascalCase
  │   └── ActivityCard.vue
  ├── pages/
  │   ├── Home.vue
  │   └── Discover.vue

stores/
  ├── user.ts                 # Pinia store 使用小写
  └── activities.ts

api/
  ├── auth.ts                 # API 模块使用小写
  └── users.ts
```

#### 后端文件命名

```
src/
  ├── controllers/
  │   ├── authController.ts   # 控制器使用 camelCase
  │   └── userController.ts
  ├── services/
  │   └── userService.ts
  ├── models/
  │   ├── User.ts             # 模型使用 PascalCase
  │   └── Activity.ts
  └── routes/
      ├── authRoutes.ts       # 路由使用 camelCase
      └── userRoutes.ts
```

### Git 工作流

#### 分支策略 (Git Flow)

```
main (生产分支)
  ↓
develop (开发分支)
  ↓
feature/* (功能分支)
  ├── feature/auth-system
  ├── feature/user-profile
  ├── feature/activity-management
  └── feature/discovery-page
```

#### Commit 规范

使用 Conventional Commits 格式:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type** (必须):

- `feat`: 新功能
- `fix`: bug 修复
- `refactor`: 代码重构
- `style`: 代码格式化 (不影响功能)
- `test`: 添加或修改测试
- `docs`: 文档更新
- `chore`: 构建脚本、依赖更新等

**Scope** (可选): 受影响的模块

- `auth`, `user`, `activity`, `discovery`, `api`, `db`

**例子**:

```
feat(auth): implement user registration
fix(activity): correct activity status transition logic
docs(api): update API documentation
```

#### Pull Request 规范

```markdown
## 描述

简述这个 PR 的目的

## 相关 Issue

Closes #123

## 更改清单

- [ ] 单元测试已编写并通过
- [ ] 文档已更新
- [ ] 代码审查已完成

## 测试步骤

1. 描述如何测试这个功能
2. 预期结果

## 截图 (如适用)
```

### 测试要求

#### 单元测试

- 后端: Jest 框架，目标覆盖率 > 50%
- 前端: Jest + Vue Test Utils，目标覆盖率 > 40%

#### 集成测试

- API 集成测试: Supertest + Jest
- 端到端测试: 手动 + Postman 集合

#### 测试命令

```bash
# 后端
npm run test              # 运行所有测试
npm run test:watch       # 监听模式
npm run test:coverage    # 生成覆盖率报告

# 前端
npm run test             # 运行所有测试
npm run test:unit       # 单元测试
```

## 开发流程

### 1. 本地开发环境搭建

```bash
# 克隆仓库
git clone <repo-url>

# 后端初始化
cd backend
npm install
cp .env.example .env
# 编辑 .env，配置数据库连接

# 前端初始化
cd ../frontend
npm install
cp .env.example .env

# 启动开发服务器 (两个终端)
# 终端1 - 后端
cd backend
npm run dev

# 终端2 - 前端
cd frontend
npm run dev
```

### 2. 实现功能流程

1. 在 `openspec/` 中查看相关的 `proposal.md` 和 `tasks.md`
2. 创建 feature 分支: `git checkout -b feature/auth-system`
3. 实现功能，遵循代码规范
4. 编写测试用例
5. 运行测试: `npm test`
6. Commit 提交: `git commit -m "feat(auth): implement user registration"`
7. Push 到远程: `git push origin feature/auth-system`
8. 创建 Pull Request
9. 代码审查，修复反馈
10. Merge 到 develop 分支

### 3. 发布流程

```bash
# 1. 从 develop 创建 release 分支
git checkout -b release/v1.0.0 develop

# 2. 更新版本号和文档
npm version patch

# 3. 提交和创建 PR 到 main
git commit -m "chore: bump version to 1.0.0"
git push origin release/v1.0.0

# 4. Merge 到 main 和 develop

# 5. 创建 Git Tag
git tag -a v1.0.0 -m "Version 1.0.0"
git push origin v1.0.0
```

## 环境变量配置

### 后端 (.env)

```
# 服务器
PORT=3000
NODE_ENV=development

# 数据库
DB_HOST=localhost
DB_PORT=3306
DB_NAME=hiking_app
DB_USER=root
DB_PASSWORD=root

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=24h

# 文件上传
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880  # 5MB

# 邮件 (可选)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# 日志
LOG_LEVEL=info
```

### 前端 (.env)

```
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_APP_NAME=Hiking Social App
```

## 常见命令

### 后端

```bash
npm run dev              # 开发模式运行
npm run build           # 构建生产版本
npm run test            # 运行测试
npm start               # 生产环境运行
npm run lint            # 代码检查
npm run format          # 代码格式化
npm run migrate         # 运行数据库迁移
npm run seed            # 填充种子数据
```

### 前端

```bash
npm run dev             # 开发服务器 (localhost:5173)
npm run build           # 构建生产版本
npm run preview         # 预览生产版本
npm run test            # 运行测试
npm run lint            # 代码检查
npm run format          # 代码格式化
```

## 团队约定

### 工作时间

- 默认每日同步一次进度
- 大型变更前进行技术讨论
- 代码审查及时反馈 (24 小时内)

### 讨论和反馈

- 使用 GitHub Issues 讨论需求和问题
- 使用 PR Comments 进行代码审查
- 重大决策记录在文档中

### 性能目标

- 前端首屏加载: < 3 秒
- API 平均响应时间: < 500ms
- 数据库查询时间: < 200ms
- Lighthouse 评分: > 80 分

### 安全要求

- 不在代码中硬编码敏感信息
- 定期审查依赖安全性
- 遵循 OWASP 安全最佳实践
- 数据库密码使用强加密
- API 必须使用 HTTPS

## 文档维护

所有文档应该：

- 使用 Markdown 格式
- 包含清晰的示例
- 定期更新以反映最新变更
- 包括 API 示例和代码片段

重要文档位置：

- 项目总体架构: `docs/ARCHITECTURE.md`
- API 文档: `docs/API.md`
- 开发指南: `docs/DEVELOPMENT.md` (本文件)
- 部署指南: `docs/DEPLOYMENT.md`

## 问题排查

### 常见问题

#### 数据库连接失败

```bash
# 检查 MySQL 是否运行
mysql -u root -p -e "SELECT 1;"

# 检查 .env 数据库配置
cat .env | grep DB_

# 重新初始化数据库
npm run migrate
npm run seed
```

#### 前后端通信问题

```bash
# 检查后端是否运行在 3000 端口
lsof -i :3000

# 检查前端 API 配置
cat .env | grep VITE_API_BASE_URL

# 检查 CORS 配置
# 在后端 app.ts 中验证 CORS 设置
```

#### 编译或运行错误

```bash
# 清理依赖缓存
rm -rf node_modules package-lock.json
npm install

# 重新启动开发服务器
npm run dev
```

## 联系和支持

- **技术问题**: 在 GitHub Issues 中提出
- **代码审查**: 提交 Pull Request
- **架构讨论**: 在讨论区或 Slack 中进行
