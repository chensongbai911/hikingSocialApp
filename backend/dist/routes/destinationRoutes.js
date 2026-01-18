"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const DestinationController_1 = __importDefault(require("../controllers/DestinationController"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// 公开接口（可选认证，用于判断收藏状态）
router.get('/', authMiddleware_1.optionalAuthMiddleware, DestinationController_1.default.getDestinations);
router.get('/popular', authMiddleware_1.optionalAuthMiddleware, DestinationController_1.default.getPopularDestinations);
router.get('/nearby', authMiddleware_1.optionalAuthMiddleware, DestinationController_1.default.getNearbyDestinations);
router.get('/:id', authMiddleware_1.optionalAuthMiddleware, DestinationController_1.default.getDestinationById);
// 需要认证的接口
router.post('/search/record', authMiddleware_1.authMiddleware, DestinationController_1.default.recordSearch);
router.get('/search/history', authMiddleware_1.authMiddleware, DestinationController_1.default.getSearchHistory);
router.post('/:id/favorite', authMiddleware_1.authMiddleware, DestinationController_1.default.toggleFavorite);
router.get('/favorites/list', authMiddleware_1.authMiddleware, DestinationController_1.default.getFavorites);
exports.default = router;
//# sourceMappingURL=destinationRoutes.js.map