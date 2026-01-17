#!/bin/bash

SERVER_IP="${1:-115.190.252.62}"

ssh root@$SERVER_IP << 'FIX_META'

cd /var/www/hikingSocialApp/backend

echo "🔧 修复剩余的 import.meta 问题..."

# 1. 修复 uploadHandler.ts
cat > src/middleware/uploadHandler.ts << 'EOF'
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// CommonJS: __dirname 直接可用
const uploadDir = path.join(__dirname, '../../uploads');

// 确保上传目录存在
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});
EOF

# 2. 修复 UploadService.ts
cat > src/services/UploadService.ts << 'EOF'
import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';

export class UploadService {
  private uploadDir: string;

  constructor() {
    // CommonJS: __dirname 直接可用
    this.uploadDir = path.join(__dirname, '../../uploads');
  }

  async processImage(filePath: string, maxWidth = 1200): Promise<string> {
    const outputPath = filePath.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '-processed.$1');

    await sharp(filePath)
      .resize(maxWidth, null, {
        withoutEnlargement: true,
        fit: 'inside',
      })
      .toFile(outputPath);

    // 删除原文件
    await fs.unlink(filePath);

    return outputPath;
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('删除文件失败:', error);
    }
  }
}

export const uploadService = new UploadService();
EOF

# 3. 修复 initDestinations.ts
cat > src/scripts/initDestinations.ts << 'EOF'
import { pool } from '../config/database';
import path from 'path';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const destinations = [
  {
    id: 'dest-001',
    name: '黄山',
    location: '安徽省黄山市',
    difficulty: 'intermediate',
    description: '世界文化与自然双重遗产，中国十大风景名胜之一',
    image_url: 'https://example.com/images/huangshan.jpg',
  },
  // 更多目的地...
];

async function initDestinations() {
  const connection = await pool.getConnection();

  try {
    console.log('开始初始化目的地数据...');

    for (const dest of destinations) {
      await connection.query(
        `INSERT INTO destinations (id, name, location, difficulty, description, image_url, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
         ON DUPLICATE KEY UPDATE updated_at = NOW()`,
        [dest.id, dest.name, dest.location, dest.difficulty, dest.description, dest.image_url]
      );
    }

    console.log('✅ 目的地数据初始化成功');
  } catch (error) {
    console.error('❌ 初始化失败:', error);
  } finally {
    connection.release();
    await pool.end();
  }
}

initDestinations();
EOF

echo "✓ 已修复所有 import.meta 问题"

echo ""
echo "重新构建..."
rm -rf dist
npm run build

if [ $? -eq 0 ]; then
  echo "✅ 构建成功！"

  echo ""
  echo "重启服务..."
  pm2 restart hiking-app-backend || pm2 start ecosystem.config.cjs

  sleep 3

  echo ""
  pm2 list

  echo ""
  echo "测试API..."
  curl -s http://localhost:3000/health | jq '.'
else
  echo "❌ 构建仍然失败"
fi

FIX_META

echo ""
echo "修复完成！"
