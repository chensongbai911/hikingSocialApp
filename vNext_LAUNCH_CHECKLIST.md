# vNext 快速启动检查清单

**项目**: 徒步社交 App vNext
**更新日期**: 2026-01-19
**状态**: ✅ 准备就绪

---

## 📋 启动前准备 (必须完成)

### 1. 环境配置 ✅

- [x] Node.js 18+ 已安装
- [x] MySQL 5.7+ 已安装并运行
- [x] Redis 已安装并运行
- [ ] **复制 `.env.example` → `.env`** (后端)
- [ ] **复制 `.env.example` → `.env.development`** (前端)
- [ ] **填写数据库连接信息** (DB_HOST, DB_USER, DB_PASSWORD)
- [ ] **填写 Redis 连接信息** (REDIS_HOST, REDIS_PORT)
- [ ] **生成 JWT_SECRET** (至少 32 个字符)

### 2. API 密钥申请 ⏳ (可稍后)

- [ ] **高德地图 API Key** (https://lbs.amap.com/)
  - 需要两个 Key: Web 端 (VITE_AMAP_KEY) + 后端 (AMAP_KEY)
  - 预计费用: 500-2000 RMB/月
- [ ] **和风天气 API Key** (https://dev.qweather.com/)
  - 免费版: 1000 次/天，可用于开发
  - 预计费用: 免费或 <500 RMB/月

### 3. 依赖安装 ✅

```bash
# 后端
cd backend
npm install

# 前端
cd frontend
npm install
```

### 4. 数据库初始化 ⏳

```bash
# 方式 1: 使用迁移脚本（推荐）
cd backend
npm run migrate

# 方式 2: 手动执行 SQL
# 打开 MySQL 客户端，执行:
# backend/src/database/migrations/001_create_route_tables.sql
```

---

## 🚀 立即启动 (3 步)

### Step 1: 启动后端

```bash
cd backend
npm run dev
```

**预期输出**:

```
✅ Database connected successfully
✅ Redis connected successfully
🚀 Server running on http://localhost:3000
```

### Step 2: 启动前端

```bash
cd frontend
npm run dev
```

**预期输出**:

```
VITE v5.x.x ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Step 3: 访问应用

打开浏览器访问: **http://localhost:5173**

---

## ✅ 验证清单

### 后端验证

- [ ] 访问 `http://localhost:3000/health` 返回 OK
- [ ] 访问 `http://localhost:3000/api/v1/routes` 返回路线列表
- [ ] 查看终端无报错信息
- [ ] Redis 连接成功
- [ ] MySQL 连接成功

### 前端验证

- [ ] 页面正常加载，无白屏
- [ ] 打开浏览器控制台，无报错
- [ ] 可以看到地图 (如果已配置 AMap Key)
- [ ] 可以看到路线列表 (来自后端 API)

### 数据库验证

```sql
-- 检查表是否创建成功
SHOW TABLES;

-- 应该看到:
-- routes
-- route_waypoints
-- route_risk_points
-- route_tags
-- route_favorites
-- migrations

-- 检查种子数据
SELECT COUNT(*) FROM routes;
-- 应该返回 10 (10 条北京徒步路线)
```

---

## 🐛 常见问题

### 1. 后端无法启动

**症状**: `Database connection failed` 或 `Redis connection failed`

**解决**:

```bash
# 检查 MySQL 是否运行
mysql -u root -p

# 检查 Redis 是否运行
redis-cli ping
# 应返回 PONG

# 检查 .env 配置是否正确
cat backend/.env
```

### 2. 前端无法访问后端

**症状**: 控制台报错 `Network Error` 或 `CORS error`

**解决**:

- 确认后端已启动 (`http://localhost:3000`)
- 检查 `frontend/.env.development` 中 `VITE_API_BASE_URL=http://localhost:3000`
- 检查后端 CORS 配置允许 `http://localhost:5173`

### 3. 地图不显示

**症状**: 地图区域是空白或显示错误

**解决**:

- 检查是否配置了 `VITE_AMAP_KEY`
- 打开浏览器控制台查看是否有 AMap SDK 加载错误
- 暂时可以跳过，专注于 API 功能开发

### 4. 数据库迁移失败

**症状**: `migrate.ts` 执行报错

**解决**:

```bash
# 手动创建数据库
mysql -u root -p
CREATE DATABASE hiking_social_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 重新运行迁移
npm run migrate
```

---

## 📂 项目目录结构

```
d:\coze\
├── backend/                  # 后端项目
│   ├── src/
│   │   ├── config/           # 配置文件
│   │   │   ├── database.ts   # 数据库配置
│   │   │   └── redis.ts      # Redis 配置
│   │   ├── controllers/      # 控制器
│   │   │   └── route.controller.ts
│   │   ├── routes/           # 路由
│   │   │   └── route.routes.ts
│   │   ├── database/         # 数据库相关
│   │   │   ├── migrate.ts    # 迁移工具
│   │   │   └── migrations/   # 迁移脚本
│   │   │       └── 001_create_route_tables.sql
│   │   └── utils/            # 工具函数
│   │       └── apiResponse.ts
│   ├── .env.example          # 环境变量示例
│   └── package.json
├── frontend/                 # 前端项目
│   ├── src/
│   │   ├── api/              # API 层
│   │   │   ├── base/         # 基础封装
│   │   │   │   ├── types.ts
│   │   │   │   └── apiService.ts
│   │   │   ├── hooks/        # Vue Hooks
│   │   │   │   └── useApiRequest.ts
│   │   │   └── modules/      # API 模块
│   │   │       └── route.ts
│   │   └── utils/            # 工具函数
│   │       ├── cache.ts      # LRU 缓存
│   │       └── storage.ts    # 本地存储
│   ├── .env.example          # 环境变量示例
│   └── package.json
├── vNext_TASK_BREAKDOWN.md   # 📌 完整任务清单
├── vNext_EXECUTION_TRACKER.md # 📌 执行跟踪看板
├── vNext_QUICK_START.md      # 📌 开发者快速上手
├── DEV_ENVIRONMENT_SETUP.md  # 📌 环境配置详解
├── GIT_COMMIT_GUIDE.md       # 📌 Git 提交规范
└── vNext_START_HERE.md       # 📌 项目入口文档
```

---

## 🎯 下一步行动

### 今天 (2026-01-19)

1. **产品经理**:
   - [ ] 确认技术方案
   - [ ] 申请高德地图和和风天气 API Key
   - [ ] 召集团队 Kickoff 会议（1 小时）

2. **后端负责人**:
   - [ ] 配置本地环境
   - [ ] 执行数据库迁移
   - [ ] 分配 Stage 0 任务 (T0.1, T0.2, T0.3, T0.4)

3. **前端负责人**:
   - [ ] 配置本地环境
   - [ ] 熟悉 API 层架构
   - [ ] 分配 Stage 0 任务 (T0.5, T0.3)

4. **全体开发人员**:
   - [ ] 阅读 vNext_START_HERE.md
   - [ ] 阅读 vNext_QUICK_START.md
   - [ ] 配置本地开发环境
   - [ ] 熟悉 Git 提交规范

### 本周 (Week 1: 2026-01-19 至 01-25)

**目标**: 完成 Stage 0 代码优化

- [ ] T0.1: TypeScript 严格模式启用 (4 人日)
- [ ] T0.2: 统一 API 响应格式 (2 人日)
- [ ] T0.3: 清理所有 console.log (1 人日)
- [ ] T0.4: Socket.io 安全加固 (1 人日)
- [ ] T0.5: 前端 API 层重构 (5 人日)

**验收标准**:

- ✅ TypeScript 编译 0 错误
- ✅ 项目代码 0 个 console.log
- ✅ 所有 API 响应格式统一
- ✅ ESLint 检查通过

---

## 📞 联系方式

- **技术讨论**: [团队 Slack/微信群]
- **Bug 反馈**: [GitHub Issues]
- **文档更新**: 直接提交 PR

---

**祝开发顺利！🚀**
