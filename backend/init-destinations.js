import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initializeDestinations () {
  const connection = await mysql.createConnection({
    host: '115.190.252.62',
    port: 3306,
    user: 'hiking_user',
    password: 'senbochen',
    database: 'hiking_app'
  });

  try {
    // 读取SQL文件
    const sqlFile = path.join(__dirname, 'src/database/create_destinations.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // 分割SQL语句，处理多个语句
    const statements = sql.split(';').filter(stmt => stmt.trim());

    console.log(`Found ${statements.length} SQL statements to execute`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement) {
        try {
          console.log(`\nExecuting statement ${i + 1}/${statements.length}...`);
          console.log(`SQL: ${statement.substring(0, 80)}...`);
          await connection.execute(statement);
          console.log(`✅ Success`);
        } catch (err) {
          console.error(`❌ Error executing statement ${i + 1}:`, err.message);
        }
      }
    }

    console.log('\n✅ Database initialization completed!');

  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
  } finally {
    await connection.end();
  }
}

initializeDestinations();
