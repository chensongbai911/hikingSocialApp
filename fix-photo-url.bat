@echo off
echo Fixing photo_url column size to support base64 images...
echo.

mysql -u root -p hiking_app < backend\src\database\fix_photo_url_column.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✓ Database schema updated successfully!
    echo ✓ photo_url columns now support base64 encoded images
    echo.
) else (
    echo.
    echo ✗ Failed to update database schema
    echo Please check your MySQL connection and try again
    echo.
)

pause
