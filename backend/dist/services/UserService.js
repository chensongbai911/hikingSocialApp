import { pool } from '../config/database';
import { BusinessErrorCode } from '../types/api.types';
export class UserService {
    /**
     * 获取用户完整资料（优化版 - 使用单次查询）
     */
    async getProfile(userId) {
        // 使用单次查询获取用户基本信息、偏好和照片
        const [rows] = await pool.query(`SELECT
        u.id, u.email, u.nickname, u.gender, u.age, u.avatar_url, u.bio,
        u.hiking_level, u.province, u.city, u.region, u.is_verified, u.created_at,
        p.id as pref_id, p.preference_type, p.preference_value, p.created_at as pref_created_at,
        ph.id as photo_id, ph.photo_url, ph.sort_order, ph.created_at as photo_created_at
       FROM users u
       LEFT JOIN user_preferences p ON u.id = p.user_id
       LEFT JOIN user_photos ph ON u.id = ph.user_id
       WHERE u.id = ? AND u.deleted_at IS NULL
       ORDER BY ph.sort_order ASC, ph.created_at DESC, p.created_at DESC`, [userId]);
        if (rows.length === 0) {
            throw {
                code: BusinessErrorCode.USER_NOT_FOUND,
                message: '用户不存在'
            };
        }
        // 组装用户数据
        const user = rows[0];
        const preferences = [];
        const photos = [];
        const prefMap = new Map();
        const photoMap = new Map();
        for (const row of rows) {
            // 收集偏好（去重）
            if (row.pref_id && !prefMap.has(row.pref_id)) {
                preferences.push({
                    id: row.pref_id,
                    preference_type: row.preference_type,
                    preference_value: row.preference_value,
                    created_at: row.pref_created_at
                });
                prefMap.set(row.pref_id, true);
            }
            // 收集照片（去重）
            if (row.photo_id && !photoMap.has(row.photo_id)) {
                photos.push({
                    id: row.photo_id,
                    photo_url: row.photo_url,
                    sort_order: row.sort_order,
                    created_at: row.photo_created_at
                });
                photoMap.set(row.photo_id, true);
            }
        }
        // 获取完整URL的辅助函数
        const getFullUrl = (path) => {
            if (!path)
                return null;
            if (path.startsWith('http'))
                return path;
            const baseUrl = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
            return `${baseUrl}${path}`;
        };
        // 处理头像URL
        const avatarUrl = getFullUrl(user.avatar_url);
        // 处理照片URL
        const photosWithFullUrl = photos.map(photo => ({
            ...photo,
            photo_url: getFullUrl(photo.photo_url)
        }));
        return {
            id: user.id,
            email: user.email,
            nickname: user.nickname,
            gender: user.gender,
            age: user.age,
            avatar_url: avatarUrl,
            bio: user.bio,
            hiking_level: user.hiking_level,
            province: user.province,
            city: user.city,
            region: user.region,
            is_verified: user.is_verified,
            created_at: user.created_at,
            preferences,
            photos: photosWithFullUrl
        };
    }
    /**
     * 更新用户资料
     */
    async updateProfile(userId, data) {
        const updates = [];
        const values = [];
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
        await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ? AND deleted_at IS NULL`, values);
        return this.getProfile(userId);
    }
    /**
     * 更新用户头像
     */
    async updateAvatar(userId, avatarUrl) {
        await pool.query('UPDATE users SET avatar_url = ?, updated_at = NOW() WHERE id = ? AND deleted_at IS NULL', [avatarUrl, userId]);
        return { avatar_url: avatarUrl };
    }
    /**
     * 生成照片ID
     */
    async generatePhotoId() {
        const [rows] = await pool.query('SELECT id FROM user_photos ORDER BY id DESC LIMIT 1');
        if (rows.length === 0) {
            return 'photo-001';
        }
        const lastId = rows[0].id;
        const num = parseInt(lastId.split('-')[1]) + 1;
        return `photo-${num.toString().padStart(3, '0')}`;
    }
    /**
     * 添加相册照片
     */
    async addPhoto(userId, photoUrl, sortOrder) {
        // 检查照片数量限制
        const [countResult] = await pool.query('SELECT COUNT(*) as count FROM user_photos WHERE user_id = ?', [userId]);
        if (countResult[0].count >= 9) {
            throw {
                code: BusinessErrorCode.MAX_PHOTOS_EXCEEDED,
                message: '相册最多只能有9张照片'
            };
        }
        const photoId = await this.generatePhotoId();
        const order = sortOrder !== undefined ? sortOrder : countResult[0].count;
        await pool.query(`INSERT INTO user_photos (id, user_id, photo_url, sort_order, created_at)
       VALUES (?, ?, ?, ?, NOW())`, [photoId, userId, photoUrl, order]);
        const [photos] = await pool.query('SELECT id, photo_url, sort_order, created_at FROM user_photos WHERE id = ?', [photoId]);
        return photos[0];
    }
    /**
     * 删除相册照片
     */
    async deletePhoto(userId, photoId) {
        const [result] = await pool.query('DELETE FROM user_photos WHERE id = ? AND user_id = ?', [photoId, userId]);
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
    async generatePreferenceId() {
        const [rows] = await pool.query('SELECT id FROM user_preferences ORDER BY created_at DESC LIMIT 1');
        if (rows.length === 0) {
            return 'pref-001';
        }
        const lastId = rows[0].id;
        const num = parseInt(lastId.split('-')[1]) + 1;
        return `pref-${num.toString().padStart(3, '0')}`;
    }
    /**
     * 更新用户偏好
     */
    async updatePreferences(userId, preferences) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            // 删除现有偏好
            await connection.query('DELETE FROM user_preferences WHERE user_id = ?', [userId]);
            // 获取全局最大ID以生成新ID（不受当前删除操作影响）
            const [idRows] = await connection.query('SELECT MAX(CAST(SUBSTRING(id, 6) AS UNSIGNED)) as maxNum FROM user_preferences');
            let nextNum = 1;
            if (idRows.length > 0 && idRows[0].maxNum) {
                nextNum = idRows[0].maxNum + 1;
            }
            // 插入新偏好
            for (const pref of preferences) {
                const prefId = `pref-${nextNum.toString().padStart(3, '0')}`;
                nextNum++;
                await connection.query(`INSERT INTO user_preferences (id, user_id, preference_type, preference_value, created_at)
           VALUES (?, ?, ?, ?, NOW())`, [prefId, userId, pref.type, pref.value]);
            }
            await connection.commit();
            // 获取更新后的偏好
            const [results] = await connection.query(`SELECT id, preference_type, preference_value, created_at
         FROM user_preferences WHERE user_id = ?
         ORDER BY created_at DESC`, [userId]);
            return results;
        }
        catch (error) {
            await connection.rollback();
            throw error;
        }
        finally {
            connection.release();
        }
    }
    /**
     * 获取用户偏好
     */
    async getPreferences(userId) {
        const [preferences] = await pool.query(`SELECT id, preference_type, preference_value, created_at
       FROM user_preferences WHERE user_id = ?
       ORDER BY created_at DESC`, [userId]);
        return preferences;
    }
    /**
     * 检查用户是否存在
     */
    async exists(userId) {
        const [users] = await pool.query('SELECT id FROM users WHERE id = ? AND deleted_at IS NULL', [userId]);
        return users.length > 0;
    }
}
export const userService = new UserService();
//# sourceMappingURL=UserService.js.map