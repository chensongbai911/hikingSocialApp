# Upload API Test Script

Write-Host "`n=== Upload API Test ===" -ForegroundColor Cyan

# 1. Login
Write-Host "`n1. Login..." -ForegroundColor Yellow
$loginBody = @{
    email = 'zhangsan@test.com'
    password = 'password123'
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri http://localhost:3000/api/v1/auth/login -Method Post -Body $loginBody -ContentType 'application/json'
$token = $loginResponse.data.token
Write-Host "Token obtained successfully" -ForegroundColor Green

# 2. Test file upload
Write-Host "`n2. Test avatar upload..." -ForegroundColor Yellow

$testImage = "d:\coze\design_images\avatar.png"
if (-not (Test-Path $testImage)) {
    Write-Host "Test image not found: $testImage" -ForegroundColor Red
    exit 1
}

Write-Host "Using image: $testImage"

# Use curl.exe
$curlPath = "C:\Windows\System32\curl.exe"
if (Test-Path $curlPath) {
    Write-Host "Uploading..."

    $result = & $curlPath -X POST http://localhost:3000/api/v1/upload/avatar `
        -H "Authorization: Bearer $token" `
        -F "avatar=@$testImage" `
        2>&1

    Write-Host $result

    if ($LASTEXITCODE -eq 0) {
        Write-Host "Upload request sent successfully" -ForegroundColor Green
    } else {
        Write-Host "Upload may have failed" -ForegroundColor Yellow
    }
} else {
    Write-Host "curl.exe not found, skipping actual upload test" -ForegroundColor Yellow
}

# 3. Check uploads directory
Write-Host "`n3. Check uploads directory..." -ForegroundColor Yellow
$uploadsDir = "d:\coze\backend\uploads\avatars"

if (Test-Path $uploadsDir) {
    $files = Get-ChildItem $uploadsDir -File
    Write-Host "Found $($files.Count) files" -ForegroundColor Gray

    if ($files.Count -gt 0) {
        $latestFile = $files | Sort-Object LastWriteTime -Descending | Select-Object -First 1
        Write-Host "Latest file: $($latestFile.Name)" -ForegroundColor Gray
    }
    Write-Host "Uploads directory exists" -ForegroundColor Green
} else {
    Write-Host "Uploads directory will be created on first upload" -ForegroundColor Yellow
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Cyan
Write-Host "`nUpload API Endpoints:" -ForegroundColor White
Write-Host "- POST /api/v1/upload/image" -ForegroundColor Gray
Write-Host "- POST /api/v1/upload/avatar (auth required)" -ForegroundColor Gray
Write-Host "- POST /api/v1/upload/photos (auth required)" -ForegroundColor Gray

