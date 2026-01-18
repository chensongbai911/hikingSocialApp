"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// 加载环境变量 - 支持多种路径
let envPath = path_1.default.resolve(__dirname, '../.env');
// 如果从dist目录运行，尝试替代路径
if (!require('fs').existsSync(envPath)) {
    envPath = path_1.default.resolve(__dirname, '../../.env');
}
// 最后的兜底 - 当前工作目录下的.env
if (!require('fs').existsSync(envPath)) {
    envPath = path_1.default.resolve(process.cwd(), '.env');
}
console.log('Loading .env from:', envPath);
dotenv_1.default.config({ path: envPath });
console.log('[Server] NODE_ENV:', process.env.NODE_ENV);
console.log('[Server] API_BASE_URL:', process.env.API_BASE_URL || 'NOT SET');
console.log('[Server] PORT:', process.env.PORT);
// 导入数据库配置
const database_1 = require("./config/database");
// 导入路由
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const activityRoutes_1 = __importDefault(require("./routes/activityRoutes"));
const discoveryRoutes_1 = __importDefault(require("./routes/discoveryRoutes"));
const uploadRoutes_1 = __importDefault(require("./routes/uploadRoutes"));
const applicationRoutes_1 = __importDefault(require("./routes/applicationRoutes"));
const friendRoutes_1 = __importDefault(require("./routes/friendRoutes"));
const destinationRoutes_1 = __importDefault(require("./routes/destinationRoutes"));
const messageRoutes_1 = __importDefault(require("./routes/messageRoutes"));
const socket_1 = require("./realtime/socket");
// 导入中间件
const errorHandler_1 = require("./middleware/errorHandler");
const requestLogger_1 = require("./middleware/requestLogger");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// 中间件配置
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true,
}));
// 增加请求体大小限制，支持多图片上传（base64）
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// 请求日志
app.use(requestLogger_1.requestLogger);
// 静态文件服务 - uploads目录
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// API路由前缀
// 当 USE_API_PREFIX 为 true 时，路由会被注册在 /api/v1 下（用于直接访问）
// 当 USE_API_PREFIX 为 false 时，路由直接注册（用于 Nginx 代理已处理前缀的情况）
const useApiPrefix = process.env.USE_API_PREFIX !== 'false'; // 默认为 true
const apiPrefix = useApiPrefix ? `/api/${process.env.API_VERSION || 'v1'}` : '';
console.log(`API routes prefix: "${apiPrefix}" (USE_API_PREFIX=${useApiPrefix})`);
// 注册路由
app.use(`${apiPrefix}/auth`, authRoutes_1.default);
app.use(`${apiPrefix}/users`, userRoutes_1.default);
app.use(`${apiPrefix}/activities`, activityRoutes_1.default);
app.use(`${apiPrefix}/discovery`, discoveryRoutes_1.default);
app.use(`${apiPrefix}/upload`, uploadRoutes_1.default);
app.use(`${apiPrefix}/applications`, applicationRoutes_1.default);
app.use(`${apiPrefix}/friends`, friendRoutes_1.default);
app.use(`${apiPrefix}/destinations`, destinationRoutes_1.default);
app.use(`${apiPrefix}/messages`, messageRoutes_1.default);
// 健康检查端点
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: process.env.API_VERSION || 'v1'
    });
});
// 根路径
app.get('/', (req, res) => {
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
app.use((req, res) => {
    res.status(404).json({
        code: 404,
        message: 'API端点不存在',
        path: req.path
    });
});
// 错误处理中间件（必须放在最后）
app.use(errorHandler_1.errorHandler);
// 启动服务器
const startServer = async () => {
    try {
        // 测试数据库连接
        const isConnected = await (0, database_1.testConnection)();
        if (!isConnected) {
            console.error('❌ 无法连接到数据库，服务器启动失败');
            process.exit(1);
        }
        // 启动HTTP服务器 + WebSocket
        const httpServer = http_1.default.createServer(app);
        (0, socket_1.initSocket)(httpServer);
        httpServer.listen(PORT, () => {
            console.log('='.repeat(50));
            console.log(`🚀 服务器启动成功！`);
            console.log(`📍 地址: http://localhost:${PORT}`);
            console.log(`📚 API前缀: ${apiPrefix || '/'}`);
            console.log(`🔐 环境: ${process.env.NODE_ENV || 'development'}`);
            console.log(`📂 上传目录: ${path_1.default.join(__dirname, '../uploads')}`);
            console.log('='.repeat(50));
        });
    }
    catch (error) {
        console.error('❌ 服务器启动失败:', error);
        process.exit(1);
    }
};
// 优雅关闭
process.on('SIGTERM', async () => {
    console.log('收到SIGTERM信号，正在关闭服务器...');
    await database_1.pool.end();
    process.exit(0);
});
process.on('SIGINT', async () => {
    console.log('\n收到SIGINT信号，正在关闭服务器...');
    await database_1.pool.end();
    process.exit(0);
});
startServer();
exports.default = app;
//# sourceMappingURL=server.js.map