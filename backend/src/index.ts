/**
 * 后端服务入口文件
 * 创建日期: 2026-01-19
 */

import express, { Application, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { testConnection } from './config/database'
import redis from './config/redis'
import routeRoutes from './routes/route.routes'
import userRoutes from './routes/user.routes'
import trackRoutes from './routes/track.routes'

// 加载环境变量
dotenv.config()

const app: Application = express()
const PORT = process.env.PORT || 3000
const HOST = process.env.HOST || 'localhost'

// ===================================
// 中间件配置
// ===================================

// 安全头
app.use(helmet())

// CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
)

// 解析 JSON
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// 请求日志 (开发环境)
if (process.env.NODE_ENV === 'development') {
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
    next()
  })
}

// ===================================
// 路由配置
// ===================================

// 健康检查
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

// API 路由
app.use('/api/v1/routes', routeRoutes)
app.use('/api/v1/users', userRoutes)
app.use('/api/v1/tracks', trackRoutes)

// 404 处理
app.use((req: Request, res: Response) => {
  res.status(404).json({
    code: 404,
    message: 'API endpoint not found',
    path: req.path,
  })
})

// 错误处理
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err)
  res.status(500).json({
    code: 500,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  })
})

// ===================================
// 启动服务器
// ===================================

async function startServer(): Promise<void> {
  try {
    // 测试数据库连接
    const dbConnected = await testConnection()
    if (!dbConnected) {
      console.error('❌ Failed to connect to database')
      process.exit(1)
    }

    // 测试 Redis 连接
    await redis.ping()
    console.log('✅ Redis connection verified')

    // 启动服务器
    app.listen(PORT, () => {
      console.log('\n' + '='.repeat(50))
      console.log('🚀 Server Information:')
      console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`)
      console.log(`   URL: http://${HOST}:${PORT}`)
      console.log(`   Health Check: http://${HOST}:${PORT}/health`)
      console.log(`   API Base: http://${HOST}:${PORT}/api/v1`)
      console.log('='.repeat(50) + '\n')
      console.log('✅ Server is ready to accept requests\n')
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('\n⚠️  SIGTERM received, shutting down gracefully...')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('\n⚠️  SIGINT received, shutting down gracefully...')
  process.exit(0)
})

// 启动
startServer()

export default app
