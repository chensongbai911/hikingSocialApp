#!/usr/bin/env pwsh
# vNext 项目快速启动脚本
# 创建日期: 2026-01-19
# 用法: .\quick-start.ps1

Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "   徒步社交 App vNext - 快速启动向导" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# 检查 Node.js
Write-Host "[1/8] 检查 Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "   ✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Node.js 未安装，请访问 https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# 检查 MySQL
Write-Host "[2/8] 检查 MySQL..." -ForegroundColor Yellow
try {
    $mysqlVersion = mysql --version
    Write-Host "   ✅ MySQL 已安装" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  MySQL 未找到，请确保已安装并在 PATH 中" -ForegroundColor Yellow
}

# 检查 Redis
Write-Host "[3/8] 检查 Redis..." -ForegroundColor Yellow
try {
    $redisResponse = redis-cli ping
    if ($redisResponse -eq "PONG") {
        Write-Host "   ✅ Redis 运行中" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Redis 未运行，请启动 Redis 服务" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️  Redis 未找到，请确保已安装并启动" -ForegroundColor Yellow
}

# 检查后端环境变量
Write-Host "[4/8] 检查后端配置..." -ForegroundColor Yellow
if (Test-Path "backend\.env") {
    Write-Host "   ✅ backend\.env 已存在" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  backend\.env 不存在" -ForegroundColor Yellow
    Write-Host "   正在从 .env.example 复制..." -ForegroundColor Cyan

    if (Test-Path "backend\.env.example") {
        Copy-Item "backend\.env.example" "backend\.env"
        Write-Host "   ✅ 已创建 backend\.env，请编辑填写配置" -ForegroundColor Green
        Write-Host "   重要: 需要配置 DB_PASSWORD, JWT_SECRET" -ForegroundColor Red
    } else {
        Write-Host "   ❌ backend\.env.example 不存在" -ForegroundColor Red
    }
}

# 检查前端环境变量
Write-Host "[5/8] 检查前端配置..." -ForegroundColor Yellow
if (Test-Path "frontend\.env.development") {
    Write-Host "   ✅ frontend\.env.development 已存在" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  frontend\.env.development 不存在" -ForegroundColor Yellow
    Write-Host "   正在从 .env.example 复制..." -ForegroundColor Cyan

    if (Test-Path "frontend\.env.example") {
        Copy-Item "frontend\.env.example" "frontend\.env.development"
        Write-Host "   ✅ 已创建 frontend\.env.development" -ForegroundColor Green
    } else {
        Write-Host "   ❌ frontend\.env.example 不存在" -ForegroundColor Red
    }
}

# 安装后端依赖
Write-Host "[6/8] 安装后端依赖..." -ForegroundColor Yellow
if (Test-Path "backend\node_modules") {
    Write-Host "   ⏭️  backend\node_modules 已存在，跳过安装" -ForegroundColor Cyan
} else {
    Write-Host "   正在安装后端依赖 (可能需要几分钟)..." -ForegroundColor Cyan
    Push-Location backend
    npm install --silent
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ 后端依赖安装成功" -ForegroundColor Green
    } else {
        Write-Host "   ❌ 后端依赖安装失败" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    Pop-Location
}

# 安装前端依赖
Write-Host "[7/8] 安装前端依赖..." -ForegroundColor Yellow
if (Test-Path "frontend\node_modules") {
    Write-Host "   ⏭️  frontend\node_modules 已存在，跳过安装" -ForegroundColor Cyan
} else {
    Write-Host "   正在安装前端依赖 (可能需要几分钟)..." -ForegroundColor Cyan
    Push-Location frontend
    npm install --silent
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ 前端依赖安装成功" -ForegroundColor Green
    } else {
        Write-Host "   ❌ 前端依赖安装失败" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    Pop-Location
}

# 数据库迁移
Write-Host "[8/8] 数据库迁移..." -ForegroundColor Yellow
Write-Host "   是否执行数据库迁移? (Y/N)" -ForegroundColor Cyan
$migrate = Read-Host "   "
if ($migrate -eq "Y" -or $migrate -eq "y") {
    Push-Location backend
    npm run migrate
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ 数据库迁移成功" -ForegroundColor Green
    } else {
        Write-Host "   ❌ 数据库迁移失败，请检查配置" -ForegroundColor Red
        Write-Host "   提示: 确保 .env 中 DB_* 配置正确" -ForegroundColor Yellow
    }
    Pop-Location
} else {
    Write-Host "   ⏭️  跳过数据库迁移" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "   🎉 初始化完成！" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "下一步:" -ForegroundColor Yellow
Write-Host "  1. 编辑 backend\.env (必须配置 DB_PASSWORD, JWT_SECRET)" -ForegroundColor White
Write-Host "  2. 启动后端: cd backend && npm run dev" -ForegroundColor White
Write-Host "  3. 启动前端: cd frontend && npm run dev" -ForegroundColor White
Write-Host "  4. 访问: http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "文档:" -ForegroundColor Yellow
Write-Host "  • 项目入口: vNext_START_HERE.md" -ForegroundColor White
Write-Host "  • 快速上手: vNext_QUICK_START.md" -ForegroundColor White
Write-Host "  • 启动检查: vNext_LAUNCH_CHECKLIST.md" -ForegroundColor White
Write-Host ""
Write-Host "需要帮助? 阅读 vNext_START_HERE.md" -ForegroundColor Cyan
Write-Host ""
