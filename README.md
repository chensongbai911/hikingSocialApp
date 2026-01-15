# 徒步社交 APP

一款专为徒步爱好者打造的社交应用，支持活动发起、匹配、评价和社区互动。

## 项目概述

徒步社交 APP 是一个全栈 Web/移动应用，旨在为徒步爱好者提供一个便捷的平台，用于：

- 🏔️ **发现活动** - 浏览和搜索附近的徒步活动
- 🤝 **社交匹配** - 根据偏好智能匹配志同道合的徒步伙伴
- 📅 **活动管理** - 创建、组织和参加徒步活动
- 💬 **即时通讯** - 与其他徒步者实时交流
- ⭐ **评价反馈** - 对活动和用户进行评分和评价
- 📸 **生活分享** - 分享徒步照片和经历

## 技术架构

### 前端

- **Vue 3** - 渐进式 JavaScript 框架
- **Lynx** - 跨平台运行时（iOS 13+, Android 8+, Web）
- **Pinia** - 轻量级状态管理
- **Vue Router** - 官方路由解决方案
- **Tailwind CSS** - 实用优先的 CSS 框架
- **Axios** - HTTP 客户端
- **TypeScript** - 类型安全

### 后端

- **Node.js** - JavaScript 运行时
- **Express.js** - Web 应用框架
- **MySQL** - 关系型数据库
- **Sequelize** - ORM 工具
- **JWT** - JSON Web Token 认证
- **Bcrypt** - 密码加密
- **Winston** - 日志管理

## 核心功能

### 用户系统

- ✅ 注册/登录/登出
- ✅ 个人资料管理
- ✅ 生活相册（最多 9 张照片）
- ✅ 登山等级和偏好设置

### 活动管理

- ✅ 活动创建和发布
- ✅ 活动浏览和搜索
- ✅ 活动详情查看
- ✅ 参加/取消活动
- ✅ 活动状态管理

### 社交功能

- ✅ 用户匹配推荐
- ✅ 消息聊天
- ✅ 活动评价和反馈
- ✅ 用户关注

### 发现功能

- ✅ 活动推荐
- ✅ 用户推荐
- ✅ 筛选和排序
- ✅ 搜索功能

## 项目结构

```
├── frontend/                  # 前端代码
│   ├── src/
│   │   ├── components/        # Vue 组件
│   │   │   ├── common/        # 公共组件（TabBar, ActivityCard, UserCard, FilterBar）
│   │   │   └── pages/         # 页面组件（8个主要页面）
│   │   ├── stores/            # Pinia 状态管理
│   │   ├── api/               # API 请求封装
│   │   ├── router/            # 路由配置
│   │   ├── utils/             # 工具函数
│   │   ├── types/             # TypeScript 类型
│   │   └── styles/            # 全局样式
│   ├── public/                # 静态资源
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── backend/                   # 后端代码
│   ├── src/
│   │   ├── controllers/       # 控制器（Auth, Activity）
│   │   ├── services/          # 业务逻辑（Auth, Activity）
│   │   ├── models/            # 数据模型（User, Activity, Participation, UserPreference, UserPhoto）
│   │   ├── routes/            # API 路由
│   │   ├── middleware/        # Express 中间件（认证、日志、错误处理）
│   │   ├── config/            # 配置文件（数据库）
│   │   ├── utils/             # 工具函数（日志）
│   │   ├── database/          # 数据库初始化脚本
│   │   └── server.ts          # 服务器入口
│   ├── tests/                 # 测试文件
│   ├── package.json
│   └── tsconfig.json
│
├── openspec/                  # 项目规范文档
│   ├── specs/                 # 详细规范（design.md, spec.md, tasks.md, etc.）
│   └── project.md             # 项目概述
│
├── design_images/             # 设计稿
├── 徒步社交app_产品需求文档_prd.md
├── 项目说明.md
├── README.md
└── README_STARTUP.md          # 启动指南
```

## 快速开始

详细的启动指南请参阅 [README_STARTUP.md](./README_STARTUP.md)

### 最小化启动步骤

```bash
# 1. 克隆项目
git clone <repository-url>
cd hiking-social-app

# 2. 安装依赖
cd frontend && npm install
cd ../backend && npm install

# 3. 配置数据库
mysql -u root -p
CREATE DATABASE hiking_social CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
mysql -u root -p hiking_social < backend/src/database/init.sql

# 4. 配置环境变量
cd backend && cp .env.example .env
cd ../frontend && cp .env.example .env
# 编辑 .env 文件，填写数据库连接信息

# 5. 启动项目
# 终端 1 - 后端
cd backend && npm run dev

# 终端 2 - 前端
cd frontend && npm run dev
```

访问 `http://localhost:5173` 查看应用。

## API 文档

### 认证 API

| 方法 | 路径                    | 描述             |
| ---- | ----------------------- | ---------------- |
| POST | `/api/v1/auth/register` | 用户注册         |
| POST | `/api/v1/auth/login`    | 用户登录         |
| POST | `/api/v1/auth/refresh`  | 刷新 token       |
| GET  | `/api/v1/auth/me`       | 获取当前用户信息 |

### 活动 API

| 方法   | 路径                                 | 描述           |
| ------ | ------------------------------------ | -------------- |
| GET    | `/api/v1/activities`                 | 获取活动列表   |
| GET    | `/api/v1/activities/:id`             | 获取活动详情   |
| POST   | `/api/v1/activities`                 | 创建活动       |
| PUT    | `/api/v1/activities/:id`             | 更新活动       |
| DELETE | `/api/v1/activities/:id`             | 删除活动       |
| POST   | `/api/v1/activities/:id/join`        | 参加活动       |
| POST   | `/api/v1/activities/:id/cancel`      | 取消参加       |
| GET    | `/api/v1/activities/user/activities` | 获取用户的活动 |

### 用户 API

| 方法 | 路径                    | 描述         |
| ---- | ----------------------- | ------------ |
| GET  | `/api/v1/users/:id`     | 获取用户信息 |
| PUT  | `/api/v1/users/profile` | 更新用户信息 |

### 发现 API

| 方法 | 路径                                       | 描述         |
| ---- | ------------------------------------------ | ------------ |
| GET  | `/api/v1/discovery/recommended-activities` | 获取推荐活动 |
| GET  | `/api/v1/discovery/recommended-users`      | 获取推荐用户 |
| GET  | `/api/v1/discovery/trending`               | 获取趋势数据 |

## 数据库设计

### 核心表

1. **users** - 用户表

   - 基本信息（邮箱、昵称、头像、性别、年龄）
   - 登山相关（等级、简介）
   - 状态（激活、认证）

2. **activities** - 活动表

   - 活动信息（标题、描述、位置、时间）
   - 难度、类型、状态
   - 路线和装备信息

3. **participations** - 参与记录表

   - 用户-活动关联
   - 参与状态
   - 评价和反馈

4. **user_preferences** - 用户偏好表

   - 时间偏好
   - 类型偏好
   - 距离偏好

5. **user_photos** - 用户相册表
   - 照片 URL
   - 排序顺序

## 开发规范

### 代码规范

- 遵循 **Airbnb JavaScript Style Guide**
- 使用 **ESLint** 进行代码检查
- 使用 **Prettier** 进行代码格式化
- 使用 **TypeScript** 确保类型安全

### Git 提交规范

使用 **Conventional Commits** 规范：

```
feat: 添加新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整（不影响功能）
refactor: 重构代码
test: 测试相关
chore: 构建或辅助工具的变动
```

### 分支策略

- `main` - 生产环境
- `develop` - 开发环境
- `feature/*` - 功能分支
- `bugfix/*` - 修复分支
- `hotfix/*` - 紧急修复分支

## 测试

### 前端测试

```bash
cd frontend
npm run test          # 运行单元测试
npm run test:e2e      # 运行端到端测试
```

### 后端测试

```bash
cd backend
npm run test          # 运行单元测试
npm run test:int      # 运行集成测试
```

## 部署

### 前端部署

```bash
cd frontend
npm run build
# 将 dist/ 目录部署到静态服务器或 CDN
```

### 后端部署

```bash
cd backend
npm run build
npm run start
# 使用 PM2 或 Docker 进行生产环境部署
```

## 贡献指南

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 致谢

- Vue.js 团队提供的优秀框架
- Express.js 社区
- 所有开源贡献者

## 联系方式

- 项目维护者: [项目团队]
- 邮箱: [联系邮箱]
- 问题反馈: [GitHub Issues](项目仓库/issues)

---

**祝您徒步愉快！🏔️⛰️🥾**
