"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = void 0;
/**
 * 请求日志中间件
 * 记录每个API请求的基本信息
 */
const requestLogger = (req, res, next) => {
    const start = Date.now();
    // 记录响应完成
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logMessage = `${req.method} ${req.path} ${res.statusCode} - ${duration}ms`;
        if (res.statusCode >= 400) {
            console.warn(`⚠️  ${logMessage}`);
        }
        else {
            console.log(`✅ ${logMessage}`);
        }
    });
    next();
};
exports.requestLogger = requestLogger;
//# sourceMappingURL=requestLogger.js.map