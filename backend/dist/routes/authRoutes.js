"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const AuthController_1 = require("../controllers/AuthController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
/**
 * 认证路由
 * 基础路径: /api/v1/auth
 */
// 公开路由（不需要认证）
router.post('/register', AuthController_1.AuthController.register);
router.post('/login', AuthController_1.AuthController.login);
router.post('/refresh', AuthController_1.AuthController.refreshToken);
// 受保护路由（需要认证）
router.post('/logout', authMiddleware_1.authMiddleware, AuthController_1.AuthController.logout);
router.get('/me', authMiddleware_1.authMiddleware, AuthController_1.AuthController.getCurrentUser);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map