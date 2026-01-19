import { pool } from './backend/src/config/database.js'

async function checkMigrations() {
  try {
    const [rows] = await pool.query('SELECT * FROM migrations ORDER BY executed_at')
    console.log('已执行的迁移:', JSON.stringify(rows, null, 2))

    const [tables] = await pool.query('SHOW TABLES')
    console.log('\n当前所有表:', tables)

    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

checkMigrations()
