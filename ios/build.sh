#!/bin/bash

# iOS 构建脚本

set -e

echo "🚀 开始构建 iOS 应用..."

# 检查是否安装了 CocoaPods
if ! command -v pod &> /dev/null; then
    echo "❌ CocoaPods 未安装，请先安装: sudo gem install cocoapods"
    exit 1
fi

# 检查是否安装了 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装"
    exit 1
fi

# 进入 iOS 目录
cd "$(dirname "$0")"

# 安装 CocoaPods 依赖
echo "📦 安装 CocoaPods 依赖..."
pod install

# 返回项目根目录
cd ..

# 安装 npm 依赖
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 安装 npm 依赖..."
    cd frontend
    npm install
    cd ..
fi

# 构建前端资源
echo "🔨 构建前端资源..."
cd frontend
npm run build
cd ..

# 复制构建产物到 iOS 目录
echo "📋 复制资源文件..."
mkdir -p ios/HikingSocialApp/Assets
cp -r frontend/dist/* ios/HikingSocialApp/Assets/

echo "✅ 构建完成！"
echo ""
echo "下一步操作："
echo "1. 在 Info.plist 中配置高德地图 API Key"
echo "2. 使用 Xcode 打开 ios/HikingSocialApp.xcworkspace"
echo "3. 选择设备或模拟器"
echo "4. 点击运行按钮（⌘+R）"
