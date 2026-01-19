"use strict";
/**
 * 路线路由配置
 * 创建日期: 2026-01-19
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const route_controller_1 = require("../controllers/route.controller");
// import { authenticateToken } from '../middleware/auth' // JWT 中间件（待实现）
const router = express_1.default.Router();
/**
 * @route   GET /api/v1/routes
 * @desc    获取路线列表
 * @access  Public
 */
router.get('/', route_controller_1.getRouteList);
/**
 * @route   GET /api/v1/routes/:id
 * @desc    获取路线详情
 * @access  Public
 */
router.get('/:id', route_controller_1.getRouteDetail);
/**
 * @route   POST /api/v1/routes
 * @desc    创建路线
 * @access  Private (需登录)
 */
router.post('/', route_controller_1.createRoute);
// router.post('/', authenticateToken, createRoute) // 启用 JWT 后使用
/**
 * @route   PUT /api/v1/routes/:id
 * @desc    更新路线
 * @access  Private (需登录且是创建者)
 */
router.put('/:id', route_controller_1.updateRoute);
// router.put('/:id', authenticateToken, updateRoute)
/**
 * @route   DELETE /api/v1/routes/:id
 * @desc    删除路线
 * @access  Private (需登录且是创建者)
 */
router.delete('/:id', route_controller_1.deleteRoute);
// router.delete('/:id', authenticateToken, deleteRoute)
exports.default = router;
//# sourceMappingURL=route.routes.js.map