"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const UserController_1 = require("../controllers/UserController");
const UserDetailController_1 = require("../controllers/UserDetailController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const uploadHandler_1 = require("../middleware/uploadHandler");
const router = express_1.default.Router();
/**
 * 用户路由
 * 基础路径: /api/v1/users
 * 所有路由都需要认证
 */
// 用户资料管理
router.get('/profile', authMiddleware_1.authMiddleware, UserController_1.UserController.getProfile);
router.get('/:userId/profile', authMiddleware_1.authMiddleware, UserController_1.UserController.getUserProfile);
router.put('/profile', authMiddleware_1.authMiddleware, UserController_1.UserController.updateProfile);
// 用户详情（包含关注者、徒步次数等）
router.get('/:userId/detail', authMiddleware_1.authMiddleware, UserDetailController_1.UserDetailController.getUserDetail);
// 关注功能
router.post('/:userId/follow', authMiddleware_1.authMiddleware, UserDetailController_1.UserDetailController.followUser);
router.delete('/:userId/follow', authMiddleware_1.authMiddleware, UserDetailController_1.UserDetailController.unfollowUser);
router.get('/:userId/follow-status', authMiddleware_1.authMiddleware, UserDetailController_1.UserDetailController.getFollowStatus);
// 头像管理 - 使用文件上传
router.post('/avatar', authMiddleware_1.authMiddleware, (0, uploadHandler_1.uploadSingle)('avatar'), UserController_1.UserController.updateAvatar);
// 相册管理
router.get('/photos', authMiddleware_1.authMiddleware, UserController_1.UserController.getPhotos);
router.post('/photos', authMiddleware_1.authMiddleware, UserController_1.UserController.addPhoto);
router.delete('/photos/:photoId', authMiddleware_1.authMiddleware, UserController_1.UserController.deletePhoto);
// 用户偏好管理
router.get('/preferences', authMiddleware_1.authMiddleware, UserController_1.UserController.getPreferences);
router.put('/preferences', authMiddleware_1.authMiddleware, UserController_1.UserController.updatePreferences);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map