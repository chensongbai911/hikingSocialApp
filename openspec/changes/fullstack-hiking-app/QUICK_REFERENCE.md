# 🚀 徒步社交 App - 快速参考卡片

## 📌 5 分钟速览

### 项目是什么？

一个**全栈徒步社交应用**：

- 用户可以**发现和发布徒步活动**
- 用户可以**搜索和发现志同道合的伙伴**
- 包括**个人资料、活动管理、社交发现**等功能

### 技术栈是什么？

```
前端: Vue 3 + Lynx + Pinia        (跨端应用)
后端: Node.js + Express + MySQL   (RESTful API)
```

### 核心功能有哪些？

1. ✅ 用户注册/登录 (JWT 认证)
2. ✅ 个人资料管理 (头像、相册、偏好)
3. ✅ 活动管理 (创建、编辑、参加)
4. ✅ 用户发现 (搜索、筛选、推荐)
5. ✅ 完整的 REST API

### 有多少工作量？

- 📊 70+ 个具体任务
- 📅 7 天开发周期 (4 个阶段)
- 📝 3000+ 行完整文档
- 🗄️ 5 个数据库表
- 🔌 20+ 个 API 端点

---

## ⚡ 快速开始 (10 分钟)

### 1️⃣ 安装依赖

```bash
# 后端
cd backend
npm install

# 前端 (新终端)
cd frontend
npm install
```

### 2️⃣ 配置环境

```bash
# 后端配置
cp backend/.env.example backend/.env
# 编辑 .env，配置数据库: localhost:3306/hiking_app

# 前端配置
cp frontend/.env.example frontend/.env
```

### 3️⃣ 初始化数据库

```bash
cd backend
npm run migrate
npm run seed
```

### 4️⃣ 启动服务

```bash
# 终端1 - 后端 (3000)
npm run dev

# 终端2 - 前端 (5173)
cd frontend
npm run dev
```

### 5️⃣ 访问应用

- 🌐 前端: http://localhost:5173
- 📱 后端 API: http://localhost:3000
- 📚 API 文档: http://localhost:3000/api-docs

---

## 🗂️ 文件结构速查

### 重要文件位置

```
openspec/changes/fullstack-hiking-app/
├── README.md              # 👈 项目入门 (从这里开始)
├── INDEX.md               # 📖 完整文档索引
├── proposal.md            # 🎯 项目目标和范围
├── design.md              # 🏗️ 架构设计细节
├── spec.md                # 📋 功能需求规范
├── tasks.md               # ✅ 开发任务清单
├── DEVELOPMENT.md         # 📐 开发规范指南
└── PROJECT_SUMMARY.md     # 📊 项目统计总结

openspec/
└── project.md             # 🔧 技术规范和约束
```

---

## 🎯 关键概念速记

### 数据模型 (5 个表)

```
users                  # 用户基本信息
├─ user_preferences   # 用户偏好标签
└─ user_photos       # 用户生活相册

activities           # 徒步活动
└─ participations    # 参加活动的记录
```

### 活动状态流转

```
pending → approved → ongoing → completed
(待审核) (即将开始) (进行中) (已完成)
```

### 用户等级

```
beginner (新手) → intermediate (中级) → advanced (资深)
```

### API 端点分类

```
认证 (5个)   → /auth/*
用户 (8个)   → /users/*
活动 (10个)  → /activities/*
发现 (2个)   → /discovery/*
```

---

## 📱 前端页面速记

### 12 个核心页面

```
1. 登录页 (Login)
2. 注册页 (Register)
3. 首页 (Home) - 占位
4. 发现页 (Discover) - 用户搜索筛选
5. 我的徒步 (MyHiking) - 我加入的/我发布的
6. 个人资料 (Profile) - 查看资料
7. 编辑资料 (EditProfile) - 编辑信息
8. 头像编辑 (AvatarEdit) - 头像裁剪
9. 活动详情 (ActivityDetail) - 活动详情
10. 创建活动 (CreateActivity) - 活动表单
11. 地图选择 (MapSelect) - 选择地点
12. 消息页 (Messages) - 占位
```

### 核心组件

```
TabBar            # 底部导航栏
TopBar            # 顶部导航栏
ActivityCard      # 活动卡片
UserCard          # 用户卡片
FilterModal       # 筛选弹窗
```

---

## 🔌 常用 API 端点

### 认证

```
POST   /api/v1/auth/register       # 注册
POST   /api/v1/auth/login          # 登录
POST   /api/v1/auth/logout         # 登出
POST   /api/v1/auth/refresh-token  # 刷新Token
```

### 用户

```
GET    /api/v1/users/me            # 获取当前用户
PUT    /api/v1/users/me            # 更新用户信息
POST   /api/v1/users/avatar        # 上传头像
```

### 活动

```
GET    /api/v1/activities          # 活动列表
POST   /api/v1/activities          # 创建活动
GET    /api/v1/activities/:id      # 活动详情
POST   /api/v1/activities/:id/join # 参加活动
```

### 发现

```
GET    /api/v1/discovery/users             # 搜索用户
GET    /api/v1/discovery/users/filter      # 筛选用户
```

---

## 💻 常用命令速查

### 后端命令

```bash
npm run dev              # 开发模式运行
npm run build           # 构建生产版本
npm run test            # 运行单元测试
npm run lint            # 代码检查
npm run migrate         # 数据库迁移
npm run seed            # 填充初始数据
```

### 前端命令

```bash
npm run dev             # 启动开发服务器
npm run build           # 生产构建
npm run preview         # 预览生产版本
npm run test            # 单元测试
npm run lint            # 代码检查
```

### 数据库

```bash
# 初始化数据库
mysql -u root -p < database/init.sql

# 运行迁移
npm run migrate

# 填充测试数据
npm run seed
```

---

## 🧪 测试命令

### 后端测试

```bash
# 运行所有测试
npm run test

# 监听模式 (文件变化自动重新运行)
npm run test:watch

# 生成覆盖率报告
npm run test:coverage

# 运行特定测试文件
npm run test -- auth.test.ts
```

### 前端测试

```bash
npm run test
npm run test:watch
npm run test:coverage
```

---

## 🔐 安全性要点

### 认证

- JWT Token (过期: 24 小时)
- Bearer scheme: `Authorization: Bearer <token>`

### 密码安全

- Bcrypt 加密 (强度 ≥ 10)
- 最小长度: 8 字符
- 必须包含: 大小写字母 + 数字

### API 安全

- HTTPS 加密传输
- 速率限制: 100 请求/分钟
- SQL 注入防护: 参数化查询
- XSS 防护: 输入验证
- CORS: 严格配置

---

## ⚡ 性能指标

| 指标            | 目标值  |
| --------------- | ------- |
| 首屏加载        | < 3 秒  |
| API 响应        | < 500ms |
| 数据库查询      | < 200ms |
| 页面滚动 FPS    | ≥ 60fps |
| Lighthouse 评分 | > 80    |

---

## 📋 4 阶段开发计划

### Phase 1: 初始化 (Day 1-2)

- 前后端项目初始化
- 数据库设计和创建
- 项目文档编写

### Phase 2: 后端开发 (Day 3-4)

- 认证系统 (6 任务)
- 用户管理 (6 任务)
- 活动管理 (5 任务)
- 发现功能 (3 任务)

### Phase 3: 前端开发 (Day 5-6)

- 基础组件 (6 任务)
- 认证页面 (2 任务)
- 资料页面 (4 任务)
- 活动页面 (8 任务)
- 发现页面 (3 任务)
- 集成优化 (2 任务)

### Phase 4: 测试部署 (Day 7)

- 前端测试 (4 任务)
- 后端测试 (5 任务)
- 集成测试 (3 任务)
- 性能优化 (3 任务)
- 安全检查 (3 任务)
- 文档完善 (2 任务)
- 部署准备 (1 任务)

---

## 🎓 文档阅读顺序

### 👨‍💼 项目经理

1. README.md (快速了解)
2. proposal.md (目标范围)
3. tasks.md (进度跟踪)

### 🏛️ 架构师

1. proposal.md (目标)
2. design.md (架构)
3. project.md (规范)

### 👨‍💻 前端开发

1. README.md (快速开始)
2. DEVELOPMENT.md (规范)
3. design.md > Frontend 部分
4. spec.md (功能需求)

### 🔧 后端开发

1. README.md (快速开始)
2. DEVELOPMENT.md (规范)
3. design.md > Backend + Database 部分
4. spec.md (业务规范)

### 🧪 QA 工程师

1. spec.md (需求)
2. design.md > API 设计
3. DEVELOPMENT.md > 测试策略

---

## 🚨 常见问题 (FAQ)

### Q: 如何启动项目？

A: 见"快速开始"部分，5 步即可启动

### Q: 项目用什么数据库？

A: MySQL 8.0+，已提供完整 SQL 脚本

### Q: 前端支持哪些平台？

A: Vue 3 + Lynx 支持 Web、iOS、Android

### Q: 如何进行代码审查？

A: 看 DEVELOPMENT.md 的 Git 工作流部分

### Q: 单元测试覆盖率要求？

A: 后端 > 50%，前端 > 40%

### Q: API 如何认证？

A: JWT Token，放在 Authorization header 中

### Q: 密码如何加密？

A: Bcrypt，强度 ≥ 10

### Q: 活动状态怎样流转？

A: pending → approved → ongoing → completed

### Q: 用户偏好标签有哪些？

A: 时间、类型、特殊需求、距离、兴趣点

### Q: 有多少个 API 端点？

A: 20+ 个，分成 4 类 (认证、用户、活动、发现)

---

## 📞 获取帮助

### 遇到问题？

1. 📖 查看 DEVELOPMENT.md 的"问题排查"
2. 📚 搜索 spec.md 的相关需求
3. 🔍 在 INDEX.md 找相关文档
4. 💬 在项目 Issues 中提问

### 需要详细信息？

| 关于     | 查看                              |
| -------- | --------------------------------- |
| 项目目标 | proposal.md                       |
| 架构设计 | design.md                         |
| 功能需求 | spec.md                           |
| 开发任务 | tasks.md                          |
| 代码规范 | DEVELOPMENT.md                    |
| API 端点 | design.md > API Design            |
| 数据库   | design.md > Database Schema       |
| 页面设计 | design.md > Frontend Architecture |

---

## ✅ 开发检查清单

### 开始开发前

- [ ] 已读 README.md
- [ ] 已读相关部分的 design.md
- [ ] 了解相关任务 (tasks.md)
- [ ] 理解代码规范 (DEVELOPMENT.md)

### 开发中

- [ ] 按照代码规范编写
- [ ] 定期 commit，message 清晰
- [ ] 为新功能编写测试
- [ ] 遵循命名约定

### 提交 PR 前

- [ ] 代码通过 ESLint 检查
- [ ] 所有测试通过
- [ ] 相关文档已更新
- [ ] Commit message 清晰

### 审查和合并

- [ ] 至少 1 人代码审查
- [ ] 反馈已处理
- [ ] 所有检查都通过
- [ ] PR 合并后删除分支

---

## 📊 项目统计

- **总文档行数**: 3,000+
- **数据库表**: 5 个
- **API 端点**: 20+
- **前端页面**: 12+
- **前端组件**: 20+
- **开发阶段**: 4 个
- **任务总数**: 70+
- **预计代码行**: 10,000+
- **开发周期**: 7 天

---

## 🎉 成功指标

项目完成的标志：

- ✅ 所有核心功能实现
- ✅ 前后端成功联动
- ✅ 数据持久化正常
- ✅ 页面快速流畅
- ✅ 单元测试通过
- ✅ API 文档完整
- ✅ 代码规范清晰
- ✅ 可以安全部署

---

## 🚀 现在开始！

1. **第一步**: 读 README.md (5 分钟)
2. **第二步**: 读 proposal.md (10 分钟)
3. **第三步**: 运行"快速开始"部分 (10 分钟)
4. **第四步**: 选择前端或后端，读相关部分的 design.md
5. **第五步**: 查看 tasks.md 中你的任务列表
6. **第六步**: 开始编码！💻

---

**祝开发顺利！** 🎊

更多信息，见 INDEX.md
