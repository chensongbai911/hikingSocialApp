# 徒步社交应用 - 快速启动指南（V2.0）

## 🎯 项目状态

**系统架构**: ✅ 完成

- 后端: Node.js + Express + TypeScript + MySQL
- 前端: Vue 3 + TypeScript + Vite
- 数据库: 14 表，3 个 schema，完整关联

**已实现功能**:

- ✅ 用户认证系统 (JWT + 刷新令牌)
- ✅ 路线管理 (CRUD + 收藏 + 搜索)
- ✅ 轨迹记录 (GPS + 上传 + 完成)
- ✅ 用户资料 (个人信息 + 关注 + 粉丝)
- ✅ 前端页面 (列表 + 详情 + 记录器 + 资料)

---

## 🚀 本地开发启动

### 前置要求

```bash
Node.js v20.19.1 或更高版本
MySQL 5.7+ 或 MySQL 8.0
npm 或 yarn
```

### 步骤 1: 启动数据库

```bash
# 启动 MySQL 服务
# Windows
net start MySQL80

# macOS
brew services start mysql

# Linux
sudo systemctl start mysql
```

### 步骤 2: 初始化后端

```bash
cd backend

# 安装依赖
npm install

# 执行数据库迁移
npm run migrate

# 检查迁移结果
# 预期输出:
# ✅ Successfully executed: 1 (003_create_track_tables.sql)
# ⏭️ Skipped: 2 (001, 002 already done)
```

### 步骤 3: 启动后端服务

```bash
# 开发环境
npm run dev

# 预期输出:
# Server is running on http://localhost:3000
```

### 步骤 4: 启动前端开发服务器

```bash
cd ../frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 预期输出:
# VITE v5.4.21  ready in 234 ms
# ➜  Local:   http://localhost:5173/
```

### 步骤 5: 访问应用

打开浏览器访问: **http://localhost:5173**

---

## 📋 环境配置

### 后端环境变量 (`backend/.env`)

```env
NODE_ENV=development
PORT=3000

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=hiking_app

# JWT 配置
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_REFRESH_EXPIRES_IN=30d

# 其他配置
CORS_ORIGIN=http://localhost:5173
API_PREFIX=/api
```

### 前端环境变量 (`frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_NAME=徒步社交应用
VITE_MAP_KEY=your_amap_key
```

---

## 🔑 测试账户

创建测试账户进行登录测试:

```bash
cd backend

# 在服务运行中，使用 API 创建账户
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@1234",
    "name": "测试用户"
  }'

# 或通过前端注册页面
```

---

## 📁 项目结构

```
徒步社交应用/
├── backend/
│   ├── src/
│   │   ├── middleware/        # 认证中间件
│   │   ├── controllers/       # API 控制器
│   │   ├── routes/            # 路由定义
│   │   ├── database/          # 数据库迁移
│   │   └── index.ts           # 服务器入口
│   ├── migrations/            # SQL 迁移文件 (3 个)
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── api/modules/       # API 客户端
│   │   ├── components/pages/  # 页面组件 (4 个新增)
│   │   ├── utils/             # 工具库
│   │   ├── router/            # 路由配置
│   │   └── App.vue            # 根组件
│   ├── package.json
│   └── vite.config.ts
│
├── DATABASE_SCHEMA.md         # 数据库文档
├── FRONTEND_IMPLEMENTATION_SUMMARY.md
└── QUICK_START.md (本文件)
```

---

## 🧪 测试核心功能

### 1. 用户认证流程

```bash
# 1. 注册新用户
POST /api/users/register
{
  "email": "newuser@example.com",
  "password": "Password@123",
  "name": "新用户"
}

# 响应:
{
  "message": "注册成功",
  "user": {
    "id": "uuid",
    "email": "newuser@example.com",
    "name": "新用户"
  }
}

# 2. 登录
POST /api/users/login
{
  "email": "newuser@example.com",
  "password": "Password@123"
}

# 响应包含 JWT tokens
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "user": {...}
}

# 3. 获取用户信息 (需要认证)
GET /api/users/profile
Headers: Authorization: Bearer {access_token}
```

### 2. 路线功能测试

```bash
# 1. 获取所有路线
GET /api/routes?page=1&limit=10

# 2. 获取路线详情
GET /api/routes/:id

# 3. 收藏路线 (需要认证)
POST /api/routes/:id/favorite
Headers: Authorization: Bearer {token}

# 4. 取消收藏
DELETE /api/routes/:id/favorite

# 5. 附近路线搜索
GET /api/routes/nearby?lat=40.7128&lng=-74.0060&radius=5000
```

### 3. 轨迹记录测试

```bash
# 1. 创建新轨迹
POST /api/tracks
{
  "name": "周末徒步",
  "description": "天气很好",
  "route_id": "optional_route_id"
}

# 2. 上传轨迹点
POST /api/tracks/:id/points
{
  "points": [
    {"latitude": 40.7128, "longitude": -74.0060, "altitude": 10, "timestamp": "2024-01-18T10:00:00Z"},
    {"latitude": 40.7130, "longitude": -74.0062, "altitude": 12, "timestamp": "2024-01-18T10:05:00Z"}
  ]
}

# 3. 完成轨迹
POST /api/tracks/:id/complete

# 4. 获取用户轨迹
GET /api/tracks/user/:userId
```

---

## 🐛 常见问题解决

### 问题 1: 数据库连接失败

```
错误: PROTOCOL_CONNECTION_LOST
解决:
1. 检查 MySQL 是否运行
2. 验证 .env 中的数据库凭证
3. 确保 hiking_app 数据库已创建
```

### 问题 2: JWT 认证失败

```
错误: 401 Unauthorized
解决:
1. 检查 access_token 是否过期
2. 确认 Authorization header 格式正确: "Bearer {token}"
3. 使用 refresh_token 获取新的 access_token
```

### 问题 3: CORS 错误

```
错误: Access to XMLHttpRequest blocked by CORS policy
解决:
1. 确认前端 URL 在 CORS_ORIGIN 列表中
2. 检查 .env 中的 CORS_ORIGIN 值
3. 重启后端服务
```

### 问题 4: 前端编译失败

```
错误: html2canvas not found
解决:
npm install html2canvas
npm install qrcode.vue
```

---

## 📊 API 端点概览

### 用户相关

- `POST /api/users/register` - 用户注册
- `POST /api/users/login` - 用户登录
- `POST /api/users/refresh` - 刷新令牌
- `GET /api/users/profile` - 获取个人资料
- `PATCH /api/users/profile` - 更新个人资料
- `GET /api/users/:id` - 获取用户信息
- `POST /api/users/:id/follow` - 关注用户
- `DELETE /api/users/:id/follow` - 取消关注

### 路线相关

- `GET /api/routes` - 获取路线列表 (分页)
- `POST /api/routes` - 创建路线 (仅管理员)
- `GET /api/routes/:id` - 获取路线详情
- `PATCH /api/routes/:id` - 更新路线
- `DELETE /api/routes/:id` - 删除路线
- `POST /api/routes/:id/favorite` - 收藏路线
- `DELETE /api/routes/:id/favorite` - 取消收藏
- `GET /api/routes/nearby` - 附近路线搜索

### 轨迹相关

- `POST /api/tracks` - 创建轨迹记录
- `POST /api/tracks/:id/points` - 上传轨迹点
- `POST /api/tracks/:id/complete` - 完成轨迹
- `GET /api/tracks/:id` - 获取轨迹详情
- `GET /api/tracks/user/:userId` - 获取用户轨迹
- `DELETE /api/tracks/:id` - 删除轨迹

---

## 📈 性能指标

| 指标         | 目标值  | 当前值 |
| ------------ | ------- | ------ |
| 首页加载时间 | < 2s    | 待测试 |
| API 响应时间 | < 200ms | 待测试 |
| 数据库查询   | < 100ms | 待测试 |
| 路线列表渲染 | < 1s    | 待测试 |

---

## 🔍 监控和调试

### 后端日志

```bash
# 查看实时日志
npm run dev

# 调试特定模块
DEBUG=hiking-app:* npm run dev
```

### 前端调试

```bash
# 使用 Vue DevTools 浏览器扩展
# 在 vite.config.ts 中启用 SourceMaps
sourcemap: true
```

### 数据库检查

```bash
# 登录 MySQL
mysql -u root -p

# 选择数据库
USE hiking_app;

# 查看表列表
SHOW TABLES;

# 检查表结构
DESC routes;
DESC users;
DESC tracks;
```

---

## 🎓 开发工作流

### 添加新 API 端点

1. **后端**: 在 `src/routes/` 中添加路由定义
2. **后端**: 在 `src/controllers/` 中添加控制器逻辑
3. **前端**: 在 `src/api/modules/` 中添加 API 客户端
4. **前端**: 在组件中调用 API
5. **测试**: 使用 Postman/curl 测试 API
6. **文档**: 更新 API 文档

### 添加新页面组件

1. 在 `frontend/src/components/pages/` 创建 Vue 文件
2. 在 `frontend/src/router/index.ts` 添加路由
3. 导入必要的 API 和工具
4. 实现 template 和 script
5. 添加 SCSS 样式
6. 导航测试

---

## 📞 技术支持参考

### 关键文档

- 数据库架构: `DATABASE_SCHEMA.md`
- 前端实现: `FRONTEND_IMPLEMENTATION_SUMMARY.md`
- API 文档: 待补充
- 部署指南: 待补充

### 关键文件

- 后端入口: `backend/src/index.ts`
- 前端入口: `frontend/src/main.ts`
- 路由配置: `frontend/src/router/index.ts`
- 数据库迁移: `backend/migrations/*.sql`

---

## ✨ 下一步行动

1. **本地测试**:
   - 启动前后端服务
   - 测试用户认证流程
   - 测试路线浏览和收藏
   - 测试轨迹记录功能

2. **功能补全**:
   - 完善 RouteDetail 页面
   - 添加评论系统
   - 实现文件上传
   - 添加搜索功能

3. **性能优化**:
   - 添加加载状态
   - 实现图片压缩
   - 添加缓存机制
   - 优化数据库查询

4. **部署准备**:
   - 环境配置
   - 生产构建
   - 服务器设置
   - 监控配置

---

**最后更新**: 2024年1月18日
**版本**: 2.0 (前端页面完成版)
**状态**: ✅ 开发中
