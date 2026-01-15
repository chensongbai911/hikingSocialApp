import { success, businessError } from '../utils/response';
import { BusinessErrorCode } from '../types/api.types';
import { UploadService } from '../services/UploadService';
import { pool } from '../config/database';
class UploadController {
    /**
     * 通用图片上传
     * POST /api/v1/upload/image
     */
    async uploadImage(req, res) {
        try {
            if (!req.file) {
                return businessError(res, BusinessErrorCode.VALIDATION_ERROR, '请选择要上传的图片');
            }
            // 处理图片
            const processed = await UploadService.processImage(req.file.path);
            // 生成缩略图
            const thumbnailPath = await UploadService.generateThumbnail(processed.processedPath);
            // 删除原始文件
            await UploadService.deleteFileAsync(processed.originalPath);
            // 返回URL
            const imageUrl = UploadService.getFileUrl(processed.processedPath);
            const thumbnailUrl = UploadService.getFileUrl(thumbnailPath);
            return success(res, {
                url: imageUrl,
                thumbnail: thumbnailUrl,
                width: processed.width,
                height: processed.height,
                size: processed.size
            });
        }
        catch (err) {
            console.error('图片上传失败:', err);
            return businessError(res, BusinessErrorCode.UNKNOWN_ERROR, '图片上传失败');
        }
    }
    /**
     * 上传并更新用户头像
     * POST /api/v1/upload/avatar
     */
    async uploadAvatar(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return businessError(res, BusinessErrorCode.UNAUTHORIZED, '请先登录');
            }
            if (!req.file) {
                return businessError(res, BusinessErrorCode.VALIDATION_ERROR, '请选择要上传的头像');
            }
            // 处理头像
            const processed = await UploadService.processAvatar(req.file.path);
            // 删除原始文件
            await UploadService.deleteFileAsync(processed.originalPath);
            // 获取用户当前头像
            const [users] = await pool.query('SELECT avatar_url FROM users WHERE id = ?', [userId]);
            const oldAvatarUrl = users[0]?.avatar_url;
            // 更新数据库
            const avatarUrl = UploadService.getFileUrl(processed.processedPath);
            const thumbnailUrl = processed.thumbnailPath
                ? UploadService.getFileUrl(processed.thumbnailPath)
                : null;
            await pool.query('UPDATE users SET avatar_url = ?, updated_at = NOW() WHERE id = ?', [avatarUrl, userId]);
            // 删除旧头像文件(如果存在)
            if (oldAvatarUrl && oldAvatarUrl.startsWith('/uploads/')) {
                const oldFilePath = oldAvatarUrl.replace('/uploads/', 'uploads/');
                await UploadService.deleteFileAsync(oldFilePath);
                // 也删除旧的缩略图
                const oldThumbPath = oldFilePath.replace('.jpg', '-thumb.jpg');
                await UploadService.deleteFileAsync(oldThumbPath);
            }
            return success(res, {
                avatar_url: avatarUrl,
                thumbnail_url: thumbnailUrl,
                width: processed.width,
                height: processed.height
            });
        }
        catch (err) {
            console.error('头像上传失败:', err);
            return businessError(res, BusinessErrorCode.UNKNOWN_ERROR, '头像上传失败');
        }
    }
    /**
     * 批量上传相册图片
     * POST /api/v1/upload/photos
     */
    async uploadPhotos(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return businessError(res, BusinessErrorCode.UNAUTHORIZED, '请先登录');
            }
            const files = req.files;
            if (!files || files.length === 0) {
                return businessError(res, BusinessErrorCode.VALIDATION_ERROR, '请选择要上传的图片');
            }
            // 检查用户当前照片数量
            const [countResult] = await pool.query('SELECT COUNT(*) as count FROM user_photos WHERE user_id = ? AND deleted_at IS NULL', [userId]);
            const currentCount = countResult[0].count;
            const maxPhotos = 6;
            if (currentCount + files.length > maxPhotos) {
                // 删除上传的临时文件
                await UploadService.deleteFiles(files.map(f => f.path));
                return businessError(res, BusinessErrorCode.MAX_PHOTOS_EXCEEDED, `最多只能上传${maxPhotos}张照片，当前已有${currentCount}张`);
            }
            // 处理每张图片
            const uploadedPhotos = [];
            for (const file of files) {
                try {
                    // 处理图片
                    const processed = await UploadService.processImage(file.path);
                    // 生成缩略图
                    const thumbnailPath = await UploadService.generateThumbnail(processed.processedPath);
                    // 删除原始文件
                    await UploadService.deleteFileAsync(processed.originalPath);
                    // 生成照片ID
                    const [lastPhoto] = await pool.query('SELECT id FROM user_photos ORDER BY id DESC LIMIT 1');
                    const lastId = lastPhoto[0]?.id || 'photo-000';
                    const lastNumber = parseInt(lastId.split('-')[1]);
                    const photoId = `photo-${String(lastNumber + 1).padStart(3, '0')}`;
                    // 保存到数据库
                    const photoUrl = UploadService.getFileUrl(processed.processedPath);
                    const thumbnailUrl = UploadService.getFileUrl(thumbnailPath);
                    await pool.query('INSERT INTO user_photos (id, user_id, photo_url, thumbnail_url, display_order) VALUES (?, ?, ?, ?, ?)', [photoId, userId, photoUrl, thumbnailUrl, currentCount + uploadedPhotos.length + 1]);
                    uploadedPhotos.push({
                        id: photoId,
                        photo_url: photoUrl,
                        thumbnail_url: thumbnailUrl,
                        display_order: currentCount + uploadedPhotos.length + 1
                    });
                }
                catch (err) {
                    console.error('处理图片失败:', file.originalname, err);
                    // 继续处理其他图片
                }
            }
            return success(res, {
                uploaded: uploadedPhotos.length,
                photos: uploadedPhotos
            });
        }
        catch (err) {
            console.error('批量上传失败:', err);
            return businessError(res, BusinessErrorCode.UNKNOWN_ERROR, '图片上传失败');
        }
    }
}
export default new UploadController();
//# sourceMappingURL=UploadController.js.map