@echo off
echo ========================================
echo 初始化目的地数据库
echo ========================================
echo.

cd backend

echo 正在连接数据库并创建目的地表...
node -e "const mysql = require('mysql2/promise'); async function init() { const conn = await mysql.createConnection({ host: process.env.DB_HOST || 'localhost', user: process.env.DB_USER || 'root', password: process.env.DB_PASSWORD || '', database: process.env.DB_NAME || 'hiking_app' }); const sql = require('fs').readFileSync('./src/database/create_destinations.sql', 'utf8'); const statements = sql.split(';').filter(s => s.trim()); for (const stmt of statements) { if (stmt.trim()) { try { await conn.execute(stmt); console.log('执行成功:', stmt.substring(0, 50) + '...'); } catch (err) { console.error('执行失败:', err.message); } } } await conn.end(); console.log('数据库初始化完成！'); } init();"

echo.
echo ========================================
echo 初始化完成！
echo ========================================
pause
