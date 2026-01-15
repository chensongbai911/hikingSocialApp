# 🔧 start_app.bat 启动故障排除指南

**更新时间**: 2026-01-14

---

## ❌ 常见错误及解决方案

### 错误 1: "未检测到 Node.js"

**症状**:

```
❌ 错误: 未检测到 Node.js
请先安装 Node.js
```

**原因**: Node.js 未安装或未添加到环境变量

**解决方案**:

1. 下载安装 Node.js: https://nodejs.org/
2. 确保选择 "Add to PATH" 选项
3. 重启 CMD 或 PowerShell
4. 验证安装: `node -v` 和 `npm -v`

---

### 错误 2: "未检测到 npm"

**症状**:

```
❌ 错误: 未检测到 npm
```

**原因**: npm 未正确安装

**解决方案**:

```powershell
# 检查npm版本
npm -v

# 如果失败，重新安装Node.js
# 或更新npm
npm install -g npm@latest
```

---

### 错误 3: "找不到目录"

**症状**:

```
D:\coze\backend找不到或不存在
```

**原因**: 路径错误或目录被删除

**解决方案**:

```powershell
# 检查目录是否存在
Get-ChildItem D:\coze\

# 如果backend或frontend不存在，需要重新创建项目结构
```

---

### 错误 4: "端口已被占用"

**症状**:

```
Error: listen EADDRINUSE: address already in use :::5173
Error: listen EADDRINUSE: address already in use :::3000
```

**原因**: 端口 3000 或 5173 已被其他程序占用

**解决方案**:

```powershell
# 查看占用端口的进程
netstat -ano | findstr :3000
netstat -ano | findstr :5173

# 杀死占用端口的进程 (PID替换为上面查到的ID)
taskkill /PID <PID> /F

# 或者直接杀死所有Node进程
taskkill /im node.exe /F
```

---

### 错误 5: "npm install 失败"

**症状**:

```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**原因**: 依赖版本冲突

**解决方案**:

```powershell
# 方案1: 清除缓存并重新安装
npm cache clean --force
cd D:\coze\backend
rm -r node_modules package-lock.json
npm install

# 方案2: 强制安装
npm install --legacy-peer-deps
```

---

### 错误 6: "数据库连接失败"

**症状**:

```
Error: connect ECONNREFUSED 127.0.0.1:3306
Error: Cannot establish MySQL connection
```

**原因**: MySQL 未运行或配置错误

**解决方案**:

```powershell
# 1. 检查MySQL是否运行
Get-Service MySQL* | Format-Table -AutoSize

# 2. 启动MySQL (Windows)
net start MySQL80

# 3. 验证MySQL连接
mysql -u root -p -e "SELECT 1"

# 4. 检查.env配置
cat D:\coze\backend\.env | findstr DB_
```

---

### 错误 7: "npm run dev 卡住"

**症状**:

```
构建开始后没有完成，一直在等待
```

**原因**: 构建过程被阻塞

**解决方案**:

```powershell
# 1. 停止脚本 (Ctrl+C)
# 2. 清除缓存
npm cache clean --force

# 3. 删除node_modules和lock文件
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json

# 4. 重新安装
npm install

# 5. 重新启动
npm run dev
```

---

## 🚀 手动启动应用 (当脚本失败时)

### 方法 1: 分别启动后端和前端

**启动后端** (CMD/PowerShell 1):

```powershell
cd D:\coze\backend
npm install
npm run dev
```

**启动前端** (CMD/PowerShell 2):

```powershell
cd D:\coze\frontend
npm install
npm run dev
```

### 方法 2: 使用简化启动脚本

```powershell
D:\coze\start_app_simple.bat
```

### 方法 3: 使用 npm start (生产模式)

```powershell
# 后端
cd D:\coze\backend
npm start

# 前端 (另一个终端)
cd D:\coze\frontend
npm run build
npm run preview
```

---

## ✅ 完整检查清单

使用以下命令检查环境设置:

```powershell
# 1. 检查Node版本
node -v

# 2. 检查npm版本
npm -v

# 3. 检查后端目录
Get-ChildItem D:\coze\backend\src

# 4. 检查前端目录
Get-ChildItem D:\coze\frontend\src

# 5. 检查Node进程
Get-Process node -ErrorAction SilentlyContinue

# 6. 检查端口占用
netstat -ano | findstr :3000
netstat -ano | findstr :5173
netstat -ano | findstr :3306

# 7. 检查MySQL
mysql -u root -p -e "SHOW DATABASES;"

# 8. 检查环境变量
Get-ChildItem -Path "D:\coze\backend\.env"
Get-ChildItem -Path "D:\coze\frontend\.env"
```

---

## 🔍 诊断步骤

### 步骤 1: 验证环境

```powershell
# 运行这个脚本来诊断问题
$checks = @{
    'Node.js' = { node -v }
    'npm' = { npm -v }
    'Backend目录' = { Test-Path D:\coze\backend }
    'Frontend目录' = { Test-Path D:\coze\frontend }
    'MySQL端口' = { Test-NetConnection localhost -Port 3306 }
}

foreach ($check in $checks.GetEnumerator()) {
    Write-Host "检查 $($check.Name)..." -ForegroundColor Yellow
    try {
        & $check.Value
        Write-Host "✅ 通过" -ForegroundColor Green
    } catch {
        Write-Host "❌ 失败: $_" -ForegroundColor Red
    }
}
```

### 步骤 2: 清除缓存

```powershell
# 清除npm缓存
npm cache clean --force

# 清除Node modules
cd D:\coze\backend
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue

cd D:\coze\frontend
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
```

### 步骤 3: 重新安装依赖

```powershell
# 后端
cd D:\coze\backend
npm install

# 前端
cd D:\coze\frontend
npm install
```

### 步骤 4: 验证启动

```powershell
# 后端
cd D:\coze\backend
npm run dev

# 前端 (新终端)
cd D:\coze\frontend
npm run dev

# 访问应用
# http://localhost:5173 (前端)
# http://localhost:3000 (后端)
```

---

## 💡 最佳实践

### ✅ 推荐做法

1. **使用简化脚本**: `start_app_simple.bat`
2. **分别启动**: 在两个独立的终端中启动
3. **检查日志**: 观察终端输出中的错误信息
4. **定期清理**: 每周清除缓存和 node_modules
5. **更新工具**: 定期更新 Node.js 和 npm

### ❌ 避免做法

1. 不要在启动脚本中关闭窗口
2. 不要删除.env 文件
3. 不要修改数据库配置而不更新.env
4. 不要在脚本运行时关闭终端
5. 不要使用旧版本的 Node.js

---

## 🆘 获取帮助

### 如果仍然无法解决

1. **检查日志文件**

   ```powershell
   # 查看后端日志
   cat D:\coze\backend\logs\*.log

   # 查看前端日志
   cat D:\coze\frontend\logs\*.log
   ```

2. **查看错误消息**

   - 截图错误信息
   - 记录完整的错误堆栈跟踪
   - 记录运行的命令

3. **查看相关文档**

   - QUICK_START.md - 快速启动指南
   - README_CN.md - 完整项目文档
   - RUNTIME_STATUS.md - 运行状态报告

4. **使用调试模式**
   ```powershell
   # 启用详细日志
   $env:DEBUG = '*'
   npm run dev
   ```

---

## 📋 快速参考

| 问题           | 解决方案                             |
| -------------- | ------------------------------------ |
| Node.js 未找到 | 安装 Node.js 并添加 PATH             |
| npm 失败       | 清除缓存: `npm cache clean --force`  |
| 端口占用       | 杀死进程: `taskkill /im node.exe /F` |
| 依赖冲突       | 重新安装: `rm -r node_modules`       |
| MySQL 连接失败 | 启动 MySQL: `net start MySQL80`      |
| 样式未加载     | 清除浏览器缓存: Ctrl+Shift+Del       |
| 页面白屏       | 检查 F12 控制台错误                  |
| API 不工作     | 检查后端日志和.env 配置              |

---

## 🎯 下一步

如果所有检查都通过，但应用仍然无法运行：

1. ✅ 检查 QUICK_START.md 的完整启动指南
2. ✅ 检查 README_CN.md 的项目文档
3. ✅ 查看 RUNTIME_STATUS.md 的运行状态说明
4. ✅ 手动启动后端和前端，观察详细的错误信息

---

**问题解决了吗？**

✅ 是 → 访问 http://localhost:5173 开始使用
❌ 否 → 提供错误截图和日志，获取更多帮助

**祝您使用愉快！** 👋
