/**
 * 轨迹路由配置
 * 创建日期: 2026-01-19
 */

import express from 'express'
import {
  createTrack,
  uploadTrackPoints,
  completeTrack,
  getTrackList,
  getTrackDetail,
  deleteTrack,
} from '../controllers/track.controller'
import { authenticateToken, optionalAuth } from '../middleware/auth'

const router = express.Router()

/**
 * @route   POST /api/v1/tracks
 * @desc    创建轨迹
 * @access  Private
 */
router.post('/', authenticateToken, createTrack)

/**
 * @route   POST /api/v1/tracks/:trackId/points
 * @desc    批量上传轨迹点
 * @access  Private
 */
router.post('/:trackId/points', authenticateToken, uploadTrackPoints)

/**
 * @route   PUT /api/v1/tracks/:trackId/complete
 * @desc    完成轨迹
 * @access  Private
 */
router.put('/:trackId/complete', authenticateToken, completeTrack)

/**
 * @route   GET /api/v1/tracks
 * @desc    获取轨迹列表
 * @access  Public (可选认证)
 */
router.get('/', optionalAuth, getTrackList)

/**
 * @route   GET /api/v1/tracks/:id
 * @desc    获取轨迹详情
 * @access  Public (可选认证)
 */
router.get('/:id', optionalAuth, getTrackDetail)

/**
 * @route   DELETE /api/v1/tracks/:id
 * @desc    删除轨迹
 * @access  Private
 */
router.delete('/:id', authenticateToken, deleteTrack)

export default router
