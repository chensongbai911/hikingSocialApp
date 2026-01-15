import { pool } from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface Destination {
  id: number;
  name: string;
  description?: string;
  area: string;
  district?: string;
  latitude: number;
  longitude: number;
  difficulty: 'easy' | 'moderate' | 'hard';
  distance?: number;
  elevation_gain?: number;
  cover_image?: string;
  photos?: string[];
  popularity_score: number;
  visit_count: number;
  activity_count: number;
  rating: number;
  tags?: string;
  facilities?: string;
  opening_hours?: string;
  ticket_price?: number;
  contact_phone?: string;
  address?: string;
  transportation?: string;
  tips?: string;
  best_season?: string;
  status: 'active' | 'inactive';
  created_at: Date;
  updated_at: Date;
  user_distance?: number; // 距离用户的距离（计算得出）
  is_favorited?: boolean; // 是否已收藏
}

export interface DestinationFilters {
  keyword?: string;
  area?: string;
  difficulty?: string;
  minDistance?: number;
  maxDistance?: number;
  sortBy?: 'distance' | 'popularity' | 'rating' | 'activity_count';
  latitude?: number;
  longitude?: number;
  limit?: number;
  offset?: number;
}

export class DestinationService {
  // 计算两点间距离（单位：km）
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // 地球半径（公里）
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
      Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // 获取目的地列表
  async getDestinations(
    filters?: DestinationFilters,
    userId?: string
  ): Promise<{ destinations: Destination[]; total: number }> {
    try {
      let whereConditions: string[] = ["d.status = 'active'"];
      let params: any[] = [];
      let orderBy = 'ORDER BY d.popularity_score DESC';

      // 关键词搜索
      if (filters?.keyword) {
        whereConditions.push(
          '(d.name LIKE ? OR d.description LIKE ? OR d.tags LIKE ? OR d.area LIKE ?)'
        );
        const keyword = `%${filters.keyword}%`;
        params.push(keyword, keyword, keyword, keyword);
      }

      // 地区过滤
      if (filters?.area) {
        whereConditions.push('d.area = ?');
        params.push(filters.area);
      }

      // 难度过滤
      if (filters?.difficulty) {
        whereConditions.push('d.difficulty = ?');
        params.push(filters.difficulty);
      }

      // 距离过滤
      if (filters?.minDistance !== undefined) {
        whereConditions.push('d.distance >= ?');
        params.push(filters.minDistance);
      }
      if (filters?.maxDistance !== undefined) {
        whereConditions.push('d.distance <= ?');
        params.push(filters.maxDistance);
      }

      const whereClause =
        whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      // 排序
      if (filters?.sortBy === 'popularity') {
        orderBy = 'ORDER BY d.popularity_score DESC, d.visit_count DESC';
      } else if (filters?.sortBy === 'rating') {
        orderBy = 'ORDER BY d.rating DESC, d.popularity_score DESC';
      } else if (filters?.sortBy === 'activity_count') {
        orderBy = 'ORDER BY d.activity_count DESC, d.popularity_score DESC';
      }

      // 分页
      const limit = Number(filters?.limit) || 20;
      const offset = Number(filters?.offset) || 0;
      console.log('getDestinations - limit:', filters?.limit, 'parsed:', limit, 'offset:', filters?.offset, 'parsed:', offset);

      // 查询总数
      const [countResult] = await pool.execute<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM destinations d ${whereClause}`,
        params
      );
      const total = countResult[0].total;

      // 查询列表
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT
          d.*,
          0 as is_favorited
        FROM destinations d
        ${whereClause}
        ${orderBy}
        LIMIT ${limit} OFFSET ${offset}`
      );

      // 处理照片字段
      const destinations = rows.map((row) => {
        const dest = { ...row } as Destination;
        if (row.photos) {
          try {
            dest.photos = JSON.parse(row.photos);
          } catch {
            dest.photos = [];
          }
        }

        // 计算距离（如果提供了用户位置）
        if (filters?.latitude && filters?.longitude) {
          dest.user_distance = this.calculateDistance(
            filters.latitude,
            filters.longitude,
            dest.latitude,
            dest.longitude
          );
        }

        return dest;
      });

      // 如果按距离排序
      if (filters?.sortBy === 'distance' && filters?.latitude && filters?.longitude) {
        destinations.sort((a, b) => (a.user_distance || 0) - (b.user_distance || 0));
      }

      return { destinations, total };
    } catch (error) {
      console.error('Error fetching destinations:', error);
      throw error;
    }
  }

  // 获取目的地详情
  async getDestinationById(id: number, userId?: string): Promise<Destination | null> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT
          d.*,
          0 as is_favorited
        FROM destinations d
        WHERE d.id = ? AND d.status = 'active'`,
        [id]
      );

      if (rows.length === 0) return null;

      const destination = rows[0] as Destination;

      // 解析照片JSON
      if (destination.photos) {
        try {
          destination.photos = JSON.parse(destination.photos as any);
        } catch {
          destination.photos = [];
        }
      }

      // 增加访问次数
      await pool.execute(
        'UPDATE destinations SET visit_count = visit_count + 1 WHERE id = ?',
        [id]
      );

      return destination;
    } catch (error) {
      console.error('Error fetching destination:', error);
      throw error;
    }
  }

  // 获取热门目的地
  async getPopularDestinations(limit: number = 10, userId?: string): Promise<Destination[]> {
    try {
      const limitInt = Number(limit) || 10;
      console.log('getPopularDestinations - limit:', limit, 'limitInt:', limitInt, 'type:', typeof limitInt);

      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT
          d.*,
          0 as is_favorited
        FROM destinations d
        WHERE d.status = 'active'
        ORDER BY d.popularity_score DESC, d.visit_count DESC
        LIMIT ${limitInt}`
      );

      return rows.map((row) => {
        const dest = { ...row } as Destination;
        if (row.photos) {
          try {
            dest.photos = JSON.parse(row.photos);
          } catch {
            dest.photos = [];
          }
        }
        return dest;
      });
    } catch (error) {
      console.error('Error fetching popular destinations:', error);
      throw error;
    }
  }

  // 获取附近目的地
  async getNearbyDestinations(
    latitude: number,
    longitude: number,
    radius: number = 50,
    limit: number = 10,
    userId?: string
  ): Promise<Destination[]> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT
          d.*,
          0 as is_favorited
        FROM destinations d
        WHERE d.status = 'active'`,
        []
      );

      // 计算距离并过滤
      const destinations = rows
        .map((row) => {
          const dest = { ...row } as Destination;
          if (row.photos) {
            try {
              dest.photos = JSON.parse(row.photos);
            } catch {
              dest.photos = [];
            }
          }
          dest.user_distance = this.calculateDistance(
            latitude,
            longitude,
            dest.latitude,
            dest.longitude
          );
          return dest;
        })
        .filter((d) => (d.user_distance || 0) <= radius)
        .sort((a, b) => (a.user_distance || 0) - (b.user_distance || 0))
        .slice(0, limit);

      return destinations;
    } catch (error) {
      console.error('Error fetching nearby destinations:', error);
      throw error;
    }
  }

  // 记录搜索历史
  async addSearchHistory(
    userId: number,
    keyword?: string,
    destinationId?: number
  ): Promise<void> {
    try {
      await pool.execute(
        'INSERT INTO destination_search_history (user_id, destination_id, search_keyword) VALUES (?, ?, ?)',
        [userId, destinationId || null, keyword || null]
      );

      // 只保留最近20条记录
      await pool.execute(
        `DELETE FROM destination_search_history
         WHERE user_id = ?
         AND id NOT IN (
           SELECT id FROM (
             SELECT id FROM destination_search_history
             WHERE user_id = ?
             ORDER BY created_at DESC
             LIMIT 20
           ) as tmp
         )`,
        [userId, userId]
      );
    } catch (error) {
      console.error('Error adding search history:', error);
    }
  }

  // 获取搜索历史
  async getSearchHistory(userId: number, limit: number = 10): Promise<string[]> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT DISTINCT
          COALESCE(d.name, h.search_keyword) as keyword
        FROM destination_search_history h
        LEFT JOIN destinations d ON h.destination_id = d.id
        WHERE h.user_id = ? AND (d.name IS NOT NULL OR h.search_keyword IS NOT NULL)
        ORDER BY h.created_at DESC
        LIMIT ?`,
        [userId, limit]
      );

      return rows.map((row) => row.keyword).filter(Boolean);
    } catch (error) {
      console.error('Error fetching search history:', error);
      return [];
    }
  }

  // 收藏/取消收藏目的地
  async toggleFavorite(userId: number, destinationId: number): Promise<boolean> {
    try {
      // 检查是否已收藏
      const [existing] = await pool.execute<RowDataPacket[]>(
        'SELECT id FROM destination_favorites WHERE user_id = ? AND destination_id = ?',
        [userId, destinationId]
      );

      if (existing.length > 0) {
        // 取消收藏
        await pool.execute(
          'DELETE FROM destination_favorites WHERE user_id = ? AND destination_id = ?',
          [userId, destinationId]
        );
        return false;
      } else {
        // 添加收藏
        await pool.execute(
          'INSERT INTO destination_favorites (user_id, destination_id) VALUES (?, ?)',
          [userId, destinationId]
        );
        return true;
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  }

  // 获取用户收藏的目的地
  async getFavoriteDestinations(userId: number): Promise<Destination[]> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT d.*, 1 as is_favorited
        FROM destinations d
        INNER JOIN destination_favorites f ON d.id = f.destination_id
        WHERE f.user_id = ? AND d.status = 'active'
        ORDER BY f.created_at DESC`,
        [userId]
      );

      return rows.map((row) => {
        const dest = { ...row } as Destination;
        if (row.photos) {
          try {
            dest.photos = JSON.parse(row.photos);
          } catch {
            dest.photos = [];
          }
        }
        return dest;
      });
    } catch (error) {
      console.error('Error fetching favorite destinations:', error);
      throw error;
    }
  }
}

export default new DestinationService();
