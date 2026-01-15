# 🚀 快速启动指南

本指南将帮助你在 **10 分钟内** 完成项目的本地部署并进行测试。

---

## 📋 前置要求

确保你已安装以下软件：

| 软件    | 最低版本 | 检查命令          |
| ------- | -------- | ----------------- |
| Node.js | 18.0+    | `node --version`  |
| npm     | 9.0+     | `npm --version`   |
| MySQL   | 8.0+     | `mysql --version` |

---

## 🔧 第一步：安装依赖（3 分钟）

```powershell
# 1. 进入后端目录
cd backend
npm install

# 2. 进入前端目录
cd ../frontend
npm install

# 3. 返回根目录
cd ..
```

---

## 🗄️ 第二步：设置数据库（2 分钟）

```powershell
# 1. 启动 MySQL（如果未启动）
# 方法 A: Windows 服务
net start MySQL80

# 方法 B: XAMPP/WAMP
# 通过控制面板启动 MySQL 服务

# 2. 登录 MySQL
mysql -u root -p

# 3. 创建数据库并导入表结构
CREATE DATABASE hiking_social CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hiking_social;
SOURCE backend/src/database/init.sql;

# 4. 验证表是否创建成功
SHOW TABLES;

# 应显示 5 个表:
# - activities
# - participations
# - user_photos
# - user_preferences
# - users

# 5. 退出 MySQL
exit;
```

---

## ⚙️ 第三步：配置环境变量（2 分钟）

### 后端配置

```powershell
# 1. 复制环境变量模板
cd backend
Copy-Item .env.example .env

# 2. 编辑 .env 文件
notepad .env
```

修改以下配置：

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=你的MySQL密码
DB_NAME=hiking_social

# JWT 密钥（生产环境请使用强密码）
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# 服务器配置
PORT=3000
NODE_ENV=development

# CORS 配置
CORS_ORIGIN=http://localhost:5173
```

### 前端配置（可选）

```powershell
cd ../frontend

# 如果需要自定义 API 地址，创建 .env 文件
echo VITE_API_BASE_URL=http://localhost:3000/api/v1 > .env
```

---

## 🎬 第四步：启动服务（1 分钟）

### 打开两个终端窗口

**终端 1 - 启动后端：**

```powershell
cd backend
npm run dev
```

看到以下输出表示成功：

```
[2024-01-15 10:30:00] INFO: Server running on port 3000
[2024-01-15 10:30:00] INFO: Database connected successfully
```

**终端 2 - 启动前端：**

```powershell
cd frontend
npm run dev
```

看到以下输出表示成功：

```
  VITE v5.0.0  ready in 1234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## ✅ 第五步：验证功能（2 分钟）

### 方法 A：使用测试脚本（推荐）

```powershell
# 在根目录运行
node test-api.js
```

如果所有测试通过，你应该看到：

```
✅ 通过: 8
❌ 失败: 0
📊 总计: 8
```

### 方法 B：手动测试

1. **访问前端应用**

   - 打开浏览器访问 `http://localhost:5173`

2. **注册新用户**

   - 点击「注册」按钮
   - 填写邮箱、昵称、密码（≥8 位）
   - 提交注册

3. **登录系统**

   - 使用刚注册的账号登录
   - 成功后自动跳转到首页

4. **创建活动**

   - 点击「发布活动」
   - 填写活动信息
   - 提交创建

5. **浏览活动**

   - 在「发现」页查看活动列表
   - 点击活动查看详情
   - 尝试参加活动

6. **个人中心**
   - 查看「我的徒步」
   - 编辑个人资料
   - 查看统计数据

---

## 🐛 常见问题

### 问题 1: 数据库连接失败

**错误信息：** `Error: connect ECONNREFUSED 127.0.0.1:3306`

**解决方法：**

1. 确认 MySQL 服务已启动
2. 检查 `.env` 文件中的数据库配置
3. 验证数据库用户名和密码

```powershell
# 检查 MySQL 服务状态
Get-Service MySQL80

# 如果未运行，启动服务
Start-Service MySQL80
```

### 问题 2: 端口被占用

**错误信息：** `Error: listen EADDRINUSE: address already in use :::3000`

**解决方法：**

```powershell
# 查找占用端口的进程
netstat -ano | findstr :3000

# 结束进程（替换 <PID> 为实际进程ID）
taskkill /PID <PID> /F

# 或者修改端口
# 在 backend/.env 中修改 PORT=3001
```

### 问题 3: npm install 失败

**错误信息：** `ERESOLVE unable to resolve dependency tree`

**解决方法：**

```powershell
# 清除缓存
npm cache clean --force

# 删除 node_modules 和 package-lock.json
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json

# 重新安装
npm install --legacy-peer-deps
```

### 问题 4: JWT Token 验证失败

**错误信息：** `401 Unauthorized`

**解决方法：**

1. 确认 `JWT_SECRET` 在前后端一致
2. 检查浏览器 LocalStorage 中的 token
3. 尝试重新登录

```javascript
// 在浏览器控制台执行
localStorage.getItem('token')
// 应该返回一个 JWT token 字符串
```

---

## 📊 功能检查清单

完成以下检查以确保系统正常运行：

- [ ] 后端服务在 3000 端口运行
- [ ] 前端服务在 5173 端口运行
- [ ] 数据库连接成功
- [ ] 用户注册功能正常
- [ ] 用户登录功能正常
- [ ] Token 自动注入和刷新
- [ ] 创建活动功能正常
- [ ] 活动列表显示正常
- [ ] 参加活动功能正常
- [ ] 个人信息更新正常

---

## 🎯 下一步

恭喜！你已经成功启动了徒步社交应用。接下来你可以：

1. **完善功能**

   - 实现图片上传服务
   - 添加实时聊天功能（Socket.io）
   - 完善推荐算法

2. **优化体验**

   - 添加加载动画
   - 优化移动端适配
   - 添加骨架屏

3. **测试部署**

   - 编写单元测试
   - 配置生产环境
   - 部署到服务器

4. **阅读文档**
   - `PROJECT_STATUS.md` - 项目状态和统计
   - `README.md` - 完整开发文档
   - `openspec/` - 技术规格说明

---

## 💡 开发提示

### 热重载

- **前端**: 保存文件后自动刷新浏览器
- **后端**: 使用 nodemon 自动重启服务

### 调试技巧

```powershell
# 后端日志
# 日志文件: backend/logs/app.log

# 查看实时日志
Get-Content backend/logs/app.log -Wait

# 前端开发工具
# 浏览器 F12 -> Console / Network / Application
```

### 数据库管理

```powershell
# 推荐工具
# - MySQL Workbench (官方)
# - DBeaver (跨平台)
# - phpMyAdmin (Web界面)

# 快速查询
mysql -u root -p hiking_social -e "SELECT COUNT(*) FROM users;"
```

---

## 📞 获取帮助

如遇到问题，请检查：

1. **日志文件**: `backend/logs/app.log`
2. **浏览器控制台**: F12 -> Console
3. **网络请求**: F12 -> Network
4. **数据库状态**: MySQL Workbench

---

**祝你开发顺利！🎉**
