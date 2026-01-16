import { Request, Response } from 'express';
export declare class UserController {
    /**
     * 获取用户完整资料
     * GET /api/v1/users/profile
     */
    static getProfile(req: Request, res: Response): Promise<void>;
    /**
     * 获取指定用户的资料
     * GET /api/v1/users/:userId/profile
     */
    static getUserProfile(req: Request, res: Response): Promise<void>;
    /**
     * 更新用户资料
     * PUT /api/v1/users/profile
     */
    static updateProfile(req: Request, res: Response): Promise<void>;
    /**
     * 更新用户头像
     * POST /api/v1/users/avatar
     */
    static updateAvatar(req: Request, res: Response): Promise<void>;
    /**
     * 添加相册照片
     * POST /api/v1/users/photos
     */
    static addPhoto(req: Request, res: Response): Promise<void>;
    /**
     * 删除相册照片
     * DELETE /api/v1/users/photos/:photoId
     */
    static deletePhoto(req: Request, res: Response): Promise<void>;
    /**
     * 获取用户照片列表
     * GET /api/v1/users/photos
     */
    static getPhotos(req: Request, res: Response): Promise<void>;
    /**
     * 获取用户偏好
     * GET /api/v1/users/preferences
     */
    static getPreferences(req: Request, res: Response): Promise<void>;
    /**
     * 更新用户偏好
     * PUT /api/v1/users/preferences
     */
    static updatePreferences(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=UserController.d.ts.map