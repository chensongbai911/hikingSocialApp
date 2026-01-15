import { activityService } from '../services/ActivityService';
import { success, created, businessError, validationError, serverError, paginated, noContent } from '../utils/response';
import { BusinessErrorCode } from '../types/api.types';
export class ActivityController {
    /**
     * 创建活动
     * POST /api/v1/activities
     */
    static async createActivity(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return businessError(res, BusinessErrorCode.UNAUTHORIZED, '未授权访问');
            }
            const { title, description, cover_image_url, photos, // 照片数组
            location, latitude, longitude, start_time, end_time, difficulty, max_participants, route_description, equipment_required } = req.body;
            // 参数验证
            if (!title || title.trim().length === 0) {
                return validationError(res, { title: '活动标题不能为空' });
            }
            if (title.length > 255) {
                return validationError(res, { title: '活动标题不能超过255个字符' });
            }
            if (!location || location.trim().length === 0) {
                return validationError(res, { location: '活动地点不能为空' });
            }
            if (!start_time) {
                return validationError(res, { start_time: '活动开始时间不能为空' });
            }
            // 验证照片数组
            if (photos && Array.isArray(photos) && photos.length > 6) {
                return validationError(res, { photos: '最多只能上传6张照片' });
            }
            const startTime = new Date(start_time);
            if (isNaN(startTime.getTime())) {
                return validationError(res, { start_time: '开始时间格式不正确' });
            }
            if (startTime < new Date()) {
                return validationError(res, { start_time: '开始时间不能早于当前时间' });
            }
            if (end_time) {
                const endTime = new Date(end_time);
                if (isNaN(endTime.getTime())) {
                    return validationError(res, { end_time: '结束时间格式不正确' });
                }
                if (endTime <= startTime) {
                    return validationError(res, { end_time: '结束时间必须晚于开始时间' });
                }
            }
            if (!difficulty || !['easy', 'moderate', 'hard'].includes(difficulty)) {
                return validationError(res, { difficulty: '难度值必须是easy、moderate或hard' });
            }
            if (max_participants !== undefined && (max_participants < 1 || max_participants > 100)) {
                return validationError(res, { max_participants: '最大参与人数必须在1-100之间' });
            }
            const activity = await activityService.createActivity(userId, {
                title,
                description,
                cover_image_url,
                photos, // 照片数组
                location,
                latitude,
                longitude,
                start_time: startTime,
                end_time: end_time ? new Date(end_time) : undefined,
                difficulty,
                max_participants,
                route_description,
                equipment_required
            });
            return created(res, activity, '创建活动成功');
        }
        catch (error) {
            console.error('Create activity error:', error);
            return serverError(res, '创建活动失败', error);
        }
    }
    /**
     * 获取活动详情
     * GET /api/v1/activities/:id
     */
    static async getActivity(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?.id;
            const activity = await activityService.getActivityById(id, userId);
            return success(res, activity, '获取活动详情成功');
        }
        catch (error) {
            console.error('Get activity error:', error);
            if (error.code === BusinessErrorCode.RESOURCE_NOT_FOUND) {
                return businessError(res, error.code, error.message);
            }
            return serverError(res, '获取活动详情失败', error);
        }
    }
    /**
     * 获取活动列表
     * GET /api/v1/activities
     */
    static async getActivities(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const pageSize = parseInt(req.query.page_size) || 20;
            const userId = req.user?.id;
            const filters = {};
            if (req.query.status)
                filters.status = req.query.status;
            if (req.query.difficulty)
                filters.difficulty = req.query.difficulty;
            if (req.query.creator_id)
                filters.creator_id = req.query.creator_id;
            if (req.query.start_date)
                filters.start_date = new Date(req.query.start_date);
            if (req.query.end_date)
                filters.end_date = new Date(req.query.end_date);
            const { activities, total } = await activityService.getActivities(page, pageSize, filters, userId);
            return paginated(res, activities, page, pageSize, total, '获取活动列表成功');
        }
        catch (error) {
            console.error('Get activities error:', error);
            return serverError(res, '获取活动列表失败', error);
        }
    }
    /**
     * 更新活动
     * PUT /api/v1/activities/:id
     */
    static async updateActivity(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?.id;
            if (!userId) {
                return businessError(res, BusinessErrorCode.UNAUTHORIZED, '未授权访问');
            }
            const { title, description, cover_image_url, photos, // 照片数组
            location, latitude, longitude, start_time, end_time, difficulty, max_participants, status, route_description, equipment_required } = req.body;
            // 参数验证
            if (title !== undefined && (title.trim().length === 0 || title.length > 255)) {
                return validationError(res, { title: '活动标题长度必须在1-255个字符之间' });
            }
            if (location !== undefined && location.trim().length === 0) {
                return validationError(res, { location: '活动地点不能为空' });
            }
            // 验证照片数组
            if (photos !== undefined && Array.isArray(photos) && photos.length > 6) {
                return validationError(res, { photos: '最多只能上传6张照片' });
            }
            if (start_time !== undefined) {
                const startTime = new Date(start_time);
                if (isNaN(startTime.getTime())) {
                    return validationError(res, { start_time: '开始时间格式不正确' });
                }
            }
            if (end_time !== undefined) {
                const endTime = new Date(end_time);
                if (isNaN(endTime.getTime())) {
                    return validationError(res, { end_time: '结束时间格式不正确' });
                }
            }
            if (difficulty !== undefined && !['easy', 'moderate', 'hard'].includes(difficulty)) {
                return validationError(res, { difficulty: '难度值必须是easy、moderate或hard' });
            }
            if (status !== undefined && !['pending', 'approved', 'ongoing', 'completed', 'cancelled'].includes(status)) {
                return validationError(res, { status: '状态值不合法' });
            }
            if (max_participants !== undefined && (max_participants < 1 || max_participants > 100)) {
                return validationError(res, { max_participants: '最大参与人数必须在1-100之间' });
            }
            const updateData = {};
            if (title !== undefined)
                updateData.title = title;
            if (description !== undefined)
                updateData.description = description;
            if (cover_image_url !== undefined)
                updateData.cover_image_url = cover_image_url;
            if (photos !== undefined)
                updateData.photos = photos; // 照片数组
            if (location !== undefined)
                updateData.location = location;
            if (latitude !== undefined)
                updateData.latitude = latitude;
            if (longitude !== undefined)
                updateData.longitude = longitude;
            if (start_time !== undefined)
                updateData.start_time = new Date(start_time);
            if (end_time !== undefined)
                updateData.end_time = new Date(end_time);
            if (difficulty !== undefined)
                updateData.difficulty = difficulty;
            if (max_participants !== undefined)
                updateData.max_participants = max_participants;
            if (status !== undefined)
                updateData.status = status;
            if (route_description !== undefined)
                updateData.route_description = route_description;
            if (equipment_required !== undefined)
                updateData.equipment_required = equipment_required;
            const activity = await activityService.updateActivity(id, userId, updateData);
            return success(res, activity, '更新活动成功');
        }
        catch (error) {
            console.error('Update activity error:', error);
            if (error.code === BusinessErrorCode.RESOURCE_NOT_FOUND) {
                return businessError(res, error.code, error.message);
            }
            if (error.code === BusinessErrorCode.FORBIDDEN) {
                return businessError(res, error.code, error.message);
            }
            return serverError(res, '更新活动失败', error);
        }
    }
    /**
     * 删除活动
     * DELETE /api/v1/activities/:id
     */
    static async deleteActivity(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?.id;
            if (!userId) {
                return businessError(res, BusinessErrorCode.UNAUTHORIZED, '未授权访问');
            }
            await activityService.deleteActivity(id, userId);
            return noContent(res);
        }
        catch (error) {
            console.error('Delete activity error:', error);
            if (error.code === BusinessErrorCode.RESOURCE_NOT_FOUND) {
                return businessError(res, error.code, error.message);
            }
            if (error.code === BusinessErrorCode.FORBIDDEN) {
                return businessError(res, error.code, error.message);
            }
            return serverError(res, '删除活动失败', error);
        }
    }
    /**
     * 加入活动
     * POST /api/v1/activities/:id/join
     */
    static async joinActivity(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?.id;
            if (!userId) {
                return businessError(res, BusinessErrorCode.UNAUTHORIZED, '未授权访问');
            }
            const participation = await activityService.joinActivity(id, userId);
            return created(res, participation, '成功加入活动');
        }
        catch (error) {
            console.error('Join activity error:', error);
            if (error.code === BusinessErrorCode.RESOURCE_NOT_FOUND) {
                return businessError(res, error.code, error.message);
            }
            if (error.code === BusinessErrorCode.VALIDATION_ERROR) {
                return businessError(res, error.code, error.message);
            }
            return serverError(res, '加入活动失败', error);
        }
    }
    /**
     * 退出活动
     * POST /api/v1/activities/:id/leave
     */
    static async leaveActivity(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?.id;
            if (!userId) {
                return businessError(res, BusinessErrorCode.UNAUTHORIZED, '未授权访问');
            }
            await activityService.leaveActivity(id, userId);
            return noContent(res);
        }
        catch (error) {
            console.error('Leave activity error:', error);
            if (error.code === BusinessErrorCode.RESOURCE_NOT_FOUND) {
                return businessError(res, error.code, error.message);
            }
            return serverError(res, '退出活动失败', error);
        }
    }
    /**
     * 获取指定用户参与的活动列表
     * GET /api/v1/activities/user/:userId/joined
     */
    static async getUserJoinedActivities(req, res) {
        try {
            const { userId } = req.params;
            if (!userId) {
                return validationError(res, '用户ID不能为空');
            }
            const page = parseInt(req.query.page) || 1;
            const pageSize = parseInt(req.query.page_size) || 20;
            const { activities, total } = await activityService.getUserJoinedActivities(userId, page, pageSize);
            return paginated(res, activities, page, pageSize, total, '获取用户参与的活动列表成功');
        }
        catch (error) {
            console.error('Get user joined activities error:', error);
            return serverError(res, '获取用户参与的活动列表失败', error);
        }
    }
    /**
     * 获取我参与的活动列表
     * GET /api/v1/activities/my-joined
     */
    static async getMyJoinedActivities(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return businessError(res, BusinessErrorCode.UNAUTHORIZED, '未授权访问');
            }
            const page = parseInt(req.query.page) || 1;
            const pageSize = parseInt(req.query.page_size) || 20;
            const { activities, total } = await activityService.getUserJoinedActivities(userId, page, pageSize);
            return paginated(res, activities, page, pageSize, total, '获取参与的活动列表成功');
        }
        catch (error) {
            console.error('Get my joined activities error:', error);
            return serverError(res, '获取参与的活动列表失败', error);
        }
    }
    /**
     * 获取我创建的活动列表
     * GET /api/v1/activities/my-created
     */
    static async getMyCreatedActivities(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return businessError(res, BusinessErrorCode.UNAUTHORIZED, '未授权访问');
            }
            const page = parseInt(req.query.page) || 1;
            const pageSize = parseInt(req.query.page_size) || 20;
            const { activities, total } = await activityService.getUserCreatedActivities(userId, page, pageSize);
            return paginated(res, activities, page, pageSize, total, '获取创建的活动列表成功');
        }
        catch (error) {
            console.error('Get my created activities error:', error);
            return serverError(res, '获取创建的活动列表失败', error);
        }
    }
}
//# sourceMappingURL=ActivityController.js.map