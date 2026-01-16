import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { promisify } from 'util';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const unlinkAsync = promisify(fs.unlink);
/**
 * 文件上传服务
 */
export class UploadService {
    /**
     * 处理图片:压缩、调整大小、转换格式
     */
    static async processImage(filePath, options = {}) {
        const { width = 1200, height = 1200, quality = 85, format = 'jpeg' } = options;
        try {
            const image = sharp(filePath);
            const metadata = await image.metadata();
            // 生成处理后的文件路径
            const dir = path.dirname(filePath);
            const ext = `.${format}`;
            const baseName = path.basename(filePath, path.extname(filePath));
            const processedPath = path.join(dir, `${baseName}-processed${ext}`);
            // 调整大小并压缩
            await image
                .resize(width, height, {
                fit: 'inside',
                withoutEnlargement: true,
            })
                .toFormat(format, { quality })
                .toFile(processedPath);
            // 获取处理后的文件大小
            const stats = fs.statSync(processedPath);
            const processedMetadata = await sharp(processedPath).metadata();
            return {
                originalPath: filePath,
                processedPath,
                size: stats.size,
                width: processedMetadata.width || 0,
                height: processedMetadata.height || 0,
            };
        }
        catch (error) {
            throw new Error(`图片处理失败: ${error instanceof Error ? error.message : '未知错误'}`);
        }
    }
    /**
     * 生成缩略图
     */
    static async generateThumbnail(filePath, size = 200) {
        try {
            const dir = path.dirname(filePath);
            const baseName = path.basename(filePath, path.extname(filePath));
            const thumbnailPath = path.join(dir, `${baseName}-thumb.jpg`);
            await sharp(filePath)
                .resize(size, size, {
                fit: 'cover',
                position: 'center',
            })
                .jpeg({ quality: 80 })
                .toFile(thumbnailPath);
            return thumbnailPath;
            return thumbnailPath;
        }
        catch (error) {
            throw new Error(`缩略图生成失败: ${error instanceof Error ? error.message : '未知错误'}`);
        }
    }
    /**
     * 处理头像:裁剪为正方形
     */
    static async processAvatar(filePath) {
        try {
            const image = sharp(filePath);
            const metadata = await image.metadata();
            // 头像固定尺寸
            const avatarSize = 300;
            const dir = path.dirname(filePath);
            const baseName = path.basename(filePath, path.extname(filePath));
            const processedPath = path.join(dir, `${baseName}-avatar.jpg`);
            // 裁剪为正方形并压缩
            await image
                .resize(avatarSize, avatarSize, {
                fit: 'cover',
                position: 'center',
            })
                .jpeg({ quality: 90 })
                .toFile(processedPath);
            // 生成小头像(用于列表显示)
            const thumbnailPath = path.join(dir, `${baseName}-avatar-thumb.jpg`);
            await sharp(processedPath)
                .resize(100, 100, {
                fit: 'cover',
                position: 'center',
            })
                .jpeg({ quality: 85 })
                .toFile(thumbnailPath);
            const stats = fs.statSync(processedPath);
            return {
                originalPath: filePath,
                processedPath,
                thumbnailPath,
                size: stats.size,
                width: avatarSize,
                height: avatarSize,
            };
        }
        catch (error) {
            throw new Error(`头像处理失败: ${error instanceof Error ? error.message : '未知错误'}`);
        }
    }
    /**
     * 获取文件的相对URL路径
     */
    static getFileUrl(filePath) {
        // 将绝对路径转换为相对URL
        const uploadsIndex = filePath.indexOf('uploads');
        if (uploadsIndex === -1) {
            return filePath;
        }
        return '/' + filePath.substring(uploadsIndex).replace(/\\/g, '/');
    }
    /**
     * 删除文件(async版本)
     */
    static async deleteFileAsync(filePath) {
        try {
            if (fs.existsSync(filePath)) {
                await unlinkAsync(filePath);
            }
        }
        catch (error) {
            console.error('删除文件失败:', error);
        }
    }
    /**
     * 批量删除文件
     */
    static async deleteFiles(filePaths) {
        await Promise.all(filePaths.map((path) => this.deleteFileAsync(path)));
    }
    /**
     * 处理上传的文件
     */
    static processUploadedFile(file, uploadType = 'avatar') {
        if (!file) {
            throw new Error('未上传文件');
        }
        // 生成文件 URL
        const fileUrl = `/uploads/${uploadType === 'avatar'
            ? 'avatars'
            : uploadType === 'activity'
                ? 'activities'
                : 'messages'}/${file.filename}`;
        return fileUrl;
    }
    /**
     * 删除文件
     */
    static deleteFile(fileUrl) {
        if (!fileUrl)
            return;
        try {
            // 从 URL 提取文件路径
            const filePath = path.join(__dirname, '../../', fileUrl);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        catch (error) {
            console.error('Failed to delete file:', error);
            // 不抛出错误，继续执行
        }
    }
    /**
     * 验证图片文件
     */
    static validateImageFile(file) {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedMimes.includes(file.mimetype)) {
            // 删除已上传的文件
            this.deleteFile(`/uploads/${file.filename}`);
            throw new Error(`不支持的图片格式: ${file.mimetype}。允许的格式: JPEG, PNG, WebP, GIF`);
        }
        // 检查文件大小 (5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            this.deleteFile(`/uploads/${file.filename}`);
            throw new Error('文件过大，最大支持 5MB');
        }
    }
    /**
     * 获取文件信息
     */
    static getFileInfo(fileUrl) {
        try {
            const filePath = path.join(__dirname, '../../', fileUrl);
            if (!fs.existsSync(filePath)) {
                return { exists: false, size: 0 };
            }
            const stats = fs.statSync(filePath);
            return { exists: true, size: stats.size };
        }
        catch (error) {
            return { exists: false, size: 0 };
        }
    }
    /**
     * 清理过期文件
     */
    static cleanupOldFiles(uploadDir, ageInDays = 30) {
        try {
            const fullPath = path.join(__dirname, '../../uploads', uploadDir);
            if (!fs.existsSync(fullPath)) {
                return;
            }
            const files = fs.readdirSync(fullPath);
            const now = Date.now();
            const ageInMs = ageInDays * 24 * 60 * 60 * 1000;
            files.forEach((file) => {
                const filePath = path.join(fullPath, file);
                const stats = fs.statSync(filePath);
                const fileAge = now - stats.mtimeMs;
                if (fileAge > ageInMs) {
                    fs.unlinkSync(filePath);
                    console.log(`Deleted old file: ${file}`);
                }
            });
        }
        catch (error) {
            console.error('Cleanup failed:', error);
        }
    }
}
export default UploadService;
//# sourceMappingURL=UploadService.js.map