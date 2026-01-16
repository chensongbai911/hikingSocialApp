import { userService } from '../services/UserService';
import { success, businessError, validationError, serverError, notFound } from '../utils/response';
import { BusinessErrorCode } from '../types/api.types';
export class UserController {
    /**
     * 获取用户完整资料
     * GET /api/v1/users/profile
     */
    static async getProfile(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return businessError(res, BusinessErrorCode.UNAUTHORIZED, '未授权访问');
            }
            const profile = await userService.getProfile(userId);
            return success(res, profile, '获取用户资料成功');
        }
        catch (error) {
            console.error('Get profile error:', error);
            if (error.code === BusinessErrorCode.USER_NOT_FOUND) {
                return businessError(res, error.code, error.message);
            }
            return serverError(res, '获取用户资料失败', error);
        }
    }
    /**
     * 获取指定用户的资料
     * GET /api/v1/users/:userId/profile
     */
    static async getUserProfile(req, res) {
        try {
            const { userId } = req.params;
            if (!userId) {
                return validationError(res, '缺少用户ID参数');
            }
            const profile = await userService.getProfile(userId);
            return success(res, profile, '获取用户资料成功');
        }
        catch (error) {
            console.error('Get user profile error:', error);
            if (error.code === BusinessErrorCode.USER_NOT_FOUND) {
                return businessError(res, error.code, error.message);
            }
            return serverError(res, '获取用户资料失败', error);
        }
    }
    /**
     * 更新用户资料
     * PUT /api/v1/users/profile
     */
    static async updateProfile(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return businessError(res, BusinessErrorCode.UNAUTHORIZED, '未授权访问');
            }
            const { nickname, gender, age, bio, hiking_level, avatar_url, province, city, region } = req.body;
            // 参数验证
            if (nickname !== undefined && (nickname.length < 2 || nickname.length > 20)) {
                return validationError(res, { nickname: '昵称长度应在2-20个字符之间' });
            }
            if (gender !== undefined && !['male', 'female', 'other'].includes(gender)) {
                return validationError(res, { gender: '性别值不合法' });
            }
            if (age !== undefined && (age < 1 || age > 120)) {
                return validationError(res, { age: '年龄必须在1-120之间' });
            }
            if (hiking_level !== undefined && !['beginner', 'intermediate', 'advanced'].includes(hiking_level)) {
                return validationError(res, { hiking_level: '徒步等级值不合法' });
            }
            if (province !== undefined && province.length > 100) {
                return validationError(res, { province: '省份名称过长' });
            }
            if (city !== undefined && city.length > 100) {
                return validationError(res, { city: '城市名称过长' });
            }
            if (region !== undefined && region.length > 200) {
                return validationError(res, { region: '地区描述过长' });
            }
            const profile = await userService.updateProfile(userId, {
                nickname,
                gender,
                age,
                bio,
                hiking_level,
                avatar_url,
                province,
                city,
                region
            });
            return success(res, profile, '更新用户资料成功');
        }
        catch (error) {
            console.error('Update profile error:', error);
            return serverError(res, '更新用户资料失败', error);
        }
    }
    /**
     * 更新用户头像
     * POST /api/v1/users/avatar
     */
    static async updateAvatar(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return businessError(res, BusinessErrorCode.UNAUTHORIZED, '未授权访问');
            }
            const { avatar_url } = req.body;
            if (!avatar_url) {
                return validationError(res, { avatar_url: '头像URL不能为空' });
            }
            const result = await userService.updateAvatar(userId, avatar_url);
            return success(res, result, '更新头像成功');
        }
        catch (error) {
            console.error('Update avatar error:', error);
            return serverError(res, '更新头像失败', error);
        }
    }
    /**
     * 添加相册照片
     * POST /api/v1/users/photos
     */
    static async addPhoto(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return businessError(res, BusinessErrorCode.UNAUTHORIZED, '未授权访问');
            }
            const { photo_url, sort_order } = req.body;
            if (!photo_url) {
                return validationError(res, { photo_url: '照片URL不能为空' });
            }
            const photo = await userService.addPhoto(userId, photo_url, sort_order);
            return success(res, photo, '添加照片成功');
        }
        catch (error) {
            console.error('Add photo error:', error);
            if (error.code === BusinessErrorCode.MAX_PHOTOS_EXCEEDED) {
                return businessError(res, error.code, error.message);
            }
            return serverError(res, '添加照片失败', error);
        }
    }
    /**
     * 删除相册照片
     * DELETE /api/v1/users/photos/:photoId
     */
    static async deletePhoto(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return businessError(res, BusinessErrorCode.UNAUTHORIZED, '未授权访问');
            }
            const { photoId } = req.params;
            if (!photoId) {
                return validationError(res, { photoId: '照片ID不能为空' });
            }
            await userService.deletePhoto(userId, photoId);
            return success(res, null, '删除照片成功');
        }
        catch (error) {
            console.error('Delete photo error:', error);
            if (error.code === BusinessErrorCode.PHOTO_NOT_FOUND) {
                return notFound(res, '照片不存在');
            }
            return serverError(res, '删除照片失败', error);
        }
    }
    /**
     * 获取用户照片列表
     * GET /api/v1/users/photos
     */
    static async getPhotos(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return businessError(res, BusinessErrorCode.UNAUTHORIZED, '未授权访问');
            }
            const profile = await userService.getProfile(userId);
            const photos = profile.photos || [];
            return success(res, photos, '获取照片列表成功');
        }
        catch (error) {
            console.error('Get photos error:', error);
            return serverError(res, '获取照片列表失败', error);
        }
    }
    /**
     * 获取用户偏好
     * GET /api/v1/users/preferences
     */
    static async getPreferences(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return businessError(res, BusinessErrorCode.UNAUTHORIZED, '未授权访问');
            }
            const preferences = await userService.getPreferences(userId);
            return success(res, preferences, '获取用户偏好成功');
        }
        catch (error) {
            console.error('Get preferences error:', error);
            return serverError(res, '获取用户偏好失败', error);
        }
    }
    /**
     * 更新用户偏好
     * PUT /api/v1/users/preferences
     */
    static async updatePreferences(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return businessError(res, BusinessErrorCode.UNAUTHORIZED, '未授权访问');
            }
            const { preferences } = req.body;
            if (!Array.isArray(preferences)) {
                return validationError(res, { preferences: '偏好必须是数组格式' });
            }
            // 验证每个偏好项
            for (const pref of preferences) {
                if (!pref.type || !pref.value) {
                    return validationError(res, { preferences: '偏好项必须包含type和value字段' });
                }
            }
            const result = await userService.updatePreferences(userId, preferences);
            return success(res, result, '更新用户偏好成功');
        }
        catch (error) {
            console.error('Update preferences error:', error);
            return serverError(res, '更新用户偏好失败', error);
        }
    }
}
//# sourceMappingURL=UserController.js.map