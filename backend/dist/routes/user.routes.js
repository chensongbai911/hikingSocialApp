"use strict";
/**
 * 用户路由配置
 * 创建日期: 2026-01-19
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
/**
 * @route   POST /api/v1/users/register
 * @desc    用户注册
 * @access  Public
 */
router.post('/register', user_controller_1.register);
/**
 * @route   POST /api/v1/users/login
 * @desc    用户登录
 * @access  Public
 */
router.post('/login', user_controller_1.login);
/**
 * @route   GET /api/v1/users/me
 * @desc    获取当前用户信息
 * @access  Private
 */
router.get('/me', auth_1.authenticateToken, user_controller_1.getCurrentUser);
/**
 * @route   GET /api/v1/users/:id
 * @desc    获取用户公开信息
 * @access  Public
 */
router.get('/:id', user_controller_1.getUserProfile);
/**
 * @route   PUT /api/v1/users/profile
 * @desc    更新用户信息
 * @access  Private
 */
router.put('/profile', auth_1.authenticateToken, user_controller_1.updateProfile);
/**
 * @route   POST /api/v1/users/avatar
 * @desc    上传头像
 * @access  Private
 */
router.post('/avatar', auth_1.authenticateToken, user_controller_1.uploadAvatar);
exports.default = router;
//# sourceMappingURL=user.routes.js.map