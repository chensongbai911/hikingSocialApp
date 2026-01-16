import { Request, Response } from 'express';
declare class UploadController {
    /**
     * 通用图片上传
     * POST /api/v1/upload/image
     */
    uploadImage(req: Request, res: Response): Promise<void>;
    /**
     * 上传并更新用户头像
     * POST /api/v1/upload/avatar
     */
    uploadAvatar(req: Request, res: Response): Promise<void>;
    /**
     * 批量上传相册图片
     * POST /api/v1/upload/photos
     */
    uploadPhotos(req: Request, res: Response): Promise<void>;
}
declare const _default: UploadController;
export default _default;
//# sourceMappingURL=UploadController.d.ts.map