/**
 * 路线控制器
 * 创建日期: 2026-01-19
 */

import { Request, Response } from 'express'
import {
  createSuccessResponse,
  createErrorResponse,
  createPaginatedResponse,
  ResponseCode,
} from '../utils/apiResponse'
import { query, queryOne, insert, execute } from '../config/database'
import {
  setCache,
  getCache,
  delCache,
  delCacheByPattern,
  CACHE_PREFIX,
  CACHE_TTL,
} from '../config/redis'

/**
 * 获取路线列表
 */
export const getRouteList = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      pageSize = 20,
      difficulty,
      minDistance,
      maxDistance,
      minElevation,
      maxElevation,
      lat,
      lng,
      radius = 10000,
      sortBy = 'created_at',
      sortOrder = 'DESC',
    } = req.query

    // 构建缓存键
    const cacheKey = `${CACHE_PREFIX.ROUTE_LIST}${JSON.stringify(req.query)}`

    // 尝试从缓存获取
    const cached = await getCache(cacheKey)
    if (cached) {
      return res.json(cached)
    }

    // 构建查询条件
    const conditions: string[] = []
    const params: any[] = []

    if (difficulty) {
      conditions.push('difficulty = ?')
      params.push(difficulty)
    }

    if (minDistance) {
      conditions.push('distance >= ?')
      params.push(minDistance)
    }

    if (maxDistance) {
      conditions.push('distance <= ?')
      params.push(maxDistance)
    }

    if (minElevation) {
      conditions.push('total_elevation_gain >= ?')
      params.push(minElevation)
    }

    if (maxElevation) {
      conditions.push('total_elevation_gain <= ?')
      params.push(maxElevation)
    }

    // 附近路线（使用空间索引）
    if (lat && lng && radius) {
      conditions.push(
        `ST_Distance_Sphere(start_point, POINT(?, ?)) <= ?`
      )
      params.push(lng, lat, radius)
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    // 查询总数
    const countSql = `SELECT COUNT(*) as total FROM routes ${whereClause}`
    const countResult = await queryOne<{ total: number }>(countSql, params)
    const total = countResult?.total || 0

    // 查询列表
    const offset = (Number(page) - 1) * Number(pageSize)
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
    `
    const [routes] = await query(listSql, [...params, Number(pageSize), offset])

    // 构建响应
    const response = createPaginatedResponse(
      routes,
      Number(page),
      Number(pageSize),
      total
    )

    // 缓存结果
    await setCache(cacheKey, response, CACHE_TTL.ROUTE)

    res.json(response)
  } catch (error: any) {
    console.error('Get route list error:', error)
    res.json(
      createErrorResponse(
        ResponseCode.INTERNAL_SERVER_ERROR,
        '获取路线列表失败'
      )
    )
  }
}

/**
 * 获取路线详情
 */
export const getRouteDetail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    // 尝试从缓存获取
    const cacheKey = `${CACHE_PREFIX.ROUTE}${id}`
    const cached = await getCache(cacheKey)
    if (cached) {
      return res.json(cached)
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
    `
    const route = await queryOne(routeSql, [id])

    if (!route) {
      return res.json(
        createErrorResponse(ResponseCode.NOT_FOUND, '路线不存在')
      )
    }

    // 查询路点
    const waypointsSql = `
      SELECT
        id, ST_X(location) as lng, ST_Y(location) as lat,
        altitude, name, description, waypoint_type, order_index
      FROM route_waypoints
      WHERE route_id = ?
      ORDER BY order_index ASC
    `
    const [waypoints] = await query(waypointsSql, [id])

    // 查询风险点
    const riskPointsSql = `
      SELECT
        id, ST_X(location) as lng, ST_Y(location) as lat,
        risk_type, risk_level, description
      FROM route_risk_points
      WHERE route_id = ?
    `
    const [riskPoints] = await query(riskPointsSql, [id])

    // 查询标签
    const tagsSql = `
      SELECT tag_name
      FROM route_tags
      WHERE route_id = ?
    `
    const [tags] = await query(tagsSql, [id])

    // 增加浏览量
    await execute(
      'UPDATE routes SET view_count = view_count + 1 WHERE id = ?',
      [id]
    )

    // 组装完整数据
    const fullRoute = {
      ...route,
      waypoints,
      riskPoints,
      tags: tags.map((t: any) => t.tag_name),
    }

    const response = createSuccessResponse(fullRoute)

    // 缓存结果
    await setCache(cacheKey, response, CACHE_TTL.ROUTE)

    res.json(response)
  } catch (error: any) {
    console.error('Get route detail error:', error)
    res.json(
      createErrorResponse(
        ResponseCode.INTERNAL_SERVER_ERROR,
        '获取路线详情失败'
      )
    )
  }
}

/**
 * 创建路线
 */
export const createRoute = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id // 从 JWT 中获取

    if (!userId) {
      return res.json(
        createErrorResponse(ResponseCode.UNAUTHORIZED, '请先登录')
      )
    }

    const {
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
      startPoint,
      endPoint,
      isCircular,
      waypoints = [],
      riskPoints = [],
      tags = [],
    } = req.body

    // 插入路线
    const routeSql = `
      INSERT INTO routes (
        name, description, difficulty, distance,
        total_elevation_gain, total_elevation_loss,
        estimated_duration, route_type, start_location_name,
        end_location_name, start_point, end_point,
        creator_id, is_circular
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, POINT(?, ?), POINT(?, ?), ?, ?)
    `
    const routeId = await insert(routeSql, [
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
    ])

    // 插入路点
    if (waypoints.length > 0) {
      const waypointSql = `
        INSERT INTO route_waypoints (
          route_id, location, altitude, name, description,
          waypoint_type, order_index
        ) VALUES (?, POINT(?, ?), ?, ?, ?, ?, ?)
      `
      for (let i = 0; i < waypoints.length; i++) {
        const wp = waypoints[i]
        await insert(waypointSql, [
          routeId,
          wp.lng,
          wp.lat,
          wp.altitude,
          wp.name,
          wp.description,
          wp.type,
          i,
        ])
      }
    }

    // 插入风险点
    if (riskPoints.length > 0) {
      const riskSql = `
        INSERT INTO route_risk_points (
          route_id, location, risk_type, risk_level, description
        ) VALUES (?, POINT(?, ?), ?, ?, ?)
      `
      for (const rp of riskPoints) {
        await insert(riskSql, [
          routeId,
          rp.lng,
          rp.lat,
          rp.riskType,
          rp.riskLevel,
          rp.description,
        ])
      }
    }

    // 插入标签
    if (tags.length > 0) {
      const tagSql = `
        INSERT INTO route_tags (route_id, tag_name) VALUES (?, ?)
      `
      for (const tag of tags) {
        await insert(tagSql, [routeId, tag])
      }
    }

    // 清除列表缓存
    await delCacheByPattern(`${CACHE_PREFIX.ROUTE_LIST}*`)

    res.json(
      createSuccessResponse(
        { id: routeId },
        ResponseCode.CREATED,
        '路线创建成功'
      )
    )
  } catch (error: any) {
    console.error('Create route error:', error)
    res.json(
      createErrorResponse(
        ResponseCode.INTERNAL_SERVER_ERROR,
        '创建路线失败'
      )
    )
  }
}

/**
 * 更新路线
 */
export const updateRoute = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = (req as any).user?.id

    // 检查权限
    const route = await queryOne('SELECT creator_id FROM routes WHERE id = ?', [
      id,
    ])

    if (!route) {
      return res.json(
        createErrorResponse(ResponseCode.NOT_FOUND, '路线不存在')
      )
    }

    if (route.creator_id !== userId) {
      return res.json(
        createErrorResponse(ResponseCode.FORBIDDEN, '无权限修改此路线')
      )
    }

    const { name, description, difficulty } = req.body

    await execute(
      'UPDATE routes SET name = ?, description = ?, difficulty = ? WHERE id = ?',
      [name, description, difficulty, id]
    )

    // 清除缓存
    await delCache(`${CACHE_PREFIX.ROUTE}${id}`)
    await delCacheByPattern(`${CACHE_PREFIX.ROUTE_LIST}*`)

    res.json(createSuccessResponse(null, ResponseCode.SUCCESS, '更新成功'))
  } catch (error: any) {
    console.error('Update route error:', error)
    res.json(
      createErrorResponse(
        ResponseCode.INTERNAL_SERVER_ERROR,
        '更新路线失败'
      )
    )
  }
}

/**
 * 删除路线
 */
export const deleteRoute = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = (req as any).user?.id

    // 检查权限
    const route = await queryOne('SELECT creator_id FROM routes WHERE id = ?', [
      id,
    ])

    if (!route) {
      return res.json(
        createErrorResponse(ResponseCode.NOT_FOUND, '路线不存在')
      )
    }

    if (route.creator_id !== userId) {
      return res.json(
        createErrorResponse(ResponseCode.FORBIDDEN, '无权限删除此路线')
      )
    }

    await execute('DELETE FROM routes WHERE id = ?', [id])

    // 清除缓存
    await delCache(`${CACHE_PREFIX.ROUTE}${id}`)
    await delCacheByPattern(`${CACHE_PREFIX.ROUTE_LIST}*`)

    res.json(createSuccessResponse(null, ResponseCode.SUCCESS, '删除成功'))
  } catch (error: any) {
    console.error('Delete route error:', error)
    res.json(
      createErrorResponse(
        ResponseCode.INTERNAL_SERVER_ERROR,
        '删除路线失败'
      )
    )
  }
}
