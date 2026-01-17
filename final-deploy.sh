#!/bin/bash

SERVER_IP="${1:-115.190.252.62}"

echo "🚀 最终部署 - 修复聊天接口"
echo ""

ssh root@$SERVER_IP << 'DEPLOY'

cd /var/www/hikingSocialApp/backend

echo "1️⃣ 备份并修改配置文件..."

# 修改package.json - 删除type: module
cp package.json package.json.backup
sed -i '/"type": "module",/d' package.json

# 修改tsconfig.json - 使用CommonJS
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": false,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "noEmitOnError": false,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
EOF

echo "✓ package.json - 已删除 type: module"
echo "✓ tsconfig.json - 已改用 CommonJS"

echo ""
echo "2️⃣ 修改server.ts - 移除ES module特定代码..."

# 创建修复后的server.ts（去掉import.meta相关代码）
cat > src/server.ts << 'EOF'
import express, { Express, Request, Response } from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

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

// API路由前缀
const useApiPrefix = process.env.USE_API_PREFIX !== 'false';
const apiPrefix = useApiPrefix ? `/api/${process.env.API_VERSION || 'v1'}` : '';
console.log(`API routes prefix: "${apiPrefix}" (USE_API_PREFIX=${useApiPrefix})`);

// 注册路由
app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/users`, userRoutes);
app.use(`${apiPrefix}/activities`, activityRoutes);
app.use(`${apiPrefix}/discovery`, discoveryRoutes);
app.use(`${apiPrefix}/upload`, uploadRoutes);
app.use(`${apiPrefix}/applications`, applicationRoutes);
app.use(`${apiPrefix}/friends`, friendRoutes);
app.use(`${apiPrefix}/destinations`, destinationRoutes);
app.use(`${apiPrefix}/messages`, messageRoutes);

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
      auth: `${apiPrefix}/auth`,
      users: `${apiPrefix}/users`,
      activities: `${apiPrefix}/activities`,
      discovery: `${apiPrefix}/discovery`,
      upload: `${apiPrefix}/upload`,
      messages: `${apiPrefix}/messages`
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
      console.log(`
╔════════════════════════════════════════════════════════════════╗
║          🚀 Hiking Social App Backend is Running              ║
╠════════════════════════════════════════════════════════════════╣
║  Server:  http://localhost:${PORT}                            ║
║  Env:     ${process.env.NODE_ENV || 'development'}            ║
║  API Prefix: ${apiPrefix || '(none)'}                         ║
║  Version: ${process.env.API_VERSION || 'v1'}                  ║
║  Time:    ${new Date().toISOString()}                         ║
╚════════════════════════════════════════════════════════════════╝
      `);
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
EOF

echo "✓ server.ts - 已移除 ES module 特定代码"

echo ""
echo "3️⃣ 清理并重新构建..."
rm -rf dist node_modules/.cache
npm run build

BUILD_STATUS=$?

if [ $BUILD_STATUS -ne 0 ]; then
  echo "❌ 构建失败，查看错误..."
  exit 1
fi

echo "✓ 构建成功！"

echo ""
echo "4️⃣ 检查构建产物..."
ls -la dist/ | head -10

echo ""
echo "5️⃣ 停止旧服务..."
pm2 delete all 2>/dev/null || true
sleep 2

echo ""
echo "6️⃣ 启动新服务..."
pm2 start ecosystem.config.cjs

sleep 5

pm2 list

echo ""
echo "7️⃣ 查看服务日志..."
pm2 logs hiking-app-backend --lines 20 --nostream

echo ""
echo "8️⃣ 测试API端点..."

# 测试健康检查
echo "测试健康检查..."
curl -s http://localhost:3000/health | jq '.'

# 注册测试用户
echo ""
echo "测试用户注册..."
TEST_EMAIL="finaltest$(date +%s)@example.com"
REGISTER_RESULT=$(curl -s -X POST http://localhost:3000/api/v1/auth/register \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"test123\",\"nickname\":\"FinalTest\"}")

echo "$REGISTER_RESULT" | jq '.'

TOKEN=$(echo "$REGISTER_RESULT" | jq -r '.data.token')

if [ "$TOKEN" != "null" ] && [ ! -z "$TOKEN" ]; then
  echo ""
  echo "✓ 注册成功！Token: ${TOKEN:0:30}..."

  echo ""
  echo "测试对话列表API..."
  curl -s -H "Authorization: Bearer $TOKEN" \
    http://localhost:3000/api/v1/messages/conversations | jq '.'

  echo ""
  echo "测试消息列表API..."
  curl -s -H "Authorization: Bearer $TOKEN" \
    http://localhost:3000/api/v1/messages/conversations/1 | jq '.'
fi

DEPLOY

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 部署完成！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "现在可以测试以下接口："
echo "  📋 对话列表: http://115.190.252.62/api/v1/messages/conversations"
echo "  💬 消息列表: http://115.190.252.62/api/v1/messages/conversations/{id}"
echo ""
