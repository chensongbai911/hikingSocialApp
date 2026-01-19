"use strict";
/**
 * 轨迹路由配置
 * 创建日期: 2026-01-19
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const track_controller_1 = require("../controllers/track.controller");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
/**
 * @route   POST /api/v1/tracks
 * @desc    创建轨迹
 * @access  Private
 */
router.post('/', auth_1.authenticateToken, track_controller_1.createTrack);
/**
 * @route   POST /api/v1/tracks/:trackId/points
 * @desc    批量上传轨迹点
 * @access  Private
 */
router.post('/:trackId/points', auth_1.authenticateToken, track_controller_1.uploadTrackPoints);
/**
 * @route   PUT /api/v1/tracks/:trackId/complete
 * @desc    完成轨迹
 * @access  Private
 */
router.put('/:trackId/complete', auth_1.authenticateToken, track_controller_1.completeTrack);
/**
 * @route   GET /api/v1/tracks
 * @desc    获取轨迹列表
 * @access  Public (可选认证)
 */
router.get('/', auth_1.optionalAuth, track_controller_1.getTrackList);
/**
 * @route   GET /api/v1/tracks/:id
 * @desc    获取轨迹详情
 * @access  Public (可选认证)
 */
router.get('/:id', auth_1.optionalAuth, track_controller_1.getTrackDetail);
/**
 * @route   DELETE /api/v1/tracks/:id
 * @desc    删除轨迹
 * @access  Private
 */
router.delete('/:id', auth_1.authenticateToken, track_controller_1.deleteTrack);
exports.default = router;
//# sourceMappingURL=track.routes.js.map