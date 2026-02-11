# Preferences API test script (ASCII only)
$BaseUrl = if ($args.Count -ge 1 -and $args[0]) { $args[0] } else { "http://localhost:3000" }
$ApiVersion = if ($args.Count -ge 2 -and $args[1]) { $args[1] } else { "v1" }
$Token = if ($args.Count -ge 3 -and $args[2]) { $args[2] } else { "" }

$ApiBaseUrl = "$BaseUrl/api/$ApiVersion"
$Headers = @{ "Content-Type" = "application/json" }
if ($Token.Trim().Length -gt 0) {
    $Headers["Authorization"] = "Bearer $Token"
}

function Write-Ok { param([string]$m) Write-Host "[OK] $m" -ForegroundColor Green }
function Write-Err { param([string]$m) Write-Host "[ERR] $m" -ForegroundColor Red }
function Write-Info { param([string]$m) Write-Host "[INFO] $m" -ForegroundColor Cyan }

$passed = 0
$failed = 0

Write-Info "API Base URL: $ApiBaseUrl"

# 1) Health check
try {
    $res = Invoke-WebRequest -Uri "$BaseUrl/health" -UseBasicParsing -ErrorAction Stop
    if ($res.StatusCode -eq 200) { Write-Ok "Health check OK"; $passed++ } else { Write-Err "Health check failed: $($res.StatusCode)"; $failed++ }
} catch {
    Write-Err "Health check failed: $_"; $failed++; exit 1
}

# 2) Get profile with preferences
try {
    $res = Invoke-WebRequest -Uri "$ApiBaseUrl/users/profile?includePreferences=true" -Headers $Headers -UseBasicParsing -ErrorAction Stop
    $data = $res.Content | ConvertFrom-Json
    if ($data.data) { Write-Ok "Profile fetch OK"; $passed++ } else { Write-Err "Profile is empty"; $failed++ }
} catch {
    Write-Err "Profile fetch failed (token may be required): $_"; $failed++
}

# 3) Update preferences
try {
    $payload = @{ preferences = @("hiking","camping","photo") } | ConvertTo-Json
    $res = Invoke-WebRequest -Uri "$ApiBaseUrl/users/preferences" -Method PUT -Headers $Headers -Body $payload -UseBasicParsing -ErrorAction Stop
    $data = $res.Content | ConvertFrom-Json
    if ($data.code -eq 200) { Write-Ok "Update preferences OK"; $passed++ } else { Write-Err "Update preferences failed: $($data.code)"; $failed++ }
} catch {
    Write-Err "Update preferences failed (token may be required): $_"; $failed++
}

Write-Info "Done: passed $passed, failed $failed"
if ($failed -gt 0) { exit 1 } else { exit 0 }
