# 启动服务器并在后台运行
$processInfo = New-Object System.Diagnostics.ProcessStartInfo
$processInfo.FileName = "npx"
$processInfo.Arguments = "tsx src/server.ts"
$processInfo.WorkingDirectory = "d:\coze\backend"
$processInfo.RedirectStandardOutput = $true
$processInfo.RedirectStandardError = $true
$processInfo.UseShellExecute = $false
$processInfo.CreateNoWindow = $true

$process = [System.Diagnostics.Process]::Start($processInfo)
Write-Host "Server started with PID $($process.Id)"

# 等待服务器启动
Start-Sleep -Seconds 5

# 测试热门目的地接口
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/destinations/popular?limit=5" -UseBasicParsing
    Write-Host "✅ API Response Status: $($response.StatusCode)"
    $content = $response.Content | ConvertFrom-Json
    Write-Host "✅ Response:"
    Write-Host ($content | ConvertTo-Json)
} catch {
    Write-Host "❌ API Call Failed: $_"
}

# 测试另一个接口
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/destinations?pageSize=5&sortBy=popularity&latitude=39.9042&longitude=116.4074" -UseBasicParsing
    Write-Host "`n✅ API Response Status: $($response.StatusCode)"
    $content = $response.Content | ConvertFrom-Json
    Write-Host "✅ Response:"
    Write-Host ($content | ConvertTo-Json)
} catch {
    Write-Host "❌ API Call Failed: $_"
}

# 保持进程运行（可选）
Write-Host "`nServer is running. Press Ctrl+C to stop."
$process.WaitForExit()
