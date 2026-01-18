"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UploadController_1 = __importDefault(require("../controllers/UploadController"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const uploadHandler_1 = require("../middleware/uploadHandler");
const router = (0, express_1.Router)();
// 通用图片上传
router.post('/image', uploadHandler_1.upload.single('image'), UploadController_1.default.uploadImage);
// 上传并更新头像
router.post('/avatar', authMiddleware_1.authMiddleware, uploadHandler_1.upload.single('avatar'), UploadController_1.default.uploadAvatar);
// 批量上传相册图片
router.post('/photos', authMiddleware_1.authMiddleware, (0, uploadHandler_1.uploadMultiple)('photos', 6), UploadController_1.default.uploadPhotos);
exports.default = router;
//# sourceMappingURL=uploadRoutes.js.map