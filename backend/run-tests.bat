@echo off
cd /d d:\coze\backend

REM Start the server in the background
start /B npx tsx src/server.ts > nul 2>&1

REM Wait for the server to start
timeout /t 5 /nobreak

REM Test the API endpoints
echo Testing destinations API...
powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:3000/api/v1/destinations/popular?limit=5' -UseBasicParsing; Write-Host 'Status: ' $r.StatusCode; $r.Content | ConvertFrom-Json | ConvertTo-Json | Write-Host } catch { Write-Host 'Error: ' $_ }"

echo.
echo Testing destinations list API...
powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:3000/api/v1/destinations?pageSize=5&sortBy=popularity&latitude=39.9042&longitude=116.4074' -UseBasicParsing; Write-Host 'Status: ' $r.StatusCode; $r.Content | ConvertFrom-Json | ConvertTo-Json | Write-Host } catch { Write-Host 'Error: ' $_ }"

pause
