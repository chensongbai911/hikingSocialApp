#!/bin/bash

SERVER_IP="${1:-115.190.252.62}"

ssh root@$SERVER_IP << 'FIX_ALL'

cd /var/www/hikingSocialApp/backend

echo "🔧 完整修复TypeScript模块和API路由问题"
echo ""

# 步骤1: 恢复package.json和tsconfig
echo "1️⃣ 恢复ES modules配置..."

# 恢复type: module
sed -i '/"main": "dist\/server.js",/a\  "type": "module",' package.json 2>/dev/null || true

# 恢复tsconfig module为ES2020
cat > tsconfig.json << 'TSCONFIG'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": false,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "noEmitOnError": false,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
TSCONFIG

# 步骤2: 修复server.ts导入
echo ""
echo "2️⃣ 修复server.ts中的导入..."

cat > src/server.ts << 'SERVER_TS'
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
import { pool, testConnection } from './config/database.js';

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
import { initSocket } from './realtime/socket.js';

// 导入中间件
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';

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

// API路由前缀
const useApiPrefix = process.env.USE_API_PREFIX !== 'false';
const apiPrefix = useApiPrefix ? \`/api/\${process.env.API_VERSION || 'v1'}\` : '';
console.log(\`API routes prefix: "\${apiPrefix}" (USE_API_PREFIX=\${useApiPrefix})\`);

// 注册路由
app.use(\`\${apiPrefix}/auth\`, authRoutes);
app.use(\`\${apiPrefix}/users\`, userRoutes);
app.use(\`\${apiPrefix}/activities\`, activityRoutes);
app.use(\`\${apiPrefix}/discovery\`, discoveryRoutes);
app.use(\`\${apiPrefix}/upload\`, uploadRoutes);
app.use(\`\${apiPrefix}/applications\`, applicationRoutes);
app.use(\`\${apiPrefix}/friends\`, friendRoutes);
app.use(\`\${apiPrefix}/destinations\`, destinationRoutes);
app.use(\`\${apiPrefix}/messages\`, messageRoutes);

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
      auth: \`\${apiPrefix}/auth\`,
      users: \`\${apiPrefix}/users\`,
      activities: \`\${apiPrefix}/activities\`,
      discovery: \`\${apiPrefix}/discovery\`,
      upload: \`\${apiPrefix}/upload\`,
      messages: \`\${apiPrefix}/messages\`
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

    // 启动HTTP服务器
    const server = http.createServer(app);

    // 初始化Socket.io
    initSocket(server);

    // 启动服务器
    server.listen(PORT, () => {
      console.log(\`
╔════════════════════════════════════════════════════════════════╗
║          🚀 Hiking Social App Backend is Running              ║
╠════════════════════════════════════════════════════════════════╣
║  Server:  http://localhost:\${PORT}                            ║
║  Env:     \${process.env.NODE_ENV || 'development'}                          ║
║  API Prefix: \${apiPrefix || '(none)'}                          ║
║  Version: \${process.env.API_VERSION || 'v1'}                                    ║
║  Time:    \${new Date().toISOString()}           ║
╚════════════════════════════════════════════════════════════════╝
      \`);
    });
  } catch (error) {
    console.error('❌ 启动服务器失败:', error);
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
SERVER_TS

# 步骤3: 重新构建
echo ""
echo "3️⃣ 重新构建..."
rm -rf dist
npm run build

if [ $? -ne 0 ]; then
  echo "❌ 构建失败"
  exit 1
fi

# 步骤4: 重启服务
echo ""
echo "4️⃣ 重启PM2服务..."
pm2 delete hiking-app-backend 2>/dev/null || true

pm2 start ecosystem.config.cjs

sleep 3

pm2 list | grep hiking-app-backend

echo ""
echo "5️⃣ 查看日志..."
pm2 logs hiking-app-backend --lines 20 --nostream

echo ""
echo "✅ 修复完成！"

FIX_ALL

echo ""
echo "现在测试API..."
