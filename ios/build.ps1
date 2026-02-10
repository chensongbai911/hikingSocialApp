# iOS 构建脚本 (Windows PowerShell)

Write-Host "🚀 开始构建 iOS 应用..." -ForegroundColor Green

# 检查是否安装了 Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js 未安装" -ForegroundColor Red
    exit 1
}

# 获取脚本所在目录
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootPath = Split-Path -Parent $scriptPath

# 安装 npm 依赖
if (-not (Test-Path "$rootPath\frontend\node_modules")) {
    Write-Host "📦 安装 npm 依赖..." -ForegroundColor Yellow
    Set-Location "$rootPath\frontend"
    npm install
    Set-Location $rootPath
}

# 构建前端资源
Write-Host "🔨 构建前端资源..." -ForegroundColor Yellow
Set-Location "$rootPath\frontend"
npm run build
Set-Location $rootPath

# 复制构建产物到 iOS 目录
Write-Host "📋 复制资源文件..." -ForegroundColor Yellow
$assetsPath = "$scriptPath\HikingSocialApp\Assets"
if (-not (Test-Path $assetsPath)) {
    New-Item -ItemType Directory -Path $assetsPath | Out-Null
}
Copy-Item -Path "$rootPath\frontend\dist\*" -Destination $assetsPath -Recurse -Force

Write-Host "✅ 构建完成！" -ForegroundColor Green
Write-Host ""
Write-Host "下一步操作：" -ForegroundColor Cyan
Write-Host "1. 在 macOS 上安装 CocoaPods: sudo gem install cocoapods"
Write-Host "2. 在 ios 目录运行: pod install"
Write-Host "3. 在 Info.plist 中配置高德地图 API Key"
Write-Host "4. 使用 Xcode 打开 ios/HikingSocialApp.xcworkspace"
Write-Host "5. 选择设备或模拟器"
Write-Host "6. 点击运行按钮（⌘+R）"
