import multer from 'multer'
import path from 'path'
import fs from 'fs'

// CommonJS: __dirname 自动可用

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../../uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// 配置存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // 根据文件类型创建子目录
    let dir = uploadDir
    if (req.path.includes('avatar')) {
      dir = path.join(uploadDir, 'avatars')
    } else if (req.path.includes('activity')) {
      dir = path.join(uploadDir, 'activities')
    } else if (req.path.includes('message')) {
      dir = path.join(uploadDir, 'messages')
    }

    // 创建目录如果不存在
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    cb(null, dir)
  },
  filename: (req, file, cb) => {
    // 生成唯一的文件名
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${path.extname(
      file.originalname
    )}`
    cb(null, uniqueName)
  },
})

// 文件过滤器
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  // 允许的图片类型
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(
      new Error(
        `不支持的文件类型: ${file.mimetype}。允许的类型: ${allowedMimes.join(', ')}`
      )
    )
  }
}

// 创建 multer 实例
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
})

// 单文件上传中间件
export const uploadSingle = (fieldName: string = 'file') => {
  return upload.single(fieldName)
}

// 多文件上传中间件
export const uploadMultiple = (fieldName: string = 'files', maxFiles: number = 9) => {
  return upload.array(fieldName, maxFiles)
}

// 获取文件 URL
export const getFileUrl = (filename: string, type: string = 'avatars'): string => {
  return `/uploads/${type}/${filename}`
}

export default upload
