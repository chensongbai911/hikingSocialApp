# 偏好设置 API 自动化测试脚本
# 测试用户偏好设置的保存、加载和同步流程

param(
    [string]$BaseUrl = "http://localhost:3001",
    [string]$ApiVersion = "v1"
)

# 配置
$ApiBaseUrl = "$BaseUrl/api/$ApiVersion"
$Headers = @{
    "Content-Type" = "application/json"
}

# 颜色输出
function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Blue
}

function Write-Test {
    param([string]$Message)
    Write-Host "🧪 $Message" -ForegroundColor Cyan
}

# 测试计数器
$testsPassed = 0
$testsFailed = 0

Write-Info "========================================"
Write-Info "偏好设置 API 自动化测试开始"
Write-Info "========================================"
Write-Info "API 基础 URL: $ApiBaseUrl"
Write-Info ""

# 测试 1: 检查后端健康状态
Write-Test "测试 1: 后端健康检查"
try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/api/$ApiVersion/health" -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Success "后端服务运行正常 (Status: $($response.StatusCode))"
        $testsPassed++
    }
} catch {
    Write-Error "后端服务无法连接: $_"
    $testsFailed++
    Write-Info "请确保后端正在运行: cd backend && npm run dev"
    exit 1
}

Write-Info ""

# 测试 2: 测试获取用户（不包含偏好）
Write-Test "测试 2: 获取用户信息（不包含偏好）"
try {
    $userId = 1  # 假设测试用户 ID
    $response = Invoke-WebRequest -Uri "$ApiBaseUrl/users/profile" -Headers $Headers -ErrorAction Stop
    $userData = $response.Content | ConvertFrom-Json

    if ($userData.data) {
        Write-Success "成功获取用户信息"
        Write-Info "用户 ID: $($userData.data.id)"
        Write-Info "用户名: $($userData.data.username)"
        $testsPassed++
    }
} catch {
    Write-Error "获取用户信息失败: $_"
    $testsFailed++
}

Write-Info ""

# 测试 3: 测试获取用户（包含偏好）
Write-Test "测试 3: 获取用户信息（包含偏好设置）"
try {
    $response = Invoke-WebRequest -Uri "$ApiBaseUrl/users/profile?includePreferences=true" -Headers $Headers -ErrorAction Stop
    $userData = $response.Content | ConvertFrom-Json

    if ($userData.data) {
        if ($userData.data.preferences) {
            Write-Success "成功获取用户信息及偏好设置"
            Write-Info "偏好数量: $(@($userData.data.preferences).Count)"

            # 验证偏好数据结构
            if (@($userData.data.preferences).Count -gt 0) {
                $firstPref = @($userData.data.preferences)[0]
                Write-Info "第一个偏好结构:"
                Write-Info "  - ID: $($firstPref.id)"
                Write-Info "  - 类型: $($firstPref.preference_type)"
                Write-Info "  - 值: $($firstPref.preference_value)"

                if ($firstPref.id -and $firstPref.preference_type -and $firstPref.preference_value) {
                    Write-Success "偏好数据结构正确"
                    $testsPassed++
                } else {
                    Write-Error "偏好数据结构不完整"
                    $testsFailed++
                }
            } else {
                Write-Success "用户还没有设置偏好（这是正常的）"
                $testsPassed++
            }
        } else {
            Write-Error "API 未返回 preferences 字段"
            $testsFailed++
        }
    }
} catch {
    Write-Error "获取用户偏好设置失败: $_"
    $testsFailed++
}

Write-Info ""

# 测试 4: 测试更新偏好设置
Write-Test "测试 4: 更新用户偏好设置"
try {
    $newPreferences = @("爬山", "宿营", "摄影")
    $payload = @{
        preferences = $newPreferences
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "$ApiBaseUrl/users/preferences" `
        -Method PUT `
        -Headers $Headers `
        -Body $payload `
        -ErrorAction Stop

    $result = $response.Content | ConvertFrom-Json

    if ($result.code -eq 200) {
        Write-Success "偏好设置更新成功"
        Write-Info "更新的偏好: $($newPreferences -join ', ')"
        $testsPassed++
    } else {
        Write-Error "偏好设置更新失败 (Code: $($result.code))"
        $testsFailed++
    }
} catch {
    Write-Error "更新偏好设置异常: $_"
    $testsFailed++
}

Write-Info ""

# 测试 5: 验证保存后的偏好
Write-Test "测试 5: 验证保存后的偏好设置"
Start-Sleep -Milliseconds 500  # 等待数据库同步

try {
    $response = Invoke-WebRequest -Uri "$ApiBaseUrl/users/profile?includePreferences=true" -Headers $Headers -ErrorAction Stop
    $userData = $response.Content | ConvertFrom-Json

    if ($userData.data.preferences) {
        $prefs = @($userData.data.preferences)
        Write-Success "成功验证已保存的偏好设置"
        Write-Info "保存的偏好数量: $($prefs.Count)"

        foreach ($i in 0..($prefs.Count - 1)) {
            Write-Info "  $($i + 1). $($prefs[$i].preference_value)"
        }

        if ($prefs.Count -eq 3) {
            Write-Success "偏好数量验证正确 (期望: 3, 实际: $($prefs.Count))"
            $testsPassed++
        } else {
            Write-Error "偏好数量不匹配 (期望: 3, 实际: $($prefs.Count))"
            $testsFailed++
        }
    }
} catch {
    Write-Error "验证偏好设置失败: $_"
    $testsFailed++
}

Write-Info ""

# 测试 6: 测试删除偏好
Write-Test "测试 6: 删除部分偏好设置"
try {
    $updatedPreferences = @("爬山", "摄影")
    $payload = @{
        preferences = $updatedPreferences
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "$ApiBaseUrl/users/preferences" `
        -Method PUT `
        -Headers $Headers `
        -Body $payload `
        -ErrorAction Stop

    $result = $response.Content | ConvertFrom-Json

    if ($result.code -eq 200) {
        Write-Success "偏好设置删除成功"
        Write-Info "更新后的偏好: $($updatedPreferences -join ', ')"

        # 验证删除结果
        Start-Sleep -Milliseconds 500
        $response = Invoke-WebRequest -Uri "$ApiBaseUrl/users/profile?includePreferences=true" -Headers $Headers -ErrorAction Stop
        $userData = $response.Content | ConvertFrom-Json
        $prefs = @($userData.data.preferences)

        if ($prefs.Count -eq 2) {
            Write-Success "删除验证成功 (保留: $($updatedPreferences -join ', '))"
            $testsPassed++
        } else {
            Write-Error "删除验证失败 (期望: 2, 实际: $($prefs.Count))"
            $testsFailed++
        }
    }
} catch {
    Write-Error "删除偏好设置异常: $_"
    $testsFailed++
}

Write-Info ""

# 测试 7: 测试清空所有偏好
Write-Test "测试 7: 清空所有偏好设置"
try {
    $payload = @{
        preferences = @()
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "$ApiBaseUrl/users/preferences" `
        -Method PUT `
        -Headers $Headers `
        -Body $payload `
        -ErrorAction Stop

    $result = $response.Content | ConvertFrom-Json

    if ($result.code -eq 200) {
        Write-Success "偏好设置清空成功"

        # 验证清空结果
        Start-Sleep -Milliseconds 500
        $response = Invoke-WebRequest -Uri "$ApiBaseUrl/users/profile?includePreferences=true" -Headers $Headers -ErrorAction Stop
        $userData = $response.Content | ConvertFrom-Json
        $prefs = @($userData.data.preferences)

        if ($prefs.Count -eq 0 -or $null -eq $userData.data.preferences) {
            Write-Success "清空验证成功 (偏好设置已清空)"
            $testsPassed++
        } else {
            Write-Error "清空验证失败 (期望: 0, 实际: $($prefs.Count))"
            $testsFailed++
        }
    }
} catch {
    Write-Error "清空偏好设置异常: $_"
    $testsFailed++
}

Write-Info ""
Write-Info "========================================"
Write-Info "测试总结"
Write-Info "========================================"
Write-Success "通过: $testsPassed 个测试"

if ($testsFailed -gt 0) {
    Write-Error "失败: $testsFailed 个测试"
} else {
    Write-Success "失败: 0 个测试"
}

Write-Info "总计: $($testsPassed + $testsFailed) 个测试"
Write-Info ""

if ($testsFailed -eq 0) {
    Write-Success "🎉 所有测试通过！偏好设置功能工作正常。"
    exit 0
} else {
    Write-Error "⚠️  有 $testsFailed 个测试失败。请检查错误信息。"
    exit 1
}
