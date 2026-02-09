#!/usr/bin/env pwsh
# Test Application API

Write-Host "🧪 Testing Hiking App Application API" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Generate JWT token for user-002
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItMDAyIiwiZW1haWwiOiJ1c2VyMDAyQGV4YW1wbGUuY29tIiwiaWF0IjoxNzY4ODE1Njk1LCJleHAiOjE3Njk0MjA0OTV9.k8jrHcMRDWgJCa1SqneKQbwtNpsekxW5ymvNsdUfSog"

Write-Host "`n📝 Test 1: POST /api/v1/applications (Create application)" -ForegroundColor Yellow
$body1 = @{
    activity_id = "act-001"
    message = "我想加入这个活动"
} | ConvertTo-Json

try {
    $resp1 = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/applications" `
        -Method Post `
        -Headers @{"Authorization"="Bearer $token"; "Content-Type"="application/json"} `
        -Body $body1 `
        -UseBasicParsing
    Write-Host "✅ Success (Status: $($resp1.StatusCode))"
    Write-Host "Response:" -ForegroundColor Green
    $resp1.Content | ConvertFrom-Json | ConvertTo-Json
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n📝 Test 2: GET /api/v1/applications/my (Get my applications)" -ForegroundColor Yellow
try {
    $resp2 = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/applications/my" `
        -Method Get `
        -Headers @{"Authorization"="Bearer $token"} `
        -UseBasicParsing
    Write-Host "✅ Success (Status: $($resp2.StatusCode))"
    Write-Host "Response:" -ForegroundColor Green
    $resp2.Content | ConvertFrom-Json | ConvertTo-Json -Depth 2
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n✨ Test completed!" -ForegroundColor Cyan
