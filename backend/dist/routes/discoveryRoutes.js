"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const DiscoveryController_1 = require("../controllers/DiscoveryController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
/**
 * 发现页路由
 * 基础路径: /api/v1/discovery
 */
// 获取推荐活动
router.get('/activities', authMiddleware_1.authMiddleware, DiscoveryController_1.DiscoveryController.getRecommendedActivities);
// 获取推荐用户
router.get('/users', authMiddleware_1.authMiddleware, DiscoveryController_1.DiscoveryController.getRecommendedUsers);
// 搜索活动
router.get('/search/activities', authMiddleware_1.optionalAuthMiddleware, DiscoveryController_1.DiscoveryController.searchActivities);
// 搜索用户
router.get('/search/users', DiscoveryController_1.DiscoveryController.searchUsers);
exports.default = router;
//# sourceMappingURL=discoveryRoutes.js.map