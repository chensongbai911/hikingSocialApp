import { pool } from './src/config/database.js'

async function checkMigrations() {
  try {
    const [rows] = await pool.query('SELECT * FROM migrations ORDER BY executed_at')
    console.log('已执行的迁移:', JSON.stringify(rows, null, 2))

    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

checkMigrations()
