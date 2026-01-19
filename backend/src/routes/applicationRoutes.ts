import { Router } from 'express'
import ApplicationController from '../controllers/ApplicationController'
import { authMiddleware } from '../middleware/authMiddleware'

const router = Router()

// 所有路由都需要认证
router.use(authMiddleware)

// 申请加入活动
router.post('/', ApplicationController.applyToActivity)

// 获取我的申请记录（必须在 /:id 之前）
router.get('/my', ApplicationController.getMyApplications)

// 审核申请
router.put('/:id/review', ApplicationController.reviewApplication)

export default router
