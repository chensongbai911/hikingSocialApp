import fs from 'fs'
import path from 'path'
import { pool } from '../config/database'
import { RowDataPacket, ResultSetHeader } from 'mysql2'
import sharp from 'sharp'
import { UploadService } from '../services/UploadService'

function isHttp(url: string) {
  return /^https?:\/\//i.test(url)
}

function isUploadsPath(url: string) {
  return url.startsWith('/uploads/') || url.startsWith('uploads/')
}

function isDataUrl(url: string) {
  return /^data:image\/(png|jpeg|jpg|webp);base64,/i.test(url)
}

function looksLikeBase64(url: string) {
  // Heuristic: long string with only base64 chars
  return /^[A-Za-z0-9+/=]+$/.test(url) && url.length > 256
}

async function ensureDir(dir: string) {
  await fs.promises.mkdir(dir, { recursive: true })
}

async function writeBufferToFile(buffer: Buffer, filePath: string) {
  await ensureDir(path.dirname(filePath))
  await fs.promises.writeFile(filePath, buffer)
}

async function migrateOnePhoto(row: any, uploadsDir: string): Promise<string | null> {
  const id = row.id as string
  let src = row.photo_url as string
  if (!src) return null

  try {
    let buffer: Buffer | null = null
    let ext = '.jpg'

    if (isDataUrl(src)) {
      const comma = src.indexOf(',')
      const meta = src.substring(0, comma)
      if (/png/i.test(meta)) ext = '.png'
      else if (/webp/i.test(meta)) ext = '.webp'
      const b64 = src.substring(comma + 1)
      buffer = Buffer.from(b64, 'base64')
    } else if (looksLikeBase64(src)) {
      // Assume jpeg when no metadata
      buffer = Buffer.from(src, 'base64')
    } else {
      return null
    }

    const fileName = `photo-${id}-${Date.now()}${ext}`
    const absFile = path.join(uploadsDir, 'activities', fileName)
    await writeBufferToFile(buffer!, absFile)

    // Generate thumbnail
    try {
      await UploadService.generateThumbnail(absFile)
    } catch { }

    const url = UploadService.getFileUrl(absFile)
    await pool.query<ResultSetHeader>(
      'UPDATE user_photos SET photo_url = ?, updated_at = NOW() WHERE id = ?',
      [url, id]
    )

    return url
  } catch (err) {
    console.error('migrate photo failed:', id, err)
    return null
  }
}

async function main() {
  const uploadsRoot = path.resolve(__dirname, '../../uploads')
  await ensureDir(path.join(uploadsRoot, 'activities'))

  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT id, photo_url FROM user_photos ORDER BY created_at ASC'
  )

  let migrated = 0
  for (const row of rows) {
    const url = row.photo_url as string
    if (!url || isHttp(url) || isUploadsPath(url)) continue
    const result = await migrateOnePhoto(row, uploadsRoot)
    if (result) {
      migrated++
      console.log('migrated:', row.id, '->', result)
    }
  }

  console.log(`✅ migration finished, migrated ${migrated} records`)
  process.exit(0)
}

main().catch(err => {
  console.error('migration error:', err)
  process.exit(1)
})
