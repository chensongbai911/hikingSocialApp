HikingSocialApp iOS 集成指南

# Lynx Framework 集成指南

## 前置要求

1. macOS 系统
2. Xcode 13.0 或更高版本
3. CocoaPods 1.11.0 或更高版本
4. Node.js 16.0 或更高版本

## 快速开始

### 1. 安装依赖

```bash
# 安装 CocoaPods (如果还未安装)
sudo gem install cocoapods

# 进入 iOS 目录
cd ios

# 安装 iOS 依赖
pod install
```

### 2. 构建 JavaScript Bundle

```bash
# 在项目根目录
cd ..

# 安装前端依赖
cd frontend
npm install

# 构建用于 iOS 的 Bundle
npm run build:ios
```

### 3. 打开 Xcode 项目

```bash
cd ../ios
open HikingSocialApp.xcworkspace
```

### 4. 配置项目

在 Xcode 中：

1. 选择你的开发团队 (Signing & Capabilities)
2. 修改 Bundle Identifier (如: com.yourcompany.hikingsocialapp)
3. 配置高德地图 API Key 在 `Info.plist` 中

### 5. 运行应用

1. 选择模拟器或真机
2. 点击 Run 按钮 (⌘R)

## 项目结构

```
ios/
├── Podfile                       # CocoaPods 依赖配置
├── HikingSocialApp/              # 主应用目录
│   ├── AppDelegate.swift        # 应用委托
│   ├── Info.plist              # 应用配置
│   ├── Assets.xcassets/        # 资源文件
│   └── Lynx/                   # Lynx 相关代码
│       ├── LynxBridge.swift    # Lynx 桥接
│       └── Modules/            # 自定义模块
└── HikingSocialApp.xcworkspace   # Xcode 工作空间
```

## Lynx 配置

### JavaScript Bundle 路径

开发环境：

- 从本地开发服务器加载: `http://localhost:5173`

生产环境：

- 从应用 Bundle 加载: `main.jsbundle`

### 原生模块

已集成的原生模块：

- 高德地图 (AMap3DMap)
- 高德搜索 (AMapSearch)
- 高德定位 (AMapLocation)
- 相机和相册访问
- 网络请求

## 调试

### 启用 Lynx DevTools

```swift
#if DEBUG
LynxConfig.enableDevtools = true
#endif
```

### 查看日志

在 Xcode Console 中查看 Lynx 日志：

```
LynxLog: [...]
```

## 构建生产版本

### 1. 构建 JavaScript Bundle

```bash
cd frontend
npm run build:ios:production
```

### 2. Archive 项目

在 Xcode 中：

1. Product > Archive
2. 选择 Archive
3. 点击 "Distribute App"
4. 选择发布方式 (App Store / Ad Hoc / Enterprise)

## 常见问题

### Q: Pod install 失败

A: 尝试更新 CocoaPods 仓库

```bash
pod repo update
pod install --repo-update
```

### Q: Lynx 加载失败

A: 检查 JavaScript Bundle 路径是否正确

### Q: 地图不显示

A: 确保在 Info.plist 中配置了高德地图 API Key

## 性能优化

1. 启用 JavaScript 压缩
2. 启用图片压缩
3. 使用代码分割
4. 懒加载非关键模块

## 更多资源

- [Lynx 官方文档](https://lynxjs.org/zh/)
- [高德地图 iOS SDK](https://lbs.amap.com/api/ios-sdk/summary)
- [Xcode 文档](https://developer.apple.com/xcode/)
