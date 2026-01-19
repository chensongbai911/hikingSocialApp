"use strict";
/**
 * 轨迹控制器
 * 创建日期: 2026-01-19
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTrack = exports.getTrackDetail = exports.getTrackList = exports.completeTrack = exports.uploadTrackPoints = exports.createTrack = void 0;
const apiResponse_1 = require("../utils/apiResponse");
const database_1 = require("../config/database");
/**
 * 创建轨迹
 */
const createTrack = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.json((0, apiResponse_1.createErrorResponse)(apiResponse_1.ResponseCode.UNAUTHORIZED, '请先登录'));
        }
        const { routeId, name, description, startPoint, startLocationName, startTime, } = req.body;
        // 插入轨迹
        const trackSql = `
      INSERT INTO tracks (
        user_id, route_id, name, description,
        start_point, start_location_name, start_time, status
      ) VALUES (?, ?, ?, ?, POINT(?, ?), ?, ?, 'recording')
    `;
        const trackId = await (0, database_1.insert)(trackSql, [
            userId,
            routeId || null,
            name,
            description || null,
            startPoint.lng,
            startPoint.lat,
            startLocationName || null,
            startTime || new Date(),
        ]);
        res.json((0, apiResponse_1.createSuccessResponse)({ id: trackId }, apiResponse_1.ResponseCode.CREATED, '轨迹创建成功'));
    }
    catch (error) {
        console.error('Create track error:', error);
        res.json((0, apiResponse_1.createErrorResponse)(apiResponse_1.ResponseCode.INTERNAL_SERVER_ERROR, '创建轨迹失败'));
    }
};
exports.createTrack = createTrack;
/**
 * 批量上传轨迹点
 */
const uploadTrackPoints = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { trackId } = req.params;
        const { points } = req.body;
        if (!userId) {
            return res.json((0, apiResponse_1.createErrorResponse)(apiResponse_1.ResponseCode.UNAUTHORIZED, '请先登录'));
        }
        if (!Array.isArray(points) || points.length === 0) {
            return res.json((0, apiResponse_1.createErrorResponse)(apiResponse_1.ResponseCode.BAD_REQUEST, '轨迹点数据无效'));
        }
        // 验证轨迹所有权
        const track = await (0, database_1.queryOne)('SELECT user_id, status FROM tracks WHERE id = ?', [trackId]);
        if (!track) {
            return res.json((0, apiResponse_1.createErrorResponse)(apiResponse_1.ResponseCode.NOT_FOUND, '轨迹不存在'));
        }
        if (track.user_id !== userId) {
            return res.json((0, apiResponse_1.createErrorResponse)(apiResponse_1.ResponseCode.FORBIDDEN, '无权操作此轨迹'));
        }
        if (track.status === 'completed') {
            return res.json((0, apiResponse_1.createErrorResponse)(apiResponse_1.ResponseCode.BAD_REQUEST, '轨迹已完成，无法添加点'));
        }
        // 批量插入轨迹点
        const pointSql = `
      INSERT INTO track_points (
        track_id, location, altitude, accuracy, speed, heading, recorded_at
      ) VALUES (?, POINT(?, ?), ?, ?, ?, ?, ?)
    `;
        let insertedCount = 0;
        for (const point of points) {
            try {
                await (0, database_1.insert)(pointSql, [
                    trackId,
                    point.lng,
                    point.lat,
                    point.altitude || null,
                    point.accuracy || null,
                    point.speed || null,
                    point.heading || null,
                    point.recordedAt || new Date(),
                ]);
                insertedCount++;
            }
            catch (err) {
                console.error('Insert point error:', err);
            }
        }
        res.json((0, apiResponse_1.createSuccessResponse)({
            insertedCount,
            totalPoints: points.length,
        }));
    }
    catch (error) {
        console.error('Upload track points error:', error);
        res.json((0, apiResponse_1.createErrorResponse)(apiResponse_1.ResponseCode.INTERNAL_SERVER_ERROR, '上传轨迹点失败'));
    }
};
exports.uploadTrackPoints = uploadTrackPoints;
/**
 * 完成轨迹
 */
const completeTrack = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { trackId } = req.params;
        const { endPoint, endLocationName, endTime, totalDistance, totalDuration, totalElevationGain, totalElevationLoss, maxAltitude, minAltitude, avgSpeed, maxSpeed, } = req.body;
        if (!userId) {
            return res.json((0, apiResponse_1.createErrorResponse)(apiResponse_1.ResponseCode.UNAUTHORIZED, '请先登录'));
        }
        // 验证轨迹所有权
        const track = await (0, database_1.queryOne)('SELECT user_id, status FROM tracks WHERE id = ?', [trackId]);
        if (!track) {
            return res.json((0, apiResponse_1.createErrorResponse)(apiResponse_1.ResponseCode.NOT_FOUND, '轨迹不存在'));
        }
        if (track.user_id !== userId) {
            return res.json((0, apiResponse_1.createErrorResponse)(apiResponse_1.ResponseCode.FORBIDDEN, '无权操作此轨迹'));
        }
        // 更新轨迹
        await (0, database_1.execute)(`UPDATE tracks SET
        end_point = POINT(?, ?),
        end_location_name = ?,
        end_time = ?,
        total_distance = ?,
        total_duration = ?,
        total_elevation_gain = ?,
        total_elevation_loss = ?,
        max_altitude = ?,
        min_altitude = ?,
        avg_speed = ?,
        max_speed = ?,
        status = 'completed'
       WHERE id = ?`, [
            endPoint.lng,
            endPoint.lat,
            endLocationName || null,
            endTime || new Date(),
            totalDistance,
            totalDuration,
            totalElevationGain || 0,
            totalElevationLoss || 0,
            maxAltitude || null,
            minAltitude || null,
            avgSpeed || null,
            maxSpeed || null,
            trackId,
        ]);
        // 更新用户统计
        await (0, database_1.execute)(`UPDATE users SET
        total_distance = total_distance + ?,
        total_elevation = total_elevation + ?,
        total_hikes = total_hikes + 1
       WHERE id = ?`, [totalDistance, totalElevationGain || 0, userId]);
        res.json((0, apiResponse_1.createSuccessResponse)(null, apiResponse_1.ResponseCode.SUCCESS, '轨迹已完成'));
    }
    catch (error) {
        console.error('Complete track error:', error);
        res.json((0, apiResponse_1.createErrorResponse)(apiResponse_1.ResponseCode.INTERNAL_SERVER_ERROR, '完成轨迹失败'));
    }
};
exports.completeTrack = completeTrack;
/**
 * 获取轨迹列表
 */
const getTrackList = async (req, res) => {
    try {
        const { page = 1, pageSize = 20, userId, routeId, status = 'completed', } = req.query;
        // 构建查询条件
        const conditions = [];
        const params = [];
        if (userId) {
            conditions.push('t.user_id = ?');
            params.push(userId);
        }
        if (routeId) {
            conditions.push('t.route_id = ?');
            params.push(routeId);
        }
        if (status) {
            conditions.push('t.status = ?');
            params.push(status);
        }
        // 只显示公开的轨迹（除非是自己的）
        const currentUserId = req.user?.id;
        if (!currentUserId || currentUserId !== Number(userId)) {
            conditions.push('t.is_public = TRUE');
        }
        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        // 查询总数
        const countSql = `SELECT COUNT(*) as total FROM tracks t ${whereClause}`;
        const countResult = await (0, database_1.queryOne)(countSql, params);
        const total = countResult?.total || 0;
        // 查询列表
        const offset = (Number(page) - 1) * Number(pageSize);
        const listSql = `
      SELECT
        t.id, t.name, t.description, t.total_distance, t.total_duration,
        t.total_elevation_gain, t.max_altitude, t.avg_speed,
        ST_X(t.start_point) as start_lng, ST_Y(t.start_point) as start_lat,
        t.start_location_name, t.start_time, t.end_time, t.status,
        t.view_count, t.like_count, t.created_at,
        u.id as user_id, u.username, u.nickname, u.avatar_url
      FROM tracks t
      LEFT JOIN users u ON t.user_id = u.id
      ${whereClause}
      ORDER BY t.created_at DESC
      LIMIT ? OFFSET ?
    `;
        const [tracks] = await (0, database_1.query)(listSql, [...params, Number(pageSize), offset]);
        res.json((0, apiResponse_1.createPaginatedResponse)(tracks, Number(page), Number(pageSize), total));
    }
    catch (error) {
        console.error('Get track list error:', error);
        res.json((0, apiResponse_1.createErrorResponse)(apiResponse_1.ResponseCode.INTERNAL_SERVER_ERROR, '获取轨迹列表失败'));
    }
};
exports.getTrackList = getTrackList;
/**
 * 获取轨迹详情
 */
const getTrackDetail = async (req, res) => {
    try {
        const { id } = req.params;
        // 查询轨迹信息
        const trackSql = `
      SELECT
        t.id, t.name, t.description, t.total_distance, t.total_duration,
        t.total_elevation_gain, t.total_elevation_loss,
        t.max_altitude, t.min_altitude, t.avg_speed, t.max_speed,
        ST_X(t.start_point) as start_lng, ST_Y(t.start_point) as start_lat,
        ST_X(t.end_point) as end_lng, ST_Y(t.end_point) as end_lat,
        t.start_location_name, t.end_location_name,
        t.start_time, t.end_time, t.status, t.is_public,
        t.view_count, t.like_count, t.created_at,
        u.id as user_id, u.username, u.nickname, u.avatar_url,
        r.id as route_id, r.name as route_name
      FROM tracks t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN routes r ON t.route_id = r.id
      WHERE t.id = ?
    `;
        const track = await (0, database_1.queryOne)(trackSql, [id]);
        if (!track) {
            return res.json((0, apiResponse_1.createErrorResponse)(apiResponse_1.ResponseCode.NOT_FOUND, '轨迹不存在'));
        }
        // 检查访问权限
        if (!track.is_public) {
            const userId = req.user?.id;
            if (!userId || userId !== track.user_id) {
                return res.json((0, apiResponse_1.createErrorResponse)(apiResponse_1.ResponseCode.FORBIDDEN, '无权访问此轨迹'));
            }
        }
        // 查询轨迹点（可能很多，需要分页或限制数量）
        const pointsSql = `
      SELECT
        ST_X(location) as lng, ST_Y(location) as lat,
        altitude, speed, recorded_at
      FROM track_points
      WHERE track_id = ?
      ORDER BY recorded_at ASC
      LIMIT 10000
    `;
        const [points] = await (0, database_1.query)(pointsSql, [id]);
        // 增加浏览量
        await (0, database_1.execute)('UPDATE tracks SET view_count = view_count + 1 WHERE id = ?', [
            id,
        ]);
        res.json((0, apiResponse_1.createSuccessResponse)({
            ...track,
            points,
        }));
    }
    catch (error) {
        console.error('Get track detail error:', error);
        res.json((0, apiResponse_1.createErrorResponse)(apiResponse_1.ResponseCode.INTERNAL_SERVER_ERROR, '获取轨迹详情失败'));
    }
};
exports.getTrackDetail = getTrackDetail;
/**
 * 删除轨迹
 */
const deleteTrack = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        if (!userId) {
            return res.json((0, apiResponse_1.createErrorResponse)(apiResponse_1.ResponseCode.UNAUTHORIZED, '请先登录'));
        }
        // 检查权限
        const track = await (0, database_1.queryOne)('SELECT user_id FROM tracks WHERE id = ?', [id]);
        if (!track) {
            return res.json((0, apiResponse_1.createErrorResponse)(apiResponse_1.ResponseCode.NOT_FOUND, '轨迹不存在'));
        }
        if (track.user_id !== userId) {
            return res.json((0, apiResponse_1.createErrorResponse)(apiResponse_1.ResponseCode.FORBIDDEN, '无权删除此轨迹'));
        }
        await (0, database_1.execute)('DELETE FROM tracks WHERE id = ?', [id]);
        res.json((0, apiResponse_1.createSuccessResponse)(null, apiResponse_1.ResponseCode.SUCCESS, '删除成功'));
    }
    catch (error) {
        console.error('Delete track error:', error);
        res.json((0, apiResponse_1.createErrorResponse)(apiResponse_1.ResponseCode.INTERNAL_SERVER_ERROR, '删除轨迹失败'));
    }
};
exports.deleteTrack = deleteTrack;
//# sourceMappingURL=track.controller.js.map