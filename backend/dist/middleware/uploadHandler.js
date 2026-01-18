"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileUrl = exports.uploadMultiple = exports.uploadSingle = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// CommonJS: __dirname 自动可用
// 确保上传目录存在
const uploadDir = path_1.default.join(__dirname, '../../uploads');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
// 配置存储
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        // 根据文件类型创建子目录
        let dir = uploadDir;
        if (req.path.includes('avatar')) {
            dir = path_1.default.join(uploadDir, 'avatars');
        }
        else if (req.path.includes('activity')) {
            dir = path_1.default.join(uploadDir, 'activities');
        }
        else if (req.path.includes('message')) {
            dir = path_1.default.join(uploadDir, 'messages');
        }
        // 创建目录如果不存在
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        // 生成唯一的文件名
        const uniqueName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${path_1.default.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});
// 文件过滤器
const fileFilter = (req, file, cb) => {
    // 允许的图片类型
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error(`不支持的文件类型: ${file.mimetype}。允许的类型: ${allowedMimes.join(', ')}`));
    }
};
// 创建 multer 实例
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
});
// 单文件上传中间件
const uploadSingle = (fieldName = 'file') => {
    return exports.upload.single(fieldName);
};
exports.uploadSingle = uploadSingle;
// 多文件上传中间件
const uploadMultiple = (fieldName = 'files', maxFiles = 9) => {
    return exports.upload.array(fieldName, maxFiles);
};
exports.uploadMultiple = uploadMultiple;
// 获取文件 URL
const getFileUrl = (filename, type = 'avatars') => {
    return `/uploads/${type}/${filename}`;
};
exports.getFileUrl = getFileUrl;
exports.default = exports.upload;
//# sourceMappingURL=uploadHandler.js.map