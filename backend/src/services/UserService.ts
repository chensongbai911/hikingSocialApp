import { pool } from '../config/database';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { BusinessErrorCode } from '../types/api.types';

interface UpdateProfilePayload {
  nickname?: string;
  gender?: 'male' | 'female' | 'other';
  age?: number;
  bio?: string;
  hiking_level?: 'beginner' | 'intermediate' | 'advanced';
  avatar_url?: string;
  province?: string;
  city?: string;
  region?: string;
}

interface UserProfile {
  id: string;
  email: string;
  nickname: string;
  gender: string | null;
  age: number | null;
  avatar_url: string | null;
  bio: string | null;
  hiking_level: string;
  province: string | null;
  city: string | null;
  region: string | null;
  is_verified: boolean;
  created_at: Date;
  preferences: UserPreference[];
  photos: UserPhoto[];
}

interface UserPreference {
  id: string;
  preference_type: string;
  preference_value: string;
  created_at: Date;
}

interface UserPhoto {
  id: string;
  photo_url: string;
  sort_order: number;
  created_at: Date;
}

export class UserService {
  /**
   * 获取用户完整资料
   */
  async getProfile(userId: string): Promise<UserProfile> {
    // 获取用户基本信息（包括地区字段）
    const [users] = await pool.query<RowDataPacket[]>(
      `SELECT id, email, nickname, gender, age, avatar_url, bio, hiking_level, province, city, region, is_verified, created_at
       FROM users WHERE id = ? AND deleted_at IS NULL`,
      [userId]
    );

    if (users.length === 0) {
      throw {
        code: BusinessErrorCode.USER_NOT_FOUND,
        message: '用户不存在'
      };
    }

    const user = users[0];

    // 获取用户偏好
    const [preferences] = await pool.query<RowDataPacket[]>(
      `SELECT id, preference_type, preference_value, created_at
       FROM user_preferences WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    // 获取用户相册
    const [photos] = await pool.query<RowDataPacket[]>(
      `SELECT id, photo_url, sort_order, created_at
       FROM user_photos WHERE user_id = ?
       ORDER BY sort_order ASC, created_at DESC`,
      [userId]
    );

    return {
      ...user,
      preferences: preferences as UserPreference[],
      photos: photos as UserPhoto[]
    } as UserProfile;
  }

  /**
   * 更新用户资料
   */
  async updateProfile(userId: string, data: UpdateProfilePayload): Promise<UserProfile> {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.nickname !== undefined) {
      updates.push('nickname = ?');
      values.push(data.nickname);
    }
    if (data.gender !== undefined) {
      updates.push('gender = ?');
      values.push(data.gender);
    }
    if (data.age !== undefined) {
      updates.push('age = ?');
      values.push(data.age);
    }
    if (data.bio !== undefined) {
      updates.push('bio = ?');
      values.push(data.bio);
    }
    if (data.hiking_level !== undefined) {
      updates.push('hiking_level = ?');
      values.push(data.hiking_level);
    }
    if (data.avatar_url !== undefined) {
      updates.push('avatar_url = ?');
      values.push(data.avatar_url);
    }
    if (data.province !== undefined) {
      updates.push('province = ?');
      values.push(data.province);
    }
    if (data.city !== undefined) {
      updates.push('city = ?');
      values.push(data.city);
    }
    if (data.region !== undefined) {
      updates.push('region = ?');
      values.push(data.region);
    }

    if (updates.length === 0) {
      return this.getProfile(userId);
    }

    updates.push('updated_at = NOW()');
    values.push(userId);

    await pool.query<ResultSetHeader>(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ? AND deleted_at IS NULL`,
      values
    );

    return this.getProfile(userId);
  }

  /**
   * 更新用户头像
   */
  async updateAvatar(userId: string, avatarUrl: string): Promise<{ avatar_url: string }> {
    await pool.query<ResultSetHeader>(
      'UPDATE users SET avatar_url = ?, updated_at = NOW() WHERE id = ? AND deleted_at IS NULL',
      [avatarUrl, userId]
    );

    return { avatar_url: avatarUrl };
  }

  /**
   * 生成照片ID
   */
  private async generatePhotoId(): Promise<string> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM user_photos ORDER BY id DESC LIMIT 1'
    );

    if (rows.length === 0) {
      return 'photo-001';
    }

    const lastId = rows[0].id as string;
    const num = parseInt(lastId.split('-')[1]) + 1;
    return `photo-${num.toString().padStart(3, '0')}`;
  }

  /**
   * 添加相册照片
   */
  async addPhoto(userId: string, photoUrl: string, sortOrder?: number): Promise<UserPhoto> {
    // 检查照片数量限制
    const [countResult] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM user_photos WHERE user_id = ?',
      [userId]
    );

    if (countResult[0].count >= 9) {
      throw {
        code: BusinessErrorCode.MAX_PHOTOS_EXCEEDED,
        message: '相册最多只能有9张照片'
      };
    }

    const photoId = await this.generatePhotoId();
    const order = sortOrder !== undefined ? sortOrder : countResult[0].count;

    await pool.query<ResultSetHeader>(
      `INSERT INTO user_photos (id, user_id, photo_url, sort_order, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [photoId, userId, photoUrl, order]
    );

    const [photos] = await pool.query<RowDataPacket[]>(
      'SELECT id, photo_url, sort_order, created_at FROM user_photos WHERE id = ?',
      [photoId]
    );

    return photos[0] as UserPhoto;
  }

  /**
   * 删除相册照片
   */
  async deletePhoto(userId: string, photoId: string): Promise<void> {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM user_photos WHERE id = ? AND user_id = ?',
      [photoId, userId]
    );

    if (result.affectedRows === 0) {
      throw {
        code: BusinessErrorCode.PHOTO_NOT_FOUND,
        message: '照片不存在'
      };
    }
  }

  /**
   * 生成偏好ID
   */
  private async generatePreferenceId(): Promise<string> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM user_preferences ORDER BY created_at DESC LIMIT 1'
    );

    if (rows.length === 0) {
      return 'pref-001';
    }

    const lastId = rows[0].id as string;
    const num = parseInt(lastId.split('-')[1]) + 1;
    return `pref-${num.toString().padStart(3, '0')}`;
  }

  /**
   * 更新用户偏好
   */
  async updatePreferences(
    userId: string,
    preferences: Array<{ type: string; value: string }>
  ): Promise<UserPreference[]> {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // 删除现有偏好
      await connection.query<ResultSetHeader>(
        'DELETE FROM user_preferences WHERE user_id = ?',
        [userId]
      );

      // 获取全局最大ID以生成新ID（不受当前删除操作影响）
      const [idRows] = await connection.query<RowDataPacket[]>(
        'SELECT MAX(CAST(SUBSTRING(id, 6) AS UNSIGNED)) as maxNum FROM user_preferences'
      );

      let nextNum = 1;
      if (idRows.length > 0 && idRows[0].maxNum) {
        nextNum = idRows[0].maxNum + 1;
      }

      // 插入新偏好
      for (const pref of preferences) {
        const prefId = `pref-${nextNum.toString().padStart(3, '0')}`;
        nextNum++;

        await connection.query<ResultSetHeader>(
          `INSERT INTO user_preferences (id, user_id, preference_type, preference_value, created_at)
           VALUES (?, ?, ?, ?, NOW())`,
          [prefId, userId, pref.type, pref.value]
        );
      }

      await connection.commit();

      // 获取更新后的偏好
      const [results] = await connection.query<RowDataPacket[]>(
        `SELECT id, preference_type, preference_value, created_at
         FROM user_preferences WHERE user_id = ?
         ORDER BY created_at DESC`,
        [userId]
      );

      return results as UserPreference[];
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * 获取用户偏好
   */
  async getPreferences(userId: string): Promise<UserPreference[]> {
    const [preferences] = await pool.query<RowDataPacket[]>(
      `SELECT id, preference_type, preference_value, created_at
       FROM user_preferences WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    return preferences as UserPreference[];
  }

  /**
   * 检查用户是否存在
   */
  async exists(userId: string): Promise<boolean> {
    const [users] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM users WHERE id = ? AND deleted_at IS NULL',
      [userId]
    );

    return users.length > 0;
  }
}

export const userService = new UserService();
