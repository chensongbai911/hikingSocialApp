# iOS 开发完成指南

## 📋 项目状态

✅ **已完成**

- iOS 项目结构创建
- Lynx 框架集成配置
- 5 个原生模块实现（高德地图、相机、定位、存储、网络）
- Info.plist 权限配置
- 构建脚本编写

⏳ **待完成**

- Xcode 项目文件生成（需要在 macOS 上使用 Xcode 创建）
- CocoaPods 依赖安装（需要在 macOS 上运行）
- 应用图标和启动屏幕设计
- App Store 发布准备

## 🚀 快速开始

### 前置要求

1. **macOS 系统**（iOS 开发必需）
2. **Xcode 13.0+**
3. **CocoaPods 1.11+**
4. **Node.js 16+**
5. **高德地图 API Key**（[申请地址](https://lbs.amap.com/)）

### 第一步：准备前端资源

在 Windows 上执行（当前系统）：

```powershell
cd d:\coze\ios
.\build.ps1
```

这会：

- 安装前端依赖
- 构建 Vue 3 应用
- 将构建产物复制到 `HikingSocialApp/Assets/` 目录

### 第二步：在 macOS 上配置项目

将整个 `ios/` 目录复制到 macOS 系统，然后执行：

```bash
cd ios
pod install
```

### 第三步：配置高德地图 API Key

编辑 `HikingSocialApp/Info.plist`：

```xml
<key>AMapAPIKey</key>
<string>YOUR_AMAP_API_KEY_HERE</string>  <!-- 替换为真实的 API Key -->
```

### 第四步：创建 Xcode 项目

在 Xcode 中：

1. **File → New → Project**
2. 选择 **iOS → App**
3. 配置项目信息：
   - Product Name: `HikingSocialApp`
   - Organization Identifier: `com.yourcompany`
   - Interface: `Storyboard`
   - Language: `Swift`
4. 保存到 `ios/` 目录

### 第五步：添加源文件到 Xcode 项目

在 Xcode 左侧项目导航器中：

1. 右键点击项目名称
2. **Add Files to "HikingSocialApp"**
3. 选择以下文件：
   - `AppDelegate.swift`
   - `SceneDelegate.swift`
   - `Lynx/Modules/` 目录下的所有 `.swift` 文件
   - `Info.plist`
   - `Assets/` 目录

### 第六步：配置项目设置

在 Xcode 中打开项目设置：

1. **General** 标签页：
   - Deployment Target: `iOS 11.0`
   - Identity: 配置 Bundle Identifier

2. **Signing & Capabilities**：
   - 勾选 **Automatically manage signing**
   - 选择开发团队

3. **Build Settings**：
   - 搜索 `IPHONEOS_DEPLOYMENT_TARGET`
   - 设置为 `11.0`

### 第七步：运行应用

1. 选择模拟器或真机
2. 点击运行按钮（⌘+R）

## 📦 项目结构

```
ios/
├── HikingSocialApp/
│   ├── AppDelegate.swift          # 应用入口，Lynx 初始化
│   ├── SceneDelegate.swift        # 场景管理
│   ├── Info.plist                 # 应用配置和权限
│   ├── Lynx/
│   │   └── Modules/               # 原生模块
│   │       ├── AMapModule.swift       # 高德地图
│   │       ├── CameraModule.swift     # 相机和相册
│   │       ├── LocationModule.swift   # 定位服务
│   │       ├── StorageModule.swift    # 本地存储
│   │       └── NetworkModule.swift    # 网络请求
│   └── Assets/                    # 前端资源（构建后）
│       └── index.html
├── Podfile                        # CocoaPods 依赖
├── build.sh                       # macOS 构建脚本
├── build.ps1                      # Windows 构建脚本
└── README.md                      # 集成指南
```

## 🔧 原生模块功能

### 1. AMapModule（高德地图）

```javascript
// JavaScript 调用示例
await window.AMap.initialize('YOUR_API_KEY')
await window.AMap.createMap({
  latitude: 39.9042,
  longitude: 116.4074,
  zoom: 15,
})
```

功能：

- ✅ 地图显示
- ✅ 添加标记
- ✅ 移动相机
- ✅ POI 搜索
- ✅ 地理编码
- ✅ 逆地理编码

### 2. CameraModule（相机）

```javascript
// 拍照
const photo = await window.Camera.takePhoto({
  allowsEditing: true,
})

// 选择照片
const image = await window.Camera.pickImage({
  allowsEditing: false,
})
```

功能：

- ✅ 拍照
- ✅ 选择相册照片
- ✅ 图片编辑
- ✅ 保存到相册
- ✅ 权限检查

### 3. LocationModule（定位）

```javascript
// 获取当前位置
const location = await window.Location.getCurrentLocation()
console.log(location.latitude, location.longitude)
```

功能：

- ✅ 单次定位
- ✅ 持续定位
- ✅ 权限管理
- ✅ 定位精度配置

### 4. StorageModule（存储）

```javascript
// 存储数据
await window.Storage.setItem('user_token', 'abc123')

// 读取数据
const token = await window.Storage.getItem('user_token')
```

功能：

- ✅ UserDefaults 存储
- ✅ 文件读写
- ✅ 目录管理
- ✅ 文件列表

### 5. NetworkModule（网络）

```javascript
// HTTP 请求
const response = await window.Network.request({
  url: 'https://api.example.com/data',
  method: 'POST',
  body: { key: 'value' },
})
```

功能：

- ✅ HTTP 请求（GET/POST/PUT/DELETE）
- ✅ 文件上传
- ✅ 文件下载
- ✅ 自定义请求头

## 🔐 权限配置

应用已配置以下权限（在 Info.plist 中）：

- 📷 **相机访问**：拍摄徒步活动照片
- 🖼️ **相册访问**：选择和保存照片
- 📍 **定位权限**：显示附近活动和记录轨迹
- 🌐 **网络访问**：API 请求和数据同步

## 🐛 调试

### 启用 Lynx DevTools

在 `AppDelegate.swift` 中，Debug 模式下自动启用：

```swift
#if DEBUG
runtime.enableDevTools(true)
#endif
```

### 查看日志

在 Xcode 控制台中查看：

- Lynx 运行时日志
- 原生模块调用日志
- JavaScript 错误

### 常见问题

1. **白屏问题**
   - 检查 bundle.js 是否正确加载
   - 确认前端资源已构建并复制到 Assets 目录

2. **地图不显示**
   - 验证高德地图 API Key 是否正确
   - 检查 Info.plist 中的配置

3. **定位失败**
   - 确认已授予定位权限
   - 在模拟器中需要手动设置位置

## 📱 App Store 发布

### 准备清单

- [ ] 配置正式版 Bundle Identifier
- [ ] 设置应用图标（1024x1024）
- [ ] 创建启动屏幕
- [ ] 准备应用截图（多种设备尺寸）
- [ ] 编写应用描述和关键词
- [ ] 配置发布证书和 Provisioning Profile
- [ ] 准备隐私政策和用户协议
- [ ] 测试所有功能
- [ ] Archive 构建并上传 App Store Connect

### 构建正式版

```bash
# 1. 切换到 Release 配置
# 2. 在 Xcode 中：Product → Archive
# 3. 上传到 App Store Connect
# 4. 提交审核
```

## 📚 参考资源

- [Lynx 官方文档](https://github.com/bytedance/lynx)
- [高德地图 iOS SDK](https://lbs.amap.com/api/ios-sdk/summary/)
- [Vue 3 文档](https://vuejs.org/)
- [Xcode 使用指南](https://developer.apple.com/xcode/)

## 🆘 获取帮助

如果遇到问题：

1. 检查 Xcode 控制台错误信息
2. 确认所有依赖已正确安装
3. 验证配置文件（Info.plist、Podfile）
4. 查看高德地图和 Lynx 官方文档

---

**现在可以在 macOS 上继续开发和发布 iOS 应用了！** 🎉
