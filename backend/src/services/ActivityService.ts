import { pool } from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { BusinessErrorCode } from '../types/api.types';

// 类型定义
export interface Activity {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  photos?: string[]; // 照片数组
  location: string;
  latitude: number | null;
  longitude: number | null;
  start_time: Date;
  end_time: Date | null;
  difficulty: 'easy' | 'moderate' | 'hard';
  max_participants: number | null;
  status: 'pending' | 'approved' | 'ongoing' | 'completed' | 'cancelled' | 'recruiting';
  route_description: string | null;
  equipment_required: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface ActivityWithCreator extends Activity {
  creator: {
    id: string;
    nickname: string;
    avatar_url: string | null;
    hiking_level: 'beginner' | 'intermediate' | 'advanced';
  };
  participant_count: number;
  is_joined?: boolean;
}

export interface Participation {
  id: string;
  user_id: string;
  activity_id: string;
  status: 'joined' | 'completed' | 'cancelled';
  joined_at: Date;
  completed_at: Date | null;
  cancelled_at: Date | null;
  feedback: string | null;
  rating: number | null;
}

export interface CreateActivityPayload {
  title: string;
  description?: string;
  cover_image_url?: string;
  photos?: string[]; // 照片数组，最多6张
  location: string;
  latitude?: number;
  longitude?: number;
  start_time: Date;
  end_time?: Date;
  difficulty: 'easy' | 'moderate' | 'hard';
  max_participants?: number;
  route_description?: string;
  equipment_required?: string;
}

export interface UpdateActivityPayload {
  title?: string;
  description?: string;
  cover_image_url?: string;
  photos?: string[]; // 照片数组，最多6张
  location?: string;
  latitude?: number;
  longitude?: number;
  start_time?: Date;
  end_time?: Date;
  difficulty?: 'easy' | 'moderate' | 'hard';
  max_participants?: number;
  status?: 'pending' | 'approved' | 'ongoing' | 'completed' | 'cancelled' | 'recruiting';
  route_description?: string;
  equipment_required?: string;
}

export class ActivityService {
  /**
   * 生成活动ID
   */
  private async generateActivityId(): Promise<string> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM activities ORDER BY id DESC LIMIT 1'
    );

    if (rows.length === 0) {
      return 'act-001';
    }

    const lastId = rows[0].id as string;
    const num = parseInt(lastId.split('-')[1]) + 1;
    return `act-${num.toString().padStart(3, '0')}`;
  }

  /**
   * 生成活动照片ID
   */
  private async generatePhotoId(): Promise<string> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM activity_photos ORDER BY id DESC LIMIT 1'
    );

    if (rows.length === 0) {
      return 'aphoto-001';
    }

    const lastId = rows[0].id as string;
    const num = parseInt(lastId.split('-')[1]) + 1;
    return `aphoto-${num.toString().padStart(3, '0')}`;
  }

  /**
   * 保存活动照片
   */
  private async saveActivityPhotos(activityId: string, photos: string[]): Promise<void> {
    if (!photos || photos.length === 0) return;

    // 删除旧照片
    await pool.query('DELETE FROM activity_photos WHERE activity_id = ?', [activityId]);

    // 插入新照片
    for (let i = 0; i < photos.length && i < 6; i++) {
      const photoId = await this.generatePhotoId();
      await pool.query(
        `INSERT INTO activity_photos (id, activity_id, photo_url, is_cover, sort_order, created_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [photoId, activityId, photos[i], i === 0, i]
      );
    }
  }

  /**
   * 获取活动照片
   */
  private async getActivityPhotos(activityId: string): Promise<string[]> {
    const [photos] = await pool.query<RowDataPacket[]>(
      `SELECT photo_url FROM activity_photos
       WHERE activity_id = ?
       ORDER BY sort_order ASC`,
      [activityId]
    );
    return photos.map(p => p.photo_url);
  }

  /**
   * 生成参与记录ID
   */
  private async generateParticipationId(): Promise<string> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM participations ORDER BY id DESC LIMIT 1'
    );

    if (rows.length === 0) {
      return 'part-001';
    }

    const lastId = rows[0].id as string;
    const num = parseInt(lastId.split('-')[1]) + 1;
    return `part-${num.toString().padStart(3, '0')}`;
  }

  /**
   * 创建活动
   */
  async createActivity(creatorId: string, data: CreateActivityPayload): Promise<ActivityWithCreator> {
    const activityId = await this.generateActivityId();

    // 确定封面图：使用传入的 cover_image_url 或照片数组的第一张
    const coverImageUrl = data.cover_image_url || (data.photos && data.photos.length > 0 ? data.photos[0] : null);

    await pool.query<ResultSetHeader>(
      `INSERT INTO activities (
        id, creator_id, title, description, cover_image_url,
        location, latitude, longitude, start_time, end_time,
        difficulty, max_participants, route_description, equipment_required,
        status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW(), NOW())`,
      [
        activityId,
        creatorId,
        data.title,
        data.description || null,
        coverImageUrl,
        data.location,
        data.latitude || null,
        data.longitude || null,
        data.start_time,
        data.end_time || null,
        data.difficulty,
        data.max_participants || null,
        data.route_description || null,
        data.equipment_required || null
      ]
    );

    // 保存照片数组
    if (data.photos && data.photos.length > 0) {
      await this.saveActivityPhotos(activityId, data.photos);
    }

    return this.getActivityById(activityId, creatorId);
  }

  /**
   * 获取活动详情
   */
  async getActivityById(activityId: string, currentUserId?: string): Promise<ActivityWithCreator> {
    const [activities] = await pool.query<RowDataPacket[]>(
      `SELECT
        a.*,
        u.id as creator_id,
        u.nickname as creator_nickname,
        u.avatar_url as creator_avatar_url,
        u.hiking_level as creator_hiking_level,
        (SELECT COUNT(*) FROM participations WHERE activity_id = a.id AND status = 'joined') as participant_count
       FROM activities a
       JOIN users u ON a.creator_id = u.id
       WHERE a.id = ? AND a.deleted_at IS NULL`,
      [activityId]
    );

    if (activities.length === 0) {
      throw {
        code: BusinessErrorCode.RESOURCE_NOT_FOUND,
        message: '活动不存在'
      };
    }

    const activity = activities[0];

    let isJoined = false;
    if (currentUserId) {
      const [participation] = await pool.query<RowDataPacket[]>(
        'SELECT id FROM participations WHERE user_id = ? AND activity_id = ? AND status = "joined"',
        [currentUserId, activityId]
      );
      isJoined = participation.length > 0;
    }

    // 获取照片数组
    const photos = await this.getActivityPhotos(activityId);

    return {
      id: activity.id,
      creator_id: activity.creator_id,
      title: activity.title,
      description: activity.description,
      cover_image_url: activity.cover_image_url,
      photos, // 添加照片数组
      location: activity.location,
      latitude: activity.latitude,
      longitude: activity.longitude,
      start_time: activity.start_time,
      end_time: activity.end_time,
      difficulty: activity.difficulty,
      max_participants: activity.max_participants,
      status: activity.status,
      route_description: activity.route_description,
      equipment_required: activity.equipment_required,
      created_at: activity.created_at,
      updated_at: activity.updated_at,
      deleted_at: activity.deleted_at,
      creator: {
        id: activity.creator_id,
        nickname: activity.creator_nickname,
        avatar_url: activity.creator_avatar_url,
        hiking_level: activity.creator_hiking_level
      },
      participant_count: activity.participant_count,
      is_joined: isJoined
    };
  }

  /**
   * 获取活动列表（带分页）
   */
  async getActivities(
    page: number = 1,
    pageSize: number = 20,
    filters?: {
      status?: string;
      difficulty?: string;
      creator_id?: string;
      start_date?: Date;
      end_date?: Date;
    },
    currentUserId?: string
  ): Promise<{ activities: ActivityWithCreator[]; total: number }> {
    let whereConditions = ['a.deleted_at IS NULL'];
    let params: any[] = [];

    if (filters?.status) {
      whereConditions.push('a.status = ?');
      params.push(filters.status);
    }

    if (filters?.difficulty) {
      whereConditions.push('a.difficulty = ?');
      params.push(filters.difficulty);
    }

    if (filters?.creator_id) {
      whereConditions.push('a.creator_id = ?');
      params.push(filters.creator_id);
    }

    if (filters?.start_date) {
      whereConditions.push('a.start_time >= ?');
      params.push(filters.start_date);
    }

    if (filters?.end_date) {
      whereConditions.push('a.start_time <= ?');
      params.push(filters.end_date);
    }

    const whereClause = whereConditions.join(' AND ');

    // 获取总数
    const [countResult] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM activities a WHERE ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    // Determine sort order: use created_at DESC for user's created activities, otherwise use start_time DESC
    const orderBy = filters?.creator_id ? 'a.created_at DESC' : 'a.start_time DESC';

    // 获取列表
    const offset = (page - 1) * pageSize;
    const [activities] = await pool.query<RowDataPacket[]>(
      `SELECT
        a.*,
        u.id as creator_id,
        u.nickname as creator_nickname,
        u.avatar_url as creator_avatar_url,
        u.hiking_level as creator_hiking_level,
        (SELECT COUNT(*) FROM participations WHERE activity_id = a.id AND status = 'joined') as participant_count
       FROM activities a
       JOIN users u ON a.creator_id = u.id
       WHERE ${whereClause}
       ORDER BY ${orderBy}
       LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    const formattedActivities = activities.map((activity: any) => ({
      id: activity.id,
      creator_id: activity.creator_id,
      title: activity.title,
      description: activity.description,
      cover_image_url: activity.cover_image_url,
      location: activity.location,
      latitude: activity.latitude,
      longitude: activity.longitude,
      start_time: activity.start_time,
      end_time: activity.end_time,
      difficulty: activity.difficulty,
      max_participants: activity.max_participants,
      status: activity.status,
      route_description: activity.route_description,
      equipment_required: activity.equipment_required,
      created_at: activity.created_at,
      updated_at: activity.updated_at,
      deleted_at: activity.deleted_at,
      creator: {
        id: activity.creator_id,
        nickname: activity.creator_nickname,
        avatar_url: activity.creator_avatar_url,
        hiking_level: activity.creator_hiking_level
      },
      participant_count: activity.participant_count
    }));

    return { activities: formattedActivities, total };
  }

  /**
   * 更新活动
   */
  async updateActivity(
    activityId: string,
    creatorId: string,
    data: UpdateActivityPayload
  ): Promise<ActivityWithCreator> {
    // 验证权限
    const [activities] = await pool.query<RowDataPacket[]>(
      'SELECT creator_id FROM activities WHERE id = ? AND deleted_at IS NULL',
      [activityId]
    );

    if (activities.length === 0) {
      throw {
        code: BusinessErrorCode.RESOURCE_NOT_FOUND,
        message: '活动不存在'
      };
    }

    if (activities[0].creator_id !== creatorId) {
      throw {
        code: BusinessErrorCode.FORBIDDEN,
        message: '无权限修改此活动'
      };
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (data.title !== undefined) {
      updates.push('title = ?');
      values.push(data.title);
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      values.push(data.description);
    }
    if (data.cover_image_url !== undefined) {
      updates.push('cover_image_url = ?');
      values.push(data.cover_image_url);
    }
    if (data.location !== undefined) {
      updates.push('location = ?');
      values.push(data.location);
    }
    if (data.latitude !== undefined) {
      updates.push('latitude = ?');
      values.push(data.latitude);
    }
    if (data.longitude !== undefined) {
      updates.push('longitude = ?');
      values.push(data.longitude);
    }
    if (data.start_time !== undefined) {
      updates.push('start_time = ?');
      values.push(data.start_time);
    }
    if (data.end_time !== undefined) {
      updates.push('end_time = ?');
      values.push(data.end_time);
    }
    if (data.difficulty !== undefined) {
      updates.push('difficulty = ?');
      values.push(data.difficulty);
    }
    if (data.max_participants !== undefined) {
      updates.push('max_participants = ?');
      values.push(data.max_participants);
    }
    if (data.status !== undefined) {
      updates.push('status = ?');
      values.push(data.status);
    }
    if (data.route_description !== undefined) {
      updates.push('route_description = ?');
      values.push(data.route_description);
    }
    if (data.equipment_required !== undefined) {
      updates.push('equipment_required = ?');
      values.push(data.equipment_required);
    }

    if (updates.length === 0 && !data.photos) {
      return this.getActivityById(activityId, creatorId);
    }

    // 更新照片数组
    if (data.photos && data.photos.length > 0) {
      await this.saveActivityPhotos(activityId, data.photos);

      // 如果有照片，同时更新封面图为第一张照片
      if (!data.cover_image_url) {
        updates.push('cover_image_url = ?');
        values.push(data.photos[0]);
      }
    }

    if (updates.length > 0) {
      updates.push('updated_at = NOW()');
      values.push(activityId);

      await pool.query<ResultSetHeader>(
        `UPDATE activities SET ${updates.join(', ')} WHERE id = ? AND deleted_at IS NULL`,
        values
      );
    }

    return this.getActivityById(activityId, creatorId);
  }

  /**
   * 删除活动（软删除）
   */
  async deleteActivity(activityId: string, creatorId: string): Promise<void> {
    // 验证权限
    const [activities] = await pool.query<RowDataPacket[]>(
      'SELECT creator_id FROM activities WHERE id = ? AND deleted_at IS NULL',
      [activityId]
    );

    if (activities.length === 0) {
      throw {
        code: BusinessErrorCode.RESOURCE_NOT_FOUND,
        message: '活动不存在'
      };
    }

    if (activities[0].creator_id !== creatorId) {
      throw {
        code: BusinessErrorCode.FORBIDDEN,
        message: '无权限删除此活动'
      };
    }

    await pool.query<ResultSetHeader>(
      'UPDATE activities SET deleted_at = NOW(), status = "cancelled" WHERE id = ?',
      [activityId]
    );
  }

  /**
   * 加入活动
   */
  async joinActivity(activityId: string, userId: string): Promise<Participation> {
    // 检查活动是否存在
    const [activities] = await pool.query<RowDataPacket[]>(
      'SELECT id, creator_id, max_participants, status FROM activities WHERE id = ? AND deleted_at IS NULL',
      [activityId]
    );

    if (activities.length === 0) {
      throw {
        code: BusinessErrorCode.RESOURCE_NOT_FOUND,
        message: '活动不存在'
      };
    }

    const activity = activities[0];

    // 不能加入自己创建的活动
    if (activity.creator_id === userId) {
      throw {
        code: BusinessErrorCode.VALIDATION_ERROR,
        message: '不能加入自己创建的活动'
      };
    }

    // 检查活动状态
    if (activity.status === 'cancelled') {
      throw {
        code: BusinessErrorCode.VALIDATION_ERROR,
        message: '活动已取消'
      };
    }

    if (activity.status === 'completed') {
      throw {
        code: BusinessErrorCode.VALIDATION_ERROR,
        message: '活动已结束'
      };
    }

    // 检查是否已加入
    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM participations WHERE user_id = ? AND activity_id = ? AND status = "joined"',
      [userId, activityId]
    );

    if (existing.length > 0) {
      throw {
        code: BusinessErrorCode.VALIDATION_ERROR,
        message: '已经加入过此活动'
      };
    }

    // 检查人数限制
    if (activity.max_participants) {
      const [countResult] = await pool.query<RowDataPacket[]>(
        'SELECT COUNT(*) as count FROM participations WHERE activity_id = ? AND status = "joined"',
        [activityId]
      );

      if (countResult[0].count >= activity.max_participants) {
        throw {
          code: BusinessErrorCode.VALIDATION_ERROR,
          message: '活动人数已满'
        };
      }
    }

    const participationId = await this.generateParticipationId();

    await pool.query<ResultSetHeader>(
      `INSERT INTO participations (id, user_id, activity_id, status, joined_at, created_at)
       VALUES (?, ?, ?, 'joined', NOW(), NOW())`,
      [participationId, userId, activityId]
    );

    const [participations] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM participations WHERE id = ?',
      [participationId]
    );

    return participations[0] as Participation;
  }

  /**
   * 退出活动
   */
  async leaveActivity(activityId: string, userId: string): Promise<void> {
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE participations
       SET status = 'cancelled', cancelled_at = NOW()
       WHERE user_id = ? AND activity_id = ? AND status = 'joined'`,
      [userId, activityId]
    );

    if (result.affectedRows === 0) {
      throw {
        code: BusinessErrorCode.RESOURCE_NOT_FOUND,
        message: '未加入此活动'
      };
    }
  }

  /**
   * 获取用户参与的活动列表
   */
  async getUserJoinedActivities(
    userId: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<{ activities: ActivityWithCreator[]; total: number }> {
    // 获取总数
    const [countResult] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total
       FROM participations p
       JOIN activities a ON p.activity_id = a.id
       WHERE p.user_id = ? AND p.status = 'joined' AND a.deleted_at IS NULL`,
      [userId]
    );
    const total = countResult[0].total;

    // 获取列表
    const offset = (page - 1) * pageSize;
    const [activities] = await pool.query<RowDataPacket[]>(
      `SELECT
        a.*,
        u.id as creator_id,
        u.nickname as creator_nickname,
        u.avatar_url as creator_avatar_url,
        u.hiking_level as creator_hiking_level,
        (SELECT COUNT(*) FROM participations WHERE activity_id = a.id AND status = 'joined') as participant_count,
        p.joined_at
       FROM participations p
       JOIN activities a ON p.activity_id = a.id
       JOIN users u ON a.creator_id = u.id
       WHERE p.user_id = ? AND p.status = 'joined' AND a.deleted_at IS NULL
       ORDER BY p.joined_at DESC
       LIMIT ? OFFSET ?`,
      [userId, pageSize, offset]
    );

    const formattedActivities = activities.map((activity: any) => ({
      id: activity.id,
      creator_id: activity.creator_id,
      title: activity.title,
      description: activity.description,
      cover_image_url: activity.cover_image_url,
      location: activity.location,
      latitude: activity.latitude,
      longitude: activity.longitude,
      start_time: activity.start_time,
      end_time: activity.end_time,
      difficulty: activity.difficulty,
      max_participants: activity.max_participants,
      status: activity.status,
      route_description: activity.route_description,
      equipment_required: activity.equipment_required,
      created_at: activity.created_at,
      updated_at: activity.updated_at,
      deleted_at: activity.deleted_at,
      creator: {
        id: activity.creator_id,
        nickname: activity.creator_nickname,
        avatar_url: activity.creator_avatar_url,
        hiking_level: activity.creator_hiking_level
      },
      participant_count: activity.participant_count,
      is_joined: true
    }));

    return { activities: formattedActivities, total };
  }

  /**
   * 获取用户创建的活动列表
   */
  async getUserCreatedActivities(
    userId: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<{ activities: ActivityWithCreator[]; total: number }> {
    return this.getActivities(page, pageSize, { creator_id: userId }, userId);
  }
}

export const activityService = new ActivityService();
