#!/bin/bash

# 🚀 快速 iOS 打包脚本
# 用法: bash QUICK_IOS_BUILD.sh [debug|release]

set -e

BUILD_TYPE="${1:-debug}"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
IOS_DIR="$FRONTEND_DIR/ios"

echo "=================================="
echo "📱 iOS 打包脚本"
echo "=================================="
echo "构建类型: $BUILD_TYPE"
echo "项目路径: $PROJECT_ROOT"
echo ""

# Step 1: 检查依赖
echo "✅ Step 1: 检查依赖..."
command -v node >/dev/null 2>&1 || { echo "❌ 需要安装 Node.js"; exit 1; }
command -v xcodebuild >/dev/null 2>&1 || { echo "❌ 需要安装 Xcode"; exit 1; }

echo "✓ Node.js 版本: $(node --version)"
echo "✓ Xcode 版本: $(xcodebuild -version)"
echo ""

# Step 2: 构建前端
echo "✅ Step 2: 构建前端代码..."
cd "$FRONTEND_DIR"
npm install
npm run build

echo "✓ 前端构建完成"
echo "✓ 输出目录: $FRONTEND_DIR/dist"
echo ""

# Step 3: 初始化 Capacitor (如果需要)
if [ ! -d "$IOS_DIR" ]; then
  echo "✅ Step 3: 初始化 Capacitor..."
  npx @capacitor/cli@latest init
  npx @capacitor/cli@latest add ios
  echo "✓ Capacitor 初始化完成"
else
  echo "✅ Step 3: 同步 Capacitor..."
  npx cap sync ios
  echo "✓ Capacitor 同步完成"
fi
echo ""

# Step 4: 构建 iOS 应用
echo "✅ Step 4: 构建 iOS 应用..."

if [ "$BUILD_TYPE" = "debug" ]; then
  echo "构建 Debug 版本..."
  xcodebuild \
    -workspace "$IOS_DIR/App/App.xcworkspace" \
    -scheme App \
    -configuration Debug \
    -derivedDataPath "$IOS_DIR/build" \
    -arch arm64 \
    -sdk iphoneos
  
  echo "✓ Debug 版本构建完成"
  echo "位置: $IOS_DIR/build"
  
elif [ "$BUILD_TYPE" = "release" ]; then
  echo "构建 Release 版本并生成 IPA..."
  xcodebuild \
    -workspace "$IOS_DIR/App/App.xcworkspace" \
    -scheme App \
    -configuration Release \
    -derivedDataPath "$IOS_DIR/build" \
    -arch arm64 \
    -sdk iphoneos \
    archive \
    -archivePath "$IOS_DIR/build/App.xcarchive"
  
  # 导出 IPA
  xcodebuild -exportArchive \
    -archivePath "$IOS_DIR/build/App.xcarchive" \
    -exportOptionsPlist "$IOS_DIR/App/App/ExportOptions.plist" \
    -exportPath "$IOS_DIR/build/output" \
    -allowProvisioningUpdates
  
  echo "✓ Release 版本构建完成"
  echo "IPA 位置: $IOS_DIR/build/output/App.ipa"
  
else
  echo "❌ 未知的构建类型: $BUILD_TYPE"
  echo "用法: bash QUICK_IOS_BUILD.sh [debug|release]"
  exit 1
fi

echo ""
echo "=================================="
echo "✨ 构建成功！"
echo "=================================="
echo ""
echo "下一步:"
if [ "$BUILD_TYPE" = "debug" ]; then
  echo "1. 在 Xcode 中打开项目:"
  echo "   open $IOS_DIR/App/App.xcworkspace"
  echo "2. 选择目标设备或模拟器"
  echo "3. 点击 Run 按钮"
else
  echo "1. 使用 Transporter 上传 IPA 到 TestFlight"
  echo "2. 或使用 Apple Configurator 2 安装到真机"
  echo "3. IPA 文件: $IOS_DIR/build/output/App.ipa"
fi

