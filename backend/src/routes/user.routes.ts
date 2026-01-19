/**
 * 用户路由配置
 * 创建日期: 2026-01-19
 */

import express from 'express'
import {
  register,
  login,
  getCurrentUser,
  getUserProfile,
  updateProfile,
  uploadAvatar,
} from '../controllers/user.controller'
import { authenticateToken } from '../middleware/auth'

const router = express.Router()

/**
 * @route   POST /api/v1/users/register
 * @desc    用户注册
 * @access  Public
 */
router.post('/register', register)

/**
 * @route   POST /api/v1/users/login
 * @desc    用户登录
 * @access  Public
 */
router.post('/login', login)

/**
 * @route   GET /api/v1/users/me
 * @desc    获取当前用户信息
 * @access  Private
 */
router.get('/me', authenticateToken, getCurrentUser)

/**
 * @route   GET /api/v1/users/:id
 * @desc    获取用户公开信息
 * @access  Public
 */
router.get('/:id', getUserProfile)

/**
 * @route   PUT /api/v1/users/profile
 * @desc    更新用户信息
 * @access  Private
 */
router.put('/profile', authenticateToken, updateProfile)

/**
 * @route   POST /api/v1/users/avatar
 * @desc    上传头像
 * @access  Private
 */
router.post('/avatar', authenticateToken, uploadAvatar)

export default router
