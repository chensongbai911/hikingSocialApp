#!/bin/bash

# ===================================================================
# 🔧 最终修复 - 更新server.ts使用正确的路由配置
# ===================================================================

SERVER_IP="${1:-115.190.252.62}"

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   🔧 最终修复 - 更新 server.ts 路由配置                   ║"
echo "║   服务器: $SERVER_IP"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

ssh root@$SERVER_IP << 'FINAL_ROUTE_FIX'

cd /var/www/hikingSocialApp/backend

echo "🎯 修复 server.ts 中的路由配置..."
echo ""

# 备份原始文件
cp src/server.ts src/server.ts.backup.$(date +%Y%m%d_%H%M%S)

# 创建修复后的 server.ts
cat > src/server.ts << 'SERVER_TS'
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import { createServer } from 'http';
import dotenv from 'dotenv';
import path from 'path';

// 导入中间件
import requestLogger from './middleware/requestLogger.js';
import errorHandler from './middleware/errorHandler.js';
import authMiddleware from './middleware/authMiddleware.js';

// 导入路由
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import discoveryRoutes from './routes/discoveryRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import friendRoutes from './routes/friendRoutes.js';
import destinationRoutes from './routes/destinationRoutes.js';
import messageRoutes from './routes/messageRoutes.js';

// 导入其他模块
import { initializeSocket } from './realtime/socket.js';
import sequelize from './config/database.js';

// 加载环境变量
dotenv.config();

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

// 🔧 修复：支持通过环境变量控制 API 前缀
const useApiPrefix = process.env.USE_API_PREFIX !== 'false'; // 默认为 true
const apiPrefix = useApiPrefix ? `/api/${process.env.API_VERSION || 'v1'}` : '';

console.log(`🚀 API routes prefix: "${apiPrefix}" (USE_API_PREFIX=${useApiPrefix})`);

// 注册路由 - 使用动态前缀
app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/users`, userRoutes);
app.use(`${apiPrefix}/activities`, activityRoutes);
app.use(`${apiPrefix}/discovery`, discoveryRoutes);
app.use(`${apiPrefix}/upload`, uploadRoutes);
app.use(`${apiPrefix}/applications`, applicationRoutes);
app.use(`${apiPrefix}/friends`, friendRoutes);
app.use(`${apiPrefix}/destinations`, destinationRoutes);
app.use(`${apiPrefix}/messages`, messageRoutes);

console.log(`📋 Routes registered with prefix: "${apiPrefix}"`);
console.log(`📋 Example routes:`);
console.log(`   - ${apiPrefix}/messages/conversations`);
console.log(`   - ${apiPrefix}/users/:userId/detail`);
console.log(`   - ${apiPrefix}/auth/login`);

// 健康检查端点 - 始终在根路径
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || 'v1',
    environment: process.env.NODE_ENV || 'development',
    apiPrefix: apiPrefix
  });
});

// 根路径
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Hiking Social App API Server',
    version: process.env.API_VERSION || 'v1',
    apiPrefix: apiPrefix,
    endpoints: {
      health: '/health',
      messages: `${apiPrefix}/messages/conversations`,
      users: `${apiPrefix}/users/:userId/detail`,
      auth: `${apiPrefix}/auth/login`
    }
  });
});

// 调试路由（仅开发环境）
if (process.env.NODE_ENV !== 'production') {
  app.get('/debug/routes', (req: Request, res: Response) => {
    const routes = [
      `${apiPrefix}/auth/*`,
      `${apiPrefix}/users/*`,
      `${apiPrefix}/activities/*`,
      `${apiPrefix}/discovery/*`,
      `${apiPrefix}/upload/*`,
      `${apiPrefix}/applications/*`,
      `${apiPrefix}/friends/*`,
      `${apiPrefix}/destinations/*`,
      `${apiPrefix}/messages/*`,
      '/health',
      '/'
    ];
    res.json({
      apiPrefix,
      useApiPrefix,
      routes
    });
  });
}

// 404处理
app.use((req: Request, res: Response) => {
  res.status(404).json({
    code: 404,
    message: 'API端点不存在',
    path: req.path,
    availablePrefix: apiPrefix,
    suggestion: `请尝试使用前缀 "${apiPrefix}" 访问API端点`
  });
});

// 错误处理中间件（必须放在最后）
app.use(errorHandler);

// 启动服务器
const startServer = async () => {
  try {
    // 测试数据库连接
    try {
      await sequelize.authenticate();
      console.log('✅ 数据库连接成功');
    } catch (error) {
      console.warn('⚠️ 数据库连接失败:', error.message);
      console.warn('⚠️ 服务器将继续启动，但数据库功能不可用');
    }

    // 创建HTTP服务器
    const server = createServer(app);

    // 初始化Socket.IO
    const io = new Server(server, {
      cors: {
        origin: process.env.CORS_ORIGIN?.split(',') || '*',
        methods: ['GET', 'POST'],
      },
    });

    initializeSocket(io);

    // 启动服务器
    server.listen(PORT, () => {
      console.log(`🚀 服务器运行在端口 ${PORT}`);
      console.log(`🔧 环境: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔧 API前缀: "${apiPrefix}"`);
      console.log(`🔧 USE_API_PREFIX: ${useApiPrefix}`);
      console.log(`📍 健康检查: http://localhost:${PORT}/health`);
      console.log(`📍 API文档: http://localhost:${PORT}/`);
      if (apiPrefix) {
        console.log(`📍 消息API: http://localhost:${PORT}${apiPrefix}/messages/conversations`);
        console.log(`📍 用户API: http://localhost:${PORT}${apiPrefix}/users/:userId/detail`);
      } else {
        console.log(`📍 消息API: http://localhost:${PORT}/messages/conversations`);
        console.log(`📍 用户API: http://localhost:${PORT}/users/:userId/detail`);
      }
    });

  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
};

startServer();
SERVER_TS

echo "✅ server.ts 已更新"

# 重启服务
echo ""
echo "重启服务以应用更改..."
pm2 restart hiking-app-backend --update-env

echo ""
echo "等待服务启动..."
sleep 5

# 查看启动日志
echo ""
echo "查看启动日志..."
pm2 logs hiking-app-backend --lines 20 --nostream

echo ""
echo "测试修复后的路由..."

# 测试健康检查
echo "1. 健康检查:"
curl -s http://localhost:3000/health | python3 -m json.tool || curl -s http://localhost:3000/health

echo ""
echo "2. 根路径信息:"
curl -s http://localhost:3000/ | python3 -m json.tool || curl -s http://localhost:3000/

echo ""
echo "3. 测试API路由 (无前缀):"
echo "   消息接口: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/messages/conversations)"
echo "   用户接口: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/users/test/detail)"

echo ""
echo "4. 通过 Nginx 测试:"
echo "   /health: $(curl -s -o /dev/null -w "%{http_code}" http://localhost/health)"
echo "   /api/v1/messages/conversations: $(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/v1/messages/conversations)"
echo "   /api/v1/users/test/detail: $(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/v1/users/test/detail)"

echo ""
echo "🎉 修复完成！"

FINAL_ROUTE_FIX

echo ""
echo "✅ 最终路由修复完成！"
echo ""
