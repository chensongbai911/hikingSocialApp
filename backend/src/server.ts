import express, { Express, Request, Response } from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载环境变量
const envPath = path.resolve(__dirname, '../.env');
console.log('Loading .env from:', envPath);
dotenv.config({ path: envPath });

// 导入数据库配置
import { pool, testConnection } from './config/database';

// 导入路由
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import activityRoutes from './routes/activityRoutes';
import discoveryRoutes from './routes/discoveryRoutes';
import uploadRoutes from './routes/uploadRoutes';
import applicationRoutes from './routes/applicationRoutes';
import friendRoutes from './routes/friendRoutes';
import destinationRoutes from './routes/destinationRoutes';
import messageRoutes from './routes/messageRoutes';
import { initSocket } from './realtime/socket';

// 导入中间件
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

const app: Express = express();
const PORT = process.env.PORT || 3000;

// 中间件配置
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true,
  })
);

// 增加请求体大小限制，支持多图片上传（base64）
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 请求日志
app.use(requestLogger);

// 静态文件服务 - uploads目录
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API路由
const apiVersion = `/api/${process.env.API_VERSION || 'v1'}`;
console.log(`API base path: ${apiVersion}`);

// 注册路由
app.use(`${apiVersion}/auth`, authRoutes);
app.use(`${apiVersion}/users`, userRoutes);
app.use(`${apiVersion}/activities`, activityRoutes);
app.use(`${apiVersion}/discovery`, discoveryRoutes);
app.use(`${apiVersion}/upload`, uploadRoutes);
app.use(`${apiVersion}/applications`, applicationRoutes);
app.use(`${apiVersion}/friends`, friendRoutes);
app.use(`${apiVersion}/destinations`, destinationRoutes);
app.use(`${apiVersion}/messages`, messageRoutes);

// 健康检查端点
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || 'v1'
  });
});

// 根路径
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Hiking Social App API',
    version: process.env.API_VERSION || 'v1',
    endpoints: {
      health: '/health',
      auth: `${apiVersion}/auth`,
      users: `${apiVersion}/users`,
      activities: `${apiVersion}/activities`,
      discovery: `${apiVersion}/discovery`,
      upload: `${apiVersion}/upload`,
      messages: `${apiVersion}/messages`
    }
  });
});

// 404处理
app.use((req: Request, res: Response) => {
  res.status(404).json({
    code: 404,
    message: 'API端点不存在',
    path: req.path
  });
});

// 错误处理中间件（必须放在最后）
app.use(errorHandler);

// 启动服务器
const startServer = async () => {
  try {
    // 测试数据库连接
    const isConnected = await testConnection();

    if (!isConnected) {
      console.error('❌ 无法连接到数据库，服务器启动失败');
      process.exit(1);
    }

    // 启动HTTP服务器 + WebSocket
    const httpServer = http.createServer(app)
    initSocket(httpServer)
    httpServer.listen(PORT, () => {
      console.log('='.repeat(50));
      console.log(`🚀 服务器启动成功！`);
      console.log(`📍 地址: http://localhost:${PORT}`);
      console.log(`📚 API版本: ${apiVersion}`);
      console.log(`🔐 环境: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📂 上传目录: ${path.join(__dirname, '../uploads')}`);
      console.log('='.repeat(50));
    });
  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
};

// 优雅关闭
process.on('SIGTERM', async () => {
  console.log('收到SIGTERM信号，正在关闭服务器...');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n收到SIGINT信号，正在关闭服务器...');
  await pool.end();
  process.exit(0);
});

startServer();

export default app;
