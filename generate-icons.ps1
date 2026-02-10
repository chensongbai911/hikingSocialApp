# Generate PWA Icons Script
param([string]$SourceImage = "logo.png")
Write-Host "Generating PWA icons..." -ForegroundColor Green
if (-not (Get-Command magick -ErrorAction SilentlyContinue)) {
    Write-Host "Creating placeholder SVG icons" -ForegroundColor Yellow
    $sizes = @(72, 96, 128, 144, 152, 192, 384, 512)
    foreach ($size in $sizes) {
        $fileName = "icon-$size" + "x$size.svg"
        $outputPath = "frontend\public\icons\$fileName"
        @"
<svg xmlns="http://www.w3.org/2000/svg" width="$size" height="$size" viewBox="0 0 512 512">
<rect width="512" height="512" fill="#10b981"/>
<path d="M256 128 L384 384 L128 384 Z" fill="white"/>
<circle cx="256" cy="320" r="20" fill="#10b981"/>
</svg>
"@ | Out-File -FilePath $outputPath -Encoding UTF8
        Write-Host "Created: $fileName" -ForegroundColor Gray
    }
    Write-Host "Placeholder icons created!" -ForegroundColor Green
    exit 0
}
Write-Host "All done!" -ForegroundColor Green
