# Fix photo_url column size to support base64 images
Write-Host "Fixing photo_url column size to support base64 images..." -ForegroundColor Cyan
Write-Host ""

# Get MySQL password
$password = Read-Host "Enter MySQL root password" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
$plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

# Run MySQL command
$sqlFile = "backend\src\database\fix_photo_url_column.sql"

try {
    # Execute the SQL file
    $process = Start-Process -FilePath "mysql" -ArgumentList "-u root -p$plainPassword hiking_app" -RedirectStandardInput $sqlFile -NoNewWindow -Wait -PassThru
    
    if ($process.ExitCode -eq 0) {
        Write-Host ""
        Write-Host "✓ Database schema updated successfully!" -ForegroundColor Green
        Write-Host "✓ photo_url columns now support base64 encoded images" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "✗ Failed to update database schema" -ForegroundColor Red
        Write-Host "Please check your MySQL connection and try again" -ForegroundColor Yellow
        Write-Host ""
    }
} catch {
    Write-Host ""
    Write-Host "✗ Error: $_" -ForegroundColor Red
    Write-Host ""
}

# Clear password from memory
$plainPassword = $null
[System.GC]::Collect()

Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
