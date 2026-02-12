# 📱 iOS 打包快速指南 - 立即开始

**目标**: 在 iOS 18.6.2 上打包并测试徒步社交 App

---

## 🚀 一键快速开始 (5 分钟)

### Windows 用户

```powershell
# 1. 打开 PowerShell
cd d:\coze

# 2. 执行打包脚本
.\QUICK_IOS_BUILD.ps1 -BuildType debug

# 3. 脚本将：
# - 安装依赖
# - 构建前端
# - 初始化 Capacitor
# - 生成 iOS 项目
```

### macOS 用户

```bash
# 1. 打开终端
cd /path/to/coze

# 2. 执行打包脚本
bash QUICK_IOS_BUILD.sh debug

# 3. 脚本将自动构建并打开 Xcode
# 4. 在 Xcode 中点击 Run 按钮
```

---

## 🔧 手动步骤 (如果脚本失败)

### Step 1: 安装 Capacitor

```bash
cd frontend

# 安装全局 CLI
npm install -g @capacitor/cli

# 安装依赖
npm install @capacitor/core @capacitor/ios @capacitor/geolocation @capacitor/camera @capacitor/filesystem
```

### Step 2: 初始化项目

```bash
# 首次初始化
npx @capacitor/cli init

# 输入:
# App ID: com.hikingsocial.app
# App Name: 徒步社交

# 添加 iOS 支持
npx @capacitor/cli add ios
```

### Step 3: 构建前端

```bash
npm run build

# 同步到 iOS
npx cap sync ios
```

### Step 4: 在 Xcode 中打开项目

```bash
# 打开 iOS 项目
npx cap open ios
```

---

## 📊 Xcode 打包步骤

### 方案 A: 直接在真机运行 (推荐用于开发)

1. **连接 iPhone**
   - 用 USB 连接到 Mac
   - 信任此计算机

2. **在 Xcode 中**
   - 顶部下拉菜单选择 "App" scheme
   - 选择连接的 iPhone 设备
   - 点击 Run 按钮 (▶️ 或 Cmd+R)
   - 等待构建完成 (~2-3 分钟)

3. **在 iPhone 上**
   - 去往 Settings > General > VPN & Device Management
   - 信任你的证书
   - 打开 App

### 方案 B: 生成 IPA 文件 (用于分发)

1. **在 Xcode 中**
   - Product > Archive
   - 等待构建完成

2. **在弹出的 Organizer 中**
   - 选择最新的 Archive
   - 点击 "Distribute App"
   - 选择 "Ad Hoc" (用于测试) 或 "App Store" (用于上架)
   - 下载签名证书和描述文件 (如需要)
   - 导出 IPA 文件

3. **使用 Transporter 上传**
   - App Store Connect > TestFlight
   - 添加测试人员邮箱
   - 共享测试链接

### 方案 C: 安装预构建的 IPA (最快)

使用 Apple Configurator 2:

```bash
# Mac App Store 下载 Apple Configurator 2

# 然后:
# 1. 连接 iPhone
# 2. 打开 Apple Configurator 2
# 3. 将 IPA 文件拖到 iPhone 上
# 4. 点击"安装"
```

---

## 🧪 iOS 18.6.2 测试检查清单

### 启动与认证

- [ ] App 启动无崩溃
- [ ] 显示登录页面
- [ ] 注册新账号成功
- [ ] 登录已有账号成功
- [ ] 首页加载 < 2 秒

### 页面导航

- [ ] 底部 Tab 导航正常
- [ ] 所有页面都可以访问
- [ ] 返回按钮工作正常
- [ ] 页面切换流畅

### 用户功能

- [ ] 浏览推荐用户
- [ ] 进入用户详情页
- [ ] 点击"关注"成功
- [ ] 显示关注人数更新

### 消息功能

- [ ] 进入私信页面
- [ ] 发送消息成功
- [ ] 接收消息 (需要双设备)
- [ ] 消息实时显示

### 活动功能

- [ ] 浏览活动列表
- [ ] 查看活动详情
- [ ] 点击"参加"成功
- [ ] 参加人数更新

### 设备特定功能

- [ ] 允许地理定位权限
- [ ] 允许相机权限
- [ ] 允许相册权限
- [ ] 拍照上传成功
- [ ] 从相册选择图片

### 网络与性能

- [ ] WiFi 下加载速度正常
- [ ] 蜂窝网络下可用
- [ ] 网络切换无崩溃
- [ ] 后台暂停/恢复正常
- [ ] 没有内存泄漏 (观察内存占用)

### 错误处理

- [ ] 网络超时显示友好提示
- [ ] 登录过期自动刷新 token
- [ ] 操作失败显示错误信息
- [ ] 长期未操作不会超时退出

---

## 📱 配置文件说明

### capacitor.config.json

```json
{
  "appId": "com.hikingsocial.app", // 应用唯一标识
  "appName": "徒步社交", // App Store 显示名称
  "webDir": "dist", // Vue 构建输出目录
  "server": {
    "ioscheme": "https" // iOS 使用 HTTPS
  },
  "plugins": {
    "Geolocation": {}, // 地理定位插件
    "Camera": {}, // 相机插件
    "Filesystem": {} // 文件系统插件
  }
}
```

### ExportOptions.plist

- 配置 Ad Hoc 签名
- 指定临时配置文件
- 用于自动化导出 IPA

---

## 🔐 证书与签名

### 首次打包需要

1. **开发者账号**
   - Apple ID
   - $99/年 Apple Developer Program

2. **证书**
   - 开发证书 (Development Certificate)
   - 分发证书 (Distribution Certificate)

3. **配置文件**
   - 开发配置文件 (Development Profile)
   - Ad Hoc 配置文件 (Ad Hoc Profile)

### 自动签名 (推荐)

- Xcode 可以自动生成证书
- Signing & Capabilities > Automatically manage signing
- 选择 Team

### 手动签名

- Apple Developer 后台创建证书
- 下载并导入到 Keychain
- 在 Xcode 中选择相应证书

---

## 📈 构建优化

### 减少包体积

```bash
# 检查包大小
du -sh frontend/dist

# 启用 gzip 压缩 (vite.config.ts)
npm install vite-plugin-compression
```

### 加快构建速度

```bash
# 并行构建
npm run build -- --mode production

# 分析构建产物
npm run build -- --analyze
```

### 性能分析

```bash
# 使用 Lighthouse (Chrome DevTools)
# 检查性能指标
# - First Contentful Paint (FCP) < 1.5s
# - Largest Contentful Paint (LCP) < 2.5s
# - Cumulative Layout Shift (CLS) < 0.1
```

---

## 🐛 常见问题

### Q: 编译错误 "Cannot find module"

**A**: 删除 node_modules，重新安装

```bash
rm -rf node_modules package-lock.json
npm install
```

### Q: 签名错误 "Provisioning profile failed to verify"

**A**:

1. Xcode > Preferences > Accounts
2. 添加 Apple ID
3. 点击 "Manage Certificates"
4. 创建新的开发证书

### Q: App 在真机上崩溃

**A**:

1. 检查控制台日志: Xcode > Window > Devices and Simulators > 选择设备 > View Device Logs
2. 查看最后一条错误日志
3. 常见原因: permission denied, network timeout, memory shortage

### Q: WebSocket 连接失败

**A**:

1. 确保后端正在运行: `npm run dev` 在 backend 目录
2. 检查 API 地址是否正确 (frontend/src/api/http.ts)
3. 确保防火墙允许连接

### Q: 消息实时性差

**A**:

1. 检查 WebSocket 连接状态
2. 查看网络 latency
3. 尝试 WiFi 而不是蜂窝网络

---

## 📚 更多资源

### 官方文档

- [Capacitor 文档](https://capacitorjs.com)
- [iOS 开发指南](https://developer.apple.com/ios)
- [Xcode 文档](https://help.apple.com/xcode)

### 项目文档

- [iOS 优化方案](./iOS_OPTIMIZATION_AND_PACKAGING_PLAN.md)
- [后端 API 文档](./backend/README.md)
- [前端代码文档](./frontend/README.md)

### 技术栈

- Vue 3 + TypeScript
- Capacitor (跨端框架)
- Express.js (后端)
- Socket.io (实时通信)

---

## ✨ 打包完成后

### 立即测试

```bash
# 在真机上打开 App
# 执行测试检查清单中的所有项
```

### 收集反馈

```
测试期间记录:
- 功能是否正常
- 性能是否可以接受
- 是否有崩溃或错误
- 用户体验是否流畅
```

### 部署上线

```
1. TestFlight 测试 (内部 + 外部测试人员)
2. 收集反馈和 bug 报告
3. 迭代修复
4. 提交 App Store 审核
5. 发布上线
```

---

**祝打包顺利！🚀**
