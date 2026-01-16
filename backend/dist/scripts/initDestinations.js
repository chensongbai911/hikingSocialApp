import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// 加载环境变量 - 修正路径到backend目录
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
async function initDestinations() {
    let connection;
    try {
        console.log('========================================');
        console.log('初始化目的地数据库');
        console.log('========================================\n');
        // 创建数据库连接
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'hiking_app',
            multipleStatements: true
        });
        console.log('✓ 数据库连接成功\n');
        // 读取SQL文件 - 修正路径
        const sqlPath = path.resolve(__dirname, '../database/create_destinations.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        console.log('✓ SQL文件读取成功\n');
        // 分割SQL语句并执行
        const statements = sql
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0);
        console.log(`共 ${statements.length} 条SQL语句\n`);
        for (let i = 0; i < statements.length; i++) {
            const stmt = statements[i];
            try {
                await connection.execute(stmt);
                // 提取操作类型
                const match = stmt.match(/^(CREATE|INSERT|ALTER|DROP)/i);
                const operation = match ? match[1].toUpperCase() : 'EXECUTE';
                // 提取表名
                const tableMatch = stmt.match(/(?:TABLE|INTO)\s+(\w+)/i);
                const tableName = tableMatch ? tableMatch[1] : '';
                console.log(`✓ [${i + 1}/${statements.length}] ${operation} ${tableName}`);
            }
            catch (err) {
                // 如果是表已存在的错误，可以忽略
                if (err.code === 'ER_TABLE_EXISTS_ERROR') {
                    console.log(`⚠ [${i + 1}/${statements.length}] 表已存在，跳过`);
                }
                else if (err.code === 'ER_DUP_ENTRY') {
                    console.log(`⚠ [${i + 1}/${statements.length}] 数据已存在，跳过`);
                }
                else {
                    console.error(`✗ [${i + 1}/${statements.length}] 执行失败:`, err.message);
                }
            }
        }
        console.log('\n========================================');
        console.log('✓ 数据库初始化完成！');
        console.log('========================================\n');
    }
    catch (error) {
        console.error('\n✗ 初始化失败:', error.message);
        process.exit(1);
    }
    finally {
        if (connection) {
            await connection.end();
        }
    }
}
// 执行初始化
initDestinations();
//# sourceMappingURL=initDestinations.js.map