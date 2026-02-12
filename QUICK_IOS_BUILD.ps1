# 🚀 快速 iOS 打包脚本 (PowerShell)
# 用法: PowerShell .\QUICK_IOS_BUILD.ps1 -BuildType debug

param(
    [ValidateSet("debug", "release")]
    [string]$BuildType = "debug"
)

$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$FrontendDir = Join-Path $ProjectRoot "frontend"
$IosDir = Join-Path $FrontendDir "ios"

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "📱 iOS 打包脚本 (Windows)" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "构建类型: $BuildType" -ForegroundColor Yellow
Write-Host "项目路径: $ProjectRoot" -ForegroundColor Yellow
Write-Host ""

# Step 1: 检查依赖
Write-Host "✅ Step 1: 检查依赖..." -ForegroundColor Green

$nodeVersion = & node --version 2>$null
if (-not $nodeVersion) {
    Write-Host "❌ 需要安装 Node.js" -ForegroundColor Red
    exit 1
}

$xcodeVersion = & xcodebuild -version 2>$null | Select-Object -First 1
if (-not $xcodeVersion) {
    Write-Host "❌ 需要安装 Xcode (macOS 只能在 Mac 上构建)" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Node.js 版本: $nodeVersion" -ForegroundColor Green
Write-Host ""

# Step 2: 构建前端
Write-Host "✅ Step 2: 构建前端代码..." -ForegroundColor Green
Push-Location $FrontendDir

try {
    npm install
    npm run build
    Write-Host "✓ 前端构建完成" -ForegroundColor Green
    Write-Host "✓ 输出目录: $FrontendDir\dist" -ForegroundColor Green
}
finally {
    Pop-Location
}

Write-Host ""

# Step 3: 初始化或同步 Capacitor
Write-Host "✅ Step 3: Capacitor 配置..." -ForegroundColor Green

if (-not (Test-Path $IosDir)) {
    Write-Host "初始化 Capacitor..." -ForegroundColor Yellow
    Push-Location $FrontendDir
    try {
        npx @capacitor/cli@latest init
        npx @capacitor/cli@latest add ios
        Write-Host "✓ Capacitor 初始化完成" -ForegroundColor Green
    }
    finally {
        Pop-Location
    }
}
else {
    Write-Host "同步 Capacitor..." -ForegroundColor Yellow
    Push-Location $FrontendDir
    try {
        npx cap sync ios
        Write-Host "✓ Capacitor 同步完成" -ForegroundColor Green
    }
    finally {
        Pop-Location
    }
}

Write-Host ""

# Step 4: 提示用户在 Mac 上继续
Write-Host "✅ Step 4: 准备 iOS 构建..." -ForegroundColor Green

if ($BuildType -eq "debug") {
    Write-Host ""
    Write-Host "⚠️  请在 Mac 上执行以下命令:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "open '$IosDir/App/App.xcworkspace'" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "然后在 Xcode 中:" -ForegroundColor Yellow
    Write-Host "1. 选择目标设备或模拟器" -ForegroundColor White
    Write-Host "2. 点击 Run 按钮 (Cmd + R)" -ForegroundColor White
    Write-Host ""
}
else {
    Write-Host ""
    Write-Host "⚠️  请在 Mac 上执行以下步骤:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. 打开 Xcode:" -ForegroundColor White
    Write-Host "   open '$IosDir/App/App.xcworkspace'" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "2. Product > Archive" -ForegroundColor White
    Write-Host ""
    Write-Host "3. 等待 Archive 完成，然后点击 'Distribute App'" -ForegroundColor White
    Write-Host ""
    Write-Host "4. 选择 'Ad Hoc' 或 'Development' 进行导出" -ForegroundColor White
    Write-Host ""
}

Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "✨ 前端准备完成！" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

