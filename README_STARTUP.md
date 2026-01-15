# 徒步社交 APP - 项目启动指南

## 项目结构

```
hiking-social-app/
├── frontend/               # 前端项目（Vue 3 + Lynx + Pinia）
│   ├── src/
│   │   ├── components/     # 组件目录
│   │   │   ├── common/     # 公共组件
│   │   │   └── pages/      # 页面组件
│   │   ├── stores/         # Pinia 状态管理
│   │   ├── api/            # API 请求模块
│   │   ├── router/         # 路由配置
│   │   ├── utils/          # 工具函数
│   │   ├── types/          # TypeScript 类型定义
│   │   ├── styles/         # 样式文件
│   │   └── main.ts         # 应用入口
│   ├── public/             # 静态资源
│   ├── index.html          # HTML 模板
│   ├── package.json        # 依赖配置
│   ├── tsconfig.json       # TypeScript 配置
│   ├── vite.config.ts      # Vite 构建配置
│   └── tailwind.config.js  # Tailwind CSS 配置
│
└── backend/                # 后端项目（Node.js + Express + MySQL）
    ├── src/
    │   ├── controllers/    # 控制器
    │   ├── services/       # 业务逻辑层
    │   ├── models/         # 数据模型
    │   ├── routes/         # 路由定义
    │   ├── middleware/     # 中间件
    │   ├── config/         # 配置文件
    │   ├── utils/          # 工具函数
    │   ├── types/          # TypeScript 类型
    │   ├── database/       # 数据库初始化脚本
    │   └── server.ts       # 服务器入口
    ├── tests/              # 测试文件
    ├── package.json        # 依赖配置
    ├── tsconfig.json       # TypeScript 配置
    └── .env.example        # 环境变量模板
```

## 环境要求

- **Node.js**: 18.x 或更高版本
- **npm**: 9.x 或更高版本
- **MySQL**: 8.0 或更高版本

## 快速开始

### 1. 安装依赖

#### 前端依赖

```bash
cd frontend
npm install
```

#### 后端依赖

```bash
cd backend
npm install
```

### 2. 数据库配置

#### 创建数据库

```sql
CREATE DATABASE hiking_social CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 导入初始化脚本

```bash
mysql -u root -p hiking_social < backend/src/database/init.sql
```

### 3. 环境变量配置

#### 后端环境变量

在 `backend/` 目录下创建 `.env` 文件：

```bash
cd backend
cp .env.example .env
```

编辑 `.env` 文件，配置数据库连接信息：

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=hiking_social

# JWT 配置
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRATION=7d

# 服务器配置
PORT=3000
NODE_ENV=development
API_VERSION=v1

# CORS 配置
CORS_ORIGIN=http://localhost:5173,http://localhost:5174
```

#### 前端环境变量

在 `frontend/` 目录下创建 `.env` 文件：

```bash
cd frontend
cp .env.example .env
```

编辑 `.env` 文件：

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_API_TIMEOUT=10000
VITE_ENABLE_MOCK=false
```

### 4. 启动项目

#### 启动后端服务器

```bash
cd backend
npm run dev
```

后端服务器将在 `http://localhost:3000` 启动。

#### 启动前端开发服务器

```bash
cd frontend
npm run dev
```

前端服务器将在 `http://localhost:5173` 启动。

## 可用的脚本命令

### 前端命令

```bash
npm run dev       # 启动开发服务器
npm run build     # 构建生产版本
npm run preview   # 预览生产构建
npm run lint      # 运行 ESLint
npm run test      # 运行测试
```

### 后端命令

```bash
npm run dev       # 启动开发服务器（使用 ts-node）
npm run build     # 编译 TypeScript
npm run start     # 启动生产服务器
npm run test      # 运行测试
npm run lint      # 运行 ESLint
```

## API 文档

### 认证相关 API

- `POST /api/v1/auth/register` - 用户注册
- `POST /api/v1/auth/login` - 用户登录
- `POST /api/v1/auth/refresh` - 刷新 token
- `GET /api/v1/auth/me` - 获取当前用户信息

### 活动相关 API

- `GET /api/v1/activities` - 获取活动列表
- `GET /api/v1/activities/:id` - 获取活动详情
- `POST /api/v1/activities` - 创建活动
- `PUT /api/v1/activities/:id` - 更新活动
- `DELETE /api/v1/activities/:id` - 删除活动
- `POST /api/v1/activities/:id/join` - 参加活动
- `POST /api/v1/activities/:id/cancel` - 取消参加
- `GET /api/v1/activities/user/activities` - 获取用户的活动

### 用户相关 API

- `GET /api/v1/users/:id` - 获取用户信息
- `PUT /api/v1/users/profile` - 更新用户信息

### 发现相关 API

- `GET /api/v1/discovery/recommended-activities` - 获取推荐活动
- `GET /api/v1/discovery/recommended-users` - 获取推荐用户
- `GET /api/v1/discovery/trending` - 获取趋势数据

## 功能特性

### 已实现功能

#### 前端

- ✅ 用户认证（登录/注册）
- ✅ 活动发现页面
- ✅ 活动详情页面
- ✅ 创建活动页面
- ✅ 用户个人中心
- ✅ 我的登山页面
- ✅ 消息页面
- ✅ 个人资料编辑
- ✅ 底部导航栏
- ✅ 活动卡片组件
- ✅ 用户卡片组件
- ✅ 筛选栏组件

#### 后端

- ✅ 用户注册和登录
- ✅ JWT 认证
- ✅ 活动 CRUD 操作
- ✅ 活动参加/取消
- ✅ 用户活动查询
- ✅ 数据库模型（5 个表）
- ✅ API 路由配置
- ✅ 错误处理中间件
- ✅ 请求日志中间件
- ✅ 认证中间件

### 待实现功能

- ⏳ 实时聊天功能
- ⏳ 推送通知
- ⏳ 图片上传
- ⏳ 用户匹配算法
- ⏳ 活动推荐算法
- ⏳ 评价和反馈系统
- ⏳ 地图集成
- ⏳ 天气 API 集成

## 开发注意事项

### TypeScript

项目全栈使用 TypeScript，确保类型安全。

### 代码规范

- 使用 ESLint 进行代码检查
- 遵循 Airbnb JavaScript 风格指南
- 使用 Prettier 进行代码格式化

### Git 提交规范

使用 Conventional Commits 规范：

```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
test: 测试相关
chore: 构建或辅助工具的变动
```

### 数据库迁移

开发环境使用 Sequelize 的 `sync()` 自动同步模型。

生产环境建议使用迁移脚本：

```bash
npm run migration:create -- --name create-users-table
npm run migration:run
```

## 常见问题

### Q: 数据库连接失败

A: 检查 `.env` 文件中的数据库配置是否正确，确保 MySQL 服务已启动。

### Q: 前端无法访问后端 API

A: 检查 CORS 配置，确保前端域名在 `CORS_ORIGIN` 环境变量中。

### Q: TypeScript 编译错误

A: 运行 `npm install` 确保所有依赖已安装，检查 `tsconfig.json` 配置。

## 技术栈

### 前端技术栈

- **框架**: Vue 3 (Composition API)
- **跨平台**: Lynx (iOS 13+, Android 8+, Web)
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **HTTP 客户端**: Axios
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **语言**: TypeScript

### 后端技术栈

- **运行时**: Node.js 18+
- **框架**: Express.js 4.x
- **数据库**: MySQL 8.0+
- **ORM**: Sequelize
- **认证**: JWT + Bcrypt
- **日志**: Winston
- **语言**: TypeScript

## 许可证

MIT License

## 联系方式

如有问题，请联系开发团队。
