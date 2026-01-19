"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ApplicationController_1 = __importDefault(require("../controllers/ApplicationController"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// 所有路由都需要认证
router.use(authMiddleware_1.authMiddleware);
// 申请加入活动
router.post('/', ApplicationController_1.default.applyToActivity);
// 获取我的申请记录（必须在 /:id 之前）
router.get('/my', ApplicationController_1.default.getMyApplications);
// 审核申请
router.put('/:id/review', ApplicationController_1.default.reviewApplication);
exports.default = router;
//# sourceMappingURL=applicationRoutes.js.map