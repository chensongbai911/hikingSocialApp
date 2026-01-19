/**
 * 数据库迁移工具
 * 创建日期: 2026-01-19
 * 使用: npm run migrate
 */

import fs from 'fs'
import path from 'path'
import { pool } from '../config/database'
/**
 * 智能分割 SQL 语句
 * 正确处理括号、引号、注释中的分号
 */
function splitSQLStatements(sql: string): string[] {
  const statements: string[] = []
  let current = ''
  let inSingleQuote = false
  let inDoubleQuote = false
  let inComment = false
  let inMultilineComment = false
  let parenDepth = 0

  for (let i = 0; i < sql.length; i++) {
    const char = sql[i]
    const nextChar = sql[i + 1]
    const prevChar = sql[i - 1]

    // 处理多行注释
    if (!inSingleQuote && !inDoubleQuote && char === '/' && nextChar === '*') {
      inMultilineComment = true
      current += char
      continue
    }
    if (inMultilineComment && char === '*' && nextChar === '/') {
      inMultilineComment = false
      current += char
      continue
    }

    // 处理单行注释
    if (!inSingleQuote && !inDoubleQuote && !inMultilineComment &&
      char === '-' && nextChar === '-') {
      inComment = true
      current += char
      continue
    }
    if (inComment && char === '\n') {
      inComment = false
      current += char
      continue
    }

    // 如果在注释中,直接添加字符
    if (inComment || inMultilineComment) {
      current += char
      continue
    }

    // 处理引号
    if (char === "'" && prevChar !== '\\' && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote
    }
    if (char === '"' && prevChar !== '\\' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote
    }

    // 处理括号深度
    if (!inSingleQuote && !inDoubleQuote) {
      if (char === '(') parenDepth++
      if (char === ')') parenDepth--
    }

    // 添加字符
    current += char

    // 检查是否为语句结束符
    if (char === ';' && !inSingleQuote && !inDoubleQuote && parenDepth === 0) {
      const trimmed = current.trim()
      if (trimmed) {
        // 过滤纯注释语句
        const withoutComments = trimmed
          .split('\n')
          .filter(line => {
            const trimLine = line.trim()
            return trimLine && !trimLine.startsWith('--')
          })
          .join('\n')
          .replace(/\/\*[\s\S]*?\*\//g, '')
          .trim()

        if (withoutComments && withoutComments !== ';') {
          statements.push(current.trim())
        }
      }
      current = ''
    }
  }

  // 添加最后一个语句(如果没有分号结尾)
  const trimmed = current.trim()
  if (trimmed) {
    statements.push(trimmed)
  }

  return statements
}


async function migrate() {
  const migrationsDir = path.join(__dirname, 'migrations')

  console.log('🚀 Starting database migration...\n')

  try {
    // 检查迁移目录是否存在
    if (!fs.existsSync(migrationsDir)) {
      console.error('❌ Migrations directory not found:', migrationsDir)
      process.exit(1)
    }

    // 获取所有 SQL 迁移文件
    const files = fs
      .readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort()

    if (files.length === 0) {
      console.log('⚠️  No migration files found')
      process.exit(0)
    }

    console.log(`📁 Found ${files.length} migration file(s):\n`)
    files.forEach(f => console.log(`   - ${f}`))
    console.log('')

    // 创建迁移历史表（如果不存在）
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_filename (filename)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)

    // 获取已执行的迁移
    const [executedMigrations] = await pool.query<any[]>(
      'SELECT filename FROM migrations'
    )
    const executedSet = new Set(
      executedMigrations.map((row: any) => row.filename)
    )

    // 执行未完成的迁移
    let successCount = 0
    let skipCount = 0

    for (const file of files) {
      if (executedSet.has(file)) {
        console.log(`⏭️  Skipping (already executed): ${file}`)
        skipCount++
        continue
      }

      console.log(`\n🔄 Executing migration: ${file}`)

      const filePath = path.join(migrationsDir, file)
      const sql = fs.readFileSync(filePath, 'utf8')

      // 智能分割 SQL 语句 - 考虑括号、引号等
      const statements = splitSQLStatements(sql)

      console.log(`   📝 Found ${statements.length} SQL statement(s)`)

      // 使用事务执行
      const connection = await pool.getConnection()

      try {
        await connection.beginTransaction()

        for (let i = 0; i < statements.length; i++) {
          const statement = statements[i]
          try {
            await connection.query(statement)
            console.log(`   ✓ Statement ${i + 1}/${statements.length} executed`)
          } catch (err: any) {
            console.error(`   ✗ Statement ${i + 1} failed:`, err.message)
            throw err
          }
        }

        // 记录迁移历史
        await connection.query(
          'INSERT INTO migrations (filename) VALUES (?)',
          [file]
        )

        await connection.commit()
        console.log(`✅ Migration completed: ${file}`)
        successCount++
      } catch (error: any) {
        await connection.rollback()
        console.error(`❌ Migration failed: ${file}`)
        console.error(`   Error: ${error.message}`)
        throw error
      } finally {
        connection.release()
      }
    }

    console.log('\n' + '='.repeat(50))
    console.log('📊 Migration Summary:')
    console.log(`   ✅ Successfully executed: ${successCount}`)
    console.log(`   ⏭️  Skipped: ${skipCount}`)
    console.log(`   📁 Total files: ${files.length}`)
    console.log('='.repeat(50) + '\n')

    console.log('🎉 All migrations completed successfully!\n')

    process.exit(0)
  } catch (error: any) {
    console.error('\n❌ Migration failed with error:')
    console.error(error)
    process.exit(1)
  }
}

// 执行迁移
migrate()
