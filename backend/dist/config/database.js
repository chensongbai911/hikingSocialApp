"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.testConnection = testConnection;
exports.closePool = closePool;
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// 数据库配置
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'senbochen',
    database: process.env.DB_NAME || 'hiking_app',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
};
console.log('Database config:', {
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password ? '***' : 'EMPTY',
    database: dbConfig.database,
});
// 创建连接池
exports.pool = promise_1.default.createPool(dbConfig);
/**
 * 测试数据库连接
 */
async function testConnection() {
    try {
        const connection = await exports.pool.getConnection();
        console.log('✅ Database connected successfully');
        connection.release();
        return true;
    }
    catch (error) {
        console.error('❌ Database connection failed:', error);
        return false;
    }
}
/**
 * 关闭连接池
 */
async function closePool() {
    await exports.pool.end();
    console.log('Database pool closed');
}
//# sourceMappingURL=database.js.map