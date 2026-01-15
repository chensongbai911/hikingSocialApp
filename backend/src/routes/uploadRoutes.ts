import { Router } from 'express';
import UploadController from '../controllers/UploadController';
import { authMiddleware } from '../middleware/authMiddleware';
import { upload, uploadMultiple } from '../middleware/uploadHandler';

const router = Router();

// 通用图片上传
router.post('/image', upload.single('image'), UploadController.uploadImage);

// 上传并更新头像
router.post('/avatar', authMiddleware, upload.single('avatar'), UploadController.uploadAvatar);

// 批量上传相册图片
router.post('/photos', authMiddleware, uploadMultiple('photos', 6), UploadController.uploadPhotos);

export default router;
