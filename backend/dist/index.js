"use strict";
/**
 * 后端服务入口文件
 * 创建日期: 2026-01-19
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./config/database");
const redis_1 = __importDefault(require("./config/redis"));
const route_routes_1 = __importDefault(require("./routes/route.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const track_routes_1 = __importDefault(require("./routes/track.routes"));
// 加载环境变量
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';
// ===================================
// 中间件配置
// ===================================
// 安全头
app.use((0, helmet_1.default)());
// CORS
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
}));
// 解析 JSON
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// 请求日志 (开发环境)
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
        next();
    });
}
// ===================================
// 路由配置
// ===================================
// 健康检查
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});
// API 路由
app.use('/api/v1/routes', route_routes_1.default);
app.use('/api/v1/users', user_routes_1.default);
app.use('/api/v1/tracks', track_routes_1.default);
// 404 处理
app.use((req, res) => {
    res.status(404).json({
        code: 404,
        message: 'API endpoint not found',
        path: req.path,
    });
});
// 错误处理
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        code: 500,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
});
// ===================================
// 启动服务器
// ===================================
async function startServer() {
    try {
        // 测试数据库连接
        const dbConnected = await (0, database_1.testConnection)();
        if (!dbConnected) {
            console.error('❌ Failed to connect to database');
            process.exit(1);
        }
        // 测试 Redis 连接
        await redis_1.default.ping();
        console.log('✅ Redis connection verified');
        // 启动服务器
        app.listen(PORT, () => {
            console.log('\n' + '='.repeat(50));
            console.log('🚀 Server Information:');
            console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`   URL: http://${HOST}:${PORT}`);
            console.log(`   Health Check: http://${HOST}:${PORT}/health`);
            console.log(`   API Base: http://${HOST}:${PORT}/api/v1`);
            console.log('='.repeat(50) + '\n');
            console.log('✅ Server is ready to accept requests\n');
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}
// 优雅关闭
process.on('SIGTERM', () => {
    console.log('\n⚠️  SIGTERM received, shutting down gracefully...');
    process.exit(0);
});
process.on('SIGINT', () => {
    console.log('\n⚠️  SIGINT received, shutting down gracefully...');
    process.exit(0);
});
// 启动
startServer();
exports.default = app;
//# sourceMappingURL=index.js.map