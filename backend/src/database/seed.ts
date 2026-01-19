import fs from 'fs'
import path from 'path'
import { pool } from '../config/database'

// 复制 migrate.ts 的智能分割逻辑，确保能逐条执行
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

    if (!inSingleQuote && !inDoubleQuote && !inMultilineComment && char === '-' && nextChar === '-') {
      inComment = true
      current += char
      continue
    }
    if (inComment && char === '\n') {
      inComment = false
      current += char
      continue
    }

    if (inComment || inMultilineComment) {
      current += char
      continue
    }

    if (char === "'" && prevChar !== '\\' && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote
    }
    if (char === '"' && prevChar !== '\\' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote
    }

    if (!inSingleQuote && !inDoubleQuote) {
      if (char === '(') parenDepth++
      if (char === ')') parenDepth--
    }

    current += char

    if (char === ';' && !inSingleQuote && !inDoubleQuote && parenDepth === 0) {
      const trimmed = current.trim()
      if (trimmed) {
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

  const trimmed = current.trim()
  if (trimmed) {
    statements.push(trimmed)
  }

  return statements
}

async function runSQLFile(sqlPath: string) {
  const sql = fs.readFileSync(sqlPath, 'utf8')
  const statements = splitSQLStatements(sql)
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    for (let i = 0; i < statements.length; i++) {
      await connection.query(statements[i])
      console.log(`   ✓ Statement ${i + 1}/${statements.length}`)
    }
    await connection.commit()
    console.log(`✓ Executed: ${path.basename(sqlPath)}`)
  } catch (err) {
    await connection.rollback()
    console.error(`✗ Failed: ${path.basename(sqlPath)} ->`, (err as any).message)
    throw err
  } finally {
    connection.release()
  }
}

async function main() {
  try {
    const createFile = path.join(__dirname, 'create_applications_friendships.sql')
    const sqlFile = path.join(__dirname, 'seed_v1_5_0.sql')
    console.log('🚀 Seeding v1.5.0 test data...')
    // 先尝试创建需要的表(如果存在则不会重复创建)
    if (fs.existsSync(createFile)) {
      await runSQLFile(createFile)
    } else {
      console.warn('⚠️  Create SQL not found:', createFile)
    }
    // 再插入测试数据
    if (fs.existsSync(sqlFile)) {
      await runSQLFile(sqlFile)
    } else {
      console.error('Seed SQL not found:', sqlFile)
      process.exit(1)
    }
    console.log('✅ Seed completed')
    process.exit(0)
  } catch (err) {
    console.error('❌ Seed failed:', err)
    process.exit(1)
  }
}

main()
