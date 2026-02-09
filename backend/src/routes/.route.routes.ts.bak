/**
 * 路线路由配置
 * 创建日期: 2026-01-19
 */

import express from 'express'
import {
  getRouteList,
  getRouteDetail,
  createRoute,
  updateRoute,
  deleteRoute,
} from '../controllers/route.controller'
// import { authenticateToken } from '../middleware/auth' // JWT 中间件（待实现）

const router = express.Router()

/**
 * @route   GET /api/v1/routes
 * @desc    获取路线列表
 * @access  Public
 */
router.get('/', getRouteList)

/**
 * @route   GET /api/v1/routes/:id
 * @desc    获取路线详情
 * @access  Public
 */
router.get('/:id', getRouteDetail)

/**
 * @route   POST /api/v1/routes
 * @desc    创建路线
 * @access  Private (需登录)
 */
router.post('/', createRoute)
// router.post('/', authenticateToken, createRoute) // 启用 JWT 后使用

/**
 * @route   PUT /api/v1/routes/:id
 * @desc    更新路线
 * @access  Private (需登录且是创建者)
 */
router.put('/:id', updateRoute)
// router.put('/:id', authenticateToken, updateRoute)

/**
 * @route   DELETE /api/v1/routes/:id
 * @desc    删除路线
 * @access  Private (需登录且是创建者)
 */
router.delete('/:id', deleteRoute)
// router.delete('/:id', authenticateToken, deleteRoute)

export default router
