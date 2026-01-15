# 🚀 应用启动指南 (最终版)

**最后更新**: 2026-01-14

---

## ✅ 应用已成功启动

前端应用和后端服务已经运行！

### 🌐 立即访问应用

```
http://localhost:5173
```

### 👥 使用测试账户登录

```
邮箱:  user1@test.com
密码:  password123
```

---

## 📂 推荐的启动方式

### 方式 1: 使用改进的启动脚本 (推荐)

```powershell
D:\coze\start_app_fixed.bat
```

**优点**:

- ✅ 自动清理旧进程
- ✅ 自动安装依赖
- ✅ 启动更稳定
- ✅ 错误提示清晰

### 方式 2: 使用简化启动脚本

```powershell
D:\coze\start_app_simple.bat
```

### 方式 3: 手动启动 (完全控制)

**启动后端** (Terminal 1):

```powershell
cd D:\coze\backend
npm run dev
```

**启动前端** (Terminal 2):

```powershell
cd D:\coze\frontend
npm run dev
```

---

## 🎯 快速测试

### 步骤 1: 打开应用

```
http://localhost:5173
```

### 步骤 2: 登录

- 邮箱: user1@test.com
- 密码: password123

### 步骤 3: 浏览功能

- 首页 - 应用入口
- 活动列表 - 浏览所有活动
- 发现用户 - 搜索其他用户
- 我的活动 - 查看参加的活动
- 个人资料 - 编辑用户信息

### 步骤 4: 测试功能

- 创建新活动
- 参加活动
- 编辑资料
- 上传头像

---

## ⚙️ 环境检查

### 检查 Node.js

```powershell
node -v        # 应输出版本号，如 v18.x.x
npm -v         # 应输出版本号，如 9.x.x
```

### 检查后端

```powershell
cd D:\coze\backend
Get-ChildItem | Where-Object {$_.Name -match "package.json"}  # 应显示 package.json
```

### 检查前端

```powershell
cd D:\coze\frontend
Get-ChildItem | Where-Object {$_.Name -match "package.json"}  # 应显示 package.json
```

### 检查 MySQL

```powershell
mysql -u root -p -e "SHOW DATABASES;"  # 应显示 hiking_app 数据库
```

---

## 🐛 常见问题

### 问题: 端口已被占用

**错误信息**:

```
Error: listen EADDRINUSE: address already in use :::3000
Error: listen EADDRINUSE: address already in use :::5173
```

**解决方案**:

```powershell
# 杀死占用端口的进程
taskkill /im node.exe /F

# 或指定端口杀死
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

---

### 问题: npm install 失败

**解决方案**:

```powershell
# 清除缓存
npm cache clean --force

# 删除node_modules
cd D:\coze\backend
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json

# 重新安装
npm install

# 同样对前端进行操作
cd D:\coze\frontend
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install
```

---

### 问题: 数据库连接失败

**解决方案**:

```powershell
# 1. 检查MySQL是否运行
netstat -ano | findstr :3306

# 2. 启动MySQL (如果未运行)
net start MySQL80

# 3. 验证数据库存在
mysql -u root -p -e "USE hiking_app; SHOW TABLES;"

# 4. 检查.env配置
cat D:\coze\backend\.env | findstr DB_
```

---

### 问题: 页面白屏

**解决方案**:

1. 按 F12 打开开发者工具
2. 查看 Console 标签页中的错误信息
3. 检查 Network 标签页中的请求状态
4. 尝试 Ctrl+Shift+R 硬刷新页面
5. 清除浏览器缓存和 localStorage

---

### 问题: API 无法连接

**解决方案**:

```powershell
# 1. 验证后端运行
Get-Process node -ErrorAction SilentlyContinue

# 2. 检查后端日志
# 查看后端终端窗口中的错误信息

# 3. 验证API连接
curl http://localhost:3000/api/v1

# 4. 检查CORS配置
cat D:\coze\backend\.env | findstr CORS
```

---

## 📊 验证服务状态

```powershell
# 检查Node进程
Get-Process node -ErrorAction SilentlyContinue | Select-Object Id, Name, HandleCount

# 检查端口
netstat -ano | findstr :3000    # 后端
netstat -ano | findstr :5173    # 前端
netstat -ano | findstr :3306    # MySQL

# 测试连接
$null = Invoke-WebRequest -Uri http://localhost:3000/api/v1 -ErrorAction SilentlyContinue -TimeoutSec 3
if ($?) { Write-Host "后端服务正常" } else { Write-Host "后端服务异常" }

$null = Invoke-WebRequest -Uri http://localhost:5173 -ErrorAction SilentlyContinue -TimeoutSec 3
if ($?) { Write-Host "前端应用正常" } else { Write-Host "前端应用异常" }
```

---

## 🛑 停止应用

### 方式 1: 关闭终端窗口

直接关闭后端和前端的 CMD 窗口

### 方式 2: 使用快捷键

在 CMD 窗口中按 `Ctrl+C` 并确认

### 方式 3: 命令行关闭

```powershell
taskkill /im node.exe /F
```

---

## 📚 相关文档

| 文档                             | 用途             |
| -------------------------------- | ---------------- |
| **START_HERE.md**                | 项目入门指南     |
| **QUICK_START.md**               | 快速启动详细步骤 |
| **README_CN.md**                 | 完整项目文档     |
| **TROUBLESHOOTING_START_APP.md** | 启动问题排查     |
| **APP_STARTED_SUCCESSFULLY.md**  | 成功启动后的说明 |

---

## 💡 开发提示

### 热重载

- 修改文件后自动重新加载
- 后端和前端都支持热重载
- 只需保存文件，刷新浏览器即可看到更改

### 调试

- 使用 F12 开发者工具调试前端
- 在后端终端窗口查看日志
- 使用 Postman 测试 API

### 性能

- 首次启动较慢 (依赖下载和编译)
- 之后启动更快
- 开发期间定期清除浏览器缓存

---

## ✨ 现在就开始

### 1. 启动应用

```powershell
D:\coze\start_app_fixed.bat
```

### 2. 打开浏览器

```
http://localhost:5173
```

### 3. 登录应用

```
邮箱:  user1@test.com
密码:  password123
```

### 4. 探索功能

- 浏览活动
- 编辑资料
- 创建活动
- 搜索用户

---

## 🎓 学习资源

- **Vue.js**: https://vuejs.org/
- **Express.js**: https://expressjs.com/
- **Pinia**: https://pinia.vuejs.org/
- **Sequelize**: https://sequelize.org/

---

## 📞 获取帮助

1. 📖 查看 README_CN.md
2. 🔧 查看 TROUBLESHOOTING_START_APP.md
3. 🚀 查看 QUICK_START.md
4. 📊 查看 RUNTIME_STATUS.md

---

## ✅ 检查清单

- [ ] Node.js 已安装 (版本 >= 14)
- [ ] npm 已安装 (版本 >= 6)
- [ ] MySQL 正在运行
- [ ] D:\coze\backend 目录存在
- [ ] D:\coze\frontend 目录存在
- [ ] 后端启动成功 (http://localhost:3000)
- [ ] 前端启动成功 (http://localhost:5173)
- [ ] 可以登录应用
- [ ] 可以浏览活动列表
- [ ] 可以编辑个人资料

---

**应用已就绪！开始使用吧！** 🎉

**访问**: http://localhost:5173
**账户**: user1@test.com / password123

_祝您开发愉快！_ 👋
