"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
// 日志工具
const winston_1 = __importDefault(require("winston"));
const logLevel = process.env.LOG_LEVEL || 'info';
exports.logger = winston_1.default.createLogger({
    level: logLevel,
    format: winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json()),
    defaultMeta: { service: 'hiking-app-api' },
    transports: [
        new winston_1.default.transports.Console({
            format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.printf(({ level, message, timestamp, ...meta }) => {
                let msg = `${timestamp} [${level}]: ${message}`;
                if (Object.keys(meta).length > 0 && meta.service !== 'hiking-app-api') {
                    msg += ` ${JSON.stringify(meta)}`;
                }
                return msg;
            })),
        }),
        new winston_1.default.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        new winston_1.default.transports.File({
            filename: 'logs/combined.log',
            maxsize: 5242880,
            maxFiles: 5,
        }),
    ],
});
//# sourceMappingURL=logger.js.map