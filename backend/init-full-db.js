import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initializeDatabase () {
  // 先连接到 MySQL 而不选择数据库，以便创建数据库
  let connection = await mysql.createConnection({
    host: '115.190.252.62',
    port: 3306,
    user: 'hiking_user',
    password: 'senbochen'
  });

  try {
    console.log('Creating database...');
    await connection.execute('CREATE DATABASE IF NOT EXISTS hiking_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    console.log('✅ Database created or already exists');

    // 关闭连接，重新连接到指定的数据库
    await connection.end();

    connection = await mysql.createConnection({
      host: '115.190.252.62',
      port: 3306,
      user: 'hiking_user',
      password: 'senbochen',
      database: 'hiking_app'
    });

    // 执行 init.sql
    console.log('\nExecuting init.sql...');
    const initSqlFile = path.join(__dirname, 'src/database/init.sql');
    const initSql = fs.readFileSync(initSqlFile, 'utf8');

    // 分割SQL语句
    const initStatements = initSql.split(';').filter(stmt => stmt.trim() && !stmt.trim().startsWith('--'));

    console.log(`Found ${initStatements.length} SQL statements in init.sql\n`);

    for (let i = 0; i < initStatements.length; i++) {
      const statement = initStatements[i].trim();
      if (statement) {
        try {
          console.log(`[${i + 1}/${initStatements.length}] Executing...`);
          await connection.execute(statement);
          console.log(`✅ Success\n`);
        } catch (err) {
          // 忽略"表已存在"的错误
          if (err.message.includes('already exists')) {
            console.log(`⚠️ Table already exists (skipped)\n`);
          } else {
            console.error(`❌ Error: ${err.message}\n`);
          }
        }
      }
    }

    // 执行 create_destinations.sql
    console.log('\nExecuting create_destinations.sql...');
    const destSqlFile = path.join(__dirname, 'src/database/create_destinations.sql');
    const destSql = fs.readFileSync(destSqlFile, 'utf8');

    const destStatements = destSql.split(';').filter(stmt => stmt.trim() && !stmt.trim().startsWith('--'));

    console.log(`Found ${destStatements.length} SQL statements in create_destinations.sql\n`);

    for (let i = 0; i < destStatements.length; i++) {
      const statement = destStatements[i].trim();
      if (statement) {
        try {
          console.log(`[${i + 1}/${destStatements.length}] Executing...`);
          await connection.execute(statement);
          console.log(`✅ Success\n`);
        } catch (err) {
          if (err.message.includes('already exists')) {
            console.log(`⚠️ Table already exists (skipped)\n`);
          } else {
            console.error(`❌ Error: ${err.message}\n`);
          }
        }
      }
    }

    console.log('\n✅ Database initialization completed!');

  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

initializeDatabase();
