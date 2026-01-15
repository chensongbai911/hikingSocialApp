export interface ImageProcessOptions {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'jpeg' | 'png' | 'webp';
}
export interface ProcessedImage {
    originalPath: string;
    processedPath: string;
    thumbnailPath?: string;
    size: number;
    width: number;
    height: number;
}
/**
 * 文件上传服务
 */
export declare class UploadService {
    /**
     * 处理图片:压缩、调整大小、转换格式
     */
    static processImage(filePath: string, options?: ImageProcessOptions): Promise<ProcessedImage>;
    /**
     * 生成缩略图
     */
    static generateThumbnail(filePath: string, size?: number): Promise<string>;
    /**
     * 处理头像:裁剪为正方形
     */
    static processAvatar(filePath: string): Promise<ProcessedImage>;
    /**
     * 获取文件的相对URL路径
     */
    static getFileUrl(filePath: string): string;
    /**
     * 删除文件(async版本)
     */
    static deleteFileAsync(filePath: string): Promise<void>;
    /**
     * 批量删除文件
     */
    static deleteFiles(filePaths: string[]): Promise<void>;
    /**
     * 处理上传的文件
     */
    static processUploadedFile(file: Express.Multer.File | undefined, uploadType?: 'avatar' | 'activity' | 'message'): string;
    /**
     * 删除文件
     */
    static deleteFile(fileUrl: string): void;
    /**
     * 验证图片文件
     */
    static validateImageFile(file: Express.Multer.File): void;
    /**
     * 获取文件信息
     */
    static getFileInfo(fileUrl: string): {
        exists: boolean;
        size: number;
    };
    /**
     * 清理过期文件
     */
    static cleanupOldFiles(uploadDir: string, ageInDays?: number): void;
}
export default UploadService;
//# sourceMappingURL=UploadService.d.ts.map