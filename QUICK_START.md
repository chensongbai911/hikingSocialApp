# 🚀 徒步社交应用 v1.1.0 - 快速访问指南

## 当前运行状态 ✅

**更新时间**: 2026-01-14 14:05
**状态**: 🟢 **全部服务正常运行**

---

## 🌐 快速链接

### 前端应用

- **主页**: [http://localhost:5173](http://localhost:5173)
- **活动列表**: [http://localhost:5173/activities](http://localhost:5173/activities)
- **我的活动**: [http://localhost:5173/my-activities](http://localhost:5173/my-activities)
- **消息**: [http://localhost:5173/messages](http://localhost:5173/messages)
- **个人资料**: [http://localhost:5173/profile](http://localhost:5173/profile)

### 后端 API

- **API 基础 URL**: `http://localhost:3000/api/v1`
- **认证**: `/auth/register`, `/auth/login`, `/auth/logout`
- **用户**: `/users`, `/users/:id`, `/users/:id/profile`
- **活动**: `/activities`, `/activities/:id`, `/activities/create`
- **消息**: `/conversations`, `/messages`, `/messages/:id`

### 实时服务

- **WebSocket**: `http://localhost:3000` (Socket.io)
- **消息事件**: `message:send`, `message:receive`, `typing:status`

---

## 👥 测试账户

### 账户 1

```
邮箱: user1@test.com
密码: password123
用户名: TestUser1
头像: 默认头像
```

### 账户 2

```
邮箱: user2@test.com
密码: password123
用户名: TestUser2
头像: 默认头像
```

### 快速登录步骤

1. 访问 [http://localhost:5173](http://localhost:5173)
2. 点击"登录"按钮
3. 输入上述任一账户的邮箱和密码
4. 点击"登录"按钮
5. 自动跳转到首页

---

## 📱 主要功能测试

### 1️⃣ 用户认证

- [x] 注册新用户
- [x] 登录已有账户
- [x] 修改个人资料
- [x] 上传头像
- [x] 登出系统

**测试地址**: [http://localhost:5173/login](http://localhost:5173/login)

### 2️⃣ 活动管理

- [x] 浏览活动列表
- [x] 搜索活动
- [x] 筛选活动类别
- [x] 查看活动详情
- [x] 参加活动
- [x] 取消参加

**测试地址**: [http://localhost:5173/activities](http://localhost:5173/activities)

### 3️⃣ 实时消息（v1.1.0 新增）

- [x] 查看对话列表
- [x] 打开聊天窗口
- [x] 显示用户信息
- [x] 输入消息框
- [ ] 发送消息（需完成 Socket.io 集成）
- [ ] 接收消息（需完成 Socket.io 集成）
- [ ] 消息实时显示（需完成 Socket.io 集成）

**测试地址**: [http://localhost:5173/messages](http://localhost:5173/messages)

### 4️⃣ 个人资料

- [x] 查看用户资料
- [x] 编辑基本信息
- [x] 上传头像
- [x] 管理偏好设置
- [x] 查看参加的活动

**测试地址**: [http://localhost:5173/profile](http://localhost:5173/profile)

---

## 🔧 常见问题快速解决

### ❌ 无法访问前端

**症状**: 浏览器无法连接到 localhost:5173

**解决**:

```powershell
# 1. 检查前端服务是否运行
Get-Process node | Where-Object {$_.Name -eq 'node'}

# 2. 如果未运行，启动前端服务
cd D:\coze\frontend
npm run dev
```

### ❌ 无法访问后端 API

**症状**: 网络错误或 CORS 报错

**解决**:

```powershell
# 1. 检查后端服务是否运行
Get-Process node | Where-Object {$_.Name -eq 'node'}

# 2. 如果未运行，启动后端服务
cd D:\coze\backend
npm run dev

# 3. 检查数据库连接
# 查看后端日志中是否显示 "✅ Database connection established"
```

### ❌ 样式显示不正确

**症状**: 页面看起来不美观或没有样式

**解决**:

```powershell
# 1. 清除浏览器缓存
# 按 F12 打开开发者工具
# 右键刷新按钮 -> "清空缓存并硬刷新"

# 2. 如果仍无法解决，重启前端服务
cd D:\coze\frontend
npm run dev
```

### ❌ 消息页面报错

**症状**: 打开 Messages 页面出现错误

**解决**:

```powershell
# 1. 清除浏览器缓存和localStorage
# 按 F12 -> Application -> Clear site data

# 2. 刷新页面
# Ctrl + Shift + R (硬刷新)

# 3. 如果仍有问题，检查浏览器控制台错误
# F12 -> Console -> 查看错误信息
```

---

## 📊 API 调试

### 使用 Postman 测试 API

#### 1. 注册用户

```
POST http://localhost:3000/api/v1/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123",
  "username": "testuser",
  "nickName": "Test User"
}
```

#### 2. 登录用户

```
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json

{
  "email": "user1@test.com",
  "password": "password123"
}
```

响应示例:

```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "user": {...},
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### 3. 获取用户信息

```
GET http://localhost:3000/api/v1/users/:userId
Headers:
  Authorization: Bearer {token}
```

#### 4. 获取活动列表

```
GET http://localhost:3000/api/v1/activities?page=1&pageSize=10
```

#### 5. 获取消息对话列表

```
GET http://localhost:3000/api/v1/conversations/:userId
Headers:
  Authorization: Bearer {token}
```

---

## 🎯 完整的测试流程

### 场景 1: 用户注册和登录

```
1. 访问 http://localhost:5173
2. 点击"注册"按钮
3. 填写邮箱、密码、用户名
4. 点击"注册"
5. 系统自动登录并跳转到首页
6. 验证首页正确显示用户信息
```

### 场景 2: 浏览活动

```
1. 登录系统（使用测试账户）
2. 导航到活动列表
3. 查看活动列表
4. 搜索特定活动
5. 筛选活动类别
6. 点击活动查看详情
7. 点击"参加"按钮
8. 验证参加成功
```

### 场景 3: 发送消息（v1.1.0）

```
1. 使用账户1（user1@test.com）登录
2. 导航到消息页面
3. 创建或打开与user2的对话
4. 在输入框输入消息
5. 点击发送按钮
6. 验证消息发送成功
7. 使用账户2验证消息接收
```

### 场景 4: 编辑个人资料

```
1. 登录系统
2. 导航到个人资料页面
3. 点击"编辑资料"
4. 修改用户信息
5. 上传新头像（可选）
6. 保存更改
7. 验证更改已保存
```

---

## 📁 项目文件快速导航

| 路径                            | 说明                    |
| ------------------------------- | ----------------------- |
| `D:\coze\frontend`              | 前端 Vue 应用根目录     |
| `D:\coze\frontend\src`          | 前端源代码              |
| `D:\coze\backend`               | 后端 Express 应用根目录 |
| `D:\coze\backend\src`           | 后端源代码              |
| `D:\coze\README_CN.md`          | 项目完整文档            |
| `D:\coze\COMPLETION_REPORT.md`  | v1.1.0 完成报告         |
| `D:\coze\DELIVERY_CHECKLIST.md` | 交付清单                |

---

## 🛠️ 开发工具和命令

### 前端开发命令

```powershell
# 启动开发服务器
cd D:\coze\frontend
npm run dev

# 生产构建
npm run build

# 预览构建结果
npm run preview

# 代码检查
npm run lint
```

### 后端开发命令

```powershell
# 启动开发服务器（热重载）
cd D:\coze\backend
npm run dev

# 启动生产服务器
npm start

# 运行测试
npm test

# 数据库迁移（如需要）
npm run migrate
```

---

## 💾 数据库信息

### 连接信息

```
主机: localhost
端口: 3306
用户名: root
密码: root
数据库: hiking_app
```

### 数据库表

- `users` - 用户表
- `activities` - 活动表
- `participations` - 参加关系表
- `user_preferences` - 用户偏好表
- `user_photos` - 用户相册表
- `conversations` - 消息对话表 (v1.1.0 新增)
- `messages` - 消息表 (v1.1.0 新增)

---

## 📞 获取帮助

### 常见问题

- 查看 `README_CN.md` - 完整的项目文档
- 查看 `COMPLETION_REPORT.md` - v1.1.0 的详细说明

### 检查日志

```powershell
# 后端日志（自动打印在终端）
# 查看：Database connection, Server startup, 错误信息等

# 前端日志
# 按 F12 打开开发者工具 -> Console标签页
```

---

## ✨ 现在您可以：

1. **立即开始开发** - 前端热重载开发环境已就绪
2. **进行功能测试** - 使用测试账户验证所有功能
3. **调试 API** - 使用 Postman 测试后端接口
4. **查看实时消息** - 测试 v1.1.0 新增的消息功能
5. **部署准备** - 参考部署建议进行生产配置

---

**祝您使用愉快！** 🎉

**需要帮助？** 查看上方的"获取帮助"部分或阅读详细文档 📚
