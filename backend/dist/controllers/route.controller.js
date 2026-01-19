"use strict";
/**
 * 路线控制器
 * 创建日期: 2026-01-19
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRoute = exports.updateRoute = exports.createRoute = exports.getRouteDetail = exports.getRouteList = void 0;
const apiResponse_1 = require("../utils/apiResponse");
const database_1 = require("../config/database");
const redis_1 = require("../config/redis");
/**
 * 获取路线列表
 */
const getRouteList = async (req, res) => {
    try {
        const { page = 1, pageSize = 20, difficulty, minDistance, maxDistance, minElevation, maxElevation, lat, lng, radius = 10000, sortBy = 'created_at', sortOrder = 'DESC', } = req.query;
        // 构建缓存键
        const cacheKey = `${redis_1.CACHE_PREFIX.ROUTE_LIST}${JSON.stringify(req.query)}`;
        // 尝试从缓存获取
        const cached = await (0, redis_1.getCache)(cacheKey);
        if (cached) {
            return res.json(cached);
        }
        // 构建查询条件
        const conditions = [];
        const params = [];
        if (difficulty) {
            conditions.push('difficulty = ?');
            params.push(difficulty);
        }
        if (minDistance) {
            conditions.push('distance >= ?');
            params.push(minDistance);
        }
        if (maxDistance) {
            conditions.push('distance <= ?');
            params.push(maxDistance);
        }
        if (minElevation) {
            conditions.push('total_elevation_gain >= ?');
            params.push(minElevation);
        }
        if (maxElevation) {
            conditions.push('total_elevation_gain <= ?');
            params.push(maxElevation);
        }
        // 附近路线（使用空间索引）
        if (lat && lng && radius) {
            conditions.push(`ST_Distance_Sphere(start_point, POINT(?, ?)) <= ?`);
            params.push(lng, lat, radius);
        }
        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        // 查询总数
        const countSql = `SELECT COUNT(*) as total FROM routes ${whereClause}`;
        const countResult = await (0, database_1.queryOne)(countSql, params);
        const total = countResult?.total || 0;
        // 查询列表
        const offset = (Number(page) - 1) * Number(pageSize);
        const listSql = `
      SELECT
        id, name, description, difficulty, distance,
        total_elevation_gain, total_elevation_loss,
        estimated_duration, route_type, start_location_name,
        end_location_name, ST_X(start_point) as start_lng,
        ST_Y(start_point) as start_lat, creator_id,
        is_circular, view_count, favorite_count, rating,
        created_at, updated_at
      FROM routes
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `;
        const [routes] = await (0, database_1.query)(listSql, [...params, Number(pageSize), offset]);
        // 构建响应
        const response = (0, apiResponse_1.createPaginatedResponse)(routes, Number(page), Number(pageSize), total);
        // 缓存结果
        await (0, redis_1.setCache)(cacheKey, response, redis_1.CACHE_TTL.ROUTE);
        res.json(response);
    }
    catch (error) {
        console.error('Get route list error:', error);
        res.json((0, apiResponse_1.createErrorResponse)(apiResponse_1.ResponseCode.INTERNAL_SERVER_ERROR, '获取路线列表失败'));
    }
};
exports.getRouteList = getRouteList;
/**
 * 获取路线详情
 */
const getRouteDetail = async (req, res) => {
    try {
        const { id } = req.params;
        // 尝试从缓存获取
        const cacheKey = `${redis_1.CACHE_PREFIX.ROUTE}${id}`;
        const cached = await (0, redis_1.getCache)(cacheKey);
        if (cached) {
            return res.json(cached);
        }
        // 查询路线基本信息
        const routeSql = `
      SELECT
        id, name, description, difficulty, distance,
        total_elevation_gain, total_elevation_loss,
        estimated_duration, route_type, start_location_name,
        end_location_name, ST_X(start_point) as start_lng,
        ST_Y(start_point) as start_lat, ST_X(end_point) as end_lng,
        ST_Y(end_point) as end_lat, creator_id, is_circular,
        view_count, favorite_count, rating, created_at, updated_at
      FROM routes
      WHERE id = ?
    `;
        const route = await (0, database_1.queryOne)(routeSql, [id]);
        if (!route) {
            return res.json((0, apiResponse_1.createErrorResponse)(apiResponse_1.ResponseCode.NOT_FOUND, '路线不存在'));
        }
        // 查询路点
        const waypointsSql = `
      SELECT
        id, ST_X(location) as lng, ST_Y(location) as lat,
        altitude, name, description, waypoint_type, order_index
      FROM route_waypoints
      WHERE route_id = ?
      ORDER BY order_index ASC
    `;
        const [waypoints] = await (0, database_1.query)(waypointsSql, [id]);
        // 查询风险点
        const riskPointsSql = `
      SELECT
        id, ST_X(location) as lng, ST_Y(location) as lat,
        risk_type, risk_level, description
      FROM route_risk_points
      WHERE route_id = ?
    `;
        const [riskPoints] = await (0, database_1.query)(riskPointsSql, [id]);
        // 查询标签
        const tagsSql = `
      SELECT tag_name
      FROM route_tags
      WHERE route_id = ?
    `;
        const [tags] = await (0, database_1.query)(tagsSql, [id]);
        // 增加浏览量
        await (0, database_1.execute)('UPDATE routes SET view_count = view_count + 1 WHERE id = ?', [id]);
        // 组装完整数据
        const fullRoute = {
            ...route,
            waypoints,
            riskPoints,
            tags: tags.map((t) => t.tag_name),
        };
        const response = (0, apiResponse_1.createSuccessResponse)(fullRoute);
        // 缓存结果
        await (0, redis_1.setCache)(cacheKey, response, redis_1.CACHE_TTL.ROUTE);
        res.json(response);
    }
    catch (error) {
        console.error('Get route detail error:', error);
        res.json((0, apiResponse_1.createErrorResponse)(apiResponse_1.ResponseCode.INTERNAL_SERVER_ERROR, '获取路线详情失败'));
    }
};
exports.getRouteDetail = getRouteDetail;
/**
 * 创建路线
 */
const createRoute = async (req, res) => {
    try {
        const userId = req.user?.id; // 从 JWT 中获取
        if (!userId) {
            return res.json((0, apiResponse_1.createErrorResponse)(apiResponse_1.ResponseCode.UNAUTHORIZED, '请先登录'));
        }
        const { name, description, difficulty, distance, totalElevationGain, totalElevationLoss, estimatedDuration, routeType, startLocationName, endLocationName, startPoint, endPoint, isCircular, waypoints = [], riskPoints = [], tags = [], } = req.body;
        // 插入路线
        const routeSql = `
      INSERT INTO routes (
        name, description, difficulty, distance,
        total_elevation_gain, total_elevation_loss,
        estimated_duration, route_type, start_location_name,
        end_location_name, start_point, end_point,
        creator_id, is_circular
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, POINT(?, ?), POINT(?, ?), ?, ?)
    `;
        const routeId = await (0, database_1.insert)(routeSql, [
            name,
            description,
            difficulty,
            distance,
            totalElevationGain,
            totalElevationLoss,
            estimatedDuration,
            routeType,
            startLocationName,
            endLocationName,
            startPoint.lng,
            startPoint.lat,
            endPoint.lng,
            endPoint.lat,
            userId,
            isCircular,
        ]);
        // 插入路点
        if (waypoints.length > 0) {
            const waypointSql = `
        INSERT INTO route_waypoints (
          route_id, location, altitude, name, description,
          waypoint_type, order_index
        ) VALUES (?, POINT(?, ?), ?, ?, ?, ?, ?)
      `;
            for (let i = 0; i < waypoints.length; i++) {
                const wp = waypoints[i];
                await (0, database_1.insert)(waypointSql, [
                    routeId,
                    wp.lng,
                    wp.lat,
                    wp.altitude,
                    wp.name,
                    wp.description,
                    wp.type,
                    i,
                ]);
            }
        }
        // 插入风险点
        if (riskPoints.length > 0) {
            const riskSql = `
        INSERT INTO route_risk_points (
          route_id, location, risk_type, risk_level, description
        ) VALUES (?, POINT(?, ?), ?, ?, ?)
      `;
            for (const rp of riskPoints) {
                await (0, database_1.insert)(riskSql, [
                    routeId,
                    rp.lng,
                    rp.lat,
                    rp.riskType,
                    rp.riskLevel,
                    rp.description,
                ]);
            }
        }
        // 插入标签
        if (tags.length > 0) {
            const tagSql = `
        INSERT INTO route_tags (route_id, tag_name) VALUES (?, ?)
      `;
            for (const tag of tags) {
                await (0, database_1.insert)(tagSql, [routeId, tag]);
            }
        }
        // 清除列表缓存
        await (0, redis_1.delCacheByPattern)(`${redis_1.CACHE_PREFIX.ROUTE_LIST}*`);
        res.json((0, apiResponse_1.createSuccessResponse)({ id: routeId }, apiResponse_1.ResponseCode.CREATED, '路线创建成功'));
    }
    catch (error) {
        console.error('Create route error:', error);
        res.json((0, apiResponse_1.createErrorResponse)(apiResponse_1.ResponseCode.INTERNAL_SERVER_ERROR, '创建路线失败'));
    }
};
exports.createRoute = createRoute;
/**
 * 更新路线
 */
const updateRoute = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        // 检查权限
        const route = await (0, database_1.queryOne)('SELECT creator_id FROM routes WHERE id = ?', [
            id,
        ]);
        if (!route) {
            return res.json((0, apiResponse_1.createErrorResponse)(apiResponse_1.ResponseCode.NOT_FOUND, '路线不存在'));
        }
        if (route.creator_id !== userId) {
            return res.json((0, apiResponse_1.createErrorResponse)(apiResponse_1.ResponseCode.FORBIDDEN, '无权限修改此路线'));
        }
        const { name, description, difficulty } = req.body;
        await (0, database_1.execute)('UPDATE routes SET name = ?, description = ?, difficulty = ? WHERE id = ?', [name, description, difficulty, id]);
        // 清除缓存
        await (0, redis_1.delCache)(`${redis_1.CACHE_PREFIX.ROUTE}${id}`);
        await (0, redis_1.delCacheByPattern)(`${redis_1.CACHE_PREFIX.ROUTE_LIST}*`);
        res.json((0, apiResponse_1.createSuccessResponse)(null, apiResponse_1.ResponseCode.SUCCESS, '更新成功'));
    }
    catch (error) {
        console.error('Update route error:', error);
        res.json((0, apiResponse_1.createErrorResponse)(apiResponse_1.ResponseCode.INTERNAL_SERVER_ERROR, '更新路线失败'));
    }
};
exports.updateRoute = updateRoute;
/**
 * 删除路线
 */
const deleteRoute = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        // 检查权限
        const route = await (0, database_1.queryOne)('SELECT creator_id FROM routes WHERE id = ?', [
            id,
        ]);
        if (!route) {
            return res.json((0, apiResponse_1.createErrorResponse)(apiResponse_1.ResponseCode.NOT_FOUND, '路线不存在'));
        }
        if (route.creator_id !== userId) {
            return res.json((0, apiResponse_1.createErrorResponse)(apiResponse_1.ResponseCode.FORBIDDEN, '无权限删除此路线'));
        }
        await (0, database_1.execute)('DELETE FROM routes WHERE id = ?', [id]);
        // 清除缓存
        await (0, redis_1.delCache)(`${redis_1.CACHE_PREFIX.ROUTE}${id}`);
        await (0, redis_1.delCacheByPattern)(`${redis_1.CACHE_PREFIX.ROUTE_LIST}*`);
        res.json((0, apiResponse_1.createSuccessResponse)(null, apiResponse_1.ResponseCode.SUCCESS, '删除成功'));
    }
    catch (error) {
        console.error('Delete route error:', error);
        res.json((0, apiResponse_1.createErrorResponse)(apiResponse_1.ResponseCode.INTERNAL_SERVER_ERROR, '删除路线失败'));
    }
};
exports.deleteRoute = deleteRoute;
//# sourceMappingURL=route.controller.js.map